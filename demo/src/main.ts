import { Buffer } from 'buffer';
import { base32Decode, base32Encode } from '../../src';

const input = document.querySelector<HTMLInputElement>('#input');
const output = document.querySelector<HTMLInputElement>('#output');

input.addEventListener('keyup', event => inputChange((event.target as HTMLInputElement).value));
output.addEventListener('keyup', event => outputChange((event.target as HTMLInputElement).value));

function inputChange(str: string) {
  output.value = base32Encode(Buffer.from(str));
}

function outputChange(str: string) {
  input.value = Buffer.from(base32Decode(str)).toString();
}
