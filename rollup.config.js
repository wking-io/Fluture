var pkg = require('./package.json');

var dependencies = {
  'concurrify': 'concurrify',
  'denque': 'Denque',
  'inspect-f': 'inspectf',
  'sanctuary-type-classes': 'sanctuaryTypeClasses',
  'sanctuary-type-identifiers': 'sanctuaryTypeIdentifiers'
};

export default {
  input: 'index.cjs.js',
  external: Object.keys(dependencies),
  globals: dependencies,
  name: 'Fluture',
  output: {format: 'umd', file: pkg.main}
};
