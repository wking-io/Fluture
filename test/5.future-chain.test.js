import {expect} from 'chai';
import Future from '..';
import U from './util';
import F from './futures';
import type from 'sanctuary-type-identifiers';

const testInstance = chain => {

  it('is considered a member of fluture/Fluture', () => {
    expect(type(chain(F.resolved, () => F.resolvedSlow))).to.equal(Future['@@type']);
  });

  describe('#fork()', () => {

    it('calls the given function with the inner of the Future', done => {
      chain(F.resolved, x => {
        expect(x).to.equal('resolved');
        done();
        return Future.of(null);
      }).fork(U.noop, U.noop);
    });

    it('returns a Future with an inner equal to the returned Future', () => {
      const actual = chain(F.resolved, () => F.resolvedSlow);
      return U.assertResolved(actual, 'resolvedSlow');
    });

    it('maintains rejected state', () => {
      const actual = chain(F.rejected, () => F.resolved);
      return U.assertRejected(actual, 'rejected');
    });

    it('assumes rejected state', () => {
      const actual = chain(F.resolved, () => F.rejected);
      return U.assertRejected(actual, 'rejected');
    });

    it('does not chain after being cancelled', done => {
      chain(F.resolvedSlow, U.failRes).fork(U.failRej, U.failRes)();
      setTimeout(done, 25);
    });

    it('does not reject after being cancelled', done => {
      chain(F.rejectedSlow, U.failRes).fork(U.failRej, U.failRes)();
      chain(F.resolved, () => F.rejectedSlow).fork(U.failRej, U.failRes)();
      setTimeout(done, 25);
    });

  });

  describe('#toString()', () => {

    it('returns the code to create the FutureChain', () => {
      const m = chain(Future.of(1), x => Future.of(x));
      const s = 'Future.of(1).chain(x => Future.of(x))';
      expect(m.toString()).to.equal(s);
    });

  });

};

describe('Future.chain()', () => {

  it('is a curried binary function', () => {
    expect(Future.chain).to.be.a('function');
    expect(Future.chain.length).to.equal(2);
    expect(Future.chain(U.noop)).to.be.a('function');
  });

  it('throws when not given a Function as first argument', () => {
    const f = () => Future.chain(1);
    expect(f).to.throw(TypeError, /Future.*first/);
  });

  it('throws when not given a Future as second argument', () => {
    const f = () => Future.chain(U.B(Future.of)(U.add(1)), 1);
    expect(f).to.throw(TypeError, /Future.*second/);
  });

  testInstance((m, f) => Future.chain(f, m));

});

describe('Future#chain()', () => {

  const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];

  it('throws when invoked out of context', () => {
    const f = () => F.resolved.chain.call(null, U.noop);
    expect(f).to.throw(TypeError, /Future/);
  });

  it('throws TypeError when not given a function', () => {
    const fs = xs.map(x => () => F.resolved.chain(x));
    fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
  });

  it('throws TypeError when the given function does not return Future', () => {
    const fs = xs.map(x => () => F.resolved.chain(() => x).fork(U.noop, U.noop));
    fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
  });

  testInstance((m, f) => m.chain(f));

});
