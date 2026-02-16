/* eslint-disable no-bitwise */
const RFC4648 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const RFC4648_HEX = '0123456789ABCDEFGHIJKLMNOPQRSTUV';
const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

function createLookupTable(alphabet: string): Int16Array {
  const table = new Int16Array(128);
  table.fill(-1);

  for (let i = 0; i < alphabet.length; i++) {
    table[alphabet.charCodeAt(i)] = i;
  }

  return table;
}

let rfc4648Lookup: Int16Array | undefined;
let rfc4648HexLookup: Int16Array | undefined;
let crockfordLookup: Int16Array | undefined;

function getLookupTable(variant: Variant): Int16Array {
  switch (variant) {
    case 'RFC3548':
    case 'RFC4648': {
      if (rfc4648Lookup === undefined) {
        rfc4648Lookup = createLookupTable(RFC4648);
      }

      return rfc4648Lookup;
    }
    case 'RFC4648-HEX': {
      if (rfc4648HexLookup === undefined) {
        rfc4648HexLookup = createLookupTable(RFC4648_HEX);
      }

      return rfc4648HexLookup;
    }
    case 'Crockford': {
      if (crockfordLookup === undefined) {
        crockfordLookup = createLookupTable(CROCKFORD);
      }

      return crockfordLookup;
    }
    default: {
      throw new Error(`Unknown base32 variant: ${variant as string}`);
    }
  }
}

type Variant = 'RFC3548' | 'RFC4648' | 'RFC4648-HEX' | 'Crockford';

export function base32Encode(
  input: Uint8Array,
  variant: Variant = 'RFC4648',
  options: Partial<{ padding: boolean }> = {},
): string {
  let alphabet: string;
  let defaultPadding: boolean;

  switch (variant) {
    case 'RFC3548':
    case 'RFC4648': {
      alphabet = RFC4648;
      defaultPadding = true;
      break;
    }
    case 'RFC4648-HEX': {
      alphabet = RFC4648_HEX;
      defaultPadding = true;
      break;
    }
    case 'Crockford': {
      alphabet = CROCKFORD;
      defaultPadding = false;
      break;
    }
    default: {
      throw new Error(`Unknown base32 variant: ${variant as string}`);
    }
  }

  const padding = options.padding ?? defaultPadding;
  const length = input.byteLength;

  let bits = 0;
  let value = 0;
  let output = '';

  for (let i = 0; i < length; i++) {
    value = (value << 8) | input[i]!;
    bits += 8;

    while (bits >= 5) {
      output += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += alphabet[(value << (5 - bits)) & 31];
  }

  if (padding) {
    while (output.length % 8 !== 0) {
      output += '=';
    }
  }

  return output;
}

function readChar(table: Int16Array, charCode: number): number {
  const idx = charCode < 128 ? table[charCode]! : -1;

  if (idx === -1) {
    throw new Error(`Invalid character found: ${String.fromCharCode(charCode)}`);
  }

  return idx;
}

export function base32Decode(input: string, variant: Variant = 'RFC4648'): Uint8Array {
  const lookup = getLookupTable(variant);
  let cleanedInput: string;

  switch (variant) {
    case 'RFC3548':
    case 'RFC4648': {
      cleanedInput = input.toUpperCase().replace(/=+$/, '');
      break;
    }
    case 'RFC4648-HEX': {
      cleanedInput = input.toUpperCase().replace(/=+$/, '');
      break;
    }
    case 'Crockford': {
      cleanedInput = input.toUpperCase().replace(/O/g, '0').replace(/[IL]/g, '1');
      break;
    }
    default: {
      throw new Error(`Unknown base32 variant: ${variant as string}`);
    }
  }

  const length = cleanedInput.length;

  let bits = 0;
  let value = 0;

  let index = 0;
  const output = new Uint8Array(Math.trunc((length * 5) / 8));

  for (let i = 0; i < length; i++) {
    value = (value << 5) | readChar(lookup, cleanedInput.charCodeAt(i));
    bits += 5;

    if (bits >= 8) {
      output[index++] = (value >>> (bits - 8)) & 255;
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
