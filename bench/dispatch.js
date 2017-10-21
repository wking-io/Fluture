/*eslint no-spaced-func:0, no-unexpected-multiline:0*/
var benchmark = require('benchmark');
var suite = new benchmark.Suite();
var Ramda = require('ramda');
var Fluture = require('..');

var noop = () => {};
var B = (f, g) => x => f(g(x));

suite.add('Method API', () => {
  Fluture.of(1)
  .map(x => x + 1)
  .chain(x => Fluture.of(f => f(x + 1)))
  .ap(Fluture.of(x => x + 1))
  .fork(noop, noop);
});

suite.add('Dispatch API', () => {
  Fluture.fork(
    noop,
    noop,
    Fluture.ap(
      Fluture.of(x => x + 1),
      Fluture.chain(
        x => Fluture.of(f => f(x + 1)),
        Fluture.map(
          x => x + 1,
          Fluture.of(1)
        )
      )
    )
  );
});

suite.add('Curried dispatch API', () => {
  Fluture.fork
    (noop, noop)
    (Fluture.ap
      (Fluture.of(x => x + 1))
      (Fluture.chain
        (x => Fluture.of(f => f(x + 1)))
        (Fluture.map
          (x => x + 1)
          (Fluture.of(1)))));
});

suite.add('Curried Ramda dispatch API', () => {
  Fluture.fork
    (noop, noop)
    (Ramda.ap
      (Fluture.of(x => x + 1))
      (Ramda.chain
        (x => Fluture.of(f => f(x + 1)))
        (Ramda.map
          (x => x + 1)
          (Fluture.of(1)))));
});

var mapChainF = B(Fluture.chain(x => Fluture.of(f => f(x + 1))), Fluture.map(x => x + 1));
var mapChainApF = B(Fluture.ap(Fluture.of(x => x + 1)), mapChainF);
var mapChainApForkF = B(Fluture.fork(noop, noop), mapChainApF);
suite.add('Precomposed dispatch API', () => {
  mapChainApForkF(Fluture.of(1));
});

var mapChainR = B(Ramda.chain(x => Fluture.of(f => f(x + 1))), Ramda.map(x => x + 1));
var mapChainApR = B(Ramda.ap(Fluture.of(x => x + 1)), mapChainR);
var mapChainApForkR = B(Fluture.fork(noop, noop), mapChainApR);
suite.add('Precomposed Ramda dispatch API', () => {
  mapChainApForkR(Fluture.of(1));
});

suite.on('complete', require('./_print'))
suite.run()
