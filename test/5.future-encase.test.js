'use strict';

const expect = require('chai').expect;
const Future = require('../fluture.js');
const FutureEncase = Future.classes.FutureEncase;
const U = require('./util');

const unaryNoop = a => void a;
const binaryNoop = (a, b) => void b;
const ternaryNoop = (a, b, c) => void c;

describe('Future.encase()', () => {

  it('is a curried binary function', () => {
    expect(Future.encase).to.be.a('function');
    expect(Future.encase.length).to.equal(2);
    expect(Future.encase(U.noop)).to.be.a('function');
  });

  it('throws TypeError when not given a function', () => {
    const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];
    const fs = xs.map(x => () => Future.encase(x)(1));
    fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
  });

  it('returns an instance of FutureEncase', () => {
    expect(Future.encase(unaryNoop, null)).to.be.an.instanceof(FutureEncase);
  });

});

describe('Future.encase2()', () => {

  it('is a curried ternary function', () => {
    expect(Future.encase2).to.be.a('function');
    expect(Future.encase2.length).to.equal(3);
    expect(Future.encase2((a, b) => b)).to.be.a('function');
    expect(Future.encase2((a, b) => b)(1)).to.be.a('function');
    expect(Future.encase2((a, b) => b, 1)).to.be.a('function');
  });

  it('throws TypeError when not given a binary function', () => {
    const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null, U.noop, unaryNoop];
    const fs = xs.map(x => () => Future.encase2(x)(1)(2));
    fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
  });

  it('returns an instance of FutureEncase', () => {
    expect(Future.encase2(binaryNoop, null, null)).to.be.an.instanceof(FutureEncase);
  });

});

describe('Future.encase3()', () => {

  it('is a curried quaternary function', () => {
    expect(Future.encase3).to.be.a('function');
    expect(Future.encase3.length).to.equal(4);
    expect(Future.encase3((a, b, c) => c)).to.be.a('function');
    expect(Future.encase3((a, b, c) => c)(1)).to.be.a('function');
    expect(Future.encase3((a, b, c) => c, 1)).to.be.a('function');
    expect(Future.encase3((a, b, c) => c)(1)(2)).to.be.a('function');
    expect(Future.encase3((a, b, c) => c, 1)(2)).to.be.a('function');
    expect(Future.encase3((a, b, c) => c)(1, 2)).to.be.a('function');
    expect(Future.encase3((a, b, c) => c, 1, 2)).to.be.a('function');
  });

  it('throws TypeError when not given a ternary function', () => {
    const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null, U.noop, unaryNoop, binaryNoop];
    const fs = xs.map(x => () => Future.encase3(x)(1)(2)(3));
    fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
  });

  it('returns an instance of FutureEncase', () => {
    expect(Future.encase3(ternaryNoop, null, null, null)).to.be.an.instanceof(FutureEncase);
  });

});

describe('FutureEncase', () => {

  it('extends Future', () => {
    expect(new FutureEncase).to.be.an.instanceof(Future);
  });

  describe('#fork()', () => {

    describe('(unary)', () => {

      it('resolves with the return value of the function', () => {
        const actual = new FutureEncase(x => x + 1, 1);
        return U.assertResolved(actual, 2);
      });

      it('rejects with the exception thrown by the function', () => {
        const actual = new FutureEncase(a => { throw a, U.error }, 1);
        return U.assertRejected(actual, U.error);
      });

      it('does not swallow errors from subsequent maps and such', () => {
        const f = () =>
          (new FutureEncase(x => x, 1))
          .map(() => { throw U.error })
          .fork(U.noop, U.noop);
        expect(f).to.throw(U.error);
      });

    });

    describe('(binary)', () => {

      it('resolves with the return value of the function', () => {
        const actual = new FutureEncase((a, x) => x + 1, 1, 1);
        return U.assertResolved(actual, 2);
      });

      it('rejects with the exception thrown by the function', () => {
        const actual = new FutureEncase((a, b) => { throw b, U.error }, 1, 1);
        return U.assertRejected(actual, U.error);
      });

      it('does not swallow errors from subsequent maps and such', () => {
        const f = () =>
          (new FutureEncase((a, x) => x, 1, 1))
          .map(() => { throw U.error })
          .fork(U.noop, U.noop);
        expect(f).to.throw(U.error);
      });

    });

    describe('(ternary)', () => {

      it('resolves with the return value of the function', () => {
        const actual = new FutureEncase((a, b, x) => x + 1, 1, 1, 1);
        return U.assertResolved(actual, 2);
      });

      it('rejects with the exception thrown by the function', () => {
        const actual = new FutureEncase((a, b, c) => { throw c, U.error }, 1, 1, 1);
        return U.assertRejected(actual, U.error);
      });

      it('does not swallow errors from subsequent maps and such', () => {
        const f = () =>
          (new FutureEncase((a, b, x) => x, 1, 1, 1))
          .map(() => { throw U.error })
          .fork(U.noop, U.noop);
        expect(f).to.throw(U.error);
      });

    });

  });

  describe('#toString()', () => {

    it('returns the code to create the FutureEncase', () => {
      const m1 = new FutureEncase(unaryNoop, null);
      const m2 = new FutureEncase(binaryNoop, null, null);
      const m3 = new FutureEncase(ternaryNoop, null, null, null);
      expect(m1.toString()).to.equal('Future.encase(a => void a, null)');
      expect(m2.toString()).to.equal('Future.encase2((a, b) => void b, null, null)');
      expect(m3.toString()).to.equal('Future.encase3((a, b, c) => void c, null, null, null)');
    });

  });

});
