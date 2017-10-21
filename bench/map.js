var benchmark = require('benchmark');
var suite = new benchmark.Suite();
var DataTask = require('data.task');
var RamdaFuture = require('ramda-fantasy').Future;
var Fluture = require('..');

var noop = () => {};
var fluture = Fluture((rej, res) => res(1));
var task = new DataTask((rej, res) => res(1));
var future = RamdaFuture((rej, res) => res(1));

suite.add('Fluture', () => {
  fluture.map(x => x + 1).fork(noop, noop);
});

suite.add('data.task', () => {
  task.map(x => x + 1).fork(noop, noop);
});

suite.add('Ramda Fantasy', () => {
  future.map(x => x + 1).fork(noop, noop);
});

suite.on('complete', require('./_print'))
suite.run()
