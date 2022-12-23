import fs from 'fs';
import path from 'path';

export const getValidators = dir => {
  const identities = [];

  const filesPath = fs
    .readdirSync(dir)
    .filter(file => path.extname(file) === '.json')
    .map(file => path.join(dir, file));

  for (const filePath of filesPath) {
    identities.push(JSON.parse(fs.readFileSync(filePath).toString()));
  }

  return identities;
};

export const getValidatorPublicKeys = dir => getValidators(dir).map(v => v.publicKey);
