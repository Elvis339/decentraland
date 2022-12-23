import * as R from 'ramda';
import fs from 'fs';
import EthCrypto from 'eth-crypto';
import { logger } from '@decentraland/logger';

const right = v => ({
  map: f => right(f(v)),
  matchWith: pattern => pattern.right(v),
});

const left = v => ({
  map: () => left(v),
  matchWith: pattern => pattern.left(v),
});

export const tryCatch = fn => {
  try {
    return right(fn());
  } catch (err) {
    return left(err);
  }
};

export const stringify = R.curry(message => JSON.stringify(message));

export const getRandomArbitrary = (min, max) => Math.floor(Math.random() * (max - min) + min);

export const getQuestion = () =>
  R.pipe(fs.readFileSync, JSON.parse, questions => {
    const index = getRandomArbitrary(0, 200);
    const question = questions[index][0];

    return {
      index,
      question,
    };
  })('questions.json');

export const fileExist = R.ifElse(fs.existsSync, R.identity, () => {
  logger.error(`Path does not exist`);
  process.exit(1);
});

export const read = R.pipe(fileExist, fs.readFileSync, R.toString, stringify);

const write = R.curry((path, data) => fs.writeFileSync(path, data));
const createDecryptionIdentity = write('decryption_wallet.json');
const identity = () => EthCrypto.createIdentity();

export const create = R.pipe(identity, stringify, createDecryptionIdentity);
export const decryptionWallet = R.ifElse(fs.existsSync, path => JSON.parse(read(path)), create);
