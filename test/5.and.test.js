import {expect} from 'chai';
import {Future, and, of} from '../index.mjs.js';
import * as U from './util';
import * as F from './futures';
import type from 'sanctuary-type-identifiers';

var testInstance = function(and){

  it('is considered a member of fluture/Fluture', function(){
    expect(type(and(F.resolved, F.resolvedSlow))).to.equal(Future['@@type']);
  });

  describe('#fork()', function(){

    describe('(res, res)', function(){

      it('resolves with right if left resolves first', function(){
        return U.assertResolved(and(F.resolved, F.resolvedSlow), 'resolvedSlow');
      });

      it('resolves with right if left resolves last', function(){
        return U.assertResolved(and(F.resolvedSlow, F.resolved), 'resolved');
      });

    });

    describe('(rej, rej)', function(){

      it('rejects with left if right rejects first', function(){
        return U.assertRejected(and(F.rejectedSlow, F.rejected), 'rejectedSlow');
      });

      it('rejects with left if right rejects last', function(){
        return U.assertRejected(and(F.rejected, F.rejectedSlow), 'rejected');
      });

    });

    describe('(rej, res)', function(){

      it('rejects with left if right resolves first', function(){
        return U.assertRejected(and(F.rejectedSlow, F.resolved), 'rejectedSlow');
      });

      it('rejects with left if right resolves last', function(){
        return U.assertRejected(and(F.rejected, F.resolvedSlow), 'rejected');
      });

    });

    describe('(res, rej)', function(){

      it('rejects with right if left resolves first', function(){
        return U.assertRejected(and(F.resolved, F.rejectedSlow), 'rejectedSlow');
      });

      it('rejects with right if left resolves last', function(){
        return U.assertRejected(and(F.resolvedSlow, F.rejected), 'rejected');
      });

    });

    it('cancels the running Future', function(done){
      var m = Future(function(){ return function(){ return done() } });
      var cancel = and(m, m).fork(U.noop, U.noop);
      cancel();
    });

  });

  describe('#toString()', function(){

    it('returns the code to create the data-structure', function(){
      var m = Future(function(){ return function(){} });
      var actual = and(m, m).toString();
      expect(actual).to.equal(((m.toString()) + '.and(' + (m.toString()) + ')'));
    });

  });

};

describe('and()', function(){

  it('is a curried binary function', function(){
    expect(and).to.be.a('function');
    expect(and.length).to.equal(2);
    expect(and(F.resolved)).to.be.a('function');
  });

  it('throws when not given a Future as first argument', function(){
    var f = function(){ return and(1) };
    expect(f).to.throw(TypeError, /Future.*first/);
  });

  it('throws when not given a Future as second argument', function(){
    var f = function(){ return and(of(1), 1) };
    expect(f).to.throw(TypeError, /Future.*second/);
  });

  testInstance(function(a, b){ return and(a, b) });

  it('allows for the implementation of `all` in terms of reduce', function(){
    var all = function(ms){ return ms.reduce(and, of(true)) };
    return Promise.all([
      U.assertResolved(all([]), true),
      U.assertRejected(all([F.rejected, F.resolved]), 'rejected'),
      U.assertRejected(all([F.resolved, F.rejected]), 'rejected'),
      U.assertResolved(all([F.resolvedSlow, F.resolved]), 'resolved'),
      U.assertResolved(all([F.resolved, F.resolvedSlow]), 'resolvedSlow'),
      U.assertRejected(all([F.rejected, F.rejectedSlow]), 'rejected'),
      U.assertRejected(all([F.rejectedSlow, F.rejected]), 'rejectedSlow')
    ]);
  });

});

describe('Future#and()', function(){

  it('throws when invoked out of context', function(){
    var f = function(){ return of(1).and.call(null, of(1)) };
    expect(f).to.throw(TypeError, /Future/);
  });

  it('throw TypeError when not given a Future', function(){
    var xs = [NaN, {}, [], 1, 'a', new Date, undefined, null, function(x){ return x }];
    var fs = xs.map(function(x){ return function(){ return of(1).and(x) } });
    fs.forEach(function(f){ return expect(f).to.throw(TypeError, /Future/) });
  });

  testInstance(function(a, b){ return a.and(b) });

});
