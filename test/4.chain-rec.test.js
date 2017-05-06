import {expect} from 'chai';
import {Future, chainRec, of, after, reject} from '../index.es.js';
import {isIteration} from '../src/internal/iteration';
import * as U from './util';
import type from 'sanctuary-type-identifiers';

describe('chainRec()', () => {

  it('is a curried binary function', () => {
    expect(chainRec).to.be.a('function');
    expect(chainRec.length).to.equal(2);
    expect(chainRec(U.noop)).to.be.a('function');
  });

  it('throws TypeError when not given a function', () => {
    const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];
    const fs = xs.map(x => _ => chainRec(x, 1));
    fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
  });

  it('returns an instance of Future', () => {
    expect(chainRec(U.noop, 1)).to.be.an.instanceof(Future);
  });

});

describe('ChainRec', () => {

  it('extends Future', () => {
    expect(chainRec(U.noop, 1)).to.be.an.instanceof(Future);
  });

  it('is considered a member of fluture/Fluture', () => {
    expect(type(chainRec(U.noop, 1))).to.equal(Future['@@type']);
  });

  describe('#fork()', () => {

    it('throws TypeError when the given function does not return a Future', () => {
      const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];
      const fs = xs.map(x => _ => chainRec((a, b, c) => (c, x), 1).fork(U.noop, U.noop));
      fs.forEach(f => expect(f).to.throw(TypeError, /Future.*first call/));
    });

    it('throws TypeError when the given function does not always return a Future', () => {
      const recur = (next, done, i) => i <= 6 ? of(next(i + 1)) : 'hello';
      const f = _ => chainRec(recur, 1).fork(U.noop, U.noop);
      expect(f).to.throw(TypeError, /Future.*6/);
    });

    it('throws TypeError when the returned Future does not contain an iteration', () => {
      const xs = [null, '', {}, {value: 1, done: 1}];
      const fs = xs.map(x => _ =>
        chainRec((a, b, c) => of((c, x)), 1).fork(U.noop, U.noop)
      );
      fs.forEach(f => expect(f).to.throw(TypeError, /Future.*first call/));
    });

    it('throws TypeError when the returned Future does not always contain an iteration', () => {
      const recur = (a, b, i) => i <= 6 ? of(a(i + 1)) : of('hello');
      const f = _ => chainRec(recur, 1).fork(U.noop, U.noop);
      expect(f).to.throw(TypeError, /Future.*6/);
    });

    it('does not break if the iteration does not contain a value key', () => {
      const actual = chainRec((f, g, x) => (x, of({done: true})), 0);
      return U.assertResolved(actual, undefined);
    });

    it('calls the function with Next, Done and the initial value', () => {
      chainRec((next, done, x) => {
        expect(next).to.be.a('function');
        expect(next.length).to.equal(1);
        expect(next(x)).to.satisfy(isIteration);
        expect(done).to.be.a('function');
        expect(done.length).to.equal(1);
        expect(done(x)).to.satisfy(isIteration);
        expect(x).to.equal(42);
        return of(done(x));
      }, 42).fork(U.noop, U.noop);
    });

    it('calls the function with the value from the current iteration', () => {
      let i = 0;
      chainRec((f, g, x) => {
        expect(x).to.equal(i);
        return x < 5 ? of(f(++i)) : of(g(x));
      }, i).fork(U.noop, U.noop);
    });

    it('works asynchronously', () => {
      const actual = chainRec((f, g, x) => after(10, x < 5 ? f(x + 1) : g(x)), 0);
      return U.assertResolved(actual, 5);
    });

    it('responds to failure', () => {
      const m = chainRec((f, g, x) => reject(x), 1);
      return U.assertRejected(m, 1);
    });

    it('responds to failure after chaining async', () => {
      const m = chainRec(
        (f, g, x) => x < 2 ? after(10, f(x + 1)) : reject(x), 0
      );
      return U.assertRejected(m, 2);
    });

    it('can be cancelled straight away', done => {
      chainRec((f, g, x) => after(10, g(x)), 1).fork(U.failRej, U.failRes)();
      setTimeout(done, 20);
    });

    it('can be cancelled after some iterations', done => {
      const m = chainRec((f, g, x) => after(10, x < 5 ? f(x + 1) : g(x)), 0);
      const cancel = m.fork(U.failRej, U.failRes);
      setTimeout(cancel, 25);
      setTimeout(done, 70);
    });

  });

  describe('#toString()', () => {

    it('returns the code to create the ChainRec', () => {
      const f = (next, done, x) => next(x);
      const m = chainRec(f, 1);
      const s = `Future.chainRec(${f.toString()}, 1)`;
      expect(m.toString()).to.equal(s);
    });

  });

});
