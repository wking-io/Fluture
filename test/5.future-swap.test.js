'use strict';

const expect = require('chai').expect;
const Future = require('../fluture.js');
const FutureSwap = Future.classes.FutureSwap;
const U = require('./util');
const F = require('./futures');

describe('Future.swap()', () => {

  it('throws when not given a Future', () => {
    const f = () => Future.swap(1);
    expect(f).to.throw(TypeError, /Future/);
  });

  it('returns an instance of FutureSwap', () => {
    expect(Future.swap(F.resolved)).to.be.an.instanceof(FutureSwap);
  });

});

describe('Future#swap()', () => {

  it('throws when invoked out of context', () => {
    const f = () => Future.of(1).swap.call(null);
    expect(f).to.throw(TypeError, /Future/);
  });

  it('returns an instance of FutureSwap', () => {
    expect(F.resolved.swap()).to.be.an.instanceof(FutureSwap);
  });

});

describe('FutureSwap', () => {

  it('extends Future', () => {
    expect(new FutureSwap).to.be.an.instanceof(Future);
  });

  describe('#fork()', () => {

    it('rejects with the resolution value', () => {
      const actual = Future.of(1).swap();
      return U.assertRejected(actual, 1);
    });

    it('resolves with the rejection reason', () => {
      const actual = Future.reject(1).swap();
      return U.assertResolved(actual, 1);
    });

  });

  describe('#toString()', () => {

    it('returns the code to create the FutureSwap', () => {
      const m = Future.of(1).swap();
      const s = 'Future.of(1).swap()';
      expect(m.toString()).to.equal(s);
    });

  });

});
