import {expect} from 'chai';
import {Future, hook, of, reject} from '../index.es.js';
import * as U from './util';
import * as F from './futures';
import type from 'sanctuary-type-identifiers';

describe('hook()', () => {

  it('is a curried ternary function', () => {
    expect(hook).to.be.a('function');
    expect(hook.length).to.equal(3);
    expect(hook(of(1))).to.be.a('function');
    expect(hook(of(1))(U.noop)).to.be.a('function');
    expect(hook(of(1), U.noop)).to.be.a('function');
  });

  it('throws when not given a Future as first argument', () => {
    const f = () => hook(1);
    expect(f).to.throw(TypeError, /Future.*first/);
  });

  it('throws when not given a Function as second argument', () => {
    const f = () => hook(of(1), 1);
    expect(f).to.throw(TypeError, /Future.*second/);
  });

  it('throws when not given a Function as third argument', () => {
    const f = () => hook(of(1), U.add(1), 1);
    expect(f).to.throw(TypeError, /Future.*third/);
  });

  it('is considered a member of fluture/Fluture', () => {
    const m = hook(of(1), () => of(2), () => of(3));
    expect(type(m)).to.equal(Future['@@type']);
  });

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
        _ => reject(2)
      ).fork(U.noop, U.noop);
    });

    it('rejects with the rejection reason of the first', () => {
      const rejected = hook(m, _ => reject(1), _ => reject(2));
      const resolved = hook(m, _ => reject(1), _ => of(2));
      return Promise.all([
        U.assertRejected(rejected, 1),
        U.assertRejected(resolved, 1)
      ]);
    });

    it('assumes the state of the second if the first resolves', () => {
      const rejected = hook(m, _ => of(1), _ => reject(2));
      const resolved = hook(m, _ => of(1), _ => of(2));
      return Promise.all([
        U.assertRejected(rejected, 2),
        U.assertResolved(resolved, 2)
      ]);
    });

    it('does not hook after being cancelled', done => {
      hook(F.resolvedSlow, _ => of('dispose'), U.failRes).fork(U.failRej, U.failRes)();
      setTimeout(done, 25);
    });

    it('does not reject after being cancelled', done => {
      hook(F.rejectedSlow, _ => of('dispose'), U.failRes).fork(U.failRej, U.failRes)();
      hook(F.resolved, _ => of('dispose'), () => F.rejectedSlow).fork(U.failRej, U.failRes)();
      setTimeout(done, 25);
    });

    it('cancels acquire appropriately', done => {
      const acquire = Future(() => () => done());
      const cancel =
        hook(acquire, _ => of('dispose'), _ => of('consume'))
        .fork(U.failRej, U.failRes);
      setTimeout(cancel, 10);
    });

    it('cancels consume appropriately', done => {
      const consume = Future(() => () => done());
      const cancel =
        hook(F.resolved, _ => of('dispose'), _ => consume)
        .fork(U.failRej, U.failRes);
      setTimeout(cancel, 10);
    });

    it('cancels delayed consume appropriately', done => {
      const consume = Future(() => () => done());
      const cancel =
        hook(F.resolvedSlow, _ => of('dispose'), _ => consume)
        .fork(U.failRej, U.failRes);
      setTimeout(cancel, 25);
    });

    it('cancels dispose appropriately', done => {
      const dispose = Future(() => () => done());
      const cancel =
        hook(F.resolved, _ => dispose, _ => of('consume'))
        .fork(U.failRej, U.failRes);
      setTimeout(cancel, 10);
    });

    it('cancels delayed dispose appropriately', done => {
      const dispose = Future(() => () => done());
      const cancel =
        hook(F.resolved, _ => dispose, _ => F.resolvedSlow)
        .fork(U.failRej, U.failRes);
      setTimeout(cancel, 25);
    });

    it('immediately runs and cancels the disposal Future when cancelled after acquire', done => {
      const cancel =
        hook(F.resolved, _ => Future(() => () => done()), () => F.resolvedSlow)
        .fork(U.failRej, U.failRes);
      setTimeout(cancel, 10);
    });

  });

});
