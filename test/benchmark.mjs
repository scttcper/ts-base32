import { randomBytes } from 'node:crypto';

import { Bench } from 'tinybench';

import { base32Decode, base32Encode } from '../dist/src/index.js';

const KB = 1024;
const warmup = 100;
const time = 500;

const random4k = randomBytes(4 * KB);
const random64k = randomBytes(64 * KB);

const encodedRfc4648 = base32Encode(random64k, 'RFC4648', { padding: true });
const encodedRfc4648Hex = base32Encode(random64k, 'RFC4648-HEX', { padding: true });
const encodedCrockford = base32Encode(random64k, 'Crockford', { padding: false });

const bench = new Bench({
  warmup,
  time,
});

bench
  .add('encode RFC4648 4KB', () => {
    base32Encode(random4k, 'RFC4648', { padding: true });
  })
  .add('encode RFC4648 64KB', () => {
    base32Encode(random64k, 'RFC4648', { padding: true });
  })
  .add('encode RFC4648-HEX 64KB', () => {
    base32Encode(random64k, 'RFC4648-HEX', { padding: true });
  })
  .add('encode Crockford 64KB', () => {
    base32Encode(random64k, 'Crockford', { padding: false });
  })
  .add('decode RFC4648 64KB', () => {
    base32Decode(encodedRfc4648, 'RFC4648');
  })
  .add('decode RFC4648-HEX 64KB', () => {
    base32Decode(encodedRfc4648Hex, 'RFC4648-HEX');
  })
  .add('decode Crockford 64KB', () => {
    base32Decode(encodedCrockford, 'Crockford');
  });

await bench.run();

console.log('base32 tinybench results');
console.table(bench.table());
