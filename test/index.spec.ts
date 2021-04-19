import { describe, it, expect } from '@jest/globals';

import { base32Encode, base32Decode, hexToArrayBuffer } from '../src/index';
import { TEST_CASES, CROCKFORD_EXTRAS } from './test-cases';

describe('base32', () => {
  describe('encode', () => {
    it.each(TEST_CASES)(
      'should encode (%s, %s)',
      (variant: any, input: string, expected: string) => {
        expect(base32Encode(hexToArrayBuffer(input), variant)).toEqual(expected);
      },
    );

    it.each(TEST_CASES)(
      'should encode w/ padding disabled (%s, %s)',
      (variant: any, input: string, expected: string) => {
        const options = { padding: false };
        expect(base32Encode(hexToArrayBuffer(input), variant, options)).toEqual(
          // eslint-disable-next-line no-useless-escape
          expected.replace(/\=/g, ''),
        );
      },
    );

    it('should encode simple examples', () => {
      expect(base32Encode(Buffer.from('a'))).toBe('ME======');
      expect(base32Encode(Buffer.from('be'))).toBe('MJSQ====');
      expect(base32Encode(Buffer.from('bee'))).toBe('MJSWK===');
      expect(base32Encode(Buffer.from('beer'))).toBe('MJSWK4Q=');
      expect(base32Encode(Buffer.from('beers'))).toBe('MJSWK4TT');
      expect(base32Encode(Buffer.from('beers 1'))).toBe('MJSWK4TTEAYQ====');
      expect(base32Encode(Buffer.from('shockingly dismissed'))).toBe(
        'ONUG6Y3LNFXGO3DZEBSGS43NNFZXGZLE',
      );
    });
    it('should error on unsupported variant', () => {
      expect(() => base32Encode(Buffer.from('a'), 'fail' as any)).toThrow(
        'Unknown base32 variant: fail',
      );
    });
  });

  describe('decode', () => {
    it.each(TEST_CASES)(
      'should decode (%s, %s)',
      (variant: any, input: string, expected: string) => {
        expect(base32Decode(expected, variant)).toEqual(hexToArrayBuffer(input));
      },
    );
    it.each(CROCKFORD_EXTRAS)(
      'should decode crockford extra (%s, %s)',
      (variant: any, input: string, expected: string) => {
        expect(base32Decode(expected, variant)).toEqual(hexToArrayBuffer(input));
      },
    );
    it('should decode simple examples', () => {
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

    it('should be binary safe', () => {
      expect(
        Buffer.from(base32Decode(base32Encode(Buffer.from([0x00, 0xff, 0x88])))).toString('hex'),
      ).toBe('00ff88');
      const code = 'f61e1f998d69151de8334dbe753ab17ae831c13849a6aecd95d0a4e5dc25';
      const encoded = '6YPB7GMNNEKR32BTJW7HKOVRPLUDDQJYJGTK5TMV2CSOLXBF';
      expect(base32Encode(Buffer.from(code, 'hex')).toString()).toBe(encoded);
      expect(Buffer.from(base32Decode(encoded)).toString('hex')).toBe(code);
    });
    it('should error on unsupported variant', () => {
      expect(() => base32Decode('ME======', 'fail' as any)).toThrow('Unknown base32 variant: fail');
    });
    it('should error from invalid encoding characters', () => {
      expect(() => base32Decode('M😴')).toThrow('Invalid character found: ');
    });
  });

  describe('hexToArrayBuffer', () => {
    it('should convert characters to ArrayBuffer', () => {
      expect(hexToArrayBuffer('')).toEqual(Uint8Array.from([]).buffer);
      expect(hexToArrayBuffer('1337')).toEqual(Uint8Array.from([0x13, 0x37]).buffer);
      expect(hexToArrayBuffer('aabb')).toEqual(Uint8Array.from([0xaa, 0xbb]).buffer);
      expect(hexToArrayBuffer('AABB')).toEqual(Uint8Array.from([0xaa, 0xbb]).buffer);
      expect(hexToArrayBuffer('ceae96a325e1dc5dd4f405d905049ceb')).toEqual(
        Uint8Array.from([
          0xce,
          0xae,
          0x96,
          0xa3,
          0x25,
          0xe1,
          0xdc,
          0x5d,
          0xd4,
          0xf4,
          0x05,
          0xd9,
          0x05,
          0x04,
          0x9c,
          0xeb,
        ]).buffer,
      );
      expect(hexToArrayBuffer('CEAE96A325E1DC5DD4F405D905049CEB')).toEqual(
        Uint8Array.from([
          0xce,
          0xae,
          0x96,
          0xa3,
          0x25,
          0xe1,
          0xdc,
          0x5d,
          0xd4,
          0xf4,
          0x05,
          0xd9,
          0x05,
          0x04,
          0x9c,
          0xeb,
        ]).buffer,
      );
    });
    it('should error on uneven length', () => {
      expect(() => hexToArrayBuffer('123')).toThrow();
    });
  });
});
