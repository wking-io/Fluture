const benchmark = require('benchmark');
const suite = new benchmark.Suite();
const DataTask = require('data.task');
const RamdaFuture = require('ramda-fantasy').Future;
const Fluture = require('..');
const LazyEither = require('lazy-either');
const FunTask = require('fun-task');

const noop = () => {};

suite.add('Fluture', () => {
  Fluture.of(1)
  .map(x => x + 1)
  .chain(x => Fluture.of(f => f(x + 1)))
  .ap(Fluture.of(x => x + 1))
  .fork(noop, noop);
});

suite.add('data.task', () => {
  DataTask.of(1)
  .map(x => x + 1)
  .chain(x => DataTask.of(f => f(x + 1)))
  .ap(DataTask.of(x => x + 1))
  .fork(noop, noop);
});

suite.add('Ramda Fantasy', () => {
  RamdaFuture.of(1)
  .map(x => x + 1)
  .chain(x => RamdaFuture.of(f => f(x + 1)))
  .ap(RamdaFuture.of(x => x + 1))
  .fork(noop, noop);
});

suite.add('LazyEither', () => {
  LazyEither.of(1)
  .map(x => x + 1)
  .chain(x => LazyEither.of(f => f(x + 1)))
  .ap(LazyEither.of(x => x + 1))
  .value(noop);
});

suite.add('FunTask', () => {
  FunTask.of(1)
  .map(x => x + 1)
  .chain(x => FunTask.of(f => f(x + 1)))
  .ap(FunTask.of(x => x + 1))
  .run({success: noop, failure: noop, catch: noop});
});

suite.on('complete', require('./_print'))
suite.run()
