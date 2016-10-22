const benchmark = require('benchmark');
const suite = new benchmark.Suite();
const Future = require('..');

const f = x => x + 1;
const m1 = Future.of(1);
const mf = Future.of(f);

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
