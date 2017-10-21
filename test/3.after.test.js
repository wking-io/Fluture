import {expect} from 'chai';
import {Future, after, never, rejectAfter} from '../index.mjs.js';
import * as U from './util';
import {rejected, resolved} from './futures';
import type from 'sanctuary-type-identifiers';

describe('after()', function(){

  it('is a curried binary function', function(){
    expect(after).to.be.a('function');
    expect(after.length).to.equal(2);
    expect(after(20)).to.be.a('function');
  });

  it('throws TypeError when not given a number as first argument', function(){
    var xs = [{}, [], 'a', new Date, undefined, null];
    var fs = xs.map(function(x){ return function(){ return after(x) } });
    fs.forEach(function(f){ return expect(f).to.throw(TypeError, /Future/) });
  });

  it('returns an instance of Future', function(){
    expect(after(20, 1)).to.be.an.instanceof(Future);
  });

  it('returns Never when given Infinity', function(){
    expect(after(Infinity, 1)).to.equal(never);
  });

});

describe('After', function(){

  var m = after(20, 1);

  it('extends Future', function(){
    expect(m).to.be.an.instanceof(Future);
  });

  it('is considered a member of fluture/Fluture', function(){
    expect(type(m)).to.equal(Future['@@type']);
  });

  describe('#fork()', function(){

    it('calls success callback with the value', function(){
      return U.assertResolved(m, 1);
    });

    it('clears its internal timeout when cancelled', function(done){
      after(20, 1).fork(U.failRej, U.failRes)();
      setTimeout(done, 25);
    });

  });

  describe('#race()', function(){

    it('returns the other if the other has already settled', function(){
      var m = after(1, 1);
      expect(m.race(rejected)).to.equal(rejected);
      expect(m.race(resolved)).to.equal(resolved);
    });

    it('returns itself if the other is Never', function(){
      var m = after(1, 1);
      expect(m.race(never)).to.equal(m);
    });

    it('returns the faster After', function(){
      var fast = after(1, 1);
      var slow = after(10, 1);
      var fastr = rejectAfter(1, 1);
      var slowr = rejectAfter(10, 1);
      expect(slow.race(fast)).to.equal(fast);
      expect(slow.race(fastr)).to.equal(fastr);
      expect(slow.race(slowr)).to.equal(slow);
      expect(fast.race(slow)).to.equal(fast);
      expect(fast.race(slowr)).to.equal(fast);
      expect(fast.race(fastr)).to.equal(fast);
    });

    it('races undeterministic Futures the conventional way', function(){
      var m = after(1, 1);
      var undeterministic = Future(function(){});
      var actual = m.race(undeterministic);
      expect(actual).to.not.equal(m);
      expect(actual).to.not.equal(undeterministic);
      return U.assertResolved(actual, 1);
    });

  });

  describe('#swap()', function(){

    it('returns a rejected Future', function(){
      var m = after(10, 1);
      return U.assertRejected(m.swap(), 1);
    });

  });

  describe('#extractRight()', function(){

    it('returns array with the value', function(){
      expect(m.extractRight()).to.deep.equal([1]);
    });

  });

  describe('#toString()', function(){

    it('returns the code to create the After', function(){
      expect(m.toString()).to.equal('Future.after(20, 1)');
    });

  });

});
