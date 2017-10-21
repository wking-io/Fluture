'use strict';

var benchmark = require('benchmark');
var suite = new benchmark.Suite();
var Future = require('..');

var resolve = x => Promise.resolve(x);
var noop = () => {};

suite.add('encaseP', {
  defer: true,
  fn: (deferred) => {
    Future.encaseP(resolve, 1).value(x => deferred.resolve(x));
  }
});

suite.add('encaseP2', {
  defer: true,
  fn: (deferred) => {
    Future.encaseP2(resolve, 1, 2).value(x => deferred.resolve(x));
  }
});

suite.add('encaseP3', {
  defer: true,
  fn: (deferred) => {
    Future.encaseP3(resolve, 1, 2, 3).value(x => deferred.resolve(x));
  }
});

suite.on('complete', require('./_print'));
suite.run({async: true});
