const RFC4648 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const RFC4648_HEX = '0123456789ABCDEFGHIJKLMNOPQRSTUV';
const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

export type Variant = 'RFC3548' | 'RFC4648' | 'RFC4648-HEX' | 'Crockford';
export interface Base32EncodeOptions {
  padding: boolean;
}

export function base32Encode(
  buffer: ArrayBuffer,
  variant: Variant = 'RFC4648',
  options: Partial<Base32EncodeOptions> = {},
) {
  let alphabet;
  let defaultPadding;

  switch (variant) {
    case 'RFC3548':
    case 'RFC4648':
      alphabet = RFC4648;
      defaultPadding = true;
      break;
    case 'RFC4648-HEX':
      alphabet = RFC4648_HEX;
      defaultPadding = true;
      break;
    case 'Crockford':
      alphabet = CROCKFORD;
      defaultPadding = false;
      break;
    default:
      throw new Error('Unknown base32 variant: ' + variant);
  }

  const padding = options.padding !== undefined ? options.padding : defaultPadding;
  const length = buffer.byteLength;
  const view = new Uint8Array(buffer);

  let bits = 0;
  let value = 0;
  let output = '';

  for (let i = 0; i < length; i++) {
    value = (value << 8) | view[i];
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

function readChar(alphabet, char) {
  const idx = alphabet.indexOf(char);

  if (idx === -1) {
    throw new Error('Invalid character found: ' + char);
  }

  return idx;
}

export function base32Decode(input: string, variant: Variant = 'RFC4648'): ArrayBuffer {
  let alphabet;
  let cleanedInput: string;

  switch (variant) {
    case 'RFC3548':
    case 'RFC4648':
      alphabet = RFC4648;
      cleanedInput = input.toUpperCase().replace(/=+$/, '');
      break;
    case 'RFC4648-HEX':
      alphabet = RFC4648_HEX;
      cleanedInput = input.toUpperCase().replace(/=+$/, '');
      break;
    case 'Crockford':
      alphabet = CROCKFORD;
      cleanedInput = input
        .toUpperCase()
        .replace(/O/g, '0')
        .replace(/[IL]/g, '1');
      break;
    default:
      throw new Error('Unknown base32 variant: ' + variant);
  }

  const length = cleanedInput.length;

  let bits = 0;
  let value = 0;

  let index = 0;
  const output = new Uint8Array(((length * 5) / 8) | 0);

  for (let i = 0; i < length; i++) {
    value = (value << 5) | readChar(alphabet, cleanedInput[i]);
    bits += 5;

    if (bits >= 8) {
      output[index++] = (value >>> (bits - 8)) & 255;
      bits -= 8;
    }
  }

  return output.buffer;
}

/**
 * Turn a string of hexadecimal characters into an ArrayBuffer
 */
export function hexToArrayBuffer(hex: string): ArrayBuffer {
  if (hex.length % 2 !== 0) {
    throw new RangeError('Expected string to be an even number of characters');
  }

  const view = new Uint8Array(hex.length / 2);

  for (let i = 0; i < hex.length; i += 2) {
    view[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }

  return view.buffer;
}
