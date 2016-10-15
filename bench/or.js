const benchmark = require('benchmark');
const suite = new benchmark.Suite();
const Future = require('..');

const noop = () => {};
const a = Future.of('a');
const b = Future.of('b');
const _a = Future.reject('!a');
const _b = Future.reject('!b');

suite.add('res res', () => {
  a.or(b).fork(noop, noop);
});

suite.add('rej rej', () => {
  _a.or(_b).fork(noop, noop);
});

suite.add('rej res', () => {
  _a.or(b).fork(noop, noop);
});

suite.add('res rej', () => {
  a.or(_b).fork(noop, noop);
});

suite.on('complete', require('./_print'))
suite.run()
