import {expect} from 'chai';
import {Future, bimap, of, reject} from '../index.es.js';
import * as U from './util';
import type from 'sanctuary-type-identifiers';

const testInstance = bimap => {

  it('is considered a member of fluture/Fluture', () => {
    expect(type(bimap(reject(1), U.add(1), U.failRes))).to.equal(Future['@@type']);
  });

  describe('#fork()', () => {

    it('applies the first function to the value in the rejection branch', () => {
      const actual = bimap(reject(1), U.add(1), U.failRes);
      return U.assertRejected(actual, 2);
    });

    it('applies the second function to the value in the resolution branch', () => {
      const actual = bimap(of(1), U.failRej, U.add(1));
      return U.assertResolved(actual, 2);
    });

  });

};

describe('bimap()', () => {

  it('is a curried ternary function', () => {
    expect(bimap).to.be.a('function');
    expect(bimap.length).to.equal(3);
    expect(bimap(U.noop)).to.be.a('function');
    expect(bimap(U.noop)(U.noop)).to.be.a('function');
    expect(bimap(U.noop, U.noop)).to.be.a('function');
  });

  it('throws when not given a Function as first argument', () => {
    const f = () => bimap(1);
    expect(f).to.throw(TypeError, /Future.*first/);
  });

  it('throws when not given a Function as second argument', () => {
    const f = () => bimap(U.add(1), 1);
    expect(f).to.throw(TypeError, /Future.*second/);
  });

  it('throws when not given a Future as third argument', () => {
    const f = () => bimap(U.add(1), U.add(1), 1);
    expect(f).to.throw(TypeError, /Future.*third/);
  });

  testInstance((m, f, g) => bimap(f, g, m));

});

describe('Future#bimap()', () => {

  testInstance((m, f, g) => m.bimap(f, g));

});
