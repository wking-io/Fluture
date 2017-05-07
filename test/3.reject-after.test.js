import {expect} from 'chai';
import {Future, after, rejectAfter, never} from '../index.es.js';
import * as U from './util';
import {rejected, resolved} from './futures';
import type from 'sanctuary-type-identifiers';

describe('rejectAfter()', () => {

  it('is a curried binary function', () => {
    expect(rejectAfter).to.be.a('function');
    expect(rejectAfter.length).to.equal(2);
    expect(rejectAfter(20)).to.be.a('function');
  });

  it('throws TypeError when not given a number as first argument', () => {
    const xs = [{}, [], 'a', new Date, undefined, null];
    const fs = xs.map(x => () => rejectAfter(x));
    fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
  });

  it('returns an instance of Future', () => {
    expect(rejectAfter(20, 1)).to.be.an.instanceof(Future);
  });

  it('returns Never when given Infinity', () => {
    expect(rejectAfter(Infinity, 1)).to.equal(never);
  });

});

describe('RejectAfter', () => {

  const m = rejectAfter(20, 1);

  it('extends Future', () => {
    expect(m).to.be.an.instanceof(Future);
  });

  it('is considered a member of fluture/Fluture', () => {
    expect(type(m)).to.equal(Future['@@type']);
  });

  describe('#fork()', () => {

    it('calls failure callback with the reason', () => {
      return U.assertRejected(m, 1);
    });

    it('clears its internal timeout when cancelled', done => {
      rejectAfter(20, 1).fork(U.failRej, U.failRes)();
      setTimeout(done, 25);
    });

  });

  describe('#race()', () => {

    it('returns the other if the other has already settled', () => {
      const m = rejectAfter(1, 1);
      expect(m.race(rejected)).to.equal(rejected);
      expect(m.race(resolved)).to.equal(resolved);
    });

    it('returns itself if the other is Never', () => {
      const m = rejectAfter(1, 1);
      expect(m.race(never)).to.equal(m);
    });

    it('returns the faster After', () => {
      const fast = rejectAfter(1, 1);
      const slow = rejectAfter(10, 1);
      const fastr = after(1, 1);
      const slowr = after(10, 1);
      expect(slow.race(fast)).to.equal(fast);
      expect(slow.race(fastr)).to.equal(fastr);
      expect(slow.race(slowr)).to.equal(slow);
      expect(fast.race(slow)).to.equal(fast);
      expect(fast.race(slowr)).to.equal(fast);
      expect(fast.race(fastr)).to.equal(fast);
    });

    it('races undeterministic Futures the conventional way', () => {
      const m = rejectAfter(1, 1);
      const undeterministic = Future(() => {});
      const actual = m.race(undeterministic);
      expect(actual).to.not.equal(m);
      expect(actual).to.not.equal(undeterministic);
      return U.assertRejected(actual, 1);
    });

  });

  describe('#swap()', () => {

    it('returns a resolved Future', () => {
      const m = rejectAfter(10, 1);
      return U.assertResolved(m.swap(), 1);
    });

  });

  describe('#extractLeft()', () => {

    it('returns array with the reason', () => {
      expect(m.extractLeft()).to.deep.equal([1]);
    });

  });

  describe('#toString()', () => {

    it('returns the code to create the RejectAfter', () => {
      expect(m.toString()).to.equal('Future.rejectAfter(20, 1)');
    });

  });

});
