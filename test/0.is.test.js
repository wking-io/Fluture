import {expect} from 'chai';
import * as U from './util';
import Future from '../index.mjs.js';
import * as util from '../src/internal/is';

describe('is', function(){

  describe('.isThenable()', function(){

    var ps = [
      Promise.resolve(1),
      new Promise(U.noop),
      {then: U.noop},
      {then: function(a){ return a }},
      {then: function(a, b){ return b }}
    ];

    var values = [NaN, 1, true, undefined, null, [], {}];
    var xs = values.concat([U.noop]).concat(values.map(function(x){ return ({then: x}) }));

    it('returns true when given a Thenable', function(){
      ps.forEach(function(p){ return expect(util.isThenable(p)).to.equal(true) });
    });

    it('returns false when not given a Thenable', function(){
      xs.forEach(function(x){ return expect(util.isThenable(x)).to.equal(false) });
    });

  });

  describe('.isFunction()', function(){

    var fs = [function(){}, function(){}, Future];
    var xs = [NaN, 1, true, undefined, null, [], {}];

    it('returns true when given a Function', function(){
      fs.forEach(function(f){ return expect(util.isFunction(f)).to.equal(true) });
    });

    it('returns false when not given a Function', function(){
      xs.forEach(function(x){ return expect(util.isFunction(x)).to.equal(false) });
    });

  });

  describe('.isUnsigned()', function(){

    var is = [1, 2, 99999999999999999999, Infinity];
    var xs = [NaN, 0, -0, -1, -99999999999999999, -Infinity, '1', [], {}];

    it('returns true when given a PositiveInteger', function(){
      is.forEach(function(i){ return expect(util.isUnsigned(i)).to.equal(true) });
    });

    it('returns false when not given a PositiveInteger', function(){
      xs.forEach(function(x){ return expect(util.isUnsigned(x)).to.equal(false) });
    });

  });

  describe('.isObject()', function(){

    function O(){}

    var os = [{}, {foo: 1}, Object.create(null), new O, []];
    var xs = [1, true, NaN, null, undefined, ''];

    it('returns true when given an Object', function(){
      os.forEach(function(i){ return expect(util.isObject(i)).to.equal(true) });
    });

    it('returns false when not given an Object', function(){
      xs.forEach(function(x){ return expect(util.isObject(x)).to.equal(false) });
    });

  });

  describe('.isIterator()', function(){

    var is = [{next: function(){}}, {next: function(x){ return x }}, (function*(){}())];
    var xs = [1, true, NaN, null, undefined, '', {}, {next: 1}];

    it('returns true when given an Iterator', function(){
      is.forEach(function(i){ return expect(util.isIterator(i)).to.equal(true) });
    });

    it('returns false when not given an Iterator', function(){
      xs.forEach(function(x){ return expect(util.isIterator(x)).to.equal(false) });
    });

  });

});
