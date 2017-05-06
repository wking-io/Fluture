import {expect} from 'chai';
import {Future, fold, of, reject} from '../index.es.js';
import * as U from './util';
import type from 'sanctuary-type-identifiers';

const testInstance = fold => {

  it('is considered a member of fluture/Fluture', () => {
    expect(type(fold(reject(1), U.add(1), U.sub(1)))).to.equal(Future['@@type']);
  });

  describe('#fork()', () => {

    it('resolves with the transformed rejection value', () => {
      return U.assertResolved(fold(reject(1), U.add(1), U.sub(1)), 2);
    });

    it('resolves with the transformed resolution value', () => {
      return U.assertResolved(fold(of(1), U.sub(1), U.add(1)), 2);
    });

  });

};

describe('fold()', () => {

  it('is a curried ternary function', () => {
    expect(fold).to.be.a('function');
    expect(fold.length).to.equal(3);
    expect(fold(U.noop)).to.be.a('function');
    expect(fold(U.noop)(U.noop)).to.be.a('function');
    expect(fold(U.noop, U.noop)).to.be.a('function');
  });

  it('throws when not given a Function as first argument', () => {
    const f = () => fold(1);
    expect(f).to.throw(TypeError, /Future.*first/);
  });

  it('throws when not given a Function as second argument', () => {
    const f = () => fold(U.add(1), 1);
    expect(f).to.throw(TypeError, /Future.*second/);
  });

  it('throws when not given a Future as third argument', () => {
    const f = () => fold(U.add(1), U.add(1), 1);
    expect(f).to.throw(TypeError, /Future.*third/);
  });

  testInstance((m, f, g) => fold(f, g, m));

});

describe('Future#fold()', () => {

  it('throws when invoked out of context', () => {
    const f = () => of(1).fold.call(null, U.noop, U.noop);
    expect(f).to.throw(TypeError, /Future/);
  });

  it('throws TypeError when first argument is not a function', () => {
    const m = of(1);
    const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];
    const fs = xs.map(x => () => m.fold(x, U.noop));
    fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
  });

  it('throws TypeError when second argument is not a function', () => {
    const m = of(1);
    const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];
    const fs = xs.map(x => () => m.fold(U.noop, x));
    fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
  });

  testInstance((m, f, g) => m.fold(f, g));

});
