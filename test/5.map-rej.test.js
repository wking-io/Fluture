import {expect} from 'chai';
import {Future, mapRej, of} from '../index.mjs.js';
import * as U from './util';
import * as F from './futures';
import type from 'sanctuary-type-identifiers';

var testInstance = function(mapRej){

  it('is considered a member of fluture/Fluture', function(){
    expect(type(mapRej(F.rejected, U.bang))).to.equal(Future['@@type']);
  });

  describe('#fork()', function(){

    it('applies the given function to its rejection reason', function(){
      var actual = mapRej(F.rejected, U.bang);
      return U.assertRejected(actual, 'rejected!');
    });

    it('does not map resolved state', function(){
      var actual = mapRej(F.resolved, function(){ return 'mapped' });
      return U.assertResolved(actual, 'resolved');
    });

    it('does not resolve after being cancelled', function(done){
      mapRej(F.resolvedSlow, U.failRej).fork(U.failRej, U.failRes)();
      setTimeout(done, 25);
    });

    it('does not reject after being cancelled', function(done){
      mapRej(F.rejectedSlow, U.failRej).fork(U.failRej, U.failRes)();
      setTimeout(done, 25);
    });

  });

};

describe('mapRej()', function(){

  it('is a curried binary function', function(){
    expect(mapRej).to.be.a('function');
    expect(mapRej.length).to.equal(2);
    expect(mapRej(U.noop)).to.be.a('function');
  });

  it('throws when not given a Function as first argument', function(){
    var f = function(){ return mapRej(1, F.resolved) };
    expect(f).to.throw(TypeError, /Future.*first/);
  });

  it('throws when not given a Future as second argument', function(){
    var f = function(){ return mapRej(U.add(1), 1) };
    expect(f).to.throw(TypeError, /Future.*second/);
  });

  testInstance(function(m, f){ return mapRej(f, m) });

});

describe('Future#mapRej()', function(){

  it('throws when invoked out of context', function(){
    var f = function(){ return of(1).mapRej.call(null, U.noop) };
    expect(f).to.throw(TypeError, /Future/);
  });

  it('throws TypeError when not given a function', function(){
    var xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];
    var fs = xs.map(function(x){ return function(){ return of(1).mapRej(x) } });
    fs.forEach(function(f){ return expect(f).to.throw(TypeError, /Future/) });
  });

  testInstance(function(m, f){ return m.mapRej(f) });

});
