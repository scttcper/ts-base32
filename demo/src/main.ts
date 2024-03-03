// @ts-expect-error
import { base32Decode, base32Encode, hexToUint8Array } from '../../src/index.js';

(window as any).base32Decode = base32Decode;
(window as any).base32Encode = base32Encode;
(window as any).hexToUint8Array = hexToUint8Array;

const input = document.querySelector<HTMLInputElement>('#input')!;
const output = document.querySelector<HTMLInputElement>('#output')!;

input.addEventListener('input', event => inputChange((event.target as HTMLInputElement).value));
output.addEventListener('input', event => outputChange((event.target as HTMLInputElement).value));

const cachedEncoder = new globalThis.TextEncoder();
const cachedDecoder = new globalThis.TextDecoder();

function stringToUint8Array(str: string) {
  return cachedEncoder.encode(str);
}

function uint8ArrayToString(array: Uint8Array) {
  return cachedDecoder.decode(array);
}

function inputChange(str: string): void {
  output.value = base32Encode(stringToUint8Array(str));
}

function outputChange(str: string): void {
  input.value = uint8ArrayToString(base32Decode(str));
}
