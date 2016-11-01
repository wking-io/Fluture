'use strict';

const expect = require('chai').expect;
const Future = require('../fluture.js');
const FutureBoth = Future.classes.FutureBoth;
const U = require('./util');
const F = require('./futures');

describe('Future.both()', () => {

  it('is a curried binary function', () => {
    expect(Future.both).to.be.a('function');
    expect(Future.both.length).to.equal(2);
    expect(Future.both(Future.of(1))).to.be.a('function');
  });

  it('throws when not given a Future as first argument', () => {
    const f = () => Future.both(1);
    expect(f).to.throw(TypeError, /Future.*first/);
  });

  it('throws when not given a Future as second argument', () => {
    const f = () => Future.both(Future.of(1), 1);
    expect(f).to.throw(TypeError, /Future.*second/);
  });

  it('returns an instance of FutureBoth', () => {
    expect(Future.both(F.resolved, F.resolved)).to.be.an.instanceof(FutureBoth);
  });

});

describe('Future#both()', () => {

  it('throws when invoked out of context', () => {
    const f = () => Future.of(1).both.call(null, Future.of(1));
    expect(f).to.throw(TypeError, /Future/);
  });

  it('throws TypeError when not given a Future', () => {
    const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null, x => x];
    const fs = xs.map(x => () => Future.of(1).both(x));
    fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
  });

  it('returns an instance of FutureBoth', () => {
    expect(F.resolved.both(F.resolved)).to.be.an.instanceof(FutureBoth);
  });

});

describe('FutureBoth', () => {

  it('extends Future', () => {
    expect(new FutureBoth).to.be.an.instanceof(Future);
  });

  describe('#fork()', () => {

    describe('(res, res)', () => {

      it('resolves with both if left resolves first', () => {
        return U.assertResolved(F.resolved.both(F.resolvedSlow), ['resolved', 'resolvedSlow']);
      });

      it('resolves with both if left resolves last', () => {
        return U.assertResolved(F.resolvedSlow.both(F.resolved), ['resolvedSlow', 'resolved']);
      });

    });

    describe('(rej, rej)', () => {

      it('rejects with right if right rejects first', () => {
        return U.assertRejected(F.rejectedSlow.both(F.rejected), 'rejected');
      });

      it('rejects with left if right rejects last', () => {
        return U.assertRejected(F.rejected.both(F.rejectedSlow), 'rejected');
      });

    });

    describe('(rej, res)', () => {

      it('rejects with left if right resolves first', () => {
        return U.assertRejected(F.rejectedSlow.both(F.resolved), 'rejectedSlow');
      });

      it('rejects with left if right resolves last', () => {
        return U.assertRejected(F.rejected.both(F.resolvedSlow), 'rejected');
      });

    });

    describe('(res, rej)', () => {

      it('rejects with right if left resolves first', () => {
        return U.assertRejected(F.resolved.both(F.rejectedSlow), 'rejectedSlow');
      });

      it('rejects with right if left resolves last', () => {
        return U.assertRejected(F.resolvedSlow.both(F.rejected), 'rejected');
      });

    });

    it('creates a cancel function which cancels both Futures', done => {
      let cancelled = false;
      const m = Future(() => () => (cancelled ? done() : (cancelled = true)));
      const cancel = m.both(m).fork(U.noop, U.noop);
      cancel();
    });

  });

  describe('#toString()', () => {

    it('returns the code to create the FutureBoth', () => {
      const m = Future.of(1).both(Future.of(2));
      const s = 'Future.of(1).both(Future.of(2))';
      expect(m.toString()).to.equal(s);
    });

  });

});
