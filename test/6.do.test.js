import {expect} from 'chai';
import {Future, go, of, after} from '../index.es.js';
import * as U from './util';

describe('go()', () => {

  it('throws TypeError when not given a function', () => {
    const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];
    const fs = xs.map(x => () => go(x));
    fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
  });

});

describe('Go', () => {

  describe('#fork()', () => {

    it('throws TypeError when the given function does not return an interator', () => {
      const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null, () => {}, {next: 'hello'}];
      const fs = xs.map(x => () => go(() => x).fork(U.noop, U.noop));
      fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
    });

    it('throws TypeError when the returned iterator does not return a valid iteration', () => {
      const xs = [null, '', {}, {value: 1, done: 1}];
      const fs = xs.map(x => () => go(() => ({next: () => x})).fork(U.noop, U.noop));
      fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
    });

    it('throws TypeError when the returned iterator produces something other than a Future', () => {
      const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];
      const fs = xs.map(x => () =>
        go(() => ({next: () => ({done: false, value: x})})).fork(U.noop, U.noop)
      );
      fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
    });

    it('handles synchronous Futures', () => {
      return U.assertResolved(go(function*(){
        const a = yield of(1);
        const b = yield of(2);
        return a + b;
      }), 3);
    });

    it('handles asynchronous Futures', () => {
      return U.assertResolved(go(function*(){
        const a = yield after(10, 1);
        const b = yield after(10, 2);
        return a + b;
      }), 3);
    });

    it('does not mix state over multiple forks', () => {
      const m = go(function*(){
        const a = yield of(1);
        const b = yield after(10, 2);
        return a + b;
      });
      return Promise.all([
        U.assertResolved(m, 3),
        U.assertResolved(m, 3)
      ]);
    });

    it('is stack safe', () => {
      const gen = function*(){
        let i = 0;
        while(i < U.STACKSIZE + 1) yield of(i++);
        return i;
      };
      const m = go(gen);
      return U.assertResolved(m, U.STACKSIZE + 1);
    });

    it('cancels the running operation when cancelled', done => {
      const cancel = go(function*(){
        yield of(1);
        yield Future(() => () => done());
      }).fork(U.noop, U.noop);
      cancel();
    });

  });

  describe('#toString()', () => {

    it('returns the code to create the Go', () => {
      const f = function*(){};
      const m = go(f);
      const s = `Future.do(${f.toString()})`;
      expect(m.toString()).to.equal(s);
    });

  });

});
