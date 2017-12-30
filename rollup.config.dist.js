/* global process */

import node from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

var pkg = require('./package.json');

var banner = `/**
 * Fluture bundled; version ${process.env.VERSION || `${pkg.version} (dirty)`}
 */
`;

export default {
  input: 'index.cjs.js',
  plugins: [node(), commonjs({include: 'node_modules/**'})],
  banner: banner,
  output: {
    format: 'iife',
    name: 'Fluture',
    file: 'dist/bundle.js'
  }
};
