'use strict';

const expect = require('chai').expect;
const Future = require('../fluture.js');
const CachedFuture = Future.classes.CachedFuture;
const U = require('./util');
const F = require('./futures');

describe('Future.cache()', () => {

  it('throws when not given a Future', () => {
    const f = () => Future.cache(1);
    expect(f).to.throw(TypeError, /Future/);
  });

  it('returns an instance of CachedFuture', () => {
    expect(Future.cache(F.resolved)).to.be.an.instanceof(CachedFuture);
  });

});

describe('Future#cache()', () => {

  it('throws when invoked out of context', () => {
    const f = () => Future.of(1).cache.call(null);
    expect(f).to.throw(TypeError, /Future/);
  });

  it('returns an instance of CachedFuture', () => {
    expect(F.resolved.cache()).to.be.an.instanceof(CachedFuture);
  });

});

describe('CachedFuture', () => {

  it('extends Future', () => {
    expect(new CachedFuture).to.be.an.instanceof(Future);
  });

  describe('#fork()', () => {

    it('resolves with the resolution value of the given Future', () => {
      U.assertResolved(Future.of(1).cache(), 1);
    });

    it('rejects with the rejection reason of the given Future', () => {
      U.assertRejected(Future.reject(U.error).cache(), U.error);
    });

    it('only forks its given Future once', () => {
      const m = Future(U.onceOrError((rej, res) => res(1))).cache();
      m.fork(U.noop, U.noop);
      m.fork(U.noop, U.noop);
      return U.assertResolved(m, 1);
    });

    it('resolves all forks once a delayed resolution happens', () => {
      const m = Future.after(20, 1).cache();
      const a = U.assertResolved(m, 1);
      const b = U.assertResolved(m, 1);
      const c = U.assertResolved(m, 1);
      return Promise.all([a, b, c]);
    });

    it('rejects all forks once a delayed rejection happens', () => {
      const m = Future(rej => void setTimeout(rej, 20, U.error)).cache();
      const a = U.assertRejected(m, U.error);
      const b = U.assertRejected(m, U.error);
      const c = U.assertRejected(m, U.error);
      return Promise.all([a, b, c]);
    });

    it('rejects all new forks after a rejection happened', () => {
      const m = Future.reject('err').cache();
      m.fork(U.noop, U.noop);
      return U.assertRejected(m, 'err');
    });

    it('it forks the internal Future again when forked after having been cancelled', done => {
      const m = Future((rej, res) => {
        const o = {cancelled: false};
        const id = setTimeout(res, 20, o);
        return () => (o.cancelled = true, clearTimeout(id));
      }).cache();
      const clear = m.fork(U.noop, U.noop);
      setTimeout(() => {
        clear();
        m.fork(U.noop, v => (expect(v).to.have.property('cancelled', false), done()));
      }, 10);
    });

    it('does not reset when one of multiple listeners is cancelled', done => {
      const m = Future.cache(Future((rej, res) => {
        setTimeout(res, 5, 1);
        return () => done(new Error('Reset happened'));
      }));
      const cancel = m.fork(U.noop, U.noop);
      m.fork(U.noop, U.noop);
      cancel();
      setTimeout(done, 20);
    });

    it('does not change when cancelled after settled', done => {
      const m = Future.cache(Future((rej, res) => {
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
      const m = Future.cache(Future(U.noop));
      m.reject(1);
      m.resolve(2);
      expect(m._state).to.equal(CachedFuture.Rejected);
    });

  });

  describe('#reject()', () => {

    it('does nothing when state is resolved', () => {
      const m = Future.cache(Future(U.noop));
      m.resolve(1);
      m.reject(2);
      expect(m._state).to.equal(CachedFuture.Resolved);
    });

  });

  describe('#_addToQueue()', () => {

    it('does nothing when state is settled', () => {
      const m = Future.cache(Future(U.noop));
      m.resolve(1);
      m._addToQueue(U.noop, U.noop);
      expect(m._queued).to.equal(0);
    });

  });

  describe('#_drainQueue()', () => {

    it('is idempotent', () => {
      const m = Future.cache(Future.of(1));
      m._drainQueue();
      m._drainQueue();
      m.fork(U.noop, U.noop);
      m._drainQueue();
      m._drainQueue();
    });

  });

  describe('#run()', () => {

    it('is idempotent', () => {
      const m = Future.cache(Future.of(1));
      m.run();
      m.run();
    });

  });

  describe('#reset()', () => {

    it('is idempotent', () => {
      const m = Future.cache(Future.of(1));
      m.reset();
      m.fork(U.noop, U.noop);
      m.reset();
      m.reset();
    });

  });

  describe('#toString()', () => {

    it('returns the code to create the CachedFuture', () => {
      const m = Future.of(1).cache();
      const s = 'Future.of(1).cache()';
      expect(m.toString()).to.equal(s);
    });

  });

  describe('#extractLeft()', () => {

    it('returns empty array for cold CachedFutures', () => {
      expect(Future.cache(Future.reject(1)).extractLeft()).to.deep.equal([]);
    });

    it('returns array with reason for rejected CachedFutures', () => {
      const m = Future.cache(Future.reject(1));
      m.run();
      expect(m.extractLeft()).to.deep.equal([1]);
    });

  });

  describe('#extractRight()', () => {

    it('returns empty array for cold CachedFutures', () => {
      expect(Future.cache(Future.of(1)).extractRight()).to.deep.equal([]);
    });

    it('returns array with value for resolved CachedFutures', () => {
      const m = Future.cache(Future.of(1));
      m.run();
      expect(m.extractRight()).to.deep.equal([1]);
    });

  });

});
