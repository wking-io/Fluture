'use strict';

const expect = require('chai').expect;
const Future = require('../fluture.js');
const FutureChain = Future.classes.FutureChain;
const U = require('./util');
const F = require('./futures');

describe('Future.chain()', () => {

  it('is a curried binary function', () => {
    expect(Future.chain).to.be.a('function');
    expect(Future.chain.length).to.equal(2);
    expect(Future.chain(U.noop)).to.be.a('function');
  });

  it('throws when not given a Function as first argument', () => {
    const f = () => Future.chain(1);
    expect(f).to.throw(TypeError, /Future.*first/);
  });

  it('throws when not given a Future as second argument', () => {
    const f = () => Future.chain(U.B(Future.of)(U.add(1)), 1);
    expect(f).to.throw(TypeError, /Future.*second/);
  });

  it('returns an instance of FutureChain', () => {
    const actual = Future.chain(U.B(Future.of)(U.add(1)), Future.of(1));
    expect(actual).to.be.an.instanceof(Future.classes.FutureChain);
  });

});

describe('#chain()', () => {

  const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];

  it('throws when invoked out of context', () => {
    const f = () => F.resolved.chain.call(null, U.noop);
    expect(f).to.throw(TypeError, /Future/);
  });

  it('throws TypeError when not given a function', () => {
    const fs = xs.map(x => () => F.resolved.chain(x));
    fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
  });

  it('throws TypeError when the given function does not return Future', () => {
    const fs = xs.map(x => () => F.resolved.chain(() => x).fork(U.noop, U.noop));
    fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
  });

  it('returns an instance of FutureChain', () => {
    expect(F.resolved.chain(_ => F.resolved)).to.be.an.instanceof(FutureChain);
  });

});

describe('FutureChain', () => {

  it('extends Future', () => {
    expect(new FutureChain).to.be.an.instanceof(Future);
  });

  describe('#fork()', () => {

    it('calls the given function with the inner of the Future', () => {
      F.resolved.chain(x => (expect(x).to.equal('resolved'), Future.of(null))).fork(U.noop, U.noop);
    });

    it('returns a Future with an inner equal to the returned Future', () => {
      const actual = F.resolved.chain(() => F.resolvedSlow);
      return U.assertResolved(actual, 'resolvedSlow');
    });

    it('maintains rejected state', () => {
      const actual = F.rejected.chain(() => F.resolved);
      return U.assertRejected(actual, 'rejected');
    });

    it('assumes rejected state', () => {
      const actual = F.resolved.chain(() => F.rejected);
      return U.assertRejected(actual, 'rejected');
    });

    it('does not chain after being cancelled', done => {
      F.resolvedSlow.chain(U.failRes).fork(U.failRej, U.failRes)();
      setTimeout(done, 25);
    });

    it('does not reject after being cancelled', done => {
      F.rejectedSlow.chain(U.failRes).fork(U.failRej, U.failRes)();
      F.resolved.chain(() => F.rejectedSlow).fork(U.failRej, U.failRes)();
      setTimeout(done, 25);
    });

  });

  describe('#toString()', () => {

    it('returns the code to create the FutureChain', () => {
      const m = Future.of(1).chain(x => Future.of(x));
      const s = 'Future.of(1).chain(x => Future.of(x))';
      expect(m.toString()).to.equal(s);
    });

  });

});
