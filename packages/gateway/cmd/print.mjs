import { db } from '@decentraland/db';
import { logger } from '@decentraland/logger';
import fs from 'fs';
import { stringify } from '../utils/utils.js';
import rimraf from 'rimraf';

export const printCmd = async () => {
  const entries = await db.getRange();
  const arr = [];

  for await (const entry of entries) {
    const value = JSON.parse(entry.value);
    arr.push({
      [entry.key]: value,
    });
  }

  rimraf('records.json', err => {
    if (err) {
      logger.error(err);
      return;
    }
    fs.writeFileSync('records.json', stringify(arr));
    logger.info(`Records persisted to file=records.json`);
  });
};
