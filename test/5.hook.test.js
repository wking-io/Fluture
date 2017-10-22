import {expect} from 'chai';
import {Future, hook, of, reject} from '../index.mjs.js';
import * as U from './util';
import * as F from './futures';
import type from 'sanctuary-type-identifiers';

describe('hook()', function(){

  it('is a curried ternary function', function(){
    expect(hook).to.be.a('function');
    expect(hook.length).to.equal(3);
    expect(hook(of(1))).to.be.a('function');
    expect(hook(of(1))(U.noop)).to.be.a('function');
    expect(hook(of(1), U.noop)).to.be.a('function');
  });

  it('throws when not given a Future as first argument', function(){
    var f = function(){ return hook(1) };
    expect(f).to.throw(TypeError, /Future.*first/);
  });

  it('throws when not given a Function as second argument', function(){
    var f = function(){ return hook(of(1), 1) };
    expect(f).to.throw(TypeError, /Future.*second/);
  });

  it('throws when not given a Function as third argument', function(){
    var f = function(){ return hook(of(1), U.add(1), 1) };
    expect(f).to.throw(TypeError, /Future.*third/);
  });

  it('is considered a member of fluture/Fluture', function(){
    var m = hook(of(1), function(){ return of(2) }, function(){ return of(3) });
    expect(type(m)).to.equal(Future['@@type']);
  });

  describe('#fork()', function(){

    var m = F.resolved, xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];

    it('throws when the first function does not return Future', function(){
      var fs = xs.map(function(x){ return function(){ return hook(m, function(){ return x }, function(){ return m }).fork(U.noop, U.noop) } });
      fs.forEach(function(f){ return expect(f).to.throw(TypeError, /Future/) });
    });

    it('throws when the second function does not return Future', function(){
      var fs = xs.map(function(x){ return function(){ return hook(m, function(){ return m }, function(){ return x }).fork(U.noop, U.noop) } });
      fs.forEach(function(f){ return expect(f).to.throw(TypeError, /Future/) });
    });

    it('runs the first computation after the second, both with the resource', function(done){
      var ran = false;
      hook(m,
        function(x){
          expect(x).to.equal('resolved');
          return Future(function(rej, res){ return res(done(ran ? null : new Error('Second did not run'))) });
        },
        function(x){
          expect(x).to.equal('resolved');
          return Future(function(rej, res){ return res(ran = true) });
        }
      ).fork(done, U.noop);
    });

    it('runs the first even if the second rejects', function(done){
      hook(m,
        function(){ return Future(function(){ return done() }) },
        function(){ return reject(2) }
      ).fork(U.noop, U.noop);
    });

    it('rejects with the rejection reason of the first', function(){
      var rejected = hook(m, function(){ return reject(1) }, function(){ return reject(2) });
      var resolved = hook(m, function(){ return reject(1) }, function(){ return of(2) });
      return Promise.all([
        U.assertRejected(rejected, 1),
        U.assertRejected(resolved, 1)
      ]);
    });

    it('assumes the state of the second if the first resolves', function(){
      var rejected = hook(m, function(){ return of(1) }, function(){ return reject(2) });
      var resolved = hook(m, function(){ return of(1) }, function(){ return of(2) });
      return Promise.all([
        U.assertRejected(rejected, 2),
        U.assertResolved(resolved, 2)
      ]);
    });

    it('does not hook after being cancelled', function(done){
      hook(F.resolvedSlow, function(){ return of('dispose') }, U.failRes).fork(U.failRej, U.failRes)();
      setTimeout(done, 25);
    });

    it('does not reject after being cancelled', function(done){
      hook(F.rejectedSlow, function(){ return of('dispose') }, U.failRes).fork(U.failRej, U.failRes)();
      hook(F.resolved, function(){ return of('dispose') }, function(){ return F.rejectedSlow }).fork(U.failRej, U.failRes)();
      setTimeout(done, 25);
    });

    it('cancels acquire appropriately', function(done){
      var acquire = Future(function(){ return function(){ return done() } });
      var cancel =
        hook(acquire, function(){ return of('dispose') }, function(){ return of('consume') })
        .fork(U.failRej, U.failRes);
      setTimeout(cancel, 10);
    });

    it('cancels consume appropriately', function(done){
      var consume = Future(function(){ return function(){ return done() } });
      var cancel =
        hook(F.resolved, function(){ return of('dispose') }, function(){ return consume })
        .fork(U.failRej, U.failRes);
      setTimeout(cancel, 10);
    });

    it('cancels delayed consume appropriately', function(done){
      var consume = Future(function(){ return function(){ return done() } });
      var cancel =
        hook(F.resolvedSlow, function(){ return of('dispose') }, function(){ return consume })
        .fork(U.failRej, U.failRes);
      setTimeout(cancel, 25);
    });

    it('cancels dispose appropriately', function(done){
      var dispose = Future(function(){ return function(){ return done() } });
      var cancel =
        hook(F.resolved, function(){ return dispose }, function(){ return of('consume') })
        .fork(U.failRej, U.failRes);
      setTimeout(cancel, 10);
    });

    it('cancels delayed dispose appropriately', function(done){
      var dispose = Future(function(){ return function(){ return done() } });
      var cancel =
        hook(F.resolved, function(){ return dispose }, function(){ return F.resolvedSlow })
        .fork(U.failRej, U.failRes);
      setTimeout(cancel, 25);
    });

    it('immediately runs and cancels the disposal Future when cancelled after acquire', function(done){
      var cancel =
        hook(F.resolved, function(){ return Future(function(){ return function(){ return done() } }) }, function(){ return F.resolvedSlow })
        .fork(U.failRej, U.failRes);
      setTimeout(cancel, 10);
    });

  });

  describe('#toString()', function(){

    it('returns the code which creates the same data-structure', function(){
      var a = of(1);
      var d = function(){ return of(2) };
      var c = function(){ return of(3) };
      var m = hook(a, d, c);
      var expected = 'Future.hook(' + (a.toString()) + ', ' + (d.toString()) + ', ' + (c.toString()) + ')';
      expect(m.toString()).to.equal(expected);
    });

  });

});
