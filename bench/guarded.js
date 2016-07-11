const benchmark = require('benchmark');
const suite = new benchmark.Suite();
const Fluture = require('..');

suite.add('Fluture', () => {
  Fluture((rej, res) => res(1));
});

suite.add('Fluture.Guarded', () => {
  Fluture.Guarded((rej, res) => res(1));
});

suite.on('complete', require('./_print'))
suite.run()
