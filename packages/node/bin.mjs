#!/usr/bin/env node
import EthCrypto from 'eth-crypto';
import { toString as uint8ArrayToString, fromString } from 'uint8arrays';
import { logger } from '@decentraland/logger';
import { createNode } from './createNode.mjs';

const requireArg = (argv = process.argv) => {
  const cmd = ['-s', '--share'];
  const command = argv[2];
  const share = argv[3];

  if (!cmd.includes(command)) {
    throw new Error(`Missing required command: ${cmd.toString()}`);
  }

  if (!share || typeof share !== 'string' || share.length <= 1) {
    throw new Error(`Invalid ${cmd.toString()} argument!`);
  }

  return share;
};

async function run() {
  const share = requireArg();

  // Used for signing message
  const identity = EthCrypto.createIdentity();
  const validatorNode = await createNode();

  validatorNode.connectionManager.addEventListener('peer:connect', async evt => {
    const connection = evt.detail;
    logger.info(`Connected peer=${connection.remotePeer.toString()}`);
  });

  validatorNode.pubsub.addEventListener('message', async evt => {
    const topic = evt.detail.topic;
    const data = evt.detail.data;

    switch (topic) {
      case 'decrypt':
        const payload = JSON.parse(uint8ArrayToString(data));
        const message = `Attested by ${identity.address}`;
        const hash = EthCrypto.hash.keccak256(message);
        const signature = EthCrypto.sign(identity.privateKey, hash);

        await validatorNode.pubsub.publish(
          'share',
          fromString(
            JSON.stringify({
              ...payload,
              share,
              attestation: {
                address: identity.address,
                signature,
                hash,
              },
            }),
          ),
        );
        break;
      default:
        break;
    }
  });

  await validatorNode.pubsub.subscribe('decrypt');

  validatorNode.getMultiaddrs().forEach(ma => {
    logger.info(`Listener ready, listening on: ${ma.toString()}`);
  });
}

process.on('uncaughtException', err => {
  logger.error(err);
  process.exit(1);
});
run().catch(err => {
  logger.error(err);
  process.exit(1);
});
