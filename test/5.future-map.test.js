'use strict';

const expect = require('chai').expect;
const Future = require('../fluture.js');
const FutureMap = Future.classes.FutureMap;
const U = require('./util');
const F = require('./futures');

describe('Future.map()', () => {

  it('is a curried binary function', () => {
    expect(Future.map).to.be.a('function');
    expect(Future.map.length).to.equal(2);
    expect(Future.map(U.noop)).to.be.a('function');
  });

  it('throws when not given a Function as first argument', () => {
    const f = () => Future.map(1);
    expect(f).to.throw(TypeError, /Future.*first/);
  });

  it('throws when not given a Future as second argument', () => {
    const f = () => Future.map(U.add(1), 1);
    expect(f).to.throw(TypeError, /Future.*second/);
  });

  it('returns a FutureMap', () => {
    const actual = Future.map(U.add(1), F.mock);
    expect(actual).to.be.an.instanceof(FutureMap);
  });

});

describe('Future#map()', () => {

  it('throws when invoked out of context', () => {
    const f = () => F.resolved.map.call(null, U.noop);
    expect(f).to.throw(TypeError, /Future/);
  });

  it('throws TypeError when not given a function', () => {
    const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];
    const fs = xs.map(x => () => F.resolved.map(x));
    fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
  });

  it('returns an instance of FutureMap', () => {
    expect(F.resolved.map(U.add('!'))).to.be.an.instanceof(FutureMap);
  });

});

describe('FutureMap', () => {

  it('extends Future', () => {
    expect(new FutureMap).to.be.an.instanceof(Future);
  });

  describe('#fork()', () => {

    it('applies the given function to its inner', () => {
      const actual = Future.of(1).map(U.add(1));
      return U.assertResolved(actual, 2);
    });

    it('does not map rejected state', () => {
      const actual = F.rejected.map(_ => 'mapped');
      return U.assertRejected(actual, 'rejected');
    });

    it('does not resolve after being cancelled', done => {
      F.resolvedSlow.map(U.failRes).fork(U.failRej, U.failRes)();
      setTimeout(done, 25);
    });

    it('does not reject after being cancelled', done => {
      F.rejectedSlow.map(U.failRes).fork(U.failRej, U.failRes)();
      setTimeout(done, 25);
    });

    it('has custom toString and inspect', () => {
      const m = Future.of(1).map(x => x);
      const s = 'Future.of(1).map(x => x)';
      expect(m.toString()).to.equal(s);
      expect(m.inspect()).to.equal(s);
    });

  });

  describe('#toString()', () => {

    it('returns the code to create the FutureMap', () => {
      const m = new FutureMap(F.resolved, U.noop);
      expect(m.toString()).to.equal('Future.of("resolved").map(() => {})');
    });

  });

});
