import { Buffer } from 'node:buffer';

import { stringToUint8Array } from 'uint8array-extras';
import { describe, expect, test } from 'vitest';

import { base32Decode, base32Encode, hexToUint8Array } from '../src/index.js';

import { CROCKFORD_EXTRAS, TEST_CASES } from './test-cases.js';

describe('encode', () => {
  TEST_CASES.forEach(([variant, input, expected]) => {
    test(`should encode ${variant} ${input}`, () => {
      expect(base32Encode(hexToUint8Array(input), variant as any)).toEqual(expected);
    });
  });

  TEST_CASES.forEach(([variant, input, expected]) => {
    test(`should encode w/ padding disabled ${variant} ${input}`, () => {
      const options = { padding: false };
      expect(base32Encode(hexToUint8Array(input), variant as any, options)).toEqual(
        expected.replace(/=/g, ''),
      );
    });
  });

  test('should encode simple examples', () => {
    expect(base32Encode(Buffer.from('a'))).toBe('ME======');
    expect(base32Encode(stringToUint8Array('a'))).toBe('ME======');
    expect(base32Encode(Buffer.from('be'))).toBe('MJSQ====');
    expect(base32Encode(Buffer.from('bee'))).toBe('MJSWK===');
    expect(base32Encode(Buffer.from('beer'))).toBe('MJSWK4Q=');
    expect(base32Encode(Buffer.from('beers'))).toBe('MJSWK4TT');
    expect(base32Encode(Buffer.from('beers 1'))).toBe('MJSWK4TTEAYQ====');
    expect(base32Encode(Buffer.from('shockingly dismissed'))).toBe(
      'ONUG6Y3LNFXGO3DZEBSGS43NNFZXGZLE',
    );
  });
  test('should error on unsupported variant', () => {
    expect(() => base32Encode(Buffer.from('a'), 'fail' as any)).toThrow(
      'Unknown base32 variant: fail',
    );
  });
});

describe('decode', () => {
  TEST_CASES.forEach(([variant, input, expected]) => {
    test(`should decode ${variant} ${input}`, () => {
      expect(base32Decode(expected, variant as any)).toEqual(hexToUint8Array(input));
    });
  });
  CROCKFORD_EXTRAS.forEach(([variant, input, expected]) => {
    test(`should decode crockford extra ${variant} ${input}`, () => {
      expect(base32Decode(expected, variant as any)).toEqual(hexToUint8Array(input));
    });
  });
  test('should decode simple examples', () => {
    expect(Buffer.from(base32Decode('ME======')).toString()).toBe('a');
    expect(Buffer.from(base32Decode('MJSQ====')).toString()).toBe('be');
    expect(Buffer.from(base32Decode('ONXW4===')).toString()).toBe('son');
    expect(Buffer.from(base32Decode('MJSWK===')).toString()).toBe('bee');
    expect(Buffer.from(base32Decode('MJSWK4Q=')).toString()).toBe('beer');
    expect(Buffer.from(base32Decode('MJSWK4TT')).toString()).toBe('beers');
    expect(Buffer.from(base32Decode('mjswK4TT')).toString()).toBe('beers');
    expect(Buffer.from(base32Decode('MJSWK4TTN5XA====')).toString()).toBe('beerson');
    expect(Buffer.from(base32Decode('MJSWK4TTEAYQ====')).toString()).toBe('beers 1');
    expect(Buffer.from(base32Decode('ONUG6Y3LNFXGO3DZEBSGS43NNFZXGZLE')).toString()).toBe(
      'shockingly dismissed',
    );
  });

  test('should be binary safe', () => {
    expect(
      Buffer.from(base32Decode(base32Encode(Buffer.from([0x00, 0xFF, 0x88])))).toString('hex'),
    ).toBe('00ff88');
    const code = 'f61e1f998d69151de8334dbe753ab17ae831c13849a6aecd95d0a4e5dc25';
    const encoded = '6YPB7GMNNEKR32BTJW7HKOVRPLUDDQJYJGTK5TMV2CSOLXBF';
    expect(base32Encode(Buffer.from(code, 'hex')).toString()).toBe(encoded);
    expect(Buffer.from(base32Decode(encoded)).toString('hex')).toBe(code);
  });
  test('should error on unsupported variant', () => {
    expect(() => base32Decode('ME======', 'fail' as any)).toThrow('Unknown base32 variant: fail');
  });
  test('should error from invalid encoding characters', () => {
    expect(() => base32Decode('M😴')).toThrow('Invalid character found: ');
  });
});

describe('hexToArrayBuffer', () => {
  test('should convert characters to ArrayBuffer', () => {
    expect(hexToUint8Array('')).toEqual(Uint8Array.from([]));
    expect(hexToUint8Array('1337')).toEqual(Uint8Array.from([0x13, 0x37]));
    expect(hexToUint8Array('aabb')).toEqual(Uint8Array.from([0xAA, 0xBB]));
    expect(hexToUint8Array('AABB')).toEqual(Uint8Array.from([0xAA, 0xBB]));
    expect(hexToUint8Array('ceae96a325e1dc5dd4f405d905049ceb')).toEqual(
      Uint8Array.from([
        0xCE, 0xAE, 0x96, 0xA3, 0x25, 0xE1, 0xDC, 0x5D, 0xD4, 0xF4, 0x05, 0xD9, 0x05, 0x04, 0x9C,
        0xEB,
      ]),
    );
    expect(hexToUint8Array('CEAE96A325E1DC5DD4F405D905049CEB')).toEqual(
      Uint8Array.from([
        0xCE, 0xAE, 0x96, 0xA3, 0x25, 0xE1, 0xDC, 0x5D, 0xD4, 0xF4, 0x05, 0xD9, 0x05, 0x04, 0x9C,
        0xEB,
      ]),
    );
  });
  test('should error on uneven length', () => {
    expect(() => hexToUint8Array('123')).toThrow();
  });
});
