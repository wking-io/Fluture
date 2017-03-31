import {expect} from 'chai';
import Future from '..';
import U from './util';
import F from './futures';
import type from 'sanctuary-type-identifiers';

const testInstance = fin => {

  it('is considered a member of fluture/Fluture', () => {
    expect(type(fin(Future.of(1), Future.of(2)))).to.equal('fluture/Future');
  });

  describe('#fork()', () => {

    it('runs the second Future when the first resolves', done => {
      fin(Future.of(1), Future.of(null).map(done)).fork(U.noop, U.noop);
    });

    it('runs the second Future when the first rejects', done => {
      fin(Future.reject(1), Future.of(null).map(done)).fork(U.noop, U.noop);
    });

    it('resolves with the resolution value of the first', () => {
      const actual = fin(Future.of(1), Future.of(2));
      return U.assertResolved(actual, 1);
    });

    it('rejects with the rejection reason of the first if the second resolves', () => {
      const actual = fin(Future.reject(1), Future.of(2));
      return U.assertRejected(actual, 1);
    });

    it('always rejects with the rejection reason of the second', () => {
      const actualResolved = fin(Future.of(1), Future.reject(2));
      const actualRejected = fin(Future.reject(1), Future.reject(2));
      return Promise.all([
        U.assertRejected(actualResolved, 2),
        U.assertRejected(actualRejected, 2)
      ]);
    });

    it('does nothing after being cancelled', done => {
      fin(F.resolvedSlow, F.resolved).fork(U.failRej, U.failRes)();
      fin(F.resolved, F.resolvedSlow).fork(U.failRej, U.failRes)();
      fin(F.rejectedSlow, F.rejected).fork(U.failRej, U.failRes)();
      fin(F.rejected, F.rejectedSlow).fork(U.failRej, U.failRes)();
      setTimeout(done, 25);
    });

    it('immediately runs and cancels the disposal Future when cancelled early', done => {
      const cancel = fin(F.resolvedSlow, Future(() => () => done())).fork(U.failRej, U.failRes);
      setTimeout(cancel, 10);
    });

  });

  describe('#toString()', () => {

    it('returns the code to create the FutureFinally', () => {
      const m = fin(Future.of(1), Future.of(2));
      const s = 'Future.of(1).finally(Future.of(2))';
      expect(m.toString()).to.equal(s);
    });

  });

};

describe.skip('Future.finally()', () => {

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

  testInstance((a, b) => Future.finally(b, a));

});

describe.skip('Future#finally()', () => {

  it('throws TypeError when invoked out of context', () => {
    const f = () => Future.of(1).finally.call(null, Future.of(1));
    expect(f).to.throw(TypeError, /Future/);
  });

  it('throw TypeError when not given a Future', () => {
    const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null, x => x];
    const fs = xs.map(x => () => Future.of(1).finally(x));
    fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
  });

  testInstance((a, b) => a.finally(b));

});
