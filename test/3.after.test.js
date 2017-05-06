import {expect} from 'chai';
import {Future, after} from '../index.es.js';
import * as U from './util';
import type from 'sanctuary-type-identifiers';

describe('after()', () => {

  it('is a curried binary function', () => {
    expect(after).to.be.a('function');
    expect(after.length).to.equal(2);
    expect(after(20)).to.be.a('function');
  });

  it('throws TypeError when not given a number as first argument', () => {
    const xs = [{}, [], 'a', new Date, undefined, null];
    const fs = xs.map(x => () => after(x));
    fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
  });

  it('returns an instance of Future', () => {
    expect(after(20, 1)).to.be.an.instanceof(Future);
  });

});

describe('After', () => {

  const m = after(20, 1);

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

    it('clears its internal timeout when cancelled', done => {
      after(20, 1).fork(U.failRej, U.failRes)();
      setTimeout(done, 25);
    });

  });

  describe('#extractRight()', () => {

    it('returns array with the value', () => {
      expect(m.extractRight()).to.deep.equal([1]);
    });

  });

  describe('#toString()', () => {

    it('returns the code to create the After', () => {
      expect(m.toString()).to.equal('Future.after(20, 1)');
    });

  });

});
