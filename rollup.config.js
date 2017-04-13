/*eslint camelcase: 0*/

import buble from 'rollup-plugin-buble';
import uglify from 'rollup-plugin-uglify';

const pkg = require('./package.json');

const dependencies = {
  'concurrify': 'concurrify',
  'denque': 'Denque',
  'inspect-f': 'inspectf',
  'sanctuary-type-classes': 'sanctuaryTypeClasses',
  'sanctuary-type-identifiers': 'sanctuaryTypeIdentifiers'
};

export default {
  entry: 'src/index.js',
  plugins: [
    buble(),
    uglify({mangle: false})
  ],
  external: Object.keys(dependencies),
  globals: dependencies,
  format: 'umd',
  moduleName: 'Fluture',
  dest: pkg.main
};
