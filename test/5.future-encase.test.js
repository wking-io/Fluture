import {expect} from 'chai';
import {Future, encase, encase2, encase3} from '../index.es.js';
import U from './util';
import type from 'sanctuary-type-identifiers';

const unaryNoop = a => void a;
const binaryNoop = (a, b) => void b;
const ternaryNoop = (a, b, c) => void c;

describe.skip('encase()', () => {

  it('is a curried binary function', () => {
    expect(Future.encase).to.be.a('function');
    expect(Future.encase.length).to.equal(2);
    expect(encase(U.noop)).to.be.a('function');
  });

  it('throws TypeError when not given a function', () => {
    const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];
    const fs = xs.map(x => () => encase(x)(1));
    fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
  });

  it('returns an instance of Future', () => {
    expect(encase(unaryNoop, null)).to.be.an.instanceof(Future);
  });

});

describe.skip('encase2()', () => {

  it('is a curried ternary function', () => {
    expect(encase2).to.be.a('function');
    expect(encase2.length).to.equal(3);
    expect(encase2((a, b) => b)).to.be.a('function');
    expect(encase2((a, b) => b)(1)).to.be.a('function');
    expect(encase2((a, b) => b, 1)).to.be.a('function');
  });

  it('throws TypeError when not given a binary function', () => {
    const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null, U.noop, unaryNoop];
    const fs = xs.map(x => () => encase2(x)(1)(2));
    fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
  });

  it('returns an instance of Future', () => {
    expect(encase2(binaryNoop, null, null)).to.be.an.instanceof(Future);
  });

});

describe.skip('encase3()', () => {

  it('is a curried quaternary function', () => {
    expect(encase3).to.be.a('function');
    expect(encase3.length).to.equal(4);
    expect(encase3((a, b, c) => c)).to.be.a('function');
    expect(encase3((a, b, c) => c)(1)).to.be.a('function');
    expect(encase3((a, b, c) => c, 1)).to.be.a('function');
    expect(encase3((a, b, c) => c)(1)(2)).to.be.a('function');
    expect(encase3((a, b, c) => c, 1)(2)).to.be.a('function');
    expect(encase3((a, b, c) => c)(1, 2)).to.be.a('function');
    expect(encase3((a, b, c) => c, 1, 2)).to.be.a('function');
  });

  it('throws TypeError when not given a ternary function', () => {
    const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null, U.noop, unaryNoop, binaryNoop];
    const fs = xs.map(x => () => encase3(x)(1)(2)(3));
    fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
  });

  it('returns an instance of Future', () => {
    expect(encase3(ternaryNoop, null, null, null)).to.be.an.instanceof(Future);
  });

});

describe.skip('FutureEncase', () => {

  it('extends Future', () => {
    expect(encase(U.noop, 1)).to.be.an.instanceof(Future);
  });

  it('is considered a member of fluture/Fluture', () => {
    expect(type(encase(U.noop, 1))).to.equal(Future['@@type']);
  });

  describe('#fork()', () => {

    describe('(unary)', () => {

      it('resolves with the return value of the function', () => {
        const actual = encase(x => x + 1, 1);
        return U.assertResolved(actual, 2);
      });

      it('rejects with the exception thrown by the function', () => {
        const actual = encase(a => { throw a, U.error }, 1);
        return U.assertRejected(actual, U.error);
      });

      it('does not swallow errors from subsequent maps and such', () => {
        const f = () =>
          (encase(x => x, 1))
          .map(() => { throw U.error })
          .fork(U.noop, U.noop);
        expect(f).to.throw(U.error);
      });

    });

    describe('(binary)', () => {

      it('resolves with the return value of the function', () => {
        const actual = encase((a, x) => x + 1, 1, 1);
        return U.assertResolved(actual, 2);
      });

      it('rejects with the exception thrown by the function', () => {
        const actual = encase((a, b) => { throw b, U.error }, 1, 1);
        return U.assertRejected(actual, U.error);
      });

      it('does not swallow errors from subsequent maps and such', () => {
        const f = () =>
          (encase((a, x) => x, 1, 1))
          .map(() => { throw U.error })
          .fork(U.noop, U.noop);
        expect(f).to.throw(U.error);
      });

    });

    describe('(ternary)', () => {

      it('resolves with the return value of the function', () => {
        const actual = encase((a, b, x) => x + 1, 1, 1, 1);
        return U.assertResolved(actual, 2);
      });

      it('rejects with the exception thrown by the function', () => {
        const actual = encase((a, b, c) => { throw c, U.error }, 1, 1, 1);
        return U.assertRejected(actual, U.error);
      });

      it('does not swallow errors from subsequent maps and such', () => {
        const f = () =>
          (encase((a, b, x) => x, 1, 1, 1))
          .map(() => { throw U.error })
          .fork(U.noop, U.noop);
        expect(f).to.throw(U.error);
      });

    });

  });

  describe('#toString()', () => {

    it('returns the code to create the FutureEncase', () => {
      const m1 = encase(unaryNoop, null);
      const m2 = encase(binaryNoop, null, null);
      const m3 = encase(ternaryNoop, null, null, null);
      expect(m1.toString()).to.equal('encase(a => void a, null)');
      expect(m2.toString()).to.equal('encase2((a, b) => void b, null, null)');
      expect(m3.toString()).to.equal('encase3((a, b, c) => void c, null, null, null)');
    });

  });

});
