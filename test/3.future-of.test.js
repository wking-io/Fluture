'use strict';

const expect = require('chai').expect;
const FL = require('fantasy-land');
const Future = require('../fluture.js');
const FutureOf = Future.classes.FutureOf;
const U = require('./util');
const type = require('sanctuary-type-identifiers');

describe('Future.of()', () => {

  it('is also available as fantasy-land function', () => {
    expect(Future.of).to.equal(Future[FL.of]);
  });

  it('returns an instance of FutureOf', () => {
    expect(Future.of(1)).to.be.an.instanceof(FutureOf);
  });

});

describe('FutureOf', () => {

  const m = new FutureOf(1);

  it('extends Future', () => {
    expect(m).to.be.an.instanceof(Future);
  });

  it('is considered a member of fluture/Fluture', () => {
    expect(type(m)).to.equal('fluture/Future');
  });

  describe('#fork()', () => {

    it('calls success callback with the value', () => {
      return U.assertResolved(m, 1);
    });

  });

  describe('#extractRight()', () => {

    it('returns array with the value', () => {
      expect(m.extractRight()).to.deep.equal([1]);
    });

  });

  describe('#toString()', () => {

    it('returns the code to create the FutureOf', () => {
      expect(m.toString()).to.equal('Future.of(1)');
    });

  });

});
