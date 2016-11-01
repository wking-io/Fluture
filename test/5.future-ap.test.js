'use strict';

const expect = require('chai').expect;
const Future = require('../fluture.js');
const FutureAp = Future.classes.FutureAp;
const U = require('./util');
const F = require('./futures');

describe('Future.ap()', () => {

  it('is a curried binary function', () => {
    expect(Future.ap).to.be.a('function');
    expect(Future.ap.length).to.equal(2);
    expect(Future.ap(F.resolved)).to.be.a('function');
  });

  it('throws when not given a Function as first argument', () => {
    const f = () => Future.ap(1);
    expect(f).to.throw(TypeError, /Future.*first/);
  });

  it('throws when not given a Future as second argument', () => {
    const f = () => Future.ap(Future.of(1), 1);
    expect(f).to.throw(TypeError, /Future.*second/);
  });

  it('returns a FutureAp', () => {
    const actual = Future.ap(Future.of(1), Future.of(U.add(1)));
    expect(actual).to.be.an.instanceof(Future.classes.FutureAp);
  });

});

describe('Future#ap()', () => {

  it('throws when invoked out of context', () => {
    const f = () => Future.of(1).ap.call(null, Future.of(1));
    expect(f).to.throw(TypeError, /Future/);
  });

  it('throws TypeError when not given Future', () => {
    const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null, x => x];
    const fs = xs.map(x => () => Future.of(U.noop).ap(x));
    fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
  });

  it('throws TypeError when not not called with Future<Function>', () => {
    const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];
    const fs = xs.map(x => () => Future.of(1).ap(Future.of(x)).fork(U.noop, U.noop));
    fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
  });

  it('returns an instance of FutureAp', () => {
    expect(F.resolved.ap(F.resolved)).to.be.an.instanceof(FutureAp);
  });

});

describe('FutureAp', () => {

  it('extends Future', () => {
    expect(new FutureAp).to.be.an.instanceof(Future);
  });

  describe('#fork()', () => {

    it('calls the function contained in the given Future to its contained value', () => {
      const actual = Future.of(1).ap(Future.of(U.add(1)));
      return U.assertResolved(actual, 2);
    });

    it('rejects if one of the two reject', () => {
      const left = Future.reject('err').ap(Future.of(1));
      const right = Future.of(U.add(1)).ap(Future.reject('err'));
      return Promise.all([
        U.assertRejected(left, 'err'),
        U.assertRejected(right, 'err')
      ]);
    });

    it('does not matter if the left resolves late', () => {
      const actual = Future.after(20, 1).ap(Future.of(U.add(1)));
      return U.assertResolved(actual, 2);
    });

    it('does not matter if the right resolves late', () => {
      const actual = Future.of(1).ap(Future.after(20, U.add(1)));
      return U.assertResolved(actual, 2);
    });

    it('forks in sequence', done => {
      let running = true;
      const left = Future.after(20, 1).map(_ => { running = false });
      const right = Future.of(_ => { expect(running).to.equal(false); done() });
      left.ap(right).fork(U.noop, U.noop);
    });

    it('cancels the left Future if cancel is called while it is running', done => {
      const left = Future(() => () => done());
      const right = Future.after(20, U.add(1));
      const cancel = left.ap(right).fork(U.noop, U.noop);
      cancel();
    });

    it('cancels the right Future if cancel is called while it is running', done => {
      const left = Future.of(1);
      const right = Future(() => () => done());
      const cancel = left.ap(right).fork(U.noop, U.noop);
      cancel();
    });

  });

  describe('#toString()', () => {

    it('returns the code to create the FutureAp', () => {
      const m = Future.of(1).ap(Future.of(x => x));
      const s = 'Future.of(1).ap(Future.of(x => x))';
      expect(m.toString()).to.equal(s);
    });

  });

});
