'use strict';

const expect = require('chai').expect;
const Future = require('../fluture.js');
const FutureOr = Future.classes.FutureOr;
const U = require('./util');
const F = require('./futures');

describe('Future.or()', () => {

  it('is a curried binary function', () => {
    expect(Future.or).to.be.a('function');
    expect(Future.or.length).to.equal(2);
    expect(Future.or(Future.of(1))).to.be.a('function');
  });

  it('throws when not given a Future as first argument', () => {
    const f = () => Future.or(1);
    expect(f).to.throw(TypeError, /Future.*first/);
  });

  it('throws when not given a Future as second argument', () => {
    const f = () => Future.or(Future.of(1), 1);
    expect(f).to.throw(TypeError, /Future.*second/);
  });

  it('returns an instance of FutureOr', () => {
    expect(Future.or(F.resolved, F.resolved)).to.be.an.instanceof(FutureOr);
  });

});

describe('Future#or()', () => {

  it('throws when invoked out of context', () => {
    const f = () => Future.of(1).or.call(null, Future.of(1));
    expect(f).to.throw(TypeError, /Future/);
  });

  it('throws TypeError when not given a Future', () => {
    const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null, x => x];
    const fs = xs.map(x => () => Future.of(1).or(x));
    fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
  });

  it('returns an instance of FutureOr', () => {
    expect(F.resolved.or(F.resolved)).to.be.an.instanceof(FutureOr);
  });

});

describe('FutureOr', () => {

  it('extends Future', () => {
    expect(new FutureOr).to.be.an.instanceof(Future);
  });

  describe('#fork()', () => {

    describe('(res, res)', () => {

      it('resolves with left if left resolves first', () => {
        return U.assertResolved(F.resolved.or(F.resolvedSlow), 'resolved');
      });

      it('resolves with left if left resolves last', () => {
        return U.assertResolved(F.resolvedSlow.or(F.resolved), 'resolvedSlow');
      });

    });

    describe('(rej, rej)', () => {

      it('rejects with right if right rejects first', () => {
        return U.assertRejected(F.rejectedSlow.or(F.rejected), 'rejected');
      });

      it('rejects with right if right rejects last', () => {
        return U.assertRejected(F.rejected.or(F.rejectedSlow), 'rejectedSlow');
      });

    });

    describe('(rej, res)', () => {

      it('resolves with right if right resolves first', () => {
        return U.assertResolved(F.rejectedSlow.or(F.resolved), 'resolved');
      });

      it('resolves with right if right resolves last', () => {
        return U.assertResolved(F.rejected.or(F.resolvedSlow), 'resolvedSlow');
      });

    });

    describe('(res, rej)', () => {

      it('resolves with left if left resolves first', () => {
        return U.assertResolved(F.resolved.or(F.rejectedSlow), 'resolved');
      });

      it('resolves with left if left resolves last', () => {
        return U.assertResolved(F.resolvedSlow.or(F.rejected), 'resolvedSlow');
      });

    });

    it('creates a cancel function which cancels both Futures', done => {
      let cancelled = false;
      const m = Future(() => () => (cancelled ? done() : (cancelled = true)));
      const cancel = m.or(m).fork(U.noop, U.noop);
      cancel();
    });

  });

  describe('#toString()', () => {

    it('returns the code to create the FutureOr', () => {
      const m = Future.of(1).or(Future.of(2));
      const s = 'Future.of(1).or(Future.of(2))';
      expect(m.toString()).to.equal(s);
    });

  });

  it('allows for the implementation of `any` in terms of reduce', () => {
    const C = f => (b, a) => f(a, b);
    const any = ms => ms.reduce(C(Future.or), Future.reject('empty list'));
    return Promise.all([
      U.assertRejected(any([]), 'empty list'),
      U.assertRejected(any([Future.reject(1)]), 1),
      U.assertResolved(any([Future.reject(1), Future.of(2)]), 2),
      U.assertResolved(any([Future.reject(1), Future.after(20, 2), Future.of(3)]), 2)
    ]);
  });

});
