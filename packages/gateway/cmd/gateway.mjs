import { logger } from '@decentraland/logger';
import { createNode } from '@decentraland/node';
import { Shamir } from '@decentraland/shamir';
import { toString as uint8ArrayToString } from 'uint8arrays';
import EthCrypto from 'eth-crypto';
import * as Rx from 'rxjs';
import { createAttestation, createLedgerRecord, runMigrations } from '../utils/sql.utils.js';

export async function gatewayNode() {
  await runMigrations();

  const peers = new Map();
  const stateMap = new Map();

  const stateChange$ = new Rx.BehaviorSubject([]);
  const gatewayNode = await createNode();

  stateChange$.subscribe(async changes => {
    const [id, share, encryptedData] = changes;

    stateMap.set(id, Array.isArray(stateMap.get(id)) ? stateMap.get(id).concat(share) : [share]);

    const item = stateMap.get(id);

    if (Array.isArray(item) && item.length === 3) {
      const secretPrivateKey = Shamir.deriveSecret(item);
      const privateKey = Buffer.from(secretPrivateKey, 'hex').toString('utf-8');
      const message = JSON.parse(await EthCrypto.decryptWithPrivateKey(privateKey, encryptedData));
      const question = Object.keys(message).filter(a => a !== 'address')[0];
      const vote = message[question] ? 1 : 0;

      await createLedgerRecord(id, question, vote, message.address);
      logger.info(`Message decrypted=${JSON.stringify(message)}`);
    }

    return changes;
  });

  await gatewayNode.pubsub.addEventListener('message', async evt => {
    const topic = evt.detail.topic;

    switch (topic) {
      case 'share': {
        try {
          const { id, encryptedData, share, attestation } = JSON.parse(uint8ArrayToString(evt.detail.data));
          const peerId = evt.detail.from.toString();

          await createAttestation(id, attestation.address, attestation.signature, attestation.hash);
          stateChange$.next([id, share, encryptedData]);

          logger.info(`Received share on id=${id} from=${peerId}`);
        } catch (err) {}
      }
    }
  });

  gatewayNode.addEventListener('peer:discovery', async evt => {
    const id = evt.detail.id;
    await gatewayNode.dial(id);
  });

  gatewayNode.connectionManager.addEventListener('peer:connect', async evt => {
    const connection = evt.detail;
    const id = connection.remotePeer;
    peers.set(id, true);
    logger.info(`Connected peer=${id}`);
  });

  gatewayNode.connectionManager.addEventListener('peer:disconnect', evt => {
    const connection = evt.detail;
    const id = connection.remotePeer;
    peers.set(id, false);
    logger.info(`Disconnected peer=${connection.remotePeer.toString()}`);
  });

  await gatewayNode.pubsub.subscribe('share');

  return gatewayNode;
}
