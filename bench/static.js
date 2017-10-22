var benchmark = require('benchmark');
var suite = new benchmark.Suite();
var Future = require('..');

var f = x => x + 1;
var m1 = Future.of(1);
var mf = Future.of(f);

suite.add('ap(m1)', () => {
  Future.ap(m1);
});

suite.add('ap(m1)(mf)', () => {
  Future.ap(m1)(mf);
});

suite.add('ap(m1, mf)', () => {
  Future.ap(m1, mf);
});

suite.add('bimap(f)', () => {
  Future.bimap(f);
});

suite.add('bimap(f)(f)', () => {
  Future.bimap(f)(f);
});

suite.add('bimap(f)(f)(m1)', () => {
  Future.bimap(f)(f)(m1);
});

suite.add('bimap(f, f, m1)', () => {
  Future.bimap(f, f, m1);
});

suite.on('complete', require('./_print'))
suite.run()
