import {expect} from 'chai';
import Future from '..';
import U from './util';
import type from 'sanctuary-type-identifiers';

const testInstance = swap => {

  it('is considered a member of fluture/Fluture', () => {
    expect(type(swap(Future.of(1)))).to.equal(Future['@@type']);
  });

  describe('#fork()', () => {

    it('rejects with the resolution value', () => {
      const actual = swap(Future.of(1));
      return U.assertRejected(actual, 1);
    });

    it('resolves with the rejection reason', () => {
      const actual = swap(Future.reject(1));
      return U.assertResolved(actual, 1);
    });

  });

  describe('#toString()', () => {

    it('returns the code to create the FutureSwap', () => {
      const m = swap(Future.of(1));
      const s = 'Future.of(1).swap()';
      expect(m.toString()).to.equal(s);
    });

  });

};

describe.skip('Future.swap()', () => {

  it('throws when not given a Future', () => {
    const f = () => Future.swap(1);
    expect(f).to.throw(TypeError, /Future/);
  });

  testInstance(m => Future.swap(m));

});

describe.skip('Future#swap()', () => {

  it('throws when invoked out of context', () => {
    const f = () => Future.of(1).swap.call(null);
    expect(f).to.throw(TypeError, /Future/);
  });

  testInstance(m => m.swap());

});
