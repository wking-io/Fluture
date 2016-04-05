const benchmark = require('benchmark');
const suite = new benchmark.Suite();
const DataTask = require('data.task');
const RamdaFuture = require('ramda-fantasy').Future;
const Pacta = require('pacta');
const Fluture = require('..');

suite.add('Fluture', () => {
  Fluture((rej, res) => res(1));
});

suite.add('data.task', () => {
  new DataTask((rej, res) => res(1));
});

suite.add('Ramda Fantasy', () => {
  RamdaFuture((rej, res) => res(1));
});

suite.add('Promise', () => {
  new Promise((res) => res(1));
});

suite.add('Pacta', () => {
  new Pacta((res) => res(1));
});

suite.on('complete', require('./_print'))
suite.run()
