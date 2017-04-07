import {expect} from 'chai';
import {Future, fromPromise, fromPromise2, fromPromise3} from '../index.es.js';
import U from './util';
import type from 'sanctuary-type-identifiers';

const unaryNoop = a => Promise.resolve(a);
const binaryNoop = (a, b) => Promise.resolve(b);
const ternaryNoop = (a, b, c) => Promise.resolve(c);

describe.skip('fromPromise()', () => {

  it('is a curried binary function', () => {
    expect(fromPromise).to.be.a('function');
    expect(fromPromise.length).to.equal(2);
    expect(fromPromise(U.noop)).to.be.a('function');
  });

  it('throws TypeError when not given a function', () => {
    const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];
    const fs = xs.map(x => () => fromPromise(x)(1));
    fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
  });

  it('returns an instance of Future', () => {
    expect(fromPromise(unaryNoop, null)).to.be.an.instanceof(Future);
  });

});

describe.skip('fromPromise2()', () => {

  it('is a curried ternary function', () => {
    expect(fromPromise2).to.be.a('function');
    expect(fromPromise2.length).to.equal(3);
    expect(fromPromise2((a, b) => b)).to.be.a('function');
    expect(fromPromise2((a, b) => b)(1)).to.be.a('function');
    expect(fromPromise2((a, b) => b, 1)).to.be.a('function');
  });

  it('throws TypeError when not given a binary function', () => {
    const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null, U.noop, unaryNoop];
    const fs = xs.map(x => () => fromPromise2(x)(1)(2));
    fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
  });

  it('returns an instance of Future', () => {
    expect(fromPromise2(binaryNoop, null, null)).to.be.an.instanceof(Future);
  });

});

describe.skip('fromPromise3()', () => {

  it('is a curried quaternary function', () => {
    expect(fromPromise3).to.be.a('function');
    expect(fromPromise3.length).to.equal(4);
    expect(fromPromise3((a, b, c) => c)).to.be.a('function');
    expect(fromPromise3((a, b, c) => c)(1)).to.be.a('function');
    expect(fromPromise3((a, b, c) => c, 1)).to.be.a('function');
    expect(fromPromise3((a, b, c) => c)(1)(2)).to.be.a('function');
    expect(fromPromise3((a, b, c) => c, 1)(2)).to.be.a('function');
    expect(fromPromise3((a, b, c) => c)(1, 2)).to.be.a('function');
    expect(fromPromise3((a, b, c) => c, 1, 2)).to.be.a('function');
  });

  it('throws TypeError when not given a ternary function', () => {
    const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null, U.noop, unaryNoop, binaryNoop];
    const fs = xs.map(x => () => fromPromise3(x)(1)(2)(3));
    fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
  });

  it('returns an instance of Future', () => {
    expect(fromPromise3(ternaryNoop, null, null, null))
    .to.be.an.instanceof(Future);
  });

});

describe.skip('FutureFromPromise', () => {

  it('extends Future', () => {
    expect(fromPromise(U.noop, 1)).to.be.an.instanceof(Future);
  });

  it('is considered a member of fluture/Fluture', () => {
    expect(type(fromPromise(U.noop, 1))).to.equal(Future['@@type']);
  });

  describe('#fork()', () => {

    describe('(unary)', () => {

      it('throws TypeError when the function does not return a Promise', () => {
        const f = () => fromPromise(U.noop, 1).fork(U.noop, U.noop);
        expect(f).to.throw(TypeError, /Future.*Promise/);
      });

      it('resolves with the resolution value of the returned Promise', () => {
        const actual = fromPromise(x => Promise.resolve(x + 1), 1);
        return U.assertResolved(actual, 2);
      });

      it('rejects with rejection reason of the returned Promise', () => {
        const actual = fromPromise(_ => Promise.reject(U.error), 1);
        return U.assertRejected(actual, U.error);
      });

    });

    describe('(binary)', () => {

      it('throws TypeError when the function does not return a Promise', () => {
        const f = () => fromPromise(U.noop, 1, 1).fork(U.noop, U.noop);
        expect(f).to.throw(TypeError, /Future.*Promise/);
      });

      it('resolves with the resolution value of the returned Promise', () => {
        const actual = fromPromise((x, y) => Promise.resolve(y + 1), 1, 1);
        return U.assertResolved(actual, 2);
      });

      it('rejects with rejection reason of the returned Promise', () => {
        const actual = fromPromise(_ => Promise.reject(U.error), 1, 1);
        return U.assertRejected(actual, U.error);
      });

    });

    describe('(ternary)', () => {

      it('throws TypeError when the function does not return a Promise', () => {
        const f = () => fromPromise(U.noop, 1, 1, 1).fork(U.noop, U.noop);
        expect(f).to.throw(TypeError, /Future.*Promise/);
      });

      it('resolves with the resolution value of the returned Promise', () => {
        const actual = fromPromise((x, y, z) => Promise.resolve(z + 1), 1, 1, 1);
        return U.assertResolved(actual, 2);
      });

      it('rejects with rejection reason of the returned Promise', () => {
        const actual = fromPromise(_ => Promise.reject(U.error), 1, 1, 1);
        return U.assertRejected(actual, U.error);
      });

    });

  });

  describe('#toString()', () => {

    it('returns the code to create the FutureFromPromise', () => {
      const m1 = fromPromise(unaryNoop, null);
      const m2 = fromPromise(binaryNoop, null, null);
      const m3 = fromPromise(ternaryNoop, null, null, null);
      expect(m1.toString()).to.equal(
        'fromPromise(a => Promise.resolve(a), null)'
      );
      expect(m2.toString()).to.equal(
        'fromPromise2((a, b) => Promise.resolve(b), null, null)'
      );
      expect(m3.toString()).to.equal(
        'fromPromise3((a, b, c) => Promise.resolve(c), null, null, null)'
      );
    });

  });

});
