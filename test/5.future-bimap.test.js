import {expect} from 'chai';
import Future from '..';
import U from './util';
import type from 'sanctuary-type-identifiers';

const testInstance = bimap => {

  it('is considered a member of fluture/Fluture', () => {
    expect(type(bimap(Future.reject(1), U.add(1), U.failRes))).to.equal(Future['@@type']);
  });

  describe('#fork()', () => {

    it('applies the first function to the value in the rejection branch', () => {
      const actual = bimap(Future.reject(1), U.add(1), U.failRes);
      return U.assertRejected(actual, 2);
    });

    it('applies the second function to the value in the resolution branch', () => {
      const actual = bimap(Future.of(1), U.failRej, U.add(1));
      return U.assertResolved(actual, 2);
    });

  });

  describe('#toString()', () => {

    it('returns the code to create the FutureBimap', () => {
      const m = bimap(Future.of(1), x => x, y => y);
      const s = 'Future.of(1).bimap(x => x, y => y)';
      expect(m.toString()).to.equal(s);
    });

  });

};

describe('Future.bimap()', () => {

  it('is a curried ternary function', () => {
    expect(Future.bimap).to.be.a('function');
    expect(Future.bimap.length).to.equal(3);
    expect(Future.bimap(U.noop)).to.be.a('function');
    expect(Future.bimap(U.noop)(U.noop)).to.be.a('function');
    expect(Future.bimap(U.noop, U.noop)).to.be.a('function');
  });

  it('throws when not given a Function as first argument', () => {
    const f = () => Future.bimap(1);
    expect(f).to.throw(TypeError, /Future.*first/);
  });

  it('throws when not given a Function as second argument', () => {
    const f = () => Future.bimap(U.add(1), 1);
    expect(f).to.throw(TypeError, /Future.*second/);
  });

  it('throws when not given a Future as third argument', () => {
    const f = () => Future.bimap(U.add(1), U.add(1), 1);
    expect(f).to.throw(TypeError, /Future.*third/);
  });

  testInstance((m, f, g) => Future.bimap(f, g, m));

});

describe('Future#bimap()', () => {

  it('throws TypeError when not given a function as first argument', () => {
    const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];
    const fs = xs.map(x => () => Future.of(1).bimap(x, U.noop));
    fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
  });

  it('throws TypeError when not given a function as second argument', () => {
    const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];
    const fs = xs.map(x => () => Future.of(1).bimap(U.noop, x));
    fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
  });

  testInstance((m, f, g) => m.bimap(f, g));

});
