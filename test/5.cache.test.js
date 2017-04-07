import {expect} from 'chai';
import {Future, cache, of, reject, after} from '../index.es.js';
import {Cached} from '../src/core';
import U from './util';
import type from 'sanctuary-type-identifiers';

const testInstance = cache => {

  it('is considered a member of fluture/Fluture', () => {
    expect(type(cache(of(1)))).to.equal(Future['@@type']);
  });

  describe('#fork()', () => {

    it('resolves with the resolution value of the given Future', () => {
      U.assertResolved(cache(of(1)), 1);
    });

    it('rejects with the rejection reason of the given Future', () => {
      U.assertRejected(cache(reject(U.error)), U.error);
    });

    it('only forks its given Future once', () => {
      const m = cache(Future(U.onceOrError((rej, res) => res(1))));
      m.fork(U.noop, U.noop);
      m.fork(U.noop, U.noop);
      return U.assertResolved(m, 1);
    });

    it('resolves all forks once a delayed resolution happens', () => {
      const m = cache(after(20, 1));
      const a = U.assertResolved(m, 1);
      const b = U.assertResolved(m, 1);
      const c = U.assertResolved(m, 1);
      return Promise.all([a, b, c]);
    });

    it('rejects all forks once a delayed rejection happens', () => {
      const m = cache(Future(rej => void setTimeout(rej, 20, U.error)));
      const a = U.assertRejected(m, U.error);
      const b = U.assertRejected(m, U.error);
      const c = U.assertRejected(m, U.error);
      return Promise.all([a, b, c]);
    });

    it('rejects all new forks after a rejection happened', () => {
      const m = cache(reject('err'));
      m.fork(U.noop, U.noop);
      return U.assertRejected(m, 'err');
    });

    it('it forks the internal Future again when forked after having been cancelled', done => {
      const m = cache(Future((rej, res) => {
        const o = {cancelled: false};
        const id = setTimeout(res, 20, o);
        return () => (o.cancelled = true, clearTimeout(id));
      }));
      const clear = m.fork(U.noop, U.noop);
      setTimeout(() => {
        clear();
        m.fork(U.noop, v => (expect(v).to.have.property('cancelled', false), done()));
      }, 10);
    });

    it('does not reset when one of multiple listeners is cancelled', done => {
      const m = cache(Future((rej, res) => {
        setTimeout(res, 5, 1);
        return () => done(new Error('Reset happened'));
      }));
      const cancel = m.fork(U.noop, U.noop);
      m.fork(U.noop, U.noop);
      cancel();
      setTimeout(done, 20);
    });

    it('does not change when cancelled after settled', done => {
      const m = cache(Future((rej, res) => {
        res(1);
        return () => done(new Error('Cancelled after settled'));
      }));
      const cancel = m.fork(U.noop, U.noop);
      setTimeout(() => {
        cancel();
        done();
      }, 5);
    });

  });

  describe('#resolve()', () => {

    it('does nothing when state is rejected', () => {
      const m = cache(Future(U.noop));
      m.reject(1);
      m.resolve(2);
      expect(m._state).to.equal(Cached.Rejected);
    });

  });

  describe('#reject()', () => {

    it('does nothing when state is resolved', () => {
      const m = cache(Future(U.noop));
      m.resolve(1);
      m.reject(2);
      expect(m._state).to.equal(Cached.Resolved);
    });

  });

  describe('#_addToQueue()', () => {

    it('does nothing when state is settled', () => {
      const m = cache(Future(U.noop));
      m.resolve(1);
      m._addToQueue(U.noop, U.noop);
      expect(m._queued).to.equal(0);
    });

  });

  describe('#_drainQueue()', () => {

    it('is idempotent', () => {
      const m = cache(of(1));
      m._drainQueue();
      m._drainQueue();
      m.fork(U.noop, U.noop);
      m._drainQueue();
      m._drainQueue();
    });

  });

  describe('#run()', () => {

    it('is idempotent', () => {
      const m = cache(of(1));
      m.run();
      m.run();
    });

  });

  describe('#reset()', () => {

    it('is idempotent', () => {
      const m = cache(of(1));
      m.reset();
      m.fork(U.noop, U.noop);
      m.reset();
      m.reset();
    });

  });

  describe('#toString()', () => {

    it('returns the code to create the Cached', () => {
      const m = cache(of(1));
      const s = 'of(1).cache()';
      expect(m.toString()).to.equal(s);
    });

  });

  describe('#extractLeft()', () => {

    it('returns empty array for cold CachedFutures', () => {
      expect(cache(reject(1)).extractLeft()).to.deep.equal([]);
    });

    it('returns array with reason for rejected CachedFutures', () => {
      const m = cache(reject(1));
      m.run();
      expect(m.extractLeft()).to.deep.equal([1]);
    });

  });

  describe('#extractRight()', () => {

    it('returns empty array for cold CachedFutures', () => {
      expect(cache(of(1)).extractRight()).to.deep.equal([]);
    });

    it('returns array with value for resolved CachedFutures', () => {
      const m = cache(of(1));
      m.run();
      expect(m.extractRight()).to.deep.equal([1]);
    });

  });

};

describe.skip('cache()', () => {

  it('throws when not given a Future', () => {
    const f = () => cache(1);
    expect(f).to.throw(TypeError, /Future/);
  });

  testInstance(cache);

});

describe.skip('Future#cache()', () => {

  testInstance(m => m.cache());

});
