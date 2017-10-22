import {expect} from 'chai';
import {Future, map, of} from '../index.mjs.js';
import * as U from './util';
import * as F from './futures';
import type from 'sanctuary-type-identifiers';

var testInstance = function(map){

  it('is considered a member of fluture/Fluture', function(){
    expect(type(map(of(1), U.add(1)))).to.equal(Future['@@type']);
  });

  describe('#fork()', function(){

    it('applies the given function to its inner', function(){
      var actual = map(of(1), U.add(1));
      return U.assertResolved(actual, 2);
    });

    it('does not map rejected state', function(){
      var actual = map(F.rejected, function(){ return 'mapped' });
      return U.assertRejected(actual, 'rejected');
    });

    it('does not resolve after being cancelled', function(done){
      map(F.resolvedSlow, U.failRes).fork(U.failRej, U.failRes)();
      setTimeout(done, 25);
    });

    it('does not reject after being cancelled', function(done){
      map(F.rejectedSlow, U.failRes).fork(U.failRej, U.failRes)();
      setTimeout(done, 25);
    });

  });

};

describe('map()', function(){

  it('is a curried binary function', function(){
    expect(map).to.be.a('function');
    expect(map.length).to.equal(2);
    expect(map(U.noop)).to.be.a('function');
  });

  it('throws when not given a Function as first argument', function(){
    var f = function(){ return map(1) };
    expect(f).to.throw(TypeError, /Future.*first/);
  });

  it('throws when not given a Future as second argument', function(){
    var f = function(){ return map(U.add(1), 1) };
    expect(f).to.throw(TypeError, /Future.*second/);
  });

  testInstance(function(m, f){ return map(f, m) });

});

describe('Future#map()', function(){

  it('throws when invoked out of context', function(){
    var f = function(){ return F.resolved.map.call(null, U.noop) };
    expect(f).to.throw(TypeError, /Future/);
  });

  it('throws TypeError when not given a function', function(){
    var xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];
    var fs = xs.map(function(x){ return function(){ return F.resolved.map(x) } });
    fs.forEach(function(f){ return expect(f).to.throw(TypeError, /Future/) });
  });

  testInstance(function(m, f){ return m.map(f) });

});
