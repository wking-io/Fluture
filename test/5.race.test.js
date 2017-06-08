import {expect} from 'chai';
import {Future, race, of, after, never} from '../index.es.js';
import * as U from './util';
import {resolvedSlow, rejectedSlow} from './futures';
import type from 'sanctuary-type-identifiers';

const testInstance = race => {

  it('is considered a member of fluture/Fluture', () => {
    const m1 = Future((rej, res) => void setTimeout(res, 15, 1));
    const m2 = Future(rej => void setTimeout(rej, 5, U.error));
    expect(type(race(m1, m2))).to.equal(Future['@@type']);
  });

  describe('#fork()', () => {

    it('rejects when the first one rejects', () => {
      const m1 = Future((rej, res) => void setTimeout(res, 15, 1));
      const m2 = Future(rej => void setTimeout(rej, 5, U.error));
      return U.assertRejected(race(m1, m2), U.error);
    });

    it('resolves when the first one resolves', () => {
      const m1 = Future((rej, res) => void setTimeout(res, 5, 1));
      const m2 = Future(rej => void setTimeout(rej, 15, U.error));
      return U.assertResolved(race(m1, m2), 1);
    });

    it('cancels the right if the left resolves', done => {
      const m = race(resolvedSlow, Future(() => () => done()));
      m.fork(U.noop, U.noop);
    });

    it('cancels the left if the right resolves', done => {
      const m = race(Future(() => () => done()), resolvedSlow);
      m.fork(U.noop, U.noop);
    });

    it('cancels the right if the left rejects', done => {
      const m = race(rejectedSlow, Future(() => () => done()));
      m.fork(U.noop, U.noop);
    });

    it('cancels the left if the right rejects', done => {
      const m = race(Future(() => () => done()), rejectedSlow);
      m.fork(U.noop, U.noop);
    });

    it('creates a cancel function which cancels both Futures', done => {
      let cancelled = false;
      const m = Future(() => () => (cancelled ? done() : (cancelled = true)));
      const cancel = race(m, m).fork(U.noop, U.noop);
      cancel();
    });

  });

};

describe('race()', () => {

  it('is a curried binary function', () => {
    expect(race).to.be.a('function');
    expect(race.length).to.equal(2);
    expect(race(of(1))).to.be.a('function');
  });

  it('throws when not given a Future as first argument', () => {
    const f = () => race(1);
    expect(f).to.throw(TypeError, /Future.*first/);
  });

  it('throws when not given a Future as second argument', () => {
    const f = () => race(of(1), 1);
    expect(f).to.throw(TypeError, /Future.*second/);
  });

  testInstance((a, b) => race(b, a));

});

describe('Future#race()', () => {

  it('throws when invoked out of context', () => {
    const f = () => of(1).race.call(null, of(1));
    expect(f).to.throw(TypeError, /Future/);
  });

  it('throws TypeError when not given a Future', () => {
    const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null, x => x];
    const fs = xs.map(x => () => of(1).race(x));
    fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
  });

  it('returns other when called on a Never', () => {
    const m = after(10, 1);
    expect(never.race(m)).to.equal(m);
  });

  testInstance((a, b) => a.race(b));

});
