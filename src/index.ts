/* eslint-disable no-bitwise */
const RFC4648 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const RFC4648_HEX = '0123456789ABCDEFGHIJKLMNOPQRSTUV';
const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

function createEncodePairs(alphabet: string): string[] {
  const pairs: string[] = [];
  for (let i = 0; i < 32; i++) {
    for (let j = 0; j < 32; j++) {
      pairs.push(alphabet[i]! + alphabet[j]!);
    }
  }
  return pairs;
}

function createEncodeLookup(alphabet: string): Uint8Array {
  const table = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    table[i] = alphabet.charCodeAt(i);
  }
  return table;
}

let rfc4648EncodePairs: string[] | undefined;
let rfc4648HexEncodePairs: string[] | undefined;
let crockfordEncodePairs: string[] | undefined;
let rfc4648EncodeLookup: Uint8Array | undefined;
let rfc4648HexEncodeLookup: Uint8Array | undefined;
let crockfordEncodeLookup: Uint8Array | undefined;

function getEncodePairs(variant: Variant): string[] {
  switch (variant) {
    case 'RFC3548':
    case 'RFC4648': {
      if (rfc4648EncodePairs === undefined) {
        rfc4648EncodePairs = createEncodePairs(RFC4648);
      }
      return rfc4648EncodePairs;
    }
    case 'RFC4648-HEX': {
      if (rfc4648HexEncodePairs === undefined) {
        rfc4648HexEncodePairs = createEncodePairs(RFC4648_HEX);
      }
      return rfc4648HexEncodePairs;
    }
    case 'Crockford': {
      if (crockfordEncodePairs === undefined) {
        crockfordEncodePairs = createEncodePairs(CROCKFORD);
      }
      return crockfordEncodePairs;
    }
    default: {
      throw new Error(`Unknown base32 variant: ${variant as string}`);
    }
  }
}

function getEncodeLookup(variant: Variant): Uint8Array {
  switch (variant) {
    case 'RFC3548':
    case 'RFC4648': {
      if (rfc4648EncodeLookup === undefined) {
        rfc4648EncodeLookup = createEncodeLookup(RFC4648);
      }
      return rfc4648EncodeLookup;
    }
    case 'RFC4648-HEX': {
      if (rfc4648HexEncodeLookup === undefined) {
        rfc4648HexEncodeLookup = createEncodeLookup(RFC4648_HEX);
      }
      return rfc4648HexEncodeLookup;
    }
    case 'Crockford': {
      if (crockfordEncodeLookup === undefined) {
        crockfordEncodeLookup = createEncodeLookup(CROCKFORD);
      }
      return crockfordEncodeLookup;
    }
    default: {
      throw new Error(`Unknown base32 variant: ${variant as string}`);
    }
  }
}

function createDecodeLookup(alphabet: string, crockfordAliases: boolean): Int8Array {
  const table = new Int8Array(128);
  table.fill(-1);

  for (let i = 0; i < alphabet.length; i++) {
    const code = alphabet.charCodeAt(i);
    table[code] = i;

    if (code >= 65 && code <= 90) {
      table[code + 32] = i;
    }
  }

  if (crockfordAliases) {
    table[79] = 0;
    table[111] = 0;
    table[73] = 1;
    table[105] = 1;
    table[76] = 1;
    table[108] = 1;
  }

  return table;
}

let rfc4648Lookup: Int8Array | undefined;
let rfc4648HexLookup: Int8Array | undefined;
let crockfordLookup: Int8Array | undefined;

function getDecodeLookup(variant: Variant): Int8Array {
  switch (variant) {
    case 'RFC3548':
    case 'RFC4648': {
      if (rfc4648Lookup === undefined) {
        rfc4648Lookup = createDecodeLookup(RFC4648, false);
      }
      return rfc4648Lookup;
    }
    case 'RFC4648-HEX': {
      if (rfc4648HexLookup === undefined) {
        rfc4648HexLookup = createDecodeLookup(RFC4648_HEX, false);
      }
      return rfc4648HexLookup;
    }
    case 'Crockford': {
      if (crockfordLookup === undefined) {
        crockfordLookup = createDecodeLookup(CROCKFORD, true);
      }
      return crockfordLookup;
    }
    default: {
      throw new Error(`Unknown base32 variant: ${variant as string}`);
    }
  }
}

type Variant = 'RFC3548' | 'RFC4648' | 'RFC4648-HEX' | 'Crockford';

const PADDING_CHARS = ['', '======', '====', '===', '='];

export function base32Encode(
  input: Uint8Array,
  variant: Variant = 'RFC4648',
  options: Partial<{ padding: boolean }> = {},
): string {
  const pairs = getEncodePairs(variant);
  const encodeLookup = getEncodeLookup(variant);
  const defaultPadding = variant !== 'Crockford';
  const padding = options.padding ?? defaultPadding;
  const length = input.byteLength;

  const fullChunks = Math.floor(length / 5);
  const fullChunksBytes = fullChunks * 5;

  let o = '';
  let i = 0;

  for (; i < fullChunksBytes; i += 5) {
    const a = input[i]!;
    const b = input[i + 1]!;
    const c = input[i + 2]!;
    const d = input[i + 3]!;
    const e = input[i + 4]!;
    const x0 = (a << 2) | (b >> 6);
    const x1 = ((b & 0x3f) << 4) | (c >> 4);
    const x2 = ((c & 0xf) << 6) | (d >> 2);
    const x3 = ((d & 0x3) << 8) | e;
    o += pairs[x0]!;
    o += pairs[x1]!;
    o += pairs[x2]!;
    o += pairs[x3]!;
  }

  const remaining = length - fullChunksBytes;
  if (remaining > 0) {
    let bits = 0;
    let value = 0;
    for (; i < length; i++) {
      value = (value << 8) | input[i]!;
      bits += 8;
      while (bits >= 5) {
        o += String.fromCharCode(encodeLookup[(value >>> (bits - 5)) & 31]!);
        bits -= 5;
      }
    }
    if (bits > 0) {
      o += String.fromCharCode(encodeLookup[(value << (5 - bits)) & 31]!);
    }
  }

  if (padding) {
    o += PADDING_CHARS[remaining]!;
  }

  return o;
}

function readChar(table: Int8Array, charCode: number): number {
  const idx = charCode < 128 ? table[charCode]! : -1;

  if (idx === -1) {
    throw new Error(`Invalid character found: ${String.fromCharCode(charCode)}`);
  }

  return idx;
}

export function base32Decode(input: string, variant: Variant = 'RFC4648'): Uint8Array {
  const m = getDecodeLookup(variant);

  let end = input.length;

  if (variant !== 'Crockford') {
    while (end > 0 && input.charCodeAt(end - 1) === 61) {
      end--;
    }
  }

  const tailLength = end % 8;
  const mainLength = end - tailLength;
  const output = new Uint8Array(Math.trunc((end * 5) / 8));
  let at = 0;

  for (let i = 0; i < mainLength; i += 8) {
    const x0 = input.charCodeAt(i);
    const x1 = input.charCodeAt(i + 1);
    const x2 = input.charCodeAt(i + 2);
    const x3 = input.charCodeAt(i + 3);
    const x4 = input.charCodeAt(i + 4);
    const x5 = input.charCodeAt(i + 5);
    const x6 = input.charCodeAt(i + 6);
    const x7 = input.charCodeAt(i + 7);
    const a = (m[x0]! << 15) | (m[x1]! << 10) | (m[x2]! << 5) | m[x3]!;
    const b = (m[x4]! << 15) | (m[x5]! << 10) | (m[x6]! << 5) | m[x7]!;
    if (a < 0 || b < 0) {
      for (let j = i; j < i + 8; j++) readChar(m, input.charCodeAt(j));
    }
    output[at] = a >> 12;
    output[at + 1] = (a >> 4) & 0xff;
    output[at + 2] = ((a << 4) & 0xff) | (b >> 16);
    output[at + 3] = (b >> 8) & 0xff;
    output[at + 4] = b & 0xff;
    at += 5;
  }

  let bits = 0;
  let value = 0;
  for (let i = mainLength; i < end; i++) {
    value = (value << 5) | readChar(m, input.charCodeAt(i));
    bits += 5;
    if (bits >= 8) {
      output[at++] = (value >>> (bits - 8)) & 255;
      bits -= 8;
    }
  }

  return output;
}

/**
 * Turn a string of hexadecimal characters into an Uint8Array
 */
export function hexToUint8Array(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) {
    throw new RangeError('Expected string to be an even number of characters');
  }

  const view = new Uint8Array(hex.length / 2);

  for (let i = 0; i < hex.length; i += 2) {
    view[i / 2] = Number.parseInt(hex.slice(i, i + 2), 16);
  }

  return view;
}
