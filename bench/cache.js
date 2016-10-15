'use strict';

const benchmark = require('benchmark');
const suite = new benchmark.Suite();
const RamdaFuture = require('ramda-fantasy').Future;
const Fluture = require('..');

const noop = () => {};

const addTenMaps = m => {
  for(let i = 0; i < 10; i++){
    m.map(x => x + 1).fork(noop, noop);
  }
}

const addTenThens = p => {
  for(let i = 0; i < 10; i++){
    p.then(x => x + 1);
  }
};

suite.add('Fluture', () => {
  const fluture = Fluture.cache(Fluture.of(1));
  addTenMaps(fluture);
  fluture.fork(noop, noop);
});

suite.add('Ramda Fantasy', () => {
  const future = RamdaFuture.cache(RamdaFuture.of(1));
  addTenMaps(future);
  future.fork(noop, noop);
});

suite.add('Promise', () => {
  const promise = new Promise(res => res(1));
  addTenThens(promise);
});

suite.on('complete', require('./_print'))
suite.run()
