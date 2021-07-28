import { Buffer } from 'buffer';

import { base32Decode, base32Encode, hexToArrayBuffer } from '../../src';

(window as any).base32Decode = base32Decode;
(window as any).base32Encode = base32Encode;
(window as any).hexToArrayBuffer = hexToArrayBuffer;

const input = document.querySelector<HTMLInputElement>('#input')!;
const output = document.querySelector<HTMLInputElement>('#output')!;

input.addEventListener('input', event => inputChange((event.target as HTMLInputElement).value));
output.addEventListener('input', event => outputChange((event.target as HTMLInputElement).value));

function inputChange(str: string): void {
  output.value = base32Encode(Buffer.from(str));
}

function outputChange(str: string): void {
  input.value = Buffer.from(base32Decode(str)).toString();
}
