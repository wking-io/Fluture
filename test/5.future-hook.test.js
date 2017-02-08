'use strict';

const expect = require('chai').expect;
const Future = require('../fluture.js');
const U = require('./util');
const F = require('./futures');

const testInstance = hook => {

  describe('#fork()', () => {

    const m = F.resolved, xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];

    it('throws when the first function does not return Future', () => {
      const fs = xs.map(x => () => hook(m, () => x, () => m).fork(U.noop, U.noop));
      fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
    });

    it('throws when the second function does not return Future', () => {
      const fs = xs.map(x => () => hook(m, () => m, () => x).fork(U.noop, U.noop));
      fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
    });

    it('runs the first computation after the second, both with the resource', done => {
      let ran = false;
      hook(m,
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
      hook(m,
        _ => Future(_ => done()),
        _ => Future.reject(2)
      ).fork(U.noop, U.noop);
    });

    it('rejects with the rejection reason of the first', () => {
      const rejected = hook(m, _ => Future.reject(1), _ => Future.reject(2));
      const resolved = hook(m, _ => Future.reject(1), _ => Future.of(2));
      return Promise.all([
        U.assertRejected(rejected, 1),
        U.assertRejected(resolved, 1)
      ]);
    });

    it('assumes the state of the second if the first resolves', () => {
      const rejected = hook(m, _ => Future.of(1), _ => Future.reject(2));
      const resolved = hook(m, _ => Future.of(1), _ => Future.of(2));
      return Promise.all([
        U.assertRejected(rejected, 2),
        U.assertResolved(resolved, 2)
      ]);
    });

    it('does not hook after being cancelled', done => {
      hook(F.resolvedSlow, _ => Future.of('clean'), U.failRes).fork(U.failRej, U.failRes)();
      setTimeout(done, 25);
    });

    it('does not reject after being cancelled', done => {
      hook(F.rejectedSlow, _ => Future.of('clean'), U.failRes).fork(U.failRej, U.failRes)();
      hook(F.resolved, _ => Future.of('clean'), () => F.rejectedSlow).fork(U.failRej, U.failRes)();
      setTimeout(done, 25);
    });

    it('immediately runs and cancels the disposal Future when cancelled after acquire', done => {
      const cancel =
        hook(F.resolved, _ => Future(() => () => done()), () => F.resolvedSlow)
        .fork(U.failRej, U.failRes);
      setTimeout(cancel, 10);
    });

  });

  describe('#toString()', () => {

    it('returns the code to create the FutureHook', () => {
      const m = hook(Future.of(1), () => Future.of(2), () => Future.of(3));
      const s = 'Future.of(1).hook(() => Future.of(2), () => Future.of(3))';
      expect(m.toString()).to.equal(s);
    });

  });

};

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

  testInstance((m, f, g) => Future.hook(m, f, g));

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

  testInstance((m, f, g) => m.hook(f, g));

});
