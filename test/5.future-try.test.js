import {expect} from 'chai';
import {Future, attempt} from '../index.es.js';
import U from './util';
import type from 'sanctuary-type-identifiers';

describe.skip('attempt()', () => {

  it('throws TypeError when not given a function', () => {
    const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];
    const fs = xs.map(x => () => attempt(x));
    fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
  });

  it('returns an instance of Future', () => {
    expect(attempt(x => x)).to.be.an.instanceof(Future);
  });

});

describe.skip('FutureTry', () => {

  it('extends Future', () => {
    expect(attempt).to.be.an.instanceof(Future);
  });

  it('is considered a member of fluture/Fluture', () => {
    expect(type(attempt)).to.equal(Future['@@type']);
  });

  describe('#fork()', () => {

    it('resolves with the return value of the function', () => {
      const actual = attempt(() => 1);
      return U.assertResolved(actual, 1);
    });

    it('rejects with the exception thrown by the function', () => {
      const actual = attempt(() => { throw U.error });
      return U.assertRejected(actual, U.error);
    });

  });

  describe('#toString()', () => {

    it('returns the code to create the FutureTry', () => {
      const m = attempt(x => x);
      expect(m.toString()).to.equal('attempt(x => x)');
    });

  });

});
