import { open } from 'lmdb';

export const db = open({
  path: './records',
  compression: true,
});
