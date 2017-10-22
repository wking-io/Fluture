import {expect} from 'chai';
import {Future, bimap, of, reject} from '../index.mjs.js';
import * as U from './util';
import type from 'sanctuary-type-identifiers';

var testInstance = function(bimap){

  it('is considered a member of fluture/Fluture', function(){
    expect(type(bimap(reject(1), U.add(1), U.failRes))).to.equal(Future['@@type']);
  });

  describe('#fork()', function(){

    it('applies the first function to the value in the rejection branch', function(){
      var actual = bimap(reject(1), U.add(1), U.failRes);
      return U.assertRejected(actual, 2);
    });

    it('applies the second function to the value in the resolution branch', function(){
      var actual = bimap(of(1), U.failRej, U.add(1));
      return U.assertResolved(actual, 2);
    });

  });

};

describe('bimap()', function(){

  it('is a curried ternary function', function(){
    expect(bimap).to.be.a('function');
    expect(bimap.length).to.equal(3);
    expect(bimap(U.noop)).to.be.a('function');
    expect(bimap(U.noop)(U.noop)).to.be.a('function');
    expect(bimap(U.noop, U.noop)).to.be.a('function');
  });

  it('throws when not given a Function as first argument', function(){
    var f = function(){ return bimap(1) };
    expect(f).to.throw(TypeError, /Future.*first/);
  });

  it('throws when not given a Function as second argument', function(){
    var f = function(){ return bimap(U.add(1), 1) };
    expect(f).to.throw(TypeError, /Future.*second/);
  });

  it('throws when not given a Future as third argument', function(){
    var f = function(){ return bimap(U.add(1), U.add(1), 1) };
    expect(f).to.throw(TypeError, /Future.*third/);
  });

  testInstance(function(m, f, g){ return bimap(f, g, m) });

});

describe('Future#bimap()', function(){

  it('throws when invoked out of context', function(){
    var f = function(){ return of(1).bimap.call(null, U.noop, U.noop) };
    expect(f).to.throw(TypeError, /Future/);
  });

  it('throws TypeError when not given a function as first argument', function(){
    var xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];
    var fs = xs.map(function(x){ return function(){ return of(1).bimap(x, U.noop) } });
    fs.forEach(function(f){ return expect(f).to.throw(TypeError, /Future/) });
  });

  it('throws TypeError when not given a function as second argument', function(){
    var xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];
    var fs = xs.map(function(x){ return function(){ return of(1).bimap(U.noop, x) } });
    fs.forEach(function(f){ return expect(f).to.throw(TypeError, /Future/) });
  });

  testInstance(function(m, f, g){ return m.bimap(f, g) });

});
