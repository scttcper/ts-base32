# ts-base32 [![npm](https://badgen.net/npm/v/@ctrl/ts-base32)](https://www.npmjs.com/package/@ctrl/ts-base32) [![bundlesize](https://badgen.net/bundlephobia/min/@ctrl/ts-base32)](https://bundlephobia.com/result?p=@ctrl/ts-base32)

Base32 encode and decode in typescript exported as both commonjs and tree shakeable modules. Support for RFC4648, RFC4648_HEX, and CROCKFORD base32 encoding. Mostly directly taken from LinusU's packages.

Demo: https://ts-base32.ep.workers.dev

### Install

```console
npm install @ctrl/ts-base32
```

### Use

```ts
import { base32Encode, base32Decode } from '@ctrl/ts-base32';
import { stringToUint8Array, uint8ArrayToString } from 'uint8array-extras';

console.log(base32Encode(stringToUint8Array('a')));
// 'ME======'

console.log(base32Encode(stringToUint8Array('a'), { padding: false }));
// 'ME'

console.log(base32Decode('ME======'));
// Uint8Array

console.log(uint8ArrayToString(base32Decode('ME======'))
// 'a'
```

### See Also

base32-encode - https://github.com/LinusU/base32-encode  
base32-decode - https://github.com/LinusU/base32-decode  
uint8array-extras - https://github.com/sindresorhus/uint8array-extras
