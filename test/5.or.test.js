import {expect} from 'chai';
import {Future, or, of, reject, after} from '../index.es.js';
import * as U from './util';
import * as F from './futures';
import type from 'sanctuary-type-identifiers';

const testInstance = or => {

  it('is considered a member of fluture/Fluture', () => {
    expect(type(or(F.resolved, F.resolvedSlow))).to.equal(Future['@@type']);
  });

  describe('#fork()', () => {

    describe('(res, res)', () => {

      it('resolves with left if left resolves first', () => {
        return U.assertResolved(or(F.resolved, F.resolvedSlow), 'resolved');
      });

      it('resolves with left if left resolves last', () => {
        return U.assertResolved(or(F.resolvedSlow, F.resolved), 'resolvedSlow');
      });

    });

    describe('(rej, rej)', () => {

      it('rejects with right if right rejects first', () => {
        return U.assertRejected(or(F.rejectedSlow, F.rejected), 'rejected');
      });

      it('rejects with right if right rejects last', () => {
        return U.assertRejected(or(F.rejected, F.rejectedSlow), 'rejectedSlow');
      });

    });

    describe('(rej, res)', () => {

      it('resolves with right if right resolves first', () => {
        return U.assertResolved(or(F.rejectedSlow, F.resolved), 'resolved');
      });

      it('resolves with right if right resolves last', () => {
        return U.assertResolved(or(F.rejected, F.resolvedSlow), 'resolvedSlow');
      });

    });

    describe('(res, rej)', () => {

      it('resolves with left if left resolves first', () => {
        return U.assertResolved(or(F.resolved, F.rejectedSlow), 'resolved');
      });

      it('resolves with left if left resolves last', () => {
        return U.assertResolved(or(F.resolvedSlow, F.rejected), 'resolvedSlow');
      });

    });

    it('cancels the running Future', done => {
      const m = Future(() => () => done());
      const cancel = or(m, m).fork(U.noop, U.noop);
      cancel();
    });

  });

  describe('#toString()', () => {

    it('returns the code to create the data-structure', () => {
      const m = Future(() => () => {});
      const actual = or(m, m).toString();
      expect(actual).to.equal(`${m.toString()}.or(${m.toString()})`);
    });

  });

};

describe('or()', () => {

  it('is a curried binary function', () => {
    expect(or).to.be.a('function');
    expect(or.length).to.equal(2);
    expect(or(of(1))).to.be.a('function');
  });

  it('throws when not given a Future as first argument', () => {
    const f = () => or(1);
    expect(f).to.throw(TypeError, /Future.*first/);
  });

  it('throws when not given a Future as second argument', () => {
    const f = () => or(of(1), 1);
    expect(f).to.throw(TypeError, /Future.*second/);
  });

  testInstance((a, b) => or(a, b));

  it('allows for the implementation of `any` in terms of reduce', () => {
    const any = ms => ms.reduce(or, reject('empty list'));
    return Promise.all([
      U.assertRejected(any([]), 'empty list'),
      U.assertRejected(any([reject(1)]), 1),
      U.assertResolved(any([reject(1), of(2)]), 2),
      U.assertResolved(any([reject(1), after(20, 2), of(3)]), 2)
    ]);
  });

});

describe('Future#or()', () => {

  it('throws when invoked out of context', () => {
    const f = () => of(1).or.call(null, of(1));
    expect(f).to.throw(TypeError, /Future/);
  });

  it('throws TypeError when not given a Future', () => {
    const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null, x => x];
    const fs = xs.map(x => () => of(1).or(x));
    fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
  });

  testInstance((a, b) => a.or(b));

});
