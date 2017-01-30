'use strict';

const expect = require('chai').expect;
const Future = require('../fluture.js');
const FutureFold = Future.classes.FutureFold;
const U = require('./util');
const F = require('./futures');

describe('Future.fold()', () => {

  it('is a curried ternary function', () => {
    expect(Future.fold).to.be.a('function');
    expect(Future.fold.length).to.equal(3);
    expect(Future.fold(U.noop)).to.be.a('function');
    expect(Future.fold(U.noop)(U.noop)).to.be.a('function');
    expect(Future.fold(U.noop, U.noop)).to.be.a('function');
  });

  it('throws when not given a Function as first argument', () => {
    const f = () => Future.fold(1);
    expect(f).to.throw(TypeError, /Future.*first/);
  });

  it('throws when not given a Function as second argument', () => {
    const f = () => Future.fold(U.add(1), 1);
    expect(f).to.throw(TypeError, /Future.*second/);
  });

  it('throws when not given a Future as third argument', () => {
    const f = () => Future.fold(U.add(1), U.add(1), 1);
    expect(f).to.throw(TypeError, /Future.*third/);
  });

  it('returns an instance of FutureFold', () => {
    expect(Future.fold(U.noop, U.noop, F.resolved)).to.be.an.instanceof(FutureFold);
  });

});

describe('Future#fold()', () => {

  it('throws when invoked out of context', () => {
    const f = () => Future.of(1).fold.call(null, U.noop, U.noop);
    expect(f).to.throw(TypeError, /Future/);
  });

  it('throws TypeError when first argument is not a function', () => {
    const m = Future.of(1);
    const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];
    const fs = xs.map(x => () => m.fold(x, U.noop));
    fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
  });

  it('throws TypeError when second argument is not a function', () => {
    const m = Future.of(1);
    const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];
    const fs = xs.map(x => () => m.fold(U.noop, x));
    fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
  });

  it('returns an instance of FutureFold', () => {
    expect(F.resolved.fold(U.noop, U.noop)).to.be.an.instanceof(FutureFold);
  });

});

describe('FutureFold', () => {

  it('extends Future', () => {
    expect(new FutureFold).to.be.an.instanceof(Future);
  });

  describe('#fork()', () => {

    it('resolves with the transformed rejection value', () => {
      return U.assertResolved(Future.reject(1).fold(U.add(1), U.add(1)), 2);
    });

    it('resolves with the transformed resolution value', () => {
      return U.assertResolved(Future.of(1).fold(U.add(1), U.add(1)), 2);
    });

  });

  describe('#toString()', () => {

    it('returns the code to create the FutureFold', () => {
      const m = Future.of(1).fold(x => x, y => y);
      const s = 'Future.of(1).fold(x => x, y => y)';
      expect(m.toString()).to.equal(s);
    });

  });

});
