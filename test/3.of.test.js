import {expect} from 'chai';
import FL from 'fantasy-land';
import {Future, of} from '../index.mjs.js';
import * as U from './util';
import type from 'sanctuary-type-identifiers';

describe('of()', function(){

  it('is also available as fantasy-land function', function(){
    expect(of).to.equal(Future[FL.of]);
  });

  it('returns an instance of Future', function(){
    expect(of(1)).to.be.an.instanceof(Future);
  });

});

describe('Resolved', function(){

  var m = of(1);

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

  });

  describe('#extractRight()', function(){

    it('returns array with the value', function(){
      expect(m.extractRight()).to.deep.equal([1]);
    });

  });

  describe('#toString()', function(){

    it('returns the code to create the Resolved', function(){
      expect(m.toString()).to.equal('Future.of(1)');
    });

  });

});
