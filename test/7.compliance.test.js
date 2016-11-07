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
  const undetermined = x => Math.random() > 0.5 ? of(x) : Future.reject(x);

  const I = x => x;
  const T = x => f => f(x);
  const B = U.B;

  const sub3 = x => x - 3;
  const mul3 = x => x * 3;

  describe('to Fantasy-Land:', () => {

    describe('Functor', () => {
      test('identity', x => {
        const a = undetermined(x);
        return eq(a, a[FL.map](I));
      });
      test('composition', x => {
        const a = undetermined(x);
        return eq(a[FL.map](B(sub3)(mul3)), a[FL.map](mul3)[FL.map](sub3));
      });
    });

    describe('Bifunctor', () => {
      test('identity', x => {
        const a = undetermined(x);
        return eq(a, a[FL.bimap](I, I));
      });
      test('composition', x => {
        const a = undetermined(x);
        const f = B(mul3)(sub3);
        return eq(a[FL.bimap](f, f), a[FL.bimap](sub3, sub3)[FL.bimap](mul3, mul3));
      });
    });

    describe('Apply', () => {
      test('composition', x => {
        const a = undetermined(x);
        const b = of(sub3);
        const c = of(mul3);
        return eq(a[FL.ap](b[FL.ap](c[FL.map](B))), a[FL.ap](b)[FL.ap](c));
      });
    });

    describe('Applicative', () => {
      test('identity', x => {
        const a = undetermined(x);
        const b = of(I);
        return eq(a, a[FL.ap](b));
      });
      test('homomorphism', x => {
        const a = of(x);
        const b = of(sub3);
        return eq(a[FL.ap](b), of(sub3(x)));
      });
      test('interchange', x => {
        const a = of(x);
        const b = of(sub3);
        return eq(a[FL.ap](b), b[FL.ap](of(T(x))));
      });
    });

    describe('Chain', () => {
      test('associativity', x => {
        const a = undetermined(x);
        const f = B(of)(sub3);
        const g = B(of)(mul3);
        return eq(a[FL.chain](f)[FL.chain](g), a[FL.chain](b => f(b)[FL.chain](g)));
      });
    });

    describe('ChainRec', () => {

      test('equivalence', x => {
        const p = v => v < 1;
        const d = of;
        const n = B(of)(v => v - 1);
        const a = Future[FL.chainRec]((l, r, v) => p(v) ? d(v)[FL.map](r) : n(v)[FL.map](l), x);
        const b = (function step(v){ return p(v) ? d(v) : n(v)[FL.chain](step) }(x));
        return eq(a, b);
      });

      it('stack-safety', () => {
        const p = v => v > (U.STACKSIZE + 1);
        const d = of;
        const n = B(of)(v => v + 1);
        const a = Future[FL.chainRec]((l, r, v) => p(v) ? d(v)[FL.map](r) : n(v)[FL.map](l), 0);
        const b = (function step(v){ return p(v) ? d(v) : n(v)[FL.chain](step) }(0));
        expect(_ => a.fork(U.noop, U.noop)).to.not.throw();
        expect(_ => b.fork(U.noop, U.noop)).to.throw(/call stack/);
      });

    });

    describe('Monad', () => {
      test('left identity', x => {
        const a = of(x);
        const f = B(of)(sub3);
        return eq(a[FL.chain](f), f(x));
      });
      test('right identity', x => {
        const a = undetermined(x);
        return eq(a, a[FL.chain](of));
      });
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
        F.map(B(sub3)(mul3), of(x)),
        F.map(sub3, F.map(mul3, of(x)))
      ));
    });

    describe('Bifunctor', () => {
      test('identity', x => eq(
        F.bimap(I, I, of(x)),
        of(x)
      ));
      test('composition', x => eq(
        F.bimap(B(sub3)(mul3), B(sub3)(mul3), of(x)),
        F.bimap(sub3, sub3, F.bimap(mul3, mul3, of(x)))
      ));
    });

    describe('Apply', () => {
      test('composition', x => eq(
        F.ap(F.ap(F.map(B, of(sub3)), of(mul3)), of(x)),
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
        F.chain(B(of)(sub3), F.chain(B(of)(mul3), of(x))),
        F.chain(y => F.chain(B(of)(sub3), B(of)(mul3)(y)), of(x))
      ));
    });

    describe('ChainRec', () => {

      test('equivalence', x => {
        const p = v => v < 1;
        const d = of;
        const n = B(of)(v => v - 1);
        const a = F.chainRec((l, r, v) => p(v) ? F.map(r, d(v)) : F.map(l, n(v)), x);
        const b = (function step(v){ return p(v) ? d(v) : F.chain(step, n(v)) }(x));
        return eq(a, b);
      });

      it('stack-safety', () => {
        const p = v => v > (U.STACKSIZE + 1);
        const d = of;
        const n = B(of)(v => v + 1);
        const a = F.chainRec((l, r, v) => p(v) ? F.map(r, d(v)) : F.map(l, n(v)), 0);
        const b = (function step(v){ return p(v) ? d(v) : F.chain(step, n(v)) }(0));
        expect(_ => a.fork(U.noop, U.noop)).to.not.throw();
        expect(_ => b.fork(U.noop, U.noop)).to.throw(/call stack/);
      });

    });

    describe('Monad', () => {
      test('left identity', x => eq(
        F.chain(B(of)(sub3), of(x)),
        B(of)(sub3)(x)
      ));
      test('right identity', x => eq(
        F.chain(of, of(x)),
        of(x)
      ));
    });

  });

});
