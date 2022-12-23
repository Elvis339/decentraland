import pkg from 'sqlite3';

export const sql = new pkg.Database('consensus.sqlite');

const tables = [
  `create table if not exists ledger (
    id text not null,
    question text not null,
    vote int not null,
    address text not null
  )`,
  `create table if not exists attestation (
    id text not null,
    address text not null,
    signature text not null,
    hash text not null
  )`,
];

export const runMigrations = async () => {
  for (const table of tables) {
    await sql.run(table);
  }
};

export const createLedgerRecord = (id, question, vote, address) => {
  return new Promise((resolve, reject) => {
    sql.run(
      `insert into ledger(id, question, vote, address) values (?, ?, ?, ?)`,
      [id, question, vote, address],
      err => {
        if (err) {
          return reject(err);
        }
        return resolve(true);
      },
    );
  });
};

export const createAttestation = (id, address, signature, hash) => {
  return new Promise((resolve, reject) => {
    sql.run(
      `insert into attestation(id, address, signature, hash) values (?, ?, ?, ?)`,
      [id, address, signature, hash],
      err => {
        if (err) {
          return reject(err);
        }
        return resolve(true);
      },
    );
  });
};
