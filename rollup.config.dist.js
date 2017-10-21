/* global process */

import node from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

var pkg = require('./package.json');

var banner = `/**
 * Fluture bundled; version ${process.env.VERSION || `${pkg.version} (dirty)`}
 */
`;

export default {
  entry: 'index.cjs.js',
  plugins: [node(), commonjs({include: 'node_modules/**'})],
  banner: banner,
  format: 'iife',
  moduleName: 'Fluture',
  dest: 'dist/bundle.js'
};
