'use strict';

const expect = require('chai').expect;
const Future = require('../fluture.js');
const FutureFinally = Future.classes.FutureFinally;
const U = require('./util');
const F = require('./futures');

describe('Future.finally()', () => {

  it('is a curried binary function', () => {
    expect(Future.finally).to.be.a('function');
    expect(Future.finally.length).to.equal(2);
    expect(Future.finally(Future.of(1))).to.be.a('function');
  });

  it('throws when not given a Future as first argument', () => {
    const f = () => Future.finally(1);
    expect(f).to.throw(TypeError, /Future.*first/);
  });

  it('throws when not given a Future as second argument', () => {
    const f = () => Future.finally(Future.of(1), 1);
    expect(f).to.throw(TypeError, /Future.*second/);
  });

  it('returns an instance of FutureFinally', () => {
    expect(Future.finally(F.resolved, F.resolved)).to.be.an.instanceof(FutureFinally);
  });

});

describe('Future#finally()', () => {

  it('throws TypeError when invoked out of context', () => {
    const f = () => Future.of(1).finally.call(null, Future.of(1));
    expect(f).to.throw(TypeError, /Future/);
  });

  it('throw TypeError when not given a Future', () => {
    const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null, x => x];
    const fs = xs.map(x => () => Future.of(1).finally(x));
    fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
  });

  it('returns an instance of FutureFinally', () => {
    expect(F.resolved.finally(F.resolved)).to.be.an.instanceof(FutureFinally);
  });

});

describe('FutureFinally', () => {

  it('extends Future', () => {
    expect(new FutureFinally).to.be.an.instanceof(Future);
  });

  describe('#fork()', () => {

    it('runs the second Future when the first resolves', done => {
      Future.of(1).finally(Future.of(null).map(done)).fork(U.noop, U.noop);
    });

    it('runs the second Future when the first rejects', done => {
      Future.reject(1).finally(Future.of(null).map(done)).fork(U.noop, U.noop);
    });

    it('resolves with the resolution value of the first', () => {
      const actual = Future.of(1).finally(Future.of(2));
      return U.assertResolved(actual, 1);
    });

    it('rejects with the rejection reason of the first if the second resolves', () => {
      const actual = Future.reject(1).finally(Future.of(2));
      return U.assertRejected(actual, 1);
    });

    it('always rejects with the rejection reason of the second', () => {
      const actualResolved = Future.of(1).finally(Future.reject(2));
      const actualRejected = Future.reject(1).finally(Future.reject(2));
      return Promise.all([
        U.assertRejected(actualResolved, 2),
        U.assertRejected(actualRejected, 2)
      ]);
    });

    it('does nothing after being cancelled', done => {
      F.resolvedSlow.finally(F.resolved).fork(U.failRej, U.failRes)();
      F.resolved.finally(F.resolvedSlow).fork(U.failRej, U.failRes)();
      F.rejectedSlow.finally(F.rejected).fork(U.failRej, U.failRes)();
      F.rejected.finally(F.rejectedSlow).fork(U.failRej, U.failRes)();
      setTimeout(done, 25);
    });

  });

  describe('#toString()', () => {

    it('returns the code to create the FutureFinally', () => {
      const m = Future.of(1).finally(Future.of(2));
      const s = 'Future.of(1).finally(Future.of(2))';
      expect(m.toString()).to.equal(s);
    });

  });

});
