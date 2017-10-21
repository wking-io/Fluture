var benchmark = require('benchmark');
var suite = new benchmark.Suite();
var DataTask = require('data.task');
var RamdaFuture = require('ramda-fantasy').Future;
var Fluture = require('..');

var noop = () => {};
var fluture = Fluture((rej, res) => res(1));
var task = new DataTask((rej, res) => res(1));
var future = RamdaFuture((rej, res) => res(1));
var flutureF = Fluture((rej, res) => res(x => x + 1));
var taskF = new DataTask((rej, res) => res(x => x + 1));
var futureF = RamdaFuture((rej, res) => res(x => x + 1));

suite.add('Fluture', () => {
  fluture.ap(flutureF).fork(noop, noop);
});

suite.add('data.task', () => {
  taskF.ap(task).fork(noop, noop);
});

suite.add('Ramda Fantasy', () => {
  futureF.ap(future).fork(noop, noop);
});

suite.on('complete', require('./_print'))
suite.run()
