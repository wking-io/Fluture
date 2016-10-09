const benchmark = require('benchmark');
const suite = new benchmark.Suite();
const DataTask = require('data.task');
const RamdaFuture = require('ramda-fantasy').Future;
const Fluture = require('..');

const noop = () => {};
const fluture = Fluture((rej, res) => res(1));
const task = new DataTask((rej, res) => res(1));
const future = RamdaFuture((rej, res) => res(1));
const flutureF = Fluture((rej, res) => res(x => x + 1));
const taskF = new DataTask((rej, res) => res(x => x + 1));
const futureF = RamdaFuture((rej, res) => res(x => x + 1));

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
