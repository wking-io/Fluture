import {expect} from 'chai';
import FL from 'fantasy-land';
import {Future, reject, ap, map, bimap, chain, chainRec} from '../index.es.js';
import U from './util';
import jsc from 'jsverify';

describe('Compliance', function(){

  this.slow(200);
  this.timeout(5000);

  const test = (name, f) => jsc.property(name, 'number | nat', o => f(o.value));
  const eq = U.assertEqual;
  const of = Future[FL.of];
  const undetermined = x => Math.random() > 0.5 ? of(x) : reject(x);

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
        expect(_ => a.fork(U.noop, U.noop)).to.not.throw();
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

    describe('Functor', () => {
      test('identity', x => eq(
        map(I, of(x)),
        of(x)
      ));
      test('composition', x => eq(
        map(B(sub3)(mul3), of(x)),
        map(sub3, map(mul3, of(x)))
      ));
    });

    describe('Bifunctor', () => {
      test('identity', x => eq(
        bimap(I, I, of(x)),
        of(x)
      ));
      test('composition', x => eq(
        bimap(B(sub3)(mul3), B(sub3)(mul3), of(x)),
        bimap(sub3, sub3, bimap(mul3, mul3, of(x)))
      ));
    });

    describe('Apply', () => {
      test('composition', x => eq(
        ap(ap(map(B, of(sub3)), of(mul3)), of(x)),
        ap(of(sub3), ap(of(mul3), of(x)))
      ));
    });

    describe('Applicative', () => {
      test('identity', x => eq(
        ap(of(I), of(x)),
        of(x)
      ));
      test('homomorphism', x => eq(
        ap(of(sub3), of(x)),
        of(sub3(x))
      ));
      test('interchange', x => eq(
        ap(of(sub3), of(x)),
        ap(of(T(x)), of(sub3))
      ));
    });

    describe('Chain', () => {
      test('associativity', x => eq(
        chain(B(of)(sub3), chain(B(of)(mul3), of(x))),
        chain(y => chain(B(of)(sub3), B(of)(mul3)(y)), of(x))
      ));
    });

    describe('ChainRec', () => {

      test('equivalence', x => {
        const p = v => v < 1;
        const d = of;
        const n = B(of)(v => v - 1);
        const a = chainRec((l, r, v) => p(v) ? map(r, d(v)) : map(l, n(v)), x);
        const b = (function step(v){ return p(v) ? d(v) : chain(step, n(v)) }(x));
        return eq(a, b);
      });

      it('stack-safety', () => {
        const p = v => v > (U.STACKSIZE + 1);
        const d = of;
        const n = B(of)(v => v + 1);
        const a = chainRec((l, r, v) => p(v) ? map(r, d(v)) : map(l, n(v)), 0);
        expect(_ => a.fork(U.noop, U.noop)).to.not.throw();
      });

    });

    describe('Monad', () => {
      test('left identity', x => eq(
        chain(B(of)(sub3), of(x)),
        B(of)(sub3)(x)
      ));
      test('right identity', x => eq(
        chain(of, of(x)),
        of(x)
      ));
    });

  });

});
