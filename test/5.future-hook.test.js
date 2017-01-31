'use strict';

const expect = require('chai').expect;
const Future = require('../fluture.js');
const FutureHook = Future.classes.FutureHook;
const U = require('./util');
const F = require('./futures');

describe('Future.hook()', () => {

  it('is a curried ternary function', () => {
    expect(Future.hook).to.be.a('function');
    expect(Future.hook.length).to.equal(3);
    expect(Future.hook(Future.of(1))).to.be.a('function');
    expect(Future.hook(Future.of(1))(U.noop)).to.be.a('function');
    expect(Future.hook(Future.of(1), U.noop)).to.be.a('function');
  });

  it('throws when not given a Future as first argument', () => {
    const f = () => Future.hook(1);
    expect(f).to.throw(TypeError, /Future.*first/);
  });

  it('throws when not given a Function as second argument', () => {
    const f = () => Future.hook(Future.of(1), 1);
    expect(f).to.throw(TypeError, /Future.*second/);
  });

  it('throws when not given a Function as third argument', () => {
    const f = () => Future.hook(Future.of(1), U.add(1), 1);
    expect(f).to.throw(TypeError, /Future.*third/);
  });

  it('returns an instance of FutureHook', () => {
    expect(Future.hook(F.resolved, U.noop, U.noop)).to.be.an.instanceof(FutureHook);
  });

});

describe('Future#hook()', () => {

  const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];

  it('throws when invoked out of context', () => {
    const f = () => Future.of(1).hook.call(null, U.noop);
    expect(f).to.throw(TypeError, /Future/);
  });

  it('throws when first argument is not a function', () => {
    const fs = xs.map(x => () => F.resolved.hook(x, U.noop));
    fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
  });

  it('throws when second argument is not a function', () => {
    const fs = xs.map(x => () => F.resolved.hook(U.noop, x));
    fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
  });

  it('returns an instance of FutureHook', () => {
    expect(F.resolved.hook(U.noop, U.noop)).to.be.an.instanceof(FutureHook);
  });

});

describe('FutureHook', () => {

  it('extends Future', () => {
    expect(new FutureHook).to.be.an.instanceof(Future);
  });

  describe('#fork()', () => {

    const m = F.resolved, xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];

    it('throws when the first function does not return Future', () => {
      const fs = xs.map(x => () => m.hook(() => x, () => m).fork(U.noop, U.noop));
      fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
    });

    it('throws when the second function does not return Future', () => {
      const fs = xs.map(x => () => m.hook(() => m, () => x).fork(U.noop, U.noop));
      fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
    });

    it('runs the first computation after the second, both with the resource', done => {
      let ran = false;
      m.hook(
        x => {
          expect(x).to.equal('resolved');
          return Future((rej, res) => res(done(ran ? null : new Error('Second did not run'))));
        },
        x => {
          expect(x).to.equal('resolved');
          return Future((rej, res) => res(ran = true));
        }
      ).fork(done, U.noop);
    });

    it('runs the first even if the second rejects', done => {
      m.hook(
        _ => Future(_ => done()),
        _ => Future.reject(2)
      ).fork(U.noop, U.noop);
    });

    it('rejects with the rejection reason of the first', () => {
      const rejected = m.hook(_ => Future.reject(1), _ => Future.reject(2));
      const resolved = m.hook(_ => Future.reject(1), _ => Future.of(2));
      return Promise.all([
        U.assertRejected(rejected, 1),
        U.assertRejected(resolved, 1)
      ]);
    });

    it('assumes the state of the second if the first resolves', () => {
      const rejected = m.hook(_ => Future.of(1), _ => Future.reject(2));
      const resolved = m.hook(_ => Future.of(1), _ => Future.of(2));
      return Promise.all([
        U.assertRejected(rejected, 2),
        U.assertResolved(resolved, 2)
      ]);
    });

    it('does not hook after being cancelled', done => {
      F.resolvedSlow.hook(_ => Future.of('cleanup'), U.failRes).fork(U.failRej, U.failRes)();
      setTimeout(done, 25);
    });

    it('does not reject after being cancelled', done => {
      F.rejectedSlow.hook(_ => Future.of('cleanup'), U.failRes).fork(U.failRej, U.failRes)();
      F.resolved.hook(_ => Future.of('cleanup'), () => F.rejectedSlow).fork(U.failRej, U.failRes)();
      setTimeout(done, 25);
    });

    it('immediately runs and cancels the disposal Future when cancelled after acquire', done => {
      const cancel = F.resolved
        .hook(_ => Future(() => () => done()), () => F.resolvedSlow)
        .fork(U.failRej, U.failRes);
      setTimeout(cancel, 10);
    });

  });

  describe('#toString()', () => {

    it('returns the code to create the FutureHook', () => {
      const m = Future.of(1).hook(() => Future.of(2), () => Future.of(3));
      const s = 'Future.of(1).hook(() => Future.of(2), () => Future.of(3))';
      expect(m.toString()).to.equal(s);
    });

  });

});
