var benchmark = require('benchmark');
var suite = new benchmark.Suite();
var DataTask = require('data.task');
var RamdaFuture = require('ramda-fantasy').Future;
var Fluture = require('..');
var FunTask = require('fun-task');

var noop = () => {};

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

suite.add('FunTask', () => {
  FunTask.of(1)
  .map(x => x + 1)
  .chain(x => FunTask.of(f => f(x + 1)))
  .ap(FunTask.of(x => x + 1))
  .run({success: noop, failure: noop, catch: noop});
});

suite.on('complete', require('./_print'))
suite.run()
