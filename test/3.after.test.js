import {expect} from 'chai';
import {Future, after, never, rejectAfter} from '../index.es.js';
import * as U from './util';
import {rejected, resolved} from './futures';
import type from 'sanctuary-type-identifiers';

describe('after()', () => {

  it('is a curried binary function', () => {
    expect(after).to.be.a('function');
    expect(after.length).to.equal(2);
    expect(after(20)).to.be.a('function');
  });

  it('throws TypeError when not given a number as first argument', () => {
    const xs = [{}, [], 'a', new Date, undefined, null];
    const fs = xs.map(x => () => after(x));
    fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
  });

  it('returns an instance of Future', () => {
    expect(after(20, 1)).to.be.an.instanceof(Future);
  });

  it('returns Never when given Infinity', () => {
    expect(after(Infinity, 1)).to.equal(never);
  });

});

describe('After', () => {

  const m = after(20, 1);

  it('extends Future', () => {
    expect(m).to.be.an.instanceof(Future);
  });

  it('is considered a member of fluture/Fluture', () => {
    expect(type(m)).to.equal(Future['@@type']);
  });

  describe('#fork()', () => {

    it('calls success callback with the value', () => {
      return U.assertResolved(m, 1);
    });

    it('clears its internal timeout when cancelled', done => {
      after(20, 1).fork(U.failRej, U.failRes)();
      setTimeout(done, 25);
    });

  });

  describe('#race()', () => {

    it('returns the other if the other has already settled', () => {
      const m = after(1, 1);
      expect(m.race(rejected)).to.equal(rejected);
      expect(m.race(resolved)).to.equal(resolved);
    });

    it('returns itself if the other is Never', () => {
      const m = after(1, 1);
      expect(m.race(never)).to.equal(m);
    });

    it('returns the faster After', () => {
      const fast = after(1, 1);
      const slow = after(10, 1);
      const fastr = rejectAfter(1, 1);
      const slowr = rejectAfter(10, 1);
      expect(slow.race(fast)).to.equal(fast);
      expect(slow.race(fastr)).to.equal(fastr);
      expect(slow.race(slowr)).to.equal(slow);
      expect(fast.race(slow)).to.equal(fast);
      expect(fast.race(slowr)).to.equal(fast);
      expect(fast.race(fastr)).to.equal(fast);
    });

    it('races undeterministic Futures the conventional way', () => {
      const m = after(1, 1);
      const undeterministic = Future(() => {});
      const actual = m.race(undeterministic);
      expect(actual).to.not.equal(m);
      expect(actual).to.not.equal(undeterministic);
      return U.assertResolved(actual, 1);
    });

  });

  describe('#swap()', () => {

    it('returns a rejected Future', () => {
      const m = after(10, 1);
      return U.assertRejected(m.swap(), 1);
    });

  });

  describe('#extractRight()', () => {

    it('returns array with the value', () => {
      expect(m.extractRight()).to.deep.equal([1]);
    });

  });

  describe('#toString()', () => {

    it('returns the code to create the After', () => {
      expect(m.toString()).to.equal('Future.after(20, 1)');
    });

  });

});
