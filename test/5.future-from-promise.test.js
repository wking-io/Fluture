'use strict';

const expect = require('chai').expect;
const Future = require('../fluture.js');
const FutureFromPromise = Future.classes.FutureFromPromise;
const U = require('./util');

const unaryNoop = a => Promise.resolve(a);
const binaryNoop = (a, b) => Promise.resolve(b);
const ternaryNoop = (a, b, c) => Promise.resolve(c);

describe('Future.fromPromise()', () => {

  it('is a curried binary function', () => {
    expect(Future.fromPromise).to.be.a('function');
    expect(Future.fromPromise.length).to.equal(2);
    expect(Future.fromPromise(U.noop)).to.be.a('function');
  });

  it('throws TypeError when not given a function', () => {
    const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];
    const fs = xs.map(x => () => Future.fromPromise(x)(1));
    fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
  });

  it('returns an instance of FutureFromPromise', () => {
    expect(Future.fromPromise(unaryNoop, null)).to.be.an.instanceof(FutureFromPromise);
  });

});

describe('Future.fromPromise2()', () => {

  it('is a curried ternary function', () => {
    expect(Future.fromPromise2).to.be.a('function');
    expect(Future.fromPromise2.length).to.equal(3);
    expect(Future.fromPromise2((a, b) => b)).to.be.a('function');
    expect(Future.fromPromise2((a, b) => b)(1)).to.be.a('function');
    expect(Future.fromPromise2((a, b) => b, 1)).to.be.a('function');
  });

  it('throws TypeError when not given a binary function', () => {
    const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null, U.noop, unaryNoop];
    const fs = xs.map(x => () => Future.fromPromise2(x)(1)(2));
    fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
  });

  it('returns an instance of FutureFromPromise', () => {
    expect(Future.fromPromise2(binaryNoop, null, null)).to.be.an.instanceof(FutureFromPromise);
  });

});

describe('Future.fromPromise3()', () => {

  it('is a curried quaternary function', () => {
    expect(Future.fromPromise3).to.be.a('function');
    expect(Future.fromPromise3.length).to.equal(4);
    expect(Future.fromPromise3((a, b, c) => c)).to.be.a('function');
    expect(Future.fromPromise3((a, b, c) => c)(1)).to.be.a('function');
    expect(Future.fromPromise3((a, b, c) => c, 1)).to.be.a('function');
    expect(Future.fromPromise3((a, b, c) => c)(1)(2)).to.be.a('function');
    expect(Future.fromPromise3((a, b, c) => c, 1)(2)).to.be.a('function');
    expect(Future.fromPromise3((a, b, c) => c)(1, 2)).to.be.a('function');
    expect(Future.fromPromise3((a, b, c) => c, 1, 2)).to.be.a('function');
  });

  it('throws TypeError when not given a ternary function', () => {
    const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null, U.noop, unaryNoop, binaryNoop];
    const fs = xs.map(x => () => Future.fromPromise3(x)(1)(2)(3));
    fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
  });

  it('returns an instance of FutureFromPromise', () => {
    expect(Future.fromPromise3(ternaryNoop, null, null, null))
    .to.be.an.instanceof(FutureFromPromise);
  });

});

describe('FutureFromPromise', () => {

  it('extends Future', () => {
    expect(new FutureFromPromise).to.be.an.instanceof(Future);
  });

  describe('#fork()', () => {

    describe('(unary)', () => {

      it('throws TypeError when the function does not return a Promise', () => {
        const f = () => new FutureFromPromise(U.noop, 1).fork(U.noop, U.noop);
        expect(f).to.throw(TypeError, /Future.*Promise/);
      });

      it('resolves with the resolution value of the returned Promise', () => {
        const actual = new FutureFromPromise(x => Promise.resolve(x + 1), 1);
        return U.assertResolved(actual, 2);
      });

      it('rejects with rejection reason of the returned Promise', () => {
        const actual = new FutureFromPromise(_ => Promise.reject(U.error), 1);
        return U.assertRejected(actual, U.error);
      });

    });

    describe('(binary)', () => {

      it('throws TypeError when the function does not return a Promise', () => {
        const f = () => new FutureFromPromise(U.noop, 1, 1).fork(U.noop, U.noop);
        expect(f).to.throw(TypeError, /Future.*Promise/);
      });

      it('resolves with the resolution value of the returned Promise', () => {
        const actual = new FutureFromPromise((x, y) => Promise.resolve(y + 1), 1, 1);
        return U.assertResolved(actual, 2);
      });

      it('rejects with rejection reason of the returned Promise', () => {
        const actual = new FutureFromPromise(_ => Promise.reject(U.error), 1, 1);
        return U.assertRejected(actual, U.error);
      });

    });

    describe('(ternary)', () => {

      it('throws TypeError when the function does not return a Promise', () => {
        const f = () => new FutureFromPromise(U.noop, 1, 1, 1).fork(U.noop, U.noop);
        expect(f).to.throw(TypeError, /Future.*Promise/);
      });

      it('resolves with the resolution value of the returned Promise', () => {
        const actual = new FutureFromPromise((x, y, z) => Promise.resolve(z + 1), 1, 1, 1);
        return U.assertResolved(actual, 2);
      });

      it('rejects with rejection reason of the returned Promise', () => {
        const actual = new FutureFromPromise(_ => Promise.reject(U.error), 1, 1, 1);
        return U.assertRejected(actual, U.error);
      });

    });

  });

  describe('#toString()', () => {

    it('returns the code to create the FutureFromPromise', () => {
      const m1 = new FutureFromPromise(unaryNoop, null);
      const m2 = new FutureFromPromise(binaryNoop, null, null);
      const m3 = new FutureFromPromise(ternaryNoop, null, null, null);
      expect(m1.toString()).to.equal(
        'Future.fromPromise(a => Promise.resolve(a), null)'
      );
      expect(m2.toString()).to.equal(
        'Future.fromPromise2((a, b) => Promise.resolve(b), null, null)'
      );
      expect(m3.toString()).to.equal(
        'Future.fromPromise3((a, b, c) => Promise.resolve(c), null, null, null)'
      );
    });

  });

});
