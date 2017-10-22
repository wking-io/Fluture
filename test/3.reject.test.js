import {expect} from 'chai';
import {Future, reject} from '../index.mjs.js';
import * as U from './util';
import type from 'sanctuary-type-identifiers';

describe('reject()', function(){

  it('returns an instance of Future', function(){
    expect(reject(1)).to.be.an.instanceof(Future);
  });

});

describe('Rejected', function(){

  var m = reject(1);

  it('extends Future', function(){
    expect(m).to.be.an.instanceof(Future);
  });

  it('is considered a member of fluture/Fluture', function(){
    expect(type(m)).to.equal(Future['@@type']);
  });

  describe('#fork()', function(){

    it('calls failure callback with the reason', function(){
      return U.assertRejected(m, 1);
    });

  });

  describe('#extractLeft()', function(){

    it('returns array with the reason', function(){
      expect(m.extractLeft()).to.deep.equal([1]);
    });

  });

  describe('#toString()', function(){

    it('returns the code to create the Rejected', function(){
      expect(m.toString()).to.equal('Future.reject(1)');
    });

  });

});
