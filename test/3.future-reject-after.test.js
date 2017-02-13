'use strict';

const expect = require('chai').expect;
const Future = require('../fluture.js');
const FutureRejectAfter = Future.classes.FutureRejectAfter;
const U = require('./util');
const type = require('sanctuary-type-identifiers');

describe('Future.rejectAfter()', () => {

  it('is a curried binary function', () => {
    expect(Future.rejectAfter).to.be.a('function');
    expect(Future.rejectAfter.length).to.equal(2);
    expect(Future.rejectAfter(20)).to.be.a('function');
  });

  it('throws TypeError when not given a number as first argument', () => {
    const xs = [{}, [], 'a', new Date, undefined, null];
    const fs = xs.map(x => () => Future.rejectAfter(x));
    fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
  });

  it('returns an instance of FutureRejectAfter', () => {
    expect(Future.rejectAfter(20, 1)).to.be.an.instanceof(FutureRejectAfter);
  });

});

describe('FutureRejectAfter', () => {

  const m = new FutureRejectAfter(20, 1);

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

    it('clears its internal timeout when cancelled', done => {
      Future.rejectAfter(20, 1).fork(U.failRej, U.failRes)();
      setTimeout(done, 25);
    });

  });

  describe('#extractLeft()', () => {

    it('returns array with the reason', () => {
      expect(m.extractLeft()).to.deep.equal([1]);
    });

  });

  describe('#toString()', () => {

    it('returns the code to create the FutureRejectAfter', () => {
      expect(m.toString()).to.equal('Future.rejectAfter(20, 1)');
    });

  });

});
