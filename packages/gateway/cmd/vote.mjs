import EthCrypto from 'eth-crypto';
import { getAddress, getPrivateKey } from '../utils/identity.utils.js';
import { getQuestion, stringify } from '../utils/utils.js';
import { db } from '@decentraland/db';
import { logger } from '@decentraland/logger';
import inquirer from 'inquirer';
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string';
import crypto from 'crypto';

const packMessage = encryptedData => {
  const hash = EthCrypto.hash.keccak256(stringify(encryptedData));
  const signature = EthCrypto.sign(getPrivateKey(), hash);

  return {
    encryptedData,
    hash,
    signature,
  };
};

let maxDepth = 200;
let currentDepth = 0;
export const vote = async (node, decryptionWalletPublicKey) => {
  const questionObject = getQuestion();
  if (currentDepth === maxDepth) {
    throw new Error(`Max depth reached!`);
  }
  let question = questionObject.question;
  let item;

  try {
    item = JSON.parse(await db.get(question));
  } catch (err) {
    item = [];
  }

  if (item.length > 0) {
    const addr = item.find(i => i.address === getAddress());
    if (addr) {
      currentDepth += 1;
      logger.info(`Skipping ${question} \n`);
      return await vote(node, decryptionWalletPublicKey);
    }
  }

  try {
    const { question: answer } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'question',
        message: question,
        default: false,
      },
    ]);

    const encryptedPayload = packMessage(
      await EthCrypto.encryptWithPublicKey(
        decryptionWalletPublicKey,
        stringify({
          [question]: answer,
          address: getAddress(),
        }),
      ),
    );

    const payload = {
      address: getAddress(),
      voteHash: EthCrypto.hash.keccak256(question + answer + getAddress()),
      ...encryptedPayload,
    };

    await db.put(question, JSON.stringify(Array.isArray(item) ? [...item, payload] : [payload]));

    if (currentDepth > 0) {
      currentDepth -= 1;
    }

    await node.publish(
      'decrypt',
      uint8ArrayFromString(
        JSON.stringify({
          ...encryptedPayload,
          id: crypto.randomBytes(5).toString('hex'),
        }),
      ),
    );
    return await vote(node, decryptionWalletPublicKey);
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
};
