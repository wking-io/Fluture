import {expect} from 'chai';
import Future from '..';
import U from './util';
import F from './futures';
import type from 'sanctuary-type-identifiers';

const testInstance = and => {

  it('is considered a member of fluture/Fluture', () => {
    expect(type(and(F.resolved, F.resolvedSlow))).to.equal(Future['@@type']);
  });

  describe('#fork()', () => {

    describe('(res, res)', () => {

      it('resolves with right if left resolves first', () => {
        return U.assertResolved(and(F.resolved, F.resolvedSlow), 'resolvedSlow');
      });

      it('resolves with right if left resolves last', () => {
        return U.assertResolved(and(F.resolvedSlow, F.resolved), 'resolved');
      });

    });

    describe('(rej, rej)', () => {

      it('rejects with left if right rejects first', () => {
        return U.assertRejected(and(F.rejectedSlow, F.rejected), 'rejectedSlow');
      });

      it('rejects with left if right rejects last', () => {
        return U.assertRejected(and(F.rejected, F.rejectedSlow), 'rejected');
      });

    });

    describe('(rej, res)', () => {

      it('rejects with left if right resolves first', () => {
        return U.assertRejected(and(F.rejectedSlow, F.resolved), 'rejectedSlow');
      });

      it('rejects with left if right resolves last', () => {
        return U.assertRejected(and(F.rejected, F.resolvedSlow), 'rejected');
      });

    });

    describe('(res, rej)', () => {

      it('rejects with right if left resolves first', () => {
        return U.assertRejected(and(F.resolved, F.rejectedSlow), 'rejectedSlow');
      });

      it('rejects with right if left resolves last', () => {
        return U.assertRejected(and(F.resolvedSlow, F.rejected), 'rejected');
      });

    });

    it('creates a cancel function which cancels both Futures', done => {
      let cancelled = false;
      const m = Future(() => () => (cancelled ? done() : (cancelled = true)));
      const cancel = and(m, m).fork(U.noop, U.noop);
      cancel();
    });

  });

  describe('#toString()', () => {

    it('returns the code to create the FutureAnd', () => {
      const m = and(Future.of(1), Future.of(2));
      const s = 'Future.of(1).and(Future.of(2))';
      expect(m.toString()).to.equal(s);
    });

  });

};

describe.skip('Future.and()', () => {

  it('is a curried binary function', () => {
    expect(Future.and).to.be.a('function');
    expect(Future.and.length).to.equal(2);
    expect(Future.and(F.resolved)).to.be.a('function');
  });

  it('throws when not given a Future as first argument', () => {
    const f = () => Future.and(1);
    expect(f).to.throw(TypeError, /Future.*first/);
  });

  it('throws when not given a Future as second argument', () => {
    const f = () => Future.and(Future.of(1), 1);
    expect(f).to.throw(TypeError, /Future.*second/);
  });

  testInstance((a, b) => Future.and(a, b));

  it('allows for the implementation of `all` in terms of reduce', () => {
    const all = ms => ms.reduce(Future.and, Future.of(true));
    return Promise.all([
      U.assertResolved(all([]), true),
      U.assertRejected(all([F.rejected, F.resolved]), 'rejected'),
      U.assertRejected(all([F.resolved, F.rejected]), 'rejected'),
      U.assertResolved(all([F.resolvedSlow, F.resolved]), 'resolved'),
      U.assertResolved(all([F.resolved, F.resolvedSlow]), 'resolvedSlow'),
      U.assertRejected(all([F.rejected, F.rejectedSlow]), 'rejected'),
      U.assertRejected(all([F.rejectedSlow, F.rejected]), 'rejectedSlow')
    ]);
  });

});

describe.skip('Future#and()', () => {

  it('throw TypeError when not given a Future', () => {
    const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null, x => x];
    const fs = xs.map(x => () => Future.of(1).and(x));
    fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
  });

  testInstance((a, b) => a.and(b));

});
