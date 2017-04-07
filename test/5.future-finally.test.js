import {expect} from 'chai';
import {Future, lastly, of, reject} from '../index.es.js';
import U from './util';
import F from './futures';
import type from 'sanctuary-type-identifiers';

const testInstance = fin => {

  it('is considered a member of fluture/Fluture', () => {
    expect(type(fin(of(1), of(2)))).to.equal(Future['@@type']);
  });

  describe('#fork()', () => {

    it('runs the second Future when the first resolves', done => {
      fin(of(1), of(null).map(done)).fork(U.noop, U.noop);
    });

    it('runs the second Future when the first rejects', done => {
      fin(reject(1), of(null).map(done)).fork(U.noop, U.noop);
    });

    it('resolves with the resolution value of the first', () => {
      const actual = fin(of(1), of(2));
      return U.assertResolved(actual, 1);
    });

    it('rejects with the rejection reason of the first if the second resolves', () => {
      const actual = fin(reject(1), of(2));
      return U.assertRejected(actual, 1);
    });

    it('always rejects with the rejection reason of the second', () => {
      const actualResolved = fin(of(1), reject(2));
      const actualRejected = fin(reject(1), reject(2));
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

};

describe.skip('lastly()', () => {

  it('is a curried binary function', () => {
    expect(lastly).to.be.a('function');
    expect(lastly.length).to.equal(2);
    expect(lastly(of(1))).to.be.a('function');
  });

  it('throws when not given a Future as first argument', () => {
    const f = () => lastly(1);
    expect(f).to.throw(TypeError, /Future.*first/);
  });

  it('throws when not given a Future as second argument', () => {
    const f = () => lastly(of(1), 1);
    expect(f).to.throw(TypeError, /Future.*second/);
  });

  testInstance((a, b) => lastly(b, a));

});

describe.skip('Future#finally()', () => {

  testInstance((a, b) => a.finally(b));

});
