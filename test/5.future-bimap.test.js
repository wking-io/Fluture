'use strict';

const expect = require('chai').expect;
const Future = require('../fluture.js');
const FutureBimap = Future.classes.FutureBimap;
const U = require('./util');
const F = require('./futures');

describe('Future.bimap()', () => {

  it('is a curried ternary function', () => {
    expect(Future.bimap).to.be.a('function');
    expect(Future.bimap.length).to.equal(3);
    expect(Future.bimap(U.noop)).to.be.a('function');
    expect(Future.bimap(U.noop)(U.noop)).to.be.a('function');
    expect(Future.bimap(U.noop, U.noop)).to.be.a('function');
  });

  it('throws when not given a Function as first argument', () => {
    const f = () => Future.bimap(1);
    expect(f).to.throw(TypeError, /Future.*first/);
  });

  it('throws when not given a Function as second argument', () => {
    const f = () => Future.bimap(U.add(1), 1);
    expect(f).to.throw(TypeError, /Future.*second/);
  });

  it('throws when not given a Future as third argument', () => {
    const f = () => Future.bimap(U.add(1), U.add(1), 1);
    expect(f).to.throw(TypeError, /Future.*third/);
  });

  it('returns a FutureBimap', () => {
    const actual = Future.bimap(U.add(1), U.add(1), Future.of(1));
    expect(actual).to.be.an.instanceof(Future.classes.FutureBimap);
  });

});

describe('Future#bimap()', () => {

  it('throws when invoked out of context', () => {
    const f = () => Future.of(1).bimap.call(null, U.noop, U.noop);
    expect(f).to.throw(TypeError, /Future/);
  });

  it('throws TypeError when not given a function as first argument', () => {
    const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];
    const fs = xs.map(x => () => Future.of(1).bimap(x, U.noop));
    fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
  });

  it('throws TypeError when not given a function as second argument', () => {
    const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];
    const fs = xs.map(x => () => Future.of(1).bimap(U.noop, x));
    fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
  });

  it('returns an instance of FutureBimap', () => {
    expect(F.resolved.bimap(U.bang, U.bang)).to.be.an.instanceof(FutureBimap);
  });

});

describe('FutureBimap', () => {

  it('extends Future', () => {
    expect(new FutureBimap).to.be.an.instanceof(Future);
  });

  describe('#fork()', () => {

    it('applies the first function to the value in the rejection branch', () => {
      const actual = Future.reject(1).bimap(U.add(1), U.failRes);
      return U.assertRejected(actual, 2);
    });

    it('applies the second function to the value in the resolution branch', () => {
      const actual = Future.of(1).bimap(U.failRej, U.add(1));
      return U.assertResolved(actual, 2);
    });

  });

  describe('#toString()', () => {

    it('returns the code to create the FutureBimap', () => {
      const m = Future.of(1).bimap(x => x, y => y);
      const s = 'Future.of(1).bimap(x => x, y => y)';
      expect(m.toString()).to.equal(s);
    });

  });

});
