import {expect} from 'chai';
import Future from '../index.mjs.js';
import * as U from './util';
import type from 'sanctuary-type-identifiers';

describe('Future()', function(){

  it('is a unary function', function(){
    expect(Future).to.be.a('function');
    expect(Future.length).to.equal(1);
  });

  it('throws TypeError when not given a function', function(){
    var xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];
    var fs = xs.map(function(x){ return function(){ return Future(x) } });
    fs.forEach(function(f){ return expect(f).to.throw(TypeError, /Future/) });
  });

  it('returns a Future', function(){
    var actual = Future(U.noop);
    expect(actual).to.be.an.instanceof(Future);
  });

  it('can be called with "new", for those feeling particularly OO', function(){
    var actual = new Future(U.noop);
    expect(actual).to.be.an.instanceof(Future);
  });

});

describe('Computation', function(){

  it('extends Future', function(){
    expect(Future(U.noop)).to.be.an.instanceof(Future);
  });

  it('is considered a member of fluture/Fluture', function(){
    expect(type(Future(U.noop))).to.equal(Future['@@type']);
  });

  describe('#fork()', function(){

    it('throws TypeError when the computation returns nonsense', function(){
      var xs = [null, 1, function(a){ return a }, function(a, b){ return b }, 'hello'];
      var ms = xs.map(function(x){ return Future(function(){ return x }) });
      var fs = ms.map(function(m){ return function(){ return m.fork(U.noop, U.noop) } });
      fs.forEach(function(f){ return expect(f).to.throw(TypeError, /Future/) });
    });

    it('does not throw when the computation returns a nullary function or void', function(){
      var xs = [undefined, function(){}];
      var ms = xs.map(function(x){ return Future(function(){ return x }) });
      var fs = ms.map(function(m){ return function(){ return m.fork(U.noop, U.noop) } });
      fs.forEach(function(f){ return expect(f).to.not.throw(TypeError, /Future/) });
    });

    it('ensures no continuations are called after the first resolve', function(done){
      var actual = Future(function(rej, res){
        res(1);
        res(2);
        rej(3);
      });
      actual.fork(U.failRej, function(){ return done() });
    });

    it('ensures no continuations are called after the first reject', function(done){
      var actual = Future(function(rej, res){
        rej(1);
        rej(2);
        res(3);
      });
      actual.fork(function(){ return done() }, U.failRes);
    });

    it('stops continuations from being called after cancellation', function(done){
      Future(function(rej, res){
        setTimeout(res, 20, 1);
        setTimeout(rej, 20, 1);
      })
      .fork(U.failRej, U.failRes)();
      setTimeout(done, 25);
    });

    it('stops cancellation from being called after continuations', function(){
      var m = Future(function(rej, res){
        res(1);
        return function(){ throw U.error };
      });
      var cancel = m.fork(U.failRej, U.noop);
      cancel();
    });

  });

  describe('#toString()', function(){

    it('returns a customized representation', function(){
      var m = Future(function(rej, res){ res() });
      expect(m.toString()).to.contain('Future');
    });

  });

});
