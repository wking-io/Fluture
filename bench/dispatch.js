/*eslint no-spaced-func:0, no-unexpected-multiline:0*/
const benchmark = require('benchmark');
const suite = new benchmark.Suite();
const Fluture = require('..');

const noop = () => {};

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
    (noop)
    (noop)
    (Fluture.ap
      (Fluture.of(x => x + 1))
      (Fluture.chain
        (x => Fluture.of(f => f(x + 1)))
        (Fluture.map
          (x => x + 1)
          (Fluture.of(1)))));
});

suite.on('complete', require('./_print'))
suite.run()
