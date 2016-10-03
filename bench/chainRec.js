const benchmark = require('benchmark');
const suite = new benchmark.Suite();
const RamdaFuture = require('ramda-fantasy').Future;
const FunTask = require('fun-task');
const Fluture = require('..');

const noop = () => {};
const iterator = of => (next, done, x) => x < 1 ? of(next(x + 0.0001)) : of(done(x));

suite.add('Fluture', () => {
  Fluture.chainRec(iterator(Fluture.of), 0).fork(noop, noop);
});

suite.add('Ramda Fantasy', () => {
  RamdaFuture.chainRec(iterator(RamdaFuture.of), 0).fork(noop, noop);
});

const handlers = {success: noop, failure: noop};
suite.add('FunTask', () => {
  FunTask.chainRec(iterator(FunTask.of), 0).run(handlers);
});

suite.on('complete', require('./_print'))
suite.run()
