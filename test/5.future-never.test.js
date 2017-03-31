import {expect} from 'chai';
import Future from '..';
import U from './util';
import type from 'sanctuary-type-identifiers';

describe('FutureNever', () => {

  it('extends Future', () => {
    expect(Future.never).to.be.an.instanceof(Future);
  });

  it('is considered a member of fluture/Fluture', () => {
    expect(type(Future.never)).to.equal('fluture/Future');
  });

  describe('#fork()', () => {

    it('does nothing and returns a noop cancel function', () => {
      const m = Future.never;
      const cancel = m.fork(U.noop, U.noop);
      cancel();
    });

  });

  describe('#toString()', () => {

    it('returns the code to create the FutureNever', () => {
      const m = Future.never;
      expect(m.toString()).to.equal('Future.never');
    });

  });

});
