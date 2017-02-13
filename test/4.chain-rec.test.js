'use strict';

const expect = require('chai').expect;
const Future = require('../fluture.js');
const ChainRec = Future.classes.ChainRec;
const U = require('./util');
const type = require('sanctuary-type-identifiers');

describe('Future.class()', () => {

  it('is a curried binary function', () => {
    expect(Future.chainRec).to.be.a('function');
    expect(Future.chainRec.length).to.equal(2);
    expect(Future.chainRec(U.noop)).to.be.a('function');
  });

  it('throws TypeError when not given a function', () => {
    const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];
    const fs = xs.map(x => _ => Future.chainRec(x, 1));
    fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
  });

  it('returns an instance of ChainRec', () => {
    expect(Future.chainRec(U.noop, 1)).to.be.an.instanceof(ChainRec);
  });

});

describe('ChainRec', () => {

  it('extends Future', () => {
    expect(new ChainRec).to.be.an.instanceof(Future);
  });

  it('is considered a member of fluture/Fluture', () => {
    expect(type(new ChainRec)).to.equal('fluture/Future');
  });

  describe('#fork()', () => {

    it('throws TypeError when the given function does not return a Future', () => {
      const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];
      const fs = xs.map(x => _ => new ChainRec((a, b, c) => (c, x), 1).fork(U.noop, U.noop));
      fs.forEach(f => expect(f).to.throw(TypeError, /Future.*first call/));
    });

    it('throws TypeError when the given function does not always return a Future', () => {
      const recur = (a, b, i) => i <= 6 ? Future.of(Future.util.Next(i + 1)) : 'hello';
      const f = _ => new ChainRec(recur, 1).fork(U.noop, U.noop);
      expect(f).to.throw(TypeError, /Future.*6/);
    });

    it('throws TypeError when the returned Future does not contain an iteration', () => {
      const xs = [null, '', {}, {value: 1, done: 1}];
      const fs = xs.map(x => _ =>
        new ChainRec((a, b, c) => Future.of((c, x)), 1).fork(U.noop, U.noop)
      );
      fs.forEach(f => expect(f).to.throw(TypeError, /Future.*first call/));
    });

    it('throws TypeError when the returned Future does not always contain an iteration', () => {
      const recur = (a, b, i) => i <= 6 ? Future.of(a(i + 1)) : Future.of('hello');
      const f = _ => new ChainRec(recur, 1).fork(U.noop, U.noop);
      expect(f).to.throw(TypeError, /Future.*6/);
    });

    it('does not break if the iteration does not contain a value key', () => {
      const actual = new ChainRec((f, g, x) => (x, Future.of({done: true})), 0);
      return U.assertResolved(actual, undefined);
    });

    it('calls the function with Next, Done and the initial value', () => {
      new ChainRec((f, g, x) => {
        expect(f).to.be.a('function');
        expect(f.length).to.equal(1);
        expect(f(x)).to.deep.equal(Future.util.Next(x));
        expect(g).to.be.a('function');
        expect(g.length).to.equal(1);
        expect(g(x)).to.deep.equal(Future.util.Done(x));
        expect(x).to.equal(42);
        return Future.of(g(x));
      }, 42).fork(U.noop, U.noop);
    });

    it('calls the function with the value from the current iteration', () => {
      let i = 0;
      new ChainRec((f, g, x) => {
        expect(x).to.equal(i);
        return x < 5 ? Future.of(f(++i)) : Future.of(g(x));
      }, i).fork(U.noop, U.noop);
    });

    it('works asynchronously', () => {
      const actual = new ChainRec((f, g, x) => Future.after(10, x < 5 ? f(x + 1) : g(x)), 0);
      return U.assertResolved(actual, 5);
    });

    it('responds to failure', () => {
      const m = new ChainRec((f, g, x) => Future.reject(x), 1);
      return U.assertRejected(m, 1);
    });

    it('responds to failure after chaining async', () => {
      const m = new ChainRec(
        (f, g, x) => x < 2 ? Future.after(10, f(x + 1)) : Future.reject(x), 0
      );
      return U.assertRejected(m, 2);
    });

    it('can be cancelled straight away', done => {
      new ChainRec((f, g, x) => Future.after(10, g(x)), 1).fork(U.failRej, U.failRes)();
      setTimeout(done, 20);
    });

    it('can be cancelled after some iterations', done => {
      const m = new ChainRec((f, g, x) => Future.after(10, x < 5 ? f(x + 1) : g(x)), 0);
      const cancel = m.fork(U.failRej, U.failRes);
      setTimeout(cancel, 25);
      setTimeout(done, 70);
    });

  });

  describe('#toString()', () => {

    it('returns the code to create the ChainRec', () => {
      const m = new ChainRec((next, done, x) => next(x), 1);
      const s = 'Future.chainRec((next, done, x) => next(x), 1)';
      expect(m.toString()).to.equal(s);
    });

  });

});
