'use strict';

const expect = require('chai').expect;
const Future = require('../fluture.js');
const U = require('./util');
const type = require('sanctuary-type-identifiers');

const testInstance = fold => {

  it('is considered a member of fluture/Fluture', () => {
    expect(type(fold(Future.reject(1), U.add(1), U.sub(1)))).to.equal('fluture/Future');
  });

  describe('#fork()', () => {

    it('resolves with the transformed rejection value', () => {
      return U.assertResolved(fold(Future.reject(1), U.add(1), U.sub(1)), 2);
    });

    it('resolves with the transformed resolution value', () => {
      return U.assertResolved(fold(Future.of(1), U.sub(1), U.add(1)), 2);
    });

  });

  describe('#toString()', () => {

    it('returns the code to create the FutureFold', () => {
      const m = fold(Future.of(1), x => x, y => y);
      const s = 'Future.of(1).fold(x => x, y => y)';
      expect(m.toString()).to.equal(s);
    });

  });

};

describe('Future.fold()', () => {

  it('is a curried ternary function', () => {
    expect(Future.fold).to.be.a('function');
    expect(Future.fold.length).to.equal(3);
    expect(Future.fold(U.noop)).to.be.a('function');
    expect(Future.fold(U.noop)(U.noop)).to.be.a('function');
    expect(Future.fold(U.noop, U.noop)).to.be.a('function');
  });

  it('throws when not given a Function as first argument', () => {
    const f = () => Future.fold(1);
    expect(f).to.throw(TypeError, /Future.*first/);
  });

  it('throws when not given a Function as second argument', () => {
    const f = () => Future.fold(U.add(1), 1);
    expect(f).to.throw(TypeError, /Future.*second/);
  });

  it('throws when not given a Future as third argument', () => {
    const f = () => Future.fold(U.add(1), U.add(1), 1);
    expect(f).to.throw(TypeError, /Future.*third/);
  });

  testInstance((m, f, g) => Future.fold(f, g, m));

});

describe('Future#fold()', () => {

  it('throws when invoked out of context', () => {
    const f = () => Future.of(1).fold.call(null, U.noop, U.noop);
    expect(f).to.throw(TypeError, /Future/);
  });

  it('throws TypeError when first argument is not a function', () => {
    const m = Future.of(1);
    const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];
    const fs = xs.map(x => () => m.fold(x, U.noop));
    fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
  });

  it('throws TypeError when second argument is not a function', () => {
    const m = Future.of(1);
    const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];
    const fs = xs.map(x => () => m.fold(U.noop, x));
    fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
  });

  testInstance((m, f, g) => m.fold(f, g));

});
