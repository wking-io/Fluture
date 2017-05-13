import {expect} from 'chai';
import {Future, reject} from '../index.es.js';
import * as U from './util';
import type from 'sanctuary-type-identifiers';

describe('reject()', () => {

  it('returns an instance of Future', () => {
    expect(reject(1)).to.be.an.instanceof(Future);
  });

});

describe('Rejected', () => {

  const m = reject(1);

  it('extends Future', () => {
    expect(m).to.be.an.instanceof(Future);
  });

  it('is considered a member of fluture/Fluture', () => {
    expect(type(m)).to.equal(Future['@@type']);
  });

  describe('#fork()', () => {

    it('calls failure callback with the reason', () => {
      return U.assertRejected(m, 1);
    });

  });

  describe('#extractLeft()', () => {

    it('returns array with the reason', () => {
      expect(m.extractLeft()).to.deep.equal([1]);
    });

  });

  describe('#toString()', () => {

    it('returns the code to create the Rejected', () => {
      expect(m.toString()).to.equal('Future.reject(1)');
    });

  });

});
