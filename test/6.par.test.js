import {expect} from 'chai';
import {Future, Par, seq, of, reject, never, ap, map} from '../index.es.js';
import * as U from './util';
import * as F from './futures';
import Z from 'sanctuary-type-classes';

describe('Par()', () => {

  it('is a unary function', () => {
    expect(Par).to.be.a('function');
    expect(Par.length).to.equal(1);
  });

  it('throws when not given a Future', () => {
    const f = () => Par(1);
    expect(f).to.throw(TypeError, /Future/);
  });

  describe('.of()', () => {

    const of = Z.of;

    it('resolves with the value', () => {
      const m = of(Par, 1);
      return U.assertResolved(seq(m), 1);
    });

  });

  describe('.zero()', () => {

    const zero = Z.zero;

    it('creates a never-ending ConcurrentFuture', () => {
      const m = zero(Par);
      expect(seq(m)).to.equal(never);
    });

  });

  describe('#ap()', () => {

    const mf = of(U.bang);

    it('throws TypeError when the Future does not resolve to a Function', () => {
      const f = () => seq(ap(Par(of(1)), Par(F.resolved))).fork(U.noop, U.noop);
      expect(f).to.throw(TypeError, /Future#ap/);
    });

    it('calls the function contained in the given Future to its contained value', () => {
      const actual = ap(Par(mf), Par(F.resolved));
      return U.assertResolved(seq(actual), 'resolved!');
    });

    it('rejects if one of the two reject', () => {
      const left = ap(Par(mf), Par(F.rejected));
      const right = ap(Par(F.rejected), Par(F.resolved));
      return Promise.all([
        U.assertRejected(seq(left), 'rejected'),
        U.assertRejected(seq(right), 'rejected')
      ]);
    });

    it('does not matter if either resolves late', () => {
      const left = ap(Par(mf), Par(F.resolvedSlow));
      const right = ap(Par(F.resolvedSlow.and(mf)), Par(F.resolved));
      return Promise.all([
        U.assertResolved(seq(left), 'resolvedSlow!'),
        U.assertResolved(seq(right), 'resolved!')
      ]);
    });

    it('cannot reject twice', () => {
      const actual = ap(Par(F.rejected), Par(F.rejected));
      return U.assertRejected(seq(actual), 'rejected');
    });

    it('forks in parallel', function(){
      this.slow(40);
      this.timeout(30);
      const actual = ap(Par(F.resolvedSlow.and(mf)), Par(F.resolvedSlow));
      return U.assertResolved(seq(actual), 'resolvedSlow!');
    });

    it('creates a cancel function which cancels both Futures', done => {
      let cancelled = false;
      const m = Par(Future(() => () => (cancelled ? done() : (cancelled = true))));
      const cancel = seq(ap(m, m)).fork(U.noop, U.noop);
      cancel();
    });

    it('shows a reasonable representation when cast to string', () => {
      const m = ap(Par(of(1)), Par(reject(0)));
      const s = 'ConcurrentFuture@2(new ParallelAp(Future.reject(0), Future.of(1)))';
      expect(m.toString()).to.equal(s);
    });

  });

  describe('#map()', () => {

    it('applies the given function to its inner', () => {
      const actual = map(U.add(1), Par(of(1)));
      return U.assertResolved(seq(actual), 2);
    });

    it('does not map rejected state', () => {
      const actual = map(_ => 'mapped', Par(F.rejected));
      return U.assertRejected(seq(actual), 'rejected');
    });

    it('shows a reasonable representation when cast to string', () => {
      const m = map(U.noop, Par(F.resolved));
      const expected = `ConcurrentFuture@2(Future.of("resolved").map(${U.noop.toString()}))`;
      expect(m.toString()).to.equal(expected);
    });

  });

  describe('#alt', () => {

    const alt = Z.alt;

    it('rejects when the first one rejects', () => {
      const m1 = Par(Future((rej, res) => void setTimeout(res, 15, 1)));
      const m2 = Par(Future(rej => void setTimeout(rej, 5, U.error)));
      return U.assertRejected(seq(alt(m1, m2)), U.error);
    });

    it('resolves when the first one resolves', () => {
      const m1 = Par(Future((rej, res) => void setTimeout(res, 5, 1)));
      const m2 = Par(Future(rej => void setTimeout(rej, 15, U.error)));
      return U.assertResolved(seq(alt(m1, m2)), 1);
    });

    it('shows a reasonable representation when cast to string', () => {
      const m = alt(Par(of(2)), Par(of(1)));
      const s = 'ConcurrentFuture@2(Future.of(1))';
      expect(m.toString()).to.equal(s);
    });

  });

});
