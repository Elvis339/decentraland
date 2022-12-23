import { Shamir } from '@decentraland/shamir/shamir.mjs';
import { logger } from '@decentraland/logger';

export const generateShares = ({ secret, totalShares, requiredShares }) => {
  const hex = Buffer.from(secret).toString('hex');
  const shares = Shamir.generateShares(hex, totalShares, requiredShares);

  logger.info(shares);
  return shares;
};
