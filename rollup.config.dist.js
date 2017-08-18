/* global process */

import buble from 'rollup-plugin-buble';
import node from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

const pkg = require('./package.json');

const banner = `/**
 * Fluture bundled; version ${process.env.VERSION || `${pkg.version} (dirty)`}
 */
`;

export default {
  entry: 'src/index.js',
  plugins: [buble(), node(), commonjs({include: 'node_modules/**'})],
  banner: banner,
  format: 'iife',
  moduleName: 'Fluture',
  dest: 'dist/bundle.js'
};
