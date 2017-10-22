'use strict';

var benchmark = require('benchmark');
var suite = new benchmark.Suite();
var RamdaFuture = require('ramda-fantasy').Future;
var Fluture = require('..');

var noop = () => {};

var addTenMaps = m => {
  for(var i = 0; i < 10; i++){
    m.map(x => x + 1).fork(noop, noop);
  }
}

var addTenThens = p => {
  for(var i = 0; i < 10; i++){
    p.then(x => x + 1);
  }
};

suite.add('Fluture', () => {
  var fluture = Fluture.cache(Fluture.of(1));
  addTenMaps(fluture);
  fluture.fork(noop, noop);
});

suite.add('Ramda Fantasy', () => {
  var future = RamdaFuture.cache(RamdaFuture.of(1));
  addTenMaps(future);
  future.fork(noop, noop);
});

suite.add('Promise', () => {
  var promise = new Promise(res => res(1));
  addTenThens(promise);
});

suite.on('complete', require('./_print'))
suite.run()
