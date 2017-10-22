import {expect} from 'chai';
import {Future, race, of, after, never} from '../index.mjs.js';
import * as U from './util';
import {resolvedSlow, rejectedSlow} from './futures';
import type from 'sanctuary-type-identifiers';

var testInstance = function(race){

  it('is considered a member of fluture/Fluture', function(){
    var m1 = Future(function(rej, res){ return void setTimeout(res, 50, 1) });
    var m2 = Future(function(rej){ return void setTimeout(rej, 5, U.error) });
    expect(type(race(m1, m2))).to.equal(Future['@@type']);
  });

  describe('#fork()', function(){

    it('rejects when the first one rejects', function(){
      var m1 = Future(function(rej, res){ return void setTimeout(res, 50, 1) });
      var m2 = Future(function(rej){ return void setTimeout(rej, 5, U.error) });
      return U.assertRejected(race(m1, m2), U.error);
    });

    it('resolves when the first one resolves', function(){
      var m1 = Future(function(rej, res){ return void setTimeout(res, 5, 1) });
      var m2 = Future(function(rej){ return void setTimeout(rej, 50, U.error) });
      return U.assertResolved(race(m1, m2), 1);
    });

    it('cancels the right if the left resolves', function(done){
      var m = race(resolvedSlow, Future(function(){ return function(){ return done() } }));
      m.fork(U.noop, U.noop);
    });

    it('cancels the left if the right resolves', function(done){
      var m = race(Future(function(){ return function(){ return done() } }), resolvedSlow);
      m.fork(U.noop, U.noop);
    });

    it('cancels the right if the left rejects', function(done){
      var m = race(rejectedSlow, Future(function(){ return function(){ return done() } }));
      m.fork(U.noop, U.noop);
    });

    it('cancels the left if the right rejects', function(done){
      var m = race(Future(function(){ return function(){ return done() } }), rejectedSlow);
      m.fork(U.noop, U.noop);
    });

    it('creates a cancel function which cancels both Futures', function(done){
      var cancelled = false;
      var m = Future(function(){ return function(){ return (cancelled ? done() : (cancelled = true)) } });
      var cancel = race(m, m).fork(U.noop, U.noop);
      cancel();
    });

  });

};

describe('race()', function(){

  it('is a curried binary function', function(){
    expect(race).to.be.a('function');
    expect(race.length).to.equal(2);
    expect(race(of(1))).to.be.a('function');
  });

  it('throws when not given a Future as first argument', function(){
    var f = function(){ return race(1) };
    expect(f).to.throw(TypeError, /Future.*first/);
  });

  it('throws when not given a Future as second argument', function(){
    var f = function(){ return race(of(1), 1) };
    expect(f).to.throw(TypeError, /Future.*second/);
  });

  testInstance(function(a, b){ return race(b, a) });

});

describe('Future#race()', function(){

  it('throws when invoked out of context', function(){
    var f = function(){ return of(1).race.call(null, of(1)) };
    expect(f).to.throw(TypeError, /Future/);
  });

  it('throws TypeError when not given a Future', function(){
    var xs = [NaN, {}, [], 1, 'a', new Date, undefined, null, function(x){ return x }];
    var fs = xs.map(function(x){ return function(){ return of(1).race(x) } });
    fs.forEach(function(f){ return expect(f).to.throw(TypeError, /Future/) });
  });

  it('returns other when called on a Never', function(){
    var m = after(10, 1);
    expect(never.race(m)).to.equal(m);
  });

  testInstance(function(a, b){ return a.race(b) });

});
