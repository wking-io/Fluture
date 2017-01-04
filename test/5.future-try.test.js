'use strict';

const expect = require('chai').expect;
const Future = require('../fluture.js');
const FutureTry = Future.classes.FutureTry;
const U = require('./util');
const type = require('sanctuary-type-identifiers');

describe('Future.try()', () => {

  it('throws TypeError when not given a function', () => {
    const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];
    const fs = xs.map(x => () => Future.try(x));
    fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
  });

  it('returns an instance of FutureTry', () => {
    expect(Future.try(x => x)).to.be.an.instanceof(FutureTry);
  });

});

describe('FutureTry', () => {

  it('extends Future', () => {
    expect(new FutureTry).to.be.an.instanceof(Future);
  });

  it('is considered a member of fluture/Fluture', () => {
    expect(type(new FutureTry)).to.equal('fluture/Future');
  });

  describe('#fork()', () => {

    it('resolves with the return value of the function', () => {
      const actual = new FutureTry(() => 1);
      return U.assertResolved(actual, 1);
    });

    it('rejects with the exception thrown by the function', () => {
      const actual = new FutureTry(() => { throw U.error });
      return U.assertRejected(actual, U.error);
    });

  });

  describe('#toString()', () => {

    it('returns the code to create the FutureTry', () => {
      const m = new FutureTry(x => x);
      expect(m.toString()).to.equal('Future.try(x => x)');
    });

  });

});
