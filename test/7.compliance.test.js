import {expect} from 'chai';
import FL from 'fantasy-land';
import Future from '../index.mjs.js';
import * as U from './util';
import jsc from 'jsverify';

describe('Compliance', function(){

  this.slow(200);
  this.timeout(5000);

  var test = function(name, f){ return jsc.property(name, 'number | nat', function(o){ return f(o.value) }) };
  var eq = U.assertEqual;
  var undetermined = function(x){ return Math.random() > 0.5 ? Future.of(x) : Future.reject(x) };

  var I = function(x){ return x };
  var T = function(x){ return function(f){ return f(x) } };
  var B = U.B;

  var sub3 = function(x){ return x - 3 };
  var mul3 = function(x){ return x * 3 };

  describe('to Fantasy-Land:', function(){

    var of = Future[FL.of];

    describe('Functor', function(){
      test('identity', function(x){
        var a = undetermined(x);
        return eq(a, a[FL.map](I));
      });
      test('composition', function(x){
        var a = undetermined(x);
        return eq(a[FL.map](B(sub3)(mul3)), a[FL.map](mul3)[FL.map](sub3));
      });
    });

    describe('Bifunctor', function(){
      test('identity', function(x){
        var a = undetermined(x);
        return eq(a, a[FL.bimap](I, I));
      });
      test('composition', function(x){
        var a = undetermined(x);
        var f = B(mul3)(sub3);
        return eq(a[FL.bimap](f, f), a[FL.bimap](sub3, sub3)[FL.bimap](mul3, mul3));
      });
    });

    describe('Apply', function(){
      test('composition', function(x){
        var a = undetermined(x);
        var b = of(sub3);
        var c = of(mul3);
        return eq(a[FL.ap](b[FL.ap](c[FL.map](B))), a[FL.ap](b)[FL.ap](c));
      });
    });

    describe('Applicative', function(){
      test('identity', function(x){
        var a = undetermined(x);
        var b = of(I);
        return eq(a, a[FL.ap](b));
      });
      test('homomorphism', function(x){
        var a = of(x);
        var b = of(sub3);
        return eq(a[FL.ap](b), of(sub3(x)));
      });
      test('interchange', function(x){
        var a = of(x);
        var b = of(sub3);
        return eq(a[FL.ap](b), b[FL.ap](of(T(x))));
      });
    });

    describe('Chain', function(){
      test('associativity', function(x){
        var a = undetermined(x);
        var f = B(of)(sub3);
        var g = B(of)(mul3);
        return eq(a[FL.chain](f)[FL.chain](g), a[FL.chain](function(b){ return f(b)[FL.chain](g) }));
      });
    });

    describe('ChainRec', function(){

      test('equivalence', function(x){
        var p = function(v){ return v < 1 };
        var d = of;
        var n = B(of)(function(v){ return v - 1 });
        var a = Future[FL.chainRec](function(l, r, v){ return p(v) ? d(v)[FL.map](r) : n(v)[FL.map](l) }, x);
        var b = (function step(v){ return p(v) ? d(v) : n(v)[FL.chain](step) }(x));
        return eq(a, b);
      });

      it('stack-safety', function(){
        var p = function(v){ return v > (U.STACKSIZE + 1) };
        var d = of;
        var n = B(of)(function(v){ return v + 1 });
        var a = Future[FL.chainRec](function(l, r, v){ return p(v) ? d(v)[FL.map](r) : n(v)[FL.map](l) }, 0);
        expect(function(){ return a.fork(U.noop, U.noop) }).to.not.throw();
      });

    });

    describe('Monad', function(){
      test('left identity', function(x){
        var a = of(x);
        var f = B(of)(sub3);
        return eq(a[FL.chain](f), f(x));
      });
      test('right identity', function(x){
        var a = undetermined(x);
        return eq(a, a[FL.chain](of));
      });
    });

  });

  describe('to Static-Land:', function(){

    var of = Future.of;
    var ap = Future.ap;
    var map = Future.map;
    var bimap = Future.bimap;
    var chain = Future.chain;
    var chainRec = Future.chainRec;

    describe('Functor', function(){
      test('identity', function(x){
 return eq(
        map(I, of(x)),
        of(x)
      );
});
      test('composition', function(x){
 return eq(
        map(B(sub3)(mul3), of(x)),
        map(sub3, map(mul3, of(x)))
      );
});
    });

    describe('Bifunctor', function(){
      test('identity', function(x){
 return eq(
        bimap(I, I, of(x)),
        of(x)
      );
});
      test('composition', function(x){
 return eq(
        bimap(B(sub3)(mul3), B(sub3)(mul3), of(x)),
        bimap(sub3, sub3, bimap(mul3, mul3, of(x)))
      );
});
    });

    describe('Apply', function(){
      test('composition', function(x){
 return eq(
        ap(ap(map(B, of(sub3)), of(mul3)), of(x)),
        ap(of(sub3), ap(of(mul3), of(x)))
      );
});
    });

    describe('Applicative', function(){
      test('identity', function(x){
 return eq(
        ap(of(I), of(x)),
        of(x)
      );
});
      test('homomorphism', function(x){
 return eq(
        ap(of(sub3), of(x)),
        of(sub3(x))
      );
});
      test('interchange', function(x){
 return eq(
        ap(of(sub3), of(x)),
        ap(of(T(x)), of(sub3))
      );
});
    });

    describe('Chain', function(){
      test('associativity', function(x){
 return eq(
        chain(B(of)(sub3), chain(B(of)(mul3), of(x))),
        chain(function(y){ return chain(B(of)(sub3), B(of)(mul3)(y)) }, of(x))
      );
});
    });

    describe('ChainRec', function(){

      test('equivalence', function(x){
        var p = function(v){ return v < 1 };
        var d = of;
        var n = B(of)(function(v){ return v - 1 });
        var a = chainRec(function(l, r, v){ return p(v) ? map(r, d(v)) : map(l, n(v)) }, x);
        var b = (function step(v){ return p(v) ? d(v) : chain(step, n(v)) }(x));
        return eq(a, b);
      });

      it('stack-safety', function(){
        var p = function(v){ return v > (U.STACKSIZE + 1) };
        var d = of;
        var n = B(of)(function(v){ return v + 1 });
        var a = chainRec(function(l, r, v){ return p(v) ? map(r, d(v)) : map(l, n(v)) }, 0);
        expect(function(){ return a.fork(U.noop, U.noop) }).to.not.throw();
      });

    });

    describe('Monad', function(){
      test('left identity', function(x){
 return eq(
        chain(B(of)(sub3), of(x)),
        B(of)(sub3)(x)
      );
});
      test('right identity', function(x){
 return eq(
        chain(of, of(x)),
        of(x)
      );
});
    });

  });

});
