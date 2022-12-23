import { Shamir } from '@decentraland/shamir/shamir.mjs';
import { logger } from '@decentraland/logger';

export const deriveSecret = ({ shares }) => {
  if (!Array.isArray(shares)) {
    logger.error(`Invalid share`);
    return;
  }
  const secretHex = Shamir.deriveSecret(shares);
  const secret = Buffer.from(secretHex, 'hex').toString('utf-8');
  logger.info(`Secret=${secret}`);

  return secret;
};
