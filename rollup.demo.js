import livereload from 'rollup-plugin-livereload';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';
import serve from 'rollup-plugin-serve';
import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

export default {
  input: './demo/src/main.ts',
  output: {
    file: './demo/public/bundle.js',
    format: 'iife', // Immediately-invoked function expression — suitable for <script> tags
    sourcemap: true,
  },
  plugins: [
    globals(),
    builtins(),
    typescript({
      tsconfig: './demo/tsconfig.json',
    }),
    production && terser(), // Minify, but only in production
    !production && serve('demo/public'),
    !production && livereload(),
  ],
};
