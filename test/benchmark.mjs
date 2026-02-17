import { test } from 'node:test';
import { toBase32, fromBase32, toBase32hex, fromBase32hex } from '@exodus/bytes/base32.js';
import { base32, base32hex, base32crockford } from '@scure/base';
import linusDecode from 'base32-decode';
import linusEncode from 'base32-encode';
import { Bench } from 'tinybench';

import { base32Decode, base32Encode } from '../dist/src/index.js';

const KB = 1024;
const warmup = 100;
const time = 500;

const random4k = crypto.getRandomValues(new Uint8Array(4 * KB));
const random64k = crypto.getRandomValues(new Uint8Array(64 * KB));

const encodedRfc4648 = base32Encode(random64k, 'RFC4648', { padding: true });
const encodedRfc4648Hex = base32Encode(random64k, 'RFC4648-HEX', { padding: true });
const encodedCrockford = base32Encode(random64k, 'Crockford', { padding: false });
const encodedRfc4648NoPad = base32Encode(random64k, 'RFC4648', { padding: false });
const encodedRfc4648HexNoPad = base32Encode(random64k, 'RFC4648-HEX', { padding: false });

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
  })
  .add('@scure/base encode 64KB', () => {
    base32.encode(random64k);
  })
  .add('@scure/base encode hex 64KB', () => {
    base32hex.encode(random64k);
  })
  .add('@scure/base encode crockford 64KB', () => {
    base32crockford.encode(random64k);
  })
  .add('@scure/base decode 64KB', () => {
    base32.decode(encodedRfc4648);
  })
  .add('@scure/base decode hex 64KB', () => {
    base32hex.decode(encodedRfc4648Hex);
  })
  .add('@scure/base decode crockford 64KB', () => {
    base32crockford.decode(encodedCrockford);
  })
  .add('@exodus/bytes encode 64KB', () => {
    toBase32(random64k);
  })
  .add('@exodus/bytes encode hex 64KB', () => {
    toBase32hex(random64k);
  })
  .add('@exodus/bytes decode 64KB', () => {
    fromBase32(encodedRfc4648NoPad);
  })
  .add('@exodus/bytes decode hex 64KB', () => {
    fromBase32hex(encodedRfc4648HexNoPad);
  })
  .add('base32-encode (LinusU) 64KB', () => {
    linusEncode(random64k, 'RFC4648');
  })
  .add('base32-decode (LinusU) 64KB', () => {
    linusDecode(encodedRfc4648, 'RFC4648');
  });

test('benchmark', async () => {
  await bench.run();

  console.log('base32 tinybench results');
  console.table(bench.table());
});
