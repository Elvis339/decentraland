import fs from 'fs';
import EthCrypto from 'eth-crypto';
import { logger } from '@decentraland/logger';

export const generateIdentity = ({ overwrite }) => {
  const identity = EthCrypto.createIdentity();
  if (overwrite) {
    fs.writeFileSync('identity.json', JSON.stringify(identity));
    logger.info(`Identity generated, wallet address=${identity.address}`);
  } else {
    logger.info(`Identity generated, but values are not persisted wallet address=${identity.address}`);
  }
};
