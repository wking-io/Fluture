import {expect} from 'chai';
import {Future, chainRej, of} from '../index.es.js';
import * as U from './util';
import * as F from './futures';
import type from 'sanctuary-type-identifiers';

const testInstance = chainRej => {

  it('is considered a member of fluture/Fluture', () => {
    expect(type(chainRej(F.rejected, () => F.resolved))).to.equal(Future['@@type']);
  });

  describe('#fork()', () => {

    it('throws TypeError when the given function does not return Future', () => {
      const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];
      const fs = xs.map(x => () => chainRej(F.rejected, () => x).fork(U.noop, U.noop));
      fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
    });

    it('calls the given function with the inner of the Future', done => {
      chainRej(F.rejected, x => {
        expect(x).to.equal('rejected');
        done();
        return of(null);
      }).fork(U.noop, U.noop);
    });

    it('returns a Future with an inner equal to the returned Future', () => {
      const actual = chainRej(F.rejected, () => F.resolved);
      return U.assertResolved(actual, 'resolved');
    });

    it('maintains resolved state', () => {
      const actual = chainRej(F.resolved, () => F.resolvedSlow);
      return U.assertResolved(actual, 'resolved');
    });

    it('assumes rejected state', () => {
      const actual = chainRej(F.rejected, () => F.rejectedSlow);
      return U.assertRejected(actual, 'rejectedSlow');
    });

    it('does not chain after being cancelled', done => {
      chainRej(F.rejectedSlow, U.failRej).fork(U.failRej, U.failRes)();
      setTimeout(done, 25);
    });

  });

};

describe('chainRej()', () => {

  it('is a curried binary function', () => {
    expect(chainRej).to.be.a('function');
    expect(chainRej.length).to.equal(2);
    expect(chainRej(U.noop)).to.be.a('function');
  });

  it('throws when not given a Function as first argument', () => {
    const f = () => chainRej(1);
    expect(f).to.throw(TypeError, /Future.*first/);
  });

  it('throws when not given a Future as second argument', () => {
    const f = () => chainRej(U.B(Future.of)(U.add(1)), 1);
    expect(f).to.throw(TypeError, /Future.*second/);
  });

  testInstance((m, f) => chainRej(f, m));

});

describe('Future#chainRej()', () => {

  it('throws when invoked out of context', () => {
    const f = () => F.rejected.chainRej.call(null, U.noop);
    expect(f).to.throw(TypeError, /Future/);
  });

  it('throws TypeError when not given a function', () => {
    const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];
    const fs = xs.map(x => () => F.rejected.chainRej(x));
    fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
  });

  testInstance((m, f) => m.chainRej(f));

});
