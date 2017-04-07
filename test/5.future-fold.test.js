import {expect} from 'chai';
import Future from '..';
import U from './util';
import type from 'sanctuary-type-identifiers';

const testInstance = fold => {

  it('is considered a member of fluture/Fluture', () => {
    expect(type(fold(Future.reject(1), U.add(1), U.sub(1)))).to.equal(Future['@@type']);
  });

  describe('#fork()', () => {

    it('resolves with the transformed rejection value', () => {
      return U.assertResolved(fold(Future.reject(1), U.add(1), U.sub(1)), 2);
    });

    it('resolves with the transformed resolution value', () => {
      return U.assertResolved(fold(Future.of(1), U.sub(1), U.add(1)), 2);
    });

  });

};

describe.skip('Future.fold()', () => {

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

describe.skip('Future#fold()', () => {

  testInstance((m, f, g) => m.fold(f, g));

});
