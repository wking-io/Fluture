import {expect} from 'chai';
import {Future, fold, of, reject} from '../index.mjs.js';
import * as U from './util';
import type from 'sanctuary-type-identifiers';

var testInstance = function(fold){

  it('is considered a member of fluture/Fluture', function(){
    expect(type(fold(reject(1), U.add(1), U.sub(1)))).to.equal(Future['@@type']);
  });

  describe('#fork()', function(){

    it('resolves with the transformed rejection value', function(){
      return U.assertResolved(fold(reject(1), U.add(1), U.sub(1)), 2);
    });

    it('resolves with the transformed resolution value', function(){
      return U.assertResolved(fold(of(1), U.sub(1), U.add(1)), 2);
    });

  });

};

describe('fold()', function(){

  it('is a curried ternary function', function(){
    expect(fold).to.be.a('function');
    expect(fold.length).to.equal(3);
    expect(fold(U.noop)).to.be.a('function');
    expect(fold(U.noop)(U.noop)).to.be.a('function');
    expect(fold(U.noop, U.noop)).to.be.a('function');
  });

  it('throws when not given a Function as first argument', function(){
    var f = function(){ return fold(1) };
    expect(f).to.throw(TypeError, /Future.*first/);
  });

  it('throws when not given a Function as second argument', function(){
    var f = function(){ return fold(U.add(1), 1) };
    expect(f).to.throw(TypeError, /Future.*second/);
  });

  it('throws when not given a Future as third argument', function(){
    var f = function(){ return fold(U.add(1), U.add(1), 1) };
    expect(f).to.throw(TypeError, /Future.*third/);
  });

  testInstance(function(m, f, g){ return fold(f, g, m) });

});

describe('Future#fold()', function(){

  it('throws when invoked out of context', function(){
    var f = function(){ return of(1).fold.call(null, U.noop, U.noop) };
    expect(f).to.throw(TypeError, /Future/);
  });

  it('throws TypeError when first argument is not a function', function(){
    var m = of(1);
    var xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];
    var fs = xs.map(function(x){ return function(){ return m.fold(x, U.noop) } });
    fs.forEach(function(f){ return expect(f).to.throw(TypeError, /Future/) });
  });

  it('throws TypeError when second argument is not a function', function(){
    var m = of(1);
    var xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];
    var fs = xs.map(function(x){ return function(){ return m.fold(U.noop, x) } });
    fs.forEach(function(f){ return expect(f).to.throw(TypeError, /Future/) });
  });

  testInstance(function(m, f, g){ return m.fold(f, g) });

});
