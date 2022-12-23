import { program, Option } from 'commander';
import { generateIdentity } from './cmd/generateIdentity.mjs';
import { vote } from './cmd/vote.mjs';
import { printCmd } from './cmd/print.mjs';
import { gatewayNode } from './cmd/gateway.mjs';
import { logger } from '@decentraland/logger';
import { generateShares } from './cmd/generate-shares.mjs';
import { deriveSecret } from './cmd/deriveSecret.mjs';
import { decryptionWallet, read } from './utils/utils.js';

program.name('Welcome to Decentralized').description('Decentralized oracle').version('1.0.0');

program
  .command('identity')
  .description('Generate identity')
  .addOption(
    new Option('-o, --overwrite <bool>', 'Overwrite existing identity').default(true).argParser(v => v === 'true'),
  )
  .action(generateIdentity);

program
  .command('vote')
  .description('Description start voting')
  .action(async () => {
    decryptionWallet('decryption_wallet.json');
    const node = await gatewayNode();
    await vote(node.pubsub);
  });

program.command('print').description('Print values from db').action(printCmd);

program
  .command('generate:shares')
  .description('Generate shares that should be distributed among validators')
  .addOption(new Option('-s, --secret <string>', 'Set secret').argParser(v => v.toString()).makeOptionMandatory(true))
  .addOption(
    new Option('-t, --totalShares <number>', 'Total shares').argParser(v => parseInt(v)).makeOptionMandatory(true),
  )
  .addOption(
    new Option('-r, --requiredShares <number>', 'Minimum required shares for secret')
      .argParser(v => parseInt(v))
      .makeOptionMandatory(true),
  )
  .action(generateShares);

program
  .command('derive:secret')
  .description('Derive secret from shares')
  .addOption(
    new Option('-s, --shares <string[]>', 'Shares of a secret format: s1,s2,sN (no space)')
      .argParser(v => v.trim().split(','))
      .makeOptionMandatory(true),
  )
  .action(deriveSecret);

program.parse(process.argv);

process.on('uncaughtException', err => {
  logger.error(err);
});
