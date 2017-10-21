var benchmark = require('benchmark');
var suite = new benchmark.Suite();
var Future = require('..');

var noop = () => {};
var a = Future.of('a');
var b = Future.of('b');
var _a = Future.reject('!a');
var _b = Future.reject('!b');

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
