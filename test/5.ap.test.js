import {expect} from 'chai';
import {Future, ap, of, reject, after} from '../index.es.js';
import * as U from './util';
import * as F from './futures';
import type from 'sanctuary-type-identifiers';

const testInstance = ap => {

  it('is considered a member of fluture/Fluture', () => {
    expect(type(ap(of(1), of(U.add(1))))).to.equal(Future['@@type']);
  });

  describe('#fork()', () => {

    it('calls the function contained in the given Future to its contained value', () => {
      const actual = ap(of(1), of(U.add(1)));
      return U.assertResolved(actual, 2);
    });

    it('rejects if one of the two reject', () => {
      const left = ap(reject('err'), of(1));
      const right = ap(of(U.add(1)), reject('err'));
      return Promise.all([
        U.assertRejected(left, 'err'),
        U.assertRejected(right, 'err')
      ]);
    });

    it('does not matter if the left resolves late', () => {
      const actual = ap(after(20, 1), of(U.add(1)));
      return U.assertResolved(actual, 2);
    });

    it('does not matter if the right resolves late', () => {
      const actual = ap(of(1), after(20, U.add(1)));
      return U.assertResolved(actual, 2);
    });

    it('forks in sequence', done => {
      let running = true;
      const left = after(20, 1).map(x => { running = false; return x });
      const right = of(_ => { expect(running).to.equal(false); done() });
      ap(left, right).fork(U.noop, U.noop);
    });

    it('cancels the left Future if cancel is called while it is running', done => {
      const left = Future(() => () => done());
      const right = after(20, U.add(1));
      const cancel = ap(left, right).fork(U.noop, U.noop);
      cancel();
    });

    it('cancels the right Future if cancel is called while it is running', done => {
      const left = of(1);
      const right = Future(() => () => done());
      const cancel = ap(left, right).fork(U.noop, U.noop);
      cancel();
    });

  });

};

describe('ap()', () => {

  it('is a curried binary function', () => {
    expect(ap).to.be.a('function');
    expect(ap.length).to.equal(2);
    expect(ap(F.resolved)).to.be.a('function');
  });

  it('throws when not given a Function as first argument', () => {
    const f = () => ap(1);
    expect(f).to.throw(TypeError, /Future.*first/);
  });

  it('throws when not given a Future as second argument', () => {
    const f = () => ap(of(1), 1);
    expect(f).to.throw(TypeError, /Future.*second/);
  });

  testInstance((a, b) => ap(b, a));

});

describe('Future#ap()', () => {

  testInstance((a, b) => a.ap(b));

});
