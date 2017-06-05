import buble from 'rollup-plugin-buble';

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
  plugins: [buble()],
  external: Object.keys(dependencies),
  globals: dependencies,
  format: 'umd',
  moduleName: 'Fluture',
  dest: pkg.main
};
