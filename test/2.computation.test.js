import {expect} from 'chai';
import Future from '../index.es.js';
import * as U from './util';
import type from 'sanctuary-type-identifiers';

describe('Future()', () => {

  it('is a unary function', () => {
    expect(Future).to.be.a('function');
    expect(Future.length).to.equal(1);
  });

  it('throws TypeError when not given a function', () => {
    const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];
    const fs = xs.map(x => () => Future(x));
    fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
  });

  it('returns a Future', () => {
    const actual = Future(U.noop);
    expect(actual).to.be.an.instanceof(Future);
  });

  it('can be called with "new", for those feeling particularly OO', () => {
    const actual = new Future(U.noop);
    expect(actual).to.be.an.instanceof(Future);
  });

});

describe('Computation', () => {

  it('extends Future', () => {
    expect(Future(U.noop)).to.be.an.instanceof(Future);
  });

  it('is considered a member of fluture/Fluture', () => {
    expect(type(Future(U.noop))).to.equal(Future['@@type']);
  });

  describe('#fork()', () => {

    it('throws TypeError when the computation returns nonsense', () => {
      const xs = [null, 1, _ => {}, (a, b) => b, 'hello'];
      const ms = xs.map(x => Future(_ => x));
      const fs = ms.map(m => () => m.fork(U.noop, U.noop));
      fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
    });

    it('does not throw when the computation returns a nullary function or void', () => {
      const xs = [undefined, () => {}];
      const ms = xs.map(x => Future(_ => x));
      const fs = ms.map(m => () => m.fork(U.noop, U.noop));
      fs.forEach(f => expect(f).to.not.throw(TypeError, /Future/));
    });

    it('ensures no continuations are called after the first resolve', done => {
      const actual = Future((rej, res) => {
        res(1);
        res(2);
        rej(3);
      });
      actual.fork(U.failRej, _ => done());
    });

    it('ensures no continuations are called after the first reject', done => {
      const actual = Future((rej, res) => {
        rej(1);
        rej(2);
        res(3);
      });
      actual.fork(_ => done(), U.failRes);
    });

    it('stops continuations from being called after cancellation', done => {
      Future((rej, res) => {
        setTimeout(res, 20, 1);
        setTimeout(rej, 20, 1);
      })
      .fork(U.failRej, U.failRes)();
      setTimeout(done, 25);
    });

    it('stops cancellation from being called after continuations', () => {
      const m = Future((rej, res) => {
        res(1);
        return () => { throw U.error };
      });
      const cancel = m.fork(U.failRej, U.noop);
      cancel();
    });

  });

  describe('#toString()', () => {

    it('returns a customized representation', () => {
      const m = Future(function(rej, res){ res() });
      expect(m.toString()).to.contain('Future');
    });

  });

});
