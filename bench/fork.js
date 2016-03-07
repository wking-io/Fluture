const benchmark = require('benchmark');
const suite = new benchmark.Suite();
const DataTask = require('data.task');
const RamdaFuture = require('ramda-fantasy').Future;
const Fluture = require('..');

const noop = () => {};
const fluture = Fluture((rej, res) => res(1));
const task = new DataTask((rej, res) => res(1));
const future = RamdaFuture((rej, res) => res(1));
const promise = new Promise(res => res(1));

suite.add('Fluture', () => {
  fluture.fork(noop, noop);
});

suite.add('data.task', () => {
  task.fork(noop, noop);
});

suite.add('Ramda Fantasy', () => {
  future.fork(noop, noop);
});

suite.add('Promise', () => {
  promise.then(noop, noop);
});

suite.on('complete', require('./_print'))
suite.run()
