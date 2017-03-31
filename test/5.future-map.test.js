import {expect} from 'chai';
import Future from '..';
import U from './util';
import F from './futures';
import type from 'sanctuary-type-identifiers';

const testInstance = map => {

  it('is considered a member of fluture/Fluture', () => {
    expect(type(map(Future.of(1), U.add(1)))).to.equal('fluture/Future');
  });

  describe('#fork()', () => {

    it('applies the given function to its inner', () => {
      const actual = map(Future.of(1), U.add(1));
      return U.assertResolved(actual, 2);
    });

    it('does not map rejected state', () => {
      const actual = map(F.rejected, _ => 'mapped');
      return U.assertRejected(actual, 'rejected');
    });

    it('does not resolve after being cancelled', done => {
      map(F.resolvedSlow, U.failRes).fork(U.failRej, U.failRes)();
      setTimeout(done, 25);
    });

    it('does not reject after being cancelled', done => {
      map(F.rejectedSlow, U.failRes).fork(U.failRej, U.failRes)();
      setTimeout(done, 25);
    });

  });

  describe('#toString()', () => {

    it('returns the code to create the FutureMap', () => {
      const m = map(F.resolved, U.noop);
      expect(m.toString()).to.equal('Future.of("resolved").map(() => {})');
    });

  });

};

describe('Future.map()', () => {

  it('is a curried binary function', () => {
    expect(Future.map).to.be.a('function');
    expect(Future.map.length).to.equal(2);
    expect(Future.map(U.noop)).to.be.a('function');
  });

  it('throws when not given a Function as first argument', () => {
    const f = () => Future.map(1);
    expect(f).to.throw(TypeError, /Future.*first/);
  });

  it('throws when not given a Future as second argument', () => {
    const f = () => Future.map(U.add(1), 1);
    expect(f).to.throw(TypeError, /Future.*second/);
  });

  testInstance((m, f) => Future.map(f, m));

});

describe('Future#map()', () => {

  it('throws when invoked out of context', () => {
    const f = () => F.resolved.map.call(null, U.noop);
    expect(f).to.throw(TypeError, /Future/);
  });

  it('throws TypeError when not given a function', () => {
    const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];
    const fs = xs.map(x => () => F.resolved.map(x));
    fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
  });

  testInstance((m, f) => m.map(f));

});
