import {expect} from 'chai';
import {Future, or, of, reject, after} from '../index.mjs.js';
import * as U from './util';
import * as F from './futures';
import type from 'sanctuary-type-identifiers';

var testInstance = function(or){

  it('is considered a member of fluture/Fluture', function(){
    expect(type(or(F.resolved, F.resolvedSlow))).to.equal(Future['@@type']);
  });

  describe('#fork()', function(){

    describe('(res, res)', function(){

      it('resolves with left if left resolves first', function(){
        return U.assertResolved(or(F.resolved, F.resolvedSlow), 'resolved');
      });

      it('resolves with left if left resolves last', function(){
        return U.assertResolved(or(F.resolvedSlow, F.resolved), 'resolvedSlow');
      });

    });

    describe('(rej, rej)', function(){

      it('rejects with right if right rejects first', function(){
        return U.assertRejected(or(F.rejectedSlow, F.rejected), 'rejected');
      });

      it('rejects with right if right rejects last', function(){
        return U.assertRejected(or(F.rejected, F.rejectedSlow), 'rejectedSlow');
      });

    });

    describe('(rej, res)', function(){

      it('resolves with right if right resolves first', function(){
        return U.assertResolved(or(F.rejectedSlow, F.resolved), 'resolved');
      });

      it('resolves with right if right resolves last', function(){
        return U.assertResolved(or(F.rejected, F.resolvedSlow), 'resolvedSlow');
      });

    });

    describe('(res, rej)', function(){

      it('resolves with left if left resolves first', function(){
        return U.assertResolved(or(F.resolved, F.rejectedSlow), 'resolved');
      });

      it('resolves with left if left resolves last', function(){
        return U.assertResolved(or(F.resolvedSlow, F.rejected), 'resolvedSlow');
      });

    });

    it('cancels the running Future', function(done){
      var m = Future(function(){ return function(){ return done() } });
      var cancel = or(m, m).fork(U.noop, U.noop);
      cancel();
    });

  });

  describe('#toString()', function(){

    it('returns the code to create the data-structure', function(){
      var m = Future(function(){ return function(){} });
      var actual = or(m, m).toString();
      expect(actual).to.equal(((m.toString()) + '.or(' + (m.toString()) + ')'));
    });

  });

};

describe('or()', function(){

  it('is a curried binary function', function(){
    expect(or).to.be.a('function');
    expect(or.length).to.equal(2);
    expect(or(of(1))).to.be.a('function');
  });

  it('throws when not given a Future as first argument', function(){
    var f = function(){ return or(1) };
    expect(f).to.throw(TypeError, /Future.*first/);
  });

  it('throws when not given a Future as second argument', function(){
    var f = function(){ return or(of(1), 1) };
    expect(f).to.throw(TypeError, /Future.*second/);
  });

  testInstance(function(a, b){ return or(a, b) });

  it('allows for the implementation of `any` in terms of reduce', function(){
    var any = function(ms){ return ms.reduce(or, reject('empty list')) };
    return Promise.all([
      U.assertRejected(any([]), 'empty list'),
      U.assertRejected(any([reject(1)]), 1),
      U.assertResolved(any([reject(1), of(2)]), 2),
      U.assertResolved(any([reject(1), after(20, 2), of(3)]), 2)
    ]);
  });

});

describe('Future#or()', function(){

  it('throws when invoked out of context', function(){
    var f = function(){ return of(1).or.call(null, of(1)) };
    expect(f).to.throw(TypeError, /Future/);
  });

  it('throws TypeError when not given a Future', function(){
    var xs = [NaN, {}, [], 1, 'a', new Date, undefined, null, function(x){ return x }];
    var fs = xs.map(function(x){ return function(){ return of(1).or(x) } });
    fs.forEach(function(f){ return expect(f).to.throw(TypeError, /Future/) });
  });

  testInstance(function(a, b){ return a.or(b) });

});
