'use strict';

const Old = require('fluture');
const New = require('..');

const noop = () => {};
const compose = (f, g) => x => f(g(x));
const run = m => m.fork(noop, noop);
const plus1 = x => x + 1;
const arr = (T, length) => Array.from({length}, (_, i) => T.of(i));

module.exports = require('sanctuary-benchmark')(Old, New, {left: 'Old', right: 'New'}, {

  'def/construct/Future': ({Future}) => Future((rej, res) => res(1)),
  'def/construct/of': ({of}) => of(1),
  'def/construct/node': ({node}) => node(done => done(null, 1)),

  'def/transform/ap': ({of, ap}) => ap(of(plus1), of(1)),
  'def/transform/map': ({of, map}) => map(plus1, of(1)),
  'def/transform/chain': ({of, chain}) => chain(plus1, of(1)),

  'run/construct/parallel/empty': ({parallel}) => run(parallel(1, [])),
  'run/construct/parallel/small/sequential': ({Future, parallel}) => run(parallel(1, arr(Future, 2))),
  'run/construct/parallel/small/concurrent': ({Future, parallel}) => run(parallel(2, arr(Future, 2))),
  'run/construct/parallel/big/sequential': ({Future, parallel}) => run(parallel(1, arr(Future, 100))),
  'run/construct/parallel/big/concurrent': ({Future, parallel}) => run(parallel(2, arr(Future, 100))),

  'run/transform/ap': ({of, ap}) => run(ap(of(plus1), of(1))),
  'run/transform/map': ({of, map}) => run(map(plus1, of(1))),
  'run/transform/chain': ({of, chain}) => run(chain(compose(of, plus1), of(1))),

});
