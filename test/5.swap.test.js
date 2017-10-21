import {expect} from 'chai';
import {Future, swap, of, reject} from '../index.mjs.js';
import * as U from './util';
import type from 'sanctuary-type-identifiers';

var testInstance = function(swap){

  it('is considered a member of fluture/Fluture', function(){
    expect(type(swap(of(1)))).to.equal(Future['@@type']);
  });

  describe('#fork()', function(){

    it('rejects with the resolution value', function(){
      var actual = swap(of(1));
      return U.assertRejected(actual, 1);
    });

    it('resolves with the rejection reason', function(){
      var actual = swap(reject(1));
      return U.assertResolved(actual, 1);
    });

  });

};

describe('swap()', function(){

  it('throws when not given a Future', function(){
    var f = function(){ return swap(1) };
    expect(f).to.throw(TypeError, /Future/);
  });

  testInstance(function(m){ return swap(m) });

});

describe('Future#swap()', function(){

  it('throws when invoked out of context', function(){
    var f = function(){ return of(1).swap.call(null) };
    expect(f).to.throw(TypeError, /Future/);
  });

  it('swaps Computation', function(){
    var m = Future(function(rej){ return rej(1) });
    return U.assertResolved(m.swap(), 1);
  });

  testInstance(function(m){ return m.swap() });

});
