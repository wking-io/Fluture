import {expect} from 'chai';
import {Future, never} from '../index.es.js';
import U from './util';
import type from 'sanctuary-type-identifiers';

describe('Never', () => {

  it('extends Future', () => {
    expect(never).to.be.an.instanceof(Future);
  });

  it('is considered a member of fluture/Fluture', () => {
    expect(type(never)).to.equal(Future['@@type']);
  });

  describe('#fork()', () => {

    it('does nothing and returns a noop cancel function', () => {
      const m = never;
      const cancel = m.fork(U.noop, U.noop);
      cancel();
    });

  });

  describe('#toString()', () => {

    it('returns the code to create the Never', () => {
      const m = never;
      expect(m.toString()).to.equal('Future.never');
    });

  });

});
