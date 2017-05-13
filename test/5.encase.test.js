import {expect} from 'chai';
import {Future, encase, encase2, encase3, attempt} from '../index.es.js';
import * as U from './util';
import type from 'sanctuary-type-identifiers';

const unaryNoop = a => void a;
const binaryNoop = (a, b) => void b;
const ternaryNoop = (a, b, c) => void c;

describe('attempt()', () => {

  it('throws TypeError when not given a function', () => {
    const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];
    const fs = xs.map(x => () => attempt(x));
    fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
  });

  it('returns an instance of Future', () => {
    expect(attempt(x => x)).to.be.an.instanceof(Future);
  });

});

describe('encase()', () => {

  it('is a curried binary function', () => {
    expect(encase).to.be.a('function');
    expect(encase.length).to.equal(2);
    expect(encase(U.noop)).to.be.a('function');
  });

  it('throws TypeError when not given a function', () => {
    const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];
    const fs = xs.map(x => () => encase(x));
    fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
  });

  it('returns an instance of Future', () => {
    expect(encase(unaryNoop, null)).to.be.an.instanceof(Future);
  });

});

describe('encase2()', () => {

  it('is a curried ternary function', () => {
    expect(encase2).to.be.a('function');
    expect(encase2.length).to.equal(3);
    expect(encase2((a, b) => b)).to.be.a('function');
    expect(encase2((a, b) => b)(1)).to.be.a('function');
    expect(encase2((a, b) => b, 1)).to.be.a('function');
  });

  it('throws TypeError when not given a function', () => {
    const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];
    const fs = xs.map(x => () => encase2(x));
    fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
  });

  it('returns an instance of Future', () => {
    expect(encase2(binaryNoop, null, null)).to.be.an.instanceof(Future);
  });

});

describe('encase3()', () => {

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

  it('throws TypeError when not given a function', () => {
    const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];
    const fs = xs.map(x => () => encase3(x));
    fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
  });

  it('returns an instance of Future', () => {
    expect(encase3(ternaryNoop, null, null, null)).to.be.an.instanceof(Future);
  });

});

describe('Encase', () => {

  it('extends Future', () => {
    expect(encase(U.noop, 1)).to.be.an.instanceof(Future);
  });

  it('is considered a member of fluture/Fluture', () => {
    expect(type(encase(U.noop, 1))).to.equal(Future['@@type']);
  });

  describe('#fork()', () => {

    describe('(nullary)', () => {

      it('resolves with the return value of the function', () => {
        const actual = attempt(() => 1);
        return U.assertResolved(actual, 1);
      });

      it('rejects with the exception thrown by the function', () => {
        const actual = attempt(() => { throw U.error });
        return U.assertRejected(actual, U.error);
      });

      it('does not swallow errors from subsequent maps and such', () => {
        const f = () =>
          (attempt(x => x))
          .map(() => { throw U.error })
          .fork(U.noop, U.noop);
        expect(f).to.throw(U.error);
      });

    });

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
        const actual = encase2((a, x) => x + 1, 1, 1);
        return U.assertResolved(actual, 2);
      });

      it('rejects with the exception thrown by the function', () => {
        const actual = encase2((a, b) => { throw b, U.error }, 1, 1);
        return U.assertRejected(actual, U.error);
      });

      it('does not swallow errors from subsequent maps and such', () => {
        const f = () =>
          (encase2((a, x) => x, 1, 1))
          .map(() => { throw U.error })
          .fork(U.noop, U.noop);
        expect(f).to.throw(U.error);
      });

    });

    describe('(ternary)', () => {

      it('resolves with the return value of the function', () => {
        const actual = encase3((a, b, x) => x + 1, 1, 1, 1);
        return U.assertResolved(actual, 2);
      });

      it('rejects with the exception thrown by the function', () => {
        const actual = encase3((a, b, c) => { throw c, U.error }, 1, 1, 1);
        return U.assertRejected(actual, U.error);
      });

      it('does not swallow errors from subsequent maps and such', () => {
        const f = () =>
          (encase3((a, b, x) => x, 1, 1, 1))
          .map(() => { throw U.error })
          .fork(U.noop, U.noop);
        expect(f).to.throw(U.error);
      });

    });

  });

  describe('#toString()', () => {

    it('returns the code to create the Encase', () => {
      const m0 = attempt(unaryNoop);
      const m1 = encase(unaryNoop, null);
      const m2 = encase2(binaryNoop, null, null);
      const m3 = encase3(ternaryNoop, null, null, null);
      expect(m0.toString()).to.equal(`Future.try(${unaryNoop.toString()})`);
      expect(m1.toString()).to.equal(`Future.encase(${unaryNoop.toString()}, null)`);
      expect(m2.toString()).to.equal(`Future.encase2(${binaryNoop.toString()}, null, null)`);
      expect(m3.toString()).to.equal(`Future.encase3(${ternaryNoop.toString()}, null, null, null)`);
    });

  });

});
