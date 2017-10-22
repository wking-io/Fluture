var benchmark = require('benchmark');
var suite = new benchmark.Suite();
var curry = require('lodash.curry');
var {util} = require('..');

var lodash = curry(function(a, b){
  return a + b;
});

function manual(a, b){
  if(arguments.length === 1) return util.unaryPartial(manual, a);
  return a + b;
}

function manual3if(a, b, c, d){
  if(arguments.length === 1) return util.unaryPartial(manual3if, a);
  if(arguments.length === 2) return util.binaryPartial(manual3if, a, b);
  if(arguments.length === 3) return util.ternaryPartial(manual3if, a, b, c);
  return a + b + c + d;
}

function manual3switch(a, b, c, d){
  switch(arguments.length){
    case 1: return util.unaryPartial(manual3switch, a);
    case 2: return util.binaryPartial(manual3switch, a, b);
    case 3: return util.ternaryPartial(manual3switch, a, b, c);
    default: return a + b + c + d;
  }
}

suite.add('Lodash uncurried', () => {
  lodash(1, 2);
});

suite.add('Lodash curried', () => {
  lodash(1)(2);
});

suite.add('Manual uncurried', () => {
  manual(1, 2);
});

suite.add('Manual curried', () => {
  manual(1)(2);
});

suite.add('Manual 3 (if)', () => {
  manual3if(1)(2)(3)(4);
});

suite.add('Manual 3 (switch)', () => {
  manual3switch(1)(2)(3)(4);
});

suite.on('complete', require('./_print'))
suite.run()
