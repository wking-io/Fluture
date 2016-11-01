'use strict';

const expect = require('chai').expect;
const FL = require('fantasy-land');
const Future = require('../fluture.js');
const U = require('./util');
const jsc = require('jsverify');

describe('Compliance', function(){

  this.slow(200);

  const test = (name, f) => jsc.property(name, 'number | nat', o => f(o.value));
  const eq = U.assertEqual;
  const of = Future[FL.of];

  const I = x => x;
  const T = x => f => f(x);

  const sub3 = x => x - 3;
  const mul3 = x => x * 3;

  describe('to Fantasy-Land:', () => {

    describe('Functor', () => {
      test('identity', x => eq(
        of(x),
        of(x)[FL.map](I))
      );
      test('composition', x => eq(
        of(x)[FL.map](U.B(sub3)(mul3)),
        of(x)[FL.map](mul3)[FL.map](sub3))
      );
    });

    describe('Bifunctor', () => {
      test('identity', x => eq(
        of(x),
        of(x)[FL.bimap](I, I)
      ));
      test('composition', x => eq(
        of(x)[FL.bimap](U.B(mul3)(sub3), U.B(mul3)(sub3)),
        of(x)[FL.bimap](sub3, sub3)[FL.bimap](mul3, mul3))
      );
    });

    describe('Apply', () => {
      test('composition', x => eq(
        of(x)[FL.ap](of(sub3)[FL.ap](of(mul3)[FL.map](U.B))),
        of(x)[FL.ap](of(sub3))[FL.ap](of(mul3))
      ));
    });

    describe('Applicative', () => {
      test('identity', x => eq(
        of(x)[FL.ap](of(I)),
        of(x)
      ));
      test('homomorphism', x => eq(
        of(x)[FL.ap](of(sub3)),
        of(sub3(x))
      ));
      test('interchange', x => eq(
        of(x)[FL.ap](of(sub3)),
        of(sub3)[FL.ap](of(T(x)))
      ));
    });

    describe('Chain', () => {
      test('associativity', x => eq(
        of(x)[FL.chain](U.B(of)(sub3))[FL.chain](U.B(of)(mul3)),
        of(x)[FL.chain](y => U.B(of)(sub3)(y)[FL.chain](U.B(of)(mul3)))
      ));
    });

    describe('ChainRec', () => {

      test('equivalence', x => {
        const p = v => v < 1;
        const d = of;
        const n = U.B(of)(v => v - 1);
        const a = Future[FL.chainRec]((l, r, v) => p(v) ? d(v)[FL.map](r) : n(v)[FL.map](l), x);
        const b = (function step(v){ return p(v) ? d(v) : n(v)[FL.chain](step) }(x));
        return eq(a, b);
      });

      it('stack-safety', () => {
        const p = v => v > (U.STACKSIZE + 1);
        const d = of;
        const n = U.B(of)(v => v + 1);
        const a = Future[FL.chainRec]((l, r, v) => p(v) ? d(v)[FL.map](r) : n(v)[FL.map](l), 0);
        const b = (function step(v){ return p(v) ? d(v) : n(v)[FL.chain](step) }(0));
        expect(_ => a.fork(U.noop, U.noop)).to.not.throw();
        expect(_ => b.fork(U.noop, U.noop)).to.throw(/call stack/);
      });

    });

    describe('Monad', () => {
      test('left identity', x => eq(
        U.B(of)(sub3)(x),
        of(x)[FL.chain](U.B(of)(sub3))
      ));
      test('right identity', x => eq(
        of(x),
        of(x)[FL.chain](of)
      ));
    });

  });

  describe('to Static-Land:', () => {

    const F = Future;

    describe('Functor', () => {
      test('identity', x => eq(
        F.map(I, of(x)),
        of(x)
      ));
      test('composition', x => eq(
        F.map(U.B(sub3)(mul3), of(x)),
        F.map(sub3, F.map(mul3, of(x)))
      ));
    });

    describe('Bifunctor', () => {
      test('identity', x => eq(
        F.bimap(I, I, of(x)),
        of(x)
      ));
      test('composition', x => eq(
        F.bimap(U.B(sub3)(mul3), U.B(sub3)(mul3), of(x)),
        F.bimap(sub3, sub3, F.bimap(mul3, mul3, of(x)))
      ));
    });

    describe('Apply', () => {
      test('composition', x => eq(
        F.ap(F.ap(F.map(U.B, of(sub3)), of(mul3)), of(x)),
        F.ap(of(sub3), F.ap(of(mul3), of(x)))
      ));
    });

    describe('Applicative', () => {
      test('identity', x => eq(
        F.ap(of(I), of(x)),
        of(x)
      ));
      test('homomorphism', x => eq(
        F.ap(of(sub3), of(x)),
        of(sub3(x))
      ));
      test('interchange', x => eq(
        F.ap(of(sub3), of(x)),
        F.ap(of(T(x)), of(sub3))
      ));
    });

    describe('Chain', () => {
      test('associativity', x => eq(
        F.chain(U.B(of)(sub3), F.chain(U.B(of)(mul3), of(x))),
        F.chain(y => F.chain(U.B(of)(sub3), U.B(of)(mul3)(y)), of(x))
      ));
    });

    describe('ChainRec', () => {

      test('equivalence', x => {
        const p = v => v < 1;
        const d = of;
        const n = U.B(of)(v => v - 1);
        const a = F.chainRec((l, r, v) => p(v) ? F.map(r, d(v)) : F.map(l, n(v)), x);
        const b = (function step(v){ return p(v) ? d(v) : F.chain(step, n(v)) }(x));
        return eq(a, b);
      });

      it('stack-safety', () => {
        const p = v => v > (U.STACKSIZE + 1);
        const d = of;
        const n = U.B(of)(v => v + 1);
        const a = F.chainRec((l, r, v) => p(v) ? F.map(r, d(v)) : F.map(l, n(v)), 0);
        const b = (function step(v){ return p(v) ? d(v) : F.chain(step, n(v)) }(0));
        expect(_ => a.fork(U.noop, U.noop)).to.not.throw();
        expect(_ => b.fork(U.noop, U.noop)).to.throw(/call stack/);
      });

    });

    describe('Monad', () => {
      test('left identity', x => eq(
        F.chain(U.B(of)(sub3), of(x)),
        U.B(of)(sub3)(x)
      ));
      test('right identity', x => eq(
        F.chain(of, of(x)),
        of(x)
      ));
    });

  });

});
