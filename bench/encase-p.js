'use strict';

const benchmark = require('benchmark');
const suite = new benchmark.Suite();
const Future = require('..');

const resolve = x => Promise.resolve(x);
const noop = () => {};

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
