'use strict';

const expect = require('chai').expect;
const Future = require('../fluture.js');
const FutureChainRej = Future.classes.FutureChainRej;
const U = require('./util');
const F = require('./futures');

describe('Future.chainRej()', () => {

  it('is a curried binary function', () => {
    expect(Future.chainRej).to.be.a('function');
    expect(Future.chainRej.length).to.equal(2);
    expect(Future.chainRej(U.noop)).to.be.a('function');
  });

  it('throws when not given a Function as first argument', () => {
    const f = () => Future.chainRej(1);
    expect(f).to.throw(TypeError, /Future.*first/);
  });

  it('throws when not given a Future as second argument', () => {
    const f = () => Future.chainRej(U.B(Future.of)(U.add(1)), 1);
    expect(f).to.throw(TypeError, /Future.*second/);
  });

  it('returns an instance of FutureChainRej', () => {
    expect(Future.chainRej(U.bang, F.resolved)).to.be.an.instanceof(FutureChainRej);
  });

});

describe('Future#chainRej()', () => {

  const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];

  it('throws when invoked out of context', () => {
    const f = () => F.rejected.chainRej.call(null, U.noop);
    expect(f).to.throw(TypeError, /Future/);
  });

  it('throws TypeError when not given a function', () => {
    const fs = xs.map(x => () => F.rejected.chainRej(x));
    fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
  });

  it('throws TypeError when the given function does not return Future', () => {
    const fs = xs.map(x => () => F.rejected.chainRej(() => x).fork(U.noop, U.noop));
    fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
  });

  it('returns an instance of FutureChainRej', () => {
    expect(F.resolved.chainRej(U.bang)).to.be.an.instanceof(FutureChainRej);
  });

});

describe('FutureChainRej', () => {

  it('extends Future', () => {
    expect(new FutureChainRej).to.be.an.instanceof(Future);
  });

  describe('#fork()', () => {

    it('calls the given function with the inner of the Future', () => {
      F.rejected.chainRej(x => {
        expect(x).to.equal('rejected');
        return Future.of(null);
      }).fork(U.noop, U.noop);
    });

    it('returns a Future with an inner equal to the returned Future', () => {
      const actual = F.rejected.chainRej(() => F.resolved);
      return U.assertResolved(actual, 'resolved');
    });

    it('maintains resolved state', () => {
      const actual = F.resolved.chainRej(() => F.resolvedSlow);
      return U.assertResolved(actual, 'resolved');
    });

    it('assumes rejected state', () => {
      const actual = F.rejected.chainRej(() => F.rejectedSlow);
      return U.assertRejected(actual, 'rejectedSlow');
    });

    it('does not chain after being cancelled', done => {
      F.rejectedSlow.chainRej(U.failRej).fork(U.failRej, U.failRes)();
      setTimeout(done, 25);
    });

  });

  describe('#toString()', () => {

    it('returns the code to create the FutureChainRej', () => {
      const m = Future.of(1).chainRej(x => Future.of(x));
      const s = 'Future.of(1).chainRej(x => Future.of(x))';
      expect(m.toString()).to.equal(s);
    });

  });

});
