import {expect} from 'chai';
import FL from 'fantasy-land';
import Future from '..';
import U from './util';
import type from 'sanctuary-type-identifiers';

describe('Future.of()', () => {

  it('is also available as fantasy-land function', () => {
    expect(Future.of).to.equal(Future[FL.of]);
  });

  it('returns an instance of Future', () => {
    expect(Future.of(1)).to.be.an.instanceof(Future);
  });

});

describe('Resolved', () => {

  const m = Future.of(1);

  it('extends Future', () => {
    expect(m).to.be.an.instanceof(Future);
  });

  it('is considered a member of fluture/Fluture', () => {
    expect(type(m)).to.equal(Future['@@type']);
  });

  describe('#fork()', () => {

    it('calls success callback with the value', () => {
      return U.assertResolved(m, 1);
    });

  });

  describe('#extractRight()', () => {

    it('returns array with the value', () => {
      expect(m.extractRight()).to.deep.equal([1]);
    });

  });

  describe('#toString()', () => {

    it('returns the code to create the Resolved', () => {
      expect(m.toString()).to.equal('Future.of(1)');
    });

  });

});
