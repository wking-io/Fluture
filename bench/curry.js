const benchmark = require('benchmark');
const suite = new benchmark.Suite();
const curry = require('lodash.curry');

const lodash = curry(function(a, b){
  return a + b;
});

const manual = function(a, b){
  if(arguments.length === 1) return b => manual(a, b);
  return a + b;
};

suite.add('Lodash uncurried', () => {
  lodash(1, 2);
});

suite.add('Manual uncurried', () => {
  manual(1, 2);
});

suite.add('Lodash curried', () => {
  lodash(1)(2);
});

suite.add('Manual curried', () => {
  manual(1)(2);
});

suite.on('complete', require('./_print'))
suite.run()
