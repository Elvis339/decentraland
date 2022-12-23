import fs from 'fs';
import * as R from 'ramda';
import { tryCatch } from './utils.js';
import { logger } from '@decentraland/logger';

/**
 * @return {{
 *     privateKey: string;
 *     publicKey: string;
 *     address: string;
 * }}
 */
const readIdentity = (path = 'identity.json') => R.pipe(fs.readFileSync, R.toString, JSON.parse)(path);

export const getIdentity = () =>
  tryCatch(readIdentity).matchWith({
    right: R.identity,
    left: () => logger.error(`Identity is malfunctioned, please generate new one!`),
  });

export const getPublicKey = R.pipe(getIdentity, identity => identity.publicKey);
export const getPrivateKey = R.pipe(getIdentity, identity => identity.privateKey);

export const getAddress = R.pipe(getIdentity, identity => identity.address);
