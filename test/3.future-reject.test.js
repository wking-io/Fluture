'use strict';

const expect = require('chai').expect;
const Future = require('../fluture.js');
const FutureReject = Future.classes.FutureReject;
const U = require('./util');
const type = require('sanctuary-type-identifiers');

describe('Future.reject()', () => {

  it('returns an instance of FutureReject', () => {
    expect(Future.reject(1)).to.be.an.instanceof(FutureReject);
  });

});

describe('FutureReject', () => {

  const m = new FutureReject(1);

  it('extends Future', () => {
    expect(m).to.be.an.instanceof(Future);
  });

  it('is considered a member of fluture/Fluture', () => {
    expect(type(m)).to.equal('fluture/Future');
  });

  describe('#fork()', () => {

    it('calls failure callback with the reason', () => {
      return U.assertRejected(m, 1);
    });

  });

  describe('#extractLeft()', () => {

    it('returns array with the reason', () => {
      expect(m.extractLeft()).to.deep.equal([1]);
    });

  });

  describe('#toString()', () => {

    it('returns the code to create the FutureReject', () => {
      expect(m.toString()).to.equal('Future.reject(1)');
    });

  });

});
