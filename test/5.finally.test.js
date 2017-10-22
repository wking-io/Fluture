import {expect} from 'chai';
import {Future, lastly, of, reject} from '../index.mjs.js';
import * as U from './util';
import * as F from './futures';
import type from 'sanctuary-type-identifiers';

var testInstance = function(fin){

  it('is considered a member of fluture/Fluture', function(){
    expect(type(fin(of(1), of(2)))).to.equal(Future['@@type']);
  });

  describe('#fork()', function(){

    it('runs the second Future when the first resolves', function(done){
      fin(of(1), of(null).map(done)).fork(U.noop, U.noop);
    });

    it('runs the second Future when the first rejects', function(done){
      fin(reject(1), of(null).map(done)).fork(U.noop, U.noop);
    });

    it('resolves with the resolution value of the first', function(){
      var actual = fin(of(1), of(2));
      return U.assertResolved(actual, 1);
    });

    it('rejects with the rejection reason of the first if the second resolves', function(){
      var actual = fin(reject(1), of(2));
      return U.assertRejected(actual, 1);
    });

    it('always rejects with the rejection reason of the second', function(){
      var actualResolved = fin(of(1), reject(2));
      var actualRejected = fin(reject(1), reject(2));
      return Promise.all([
        U.assertRejected(actualResolved, 2),
        U.assertRejected(actualRejected, 2)
      ]);
    });

    it('does nothing after being cancelled', function(done){
      fin(F.resolvedSlow, F.resolved).fork(U.failRej, U.failRes)();
      fin(F.resolved, F.resolvedSlow).fork(U.failRej, U.failRes)();
      fin(F.rejectedSlow, F.rejected).fork(U.failRej, U.failRes)();
      fin(F.rejected, F.rejectedSlow).fork(U.failRej, U.failRes)();
      setTimeout(done, 25);
    });

    it('immediately runs and cancels the disposal Future when cancelled early', function(done){
      var cancel = fin(F.resolvedSlow, Future(function(){ return function(){ return done() } })).fork(U.failRej, U.failRes);
      setTimeout(cancel, 10);
    });

  });

};

describe('finally()', function(){

  it('is a curried binary function', function(){
    expect(lastly).to.be.a('function');
    expect(lastly.length).to.equal(2);
    expect(lastly(of(1))).to.be.a('function');
  });

  it('throws when not given a Future as first argument', function(){
    var f = function(){ return lastly(1) };
    expect(f).to.throw(TypeError, /Future.*first/);
  });

  it('throws when not given a Future as second argument', function(){
    var f = function(){ return lastly(of(1), 1) };
    expect(f).to.throw(TypeError, /Future.*second/);
  });

  testInstance(function(a, b){ return lastly(b, a) });

});

describe('Future#finally()', function(){

  it('throws when invoked out of context', function(){
    var f = function(){ return of(1).finally.call(null, of(1)) };
    expect(f).to.throw(TypeError, /Future/);
  });

  it('throws TypeError when not given a Future', function(){
    var xs = [NaN, {}, [], 1, 'a', new Date, undefined, null, function(x){ return x }];
    var fs = xs.map(function(x){ return function(){ return of(1).finally(x) } });
    fs.forEach(function(f){ return expect(f).to.throw(TypeError, /Future/) });
  });

  testInstance(function(a, b){ return a.finally(b) });

});

describe('Future#lastly()', function(){

  it('throws when invoked out of context', function(){
    var f = function(){ return of(1).lastly.call(null, of(1)) };
    expect(f).to.throw(TypeError, /Future/);
  });

  it('throws TypeError when not given a Future', function(){
    var xs = [NaN, {}, [], 1, 'a', new Date, undefined, null, function(x){ return x }];
    var fs = xs.map(function(x){ return function(){ return of(1).lastly(x) } });
    fs.forEach(function(f){ return expect(f).to.throw(TypeError, /Future/) });
  });

  testInstance(function(a, b){ return a.lastly(b) });

});
