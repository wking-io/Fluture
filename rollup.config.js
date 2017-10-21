var pkg = require('./package.json');

var dependencies = {
  'concurrify': 'concurrify',
  'denque': 'Denque',
  'inspect-f': 'inspectf',
  'sanctuary-type-classes': 'sanctuaryTypeClasses',
  'sanctuary-type-identifiers': 'sanctuaryTypeIdentifiers'
};

export default {
  entry: 'index.cjs.js',
  external: Object.keys(dependencies),
  globals: dependencies,
  format: 'umd',
  moduleName: 'Fluture',
  dest: pkg.main
};
