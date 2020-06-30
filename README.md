# ts-base32 [![npm](https://img.shields.io/npm/v/@ctrl/ts-base32.svg?maxAge=3600)](https://www.npmjs.com/package/@ctrl/ts-base32) [![CircleCI](https://circleci.com/gh/TypeCtrl/ts-base32.svg?style=svg)](https://circleci.com/gh/TypeCtrl/ts-base32) [![coverage status](https://codecov.io/gh/typectrl/ts-base32/branch/master/graph/badge.svg)](https://codecov.io/gh/typectrl/ts-base32)

Base32 encode and decode in typescript exported as both commonjs and tree shakeable modules. Support for RFC4648, RFC4648_HEX, and CROCKFORD base32 encoding. Mostly directly taken from LinusU's packages.

Demo: https://ts-base32.vercel.app

### Install
```console
npm install @ctrl/ts-base32
```

### Use
```ts
import { base32Encode, base32Decode } from '@ctrl/ts-base32';

console.log(base32Encode(Buffer.from('a')));
// 'ME======'

console.log(base32Encode(Buffer.from('a'), { padding: false }));
// 'ME'

console.log(base32Decode('ME======'));
// ArrayBuffer { byteLength: 1 }

console.log(Buffer.from(base32Decode('ME======')).toString());
// 'a'
```

### See Also
base32-encode - https://github.com/LinusU/base32-encode  
base32-decode - https://github.com/LinusU/base32-decode  
hex-to-array-buffer - https://github.com/LinusU/hex-to-array-buffer  
