import {expect} from 'chai';
import {Future, go, of, after} from '../index.mjs.js';
import * as U from './util';

describe('go()', function(){

  it('throws TypeError when not given a function', function(){
    var xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];
    var fs = xs.map(function(x){ return function(){ return go(x) } });
    fs.forEach(function(f){ return expect(f).to.throw(TypeError, /Future/) });
  });

});

describe('Go', function(){

  describe('#fork()', function(){

    it('throws TypeError when the given function does not return an interator', function(){
      var xs = [NaN, {}, [], 1, 'a', new Date, undefined, null, function(){}, {next: 'hello'}];
      var fs = xs.map(function(x){ return function(){ return go(function(){ return x }).fork(U.noop, U.noop) } });
      fs.forEach(function(f){ return expect(f).to.throw(TypeError, /Future/) });
    });

    it('throws TypeError when the returned iterator does not return a valid iteration', function(){
      var xs = [null, '', {}, {value: 1, done: 1}];
      var fs = xs.map(function(x){ return function(){ return go(function(){ return ({next: function(){ return x }}) }).fork(U.noop, U.noop) } });
      fs.forEach(function(f){ return expect(f).to.throw(TypeError, /Future/) });
    });

    it('throws TypeError when the returned iterator produces something other than a Future', function(){
      var xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];
      var fs = xs.map(function(x){ return function(){ return go(function(){ return ({next: function(){ return ({done: false, value: x}) }}) }).fork(U.noop, U.noop) } }
      );
      fs.forEach(function(f){ return expect(f).to.throw(TypeError, /Future/) });
    });

    it('handles synchronous Futures', function(){
      return U.assertResolved(go(function*(){
        var a = yield of(1);
        var b = yield of(2);
        return a + b;
      }), 3);
    });

    it('handles asynchronous Futures', function(){
      return U.assertResolved(go(function*(){
        var a = yield after(10, 1);
        var b = yield after(10, 2);
        return a + b;
      }), 3);
    });

    it('does not mix state over multiple forks', function(){
      var m = go(function*(){
        var a = yield of(1);
        var b = yield after(10, 2);
        return a + b;
      });
      return Promise.all([
        U.assertResolved(m, 3),
        U.assertResolved(m, 3)
      ]);
    });

    it('is stack safe', function(){
      var gen = function*(){
        var i = 0;
        while(i < U.STACKSIZE + 1){ yield of(i++) }
        return i;
      };

      var m = go(gen);
      return U.assertResolved(m, U.STACKSIZE + 1);
    });

    it('cancels the running operation when cancelled', function(done){
      var cancel = go(function*(){
        yield of(1);
        yield Future(function(){ return function(){ return done() } });
      }).fork(U.noop, U.noop);
      cancel();
    });

  });

  describe('#toString()', function(){

    it('returns the code to create the Go', function(){
      var f = function*(){};
      var m = go(f);
      var s = 'Future.do(' + (f.toString()) + ')';
      expect(m.toString()).to.equal(s);
    });

  });

});
