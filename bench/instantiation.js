var benchmark = require('benchmark');
var suite = new benchmark.Suite();
var DataTask = require('data.task');
var RamdaFuture = require('ramda-fantasy').Future;
var Fluture = require('..');

suite.add('Fluture', () => {
  Fluture((rej, res) => res(1));
});

suite.add('data.task', () => {
  new DataTask((rej, res) => res(1));
});

suite.add('Ramda Fantasy', () => {
  RamdaFuture((rej, res) => res(1));
});

suite.add('Promise', () => {
  new Promise((res) => res(1));
});

suite.on('complete', require('./_print'))
suite.run()
