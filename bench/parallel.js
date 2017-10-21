var benchmark = require('benchmark');
var suite = new benchmark.Suite();
var Future = require('..');

var noop = () => {};
var makeArr = length => Array.from({length}, (_, i) => Future.of(i));
var empty = makeArr(0);
var small = makeArr(2);
var big = makeArr(100);

suite.add('Empty', () => {
  Future.parallel(1, empty).fork(noop, noop);
});

suite.add('Small concurrent', () => {
  Future.parallel(2, small).fork(noop, noop);
});

suite.add('Small sequential', () => {
  Future.parallel(1, small).fork(noop, noop);
});

suite.add('Big concurrent', () => {
  Future.parallel(Infinity, big).fork(noop, noop);
});

suite.add('Big sequential', () => {
  Future.parallel(5, big).fork(noop, noop);
});

suite.on('complete', require('./_print'))
suite.run()
