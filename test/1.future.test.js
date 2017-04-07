import {expect} from 'chai';
import Future from '..';
import U from './util';
import F from './futures';
import type from 'sanctuary-type-identifiers';

describe('Future', () => {

  it('instances are considered members of fluture/Future by sanctuary-type-identifiers', () => {
    expect(type(F.mock)).to.equal(Future['@@type']);
  });

  describe('.isFuture()', () => {

    const ms = [F.mock];
    const xs = [NaN, 1, true, undefined, null, [], {}, {fork: (a, b) => ({a, b})}];

    it('returns true when given a Future', () => {
      ms.forEach(m => expect(Future.isFuture(m)).to.equal(true));
    });

    it('returns false when not given a Future', () => {
      xs.forEach(x => expect(Future.isFuture(x)).to.equal(false));
    });

  });

  describe('.fork()', () => {

    it('is a curried ternary function', () => {
      expect(Future.fork).to.be.a('function');
      expect(Future.fork.length).to.equal(3);
      expect(Future.fork(U.noop)).to.be.a('function');
      expect(Future.fork(U.noop, U.noop)).to.be.a('function');
    });

    it('throws when not given a Function as first argument', () => {
      const f = () => Future.fork(1);
      expect(f).to.throw(TypeError, /Future.*first/);
    });

    it('throws when not given a Function as second argument', () => {
      const f = () => Future.fork(U.add(1), 1);
      expect(f).to.throw(TypeError, /Future.*second/);
    });

    it('throws when not given a Future as third argument', () => {
      const f = () => Future.fork(U.add(1), U.add(1), 1);
      expect(f).to.throw(TypeError, /Future.*third/);
    });

    it('dispatches to #_fork()', done => {
      const a = () => {};
      const b = () => {};
      const mock = Object.create(F.mock);
      mock._fork = (x, y) => {
        expect(x).to.equal(a);
        expect(y).to.equal(b);
        done();
      };
      Future.fork(a, b, mock);
    });

  });

  describe('.value()', () => {

    it('is a curried binary function', () => {
      expect(Future.value).to.be.a('function');
      expect(Future.value.length).to.equal(2);
      expect(Future.value(U.noop)).to.be.a('function');
    });

    it('throws when not given a Function as first argument', () => {
      const f = () => Future.value(1);
      expect(f).to.throw(TypeError, /Future.*first/);
    });

    it('throws when not given a Future as second argument', () => {
      const f = () => Future.value(U.add(1), 1);
      expect(f).to.throw(TypeError, /Future.*second/);
    });

    it('dispatches to #value()', done => {
      const a = () => {};
      const mock = Object.create(F.mock);
      mock.value = x => {
        expect(x).to.equal(a);
        done();
      };
      Future.value(a, mock);
    });

  });

  describe('.promise()', () => {

    it('throws when not given a Future', () => {
      const f = () => Future.promise(1);
      expect(f).to.throw(TypeError, /Future/);
    });

    it('dispatches to #promise', done => {
      const mock = Object.create(F.mock);
      mock.promise = done;
      Future.promise(mock);
    });

  });

  describe.skip('.seq()', () => {

    it('throws when not given a Parallel', () => {
      const f = () => Future.seq(1);
      expect(f).to.throw(TypeError, /Future/);
    });

    it('returns the Future contained in the Parallel', () => {
      const par = Future.Par(F.mock);
      const seq = Future.seq(par);
      expect(seq).to.equal(F.mock);
    });

  });

  describe('.extractLeft()', () => {

    it('throws when not given a Future', () => {
      const f = () => Future.extractLeft(1);
      expect(f).to.throw(TypeError, /Future/);
    });

    it('dispatches to #extractLeft', done => {
      const mock = Object.create(F.mock);
      mock.extractLeft = done;
      Future.extractLeft(mock);
    });

  });

  describe('.extractRight()', () => {

    it('throws when not given a Future', () => {
      const f = () => Future.extractRight(1);
      expect(f).to.throw(TypeError, /Future/);
    });

    it('dispatches to #extractRight', done => {
      const mock = Object.create(F.mock);
      mock.extractRight = done;
      Future.extractRight(mock);
    });

  });

  describe('#fork()', () => {

    it('does not throw when both arguments are functions', () => {
      const f = () => F.mock.fork(U.noop, U.noop);
      expect(f).to.not.throw(TypeError);
    });

    it('dispatches to #_fork()', done => {
      const mock = Object.create(Future.prototype);
      const a = () => {};
      const b = () => {};
      mock._fork = (x, y) => {
        expect(x).to.equal(a);
        expect(y).to.equal(b);
        done();
      };
      mock.fork(a, b);
    });

  });

  describe('#value()', () => {

    it('dispatches to #_fork(), using the input as resolution callback', done => {
      const mock = Object.create(Future.prototype);
      const res = () => {};
      mock._fork = (l, r) => {
        expect(r).to.equal(res);
        done();
      };
      mock.value(res);
    });

    it('throws when _f calls the rejection callback', () => {
      const mock = Object.create(Future.prototype);
      mock._fork = l => {l(1)};
      expect(() => mock.value(U.noop)).to.throw(Error);
    });

    it('returns the return value of #_fork()', () => {
      const mock = Object.create(Future.prototype);
      const sentinel = {};
      mock._fork = () => sentinel;
      expect(mock.value(U.noop)).to.equal(sentinel);
    });

  });

  describe('#promise()', () => {

    it('returns a Promise', () => {
      const actual = F.mock.promise();
      expect(actual).to.be.an.instanceof(Promise);
    });

    it('resolves if the Future resolves', done => {
      const mock = Object.create(Future.prototype);
      mock._fork = (l, r) => r(1);
      mock.promise().then(
        x => (expect(x).to.equal(1), done()),
        done
      );
    });

    it('rejects if the Future rejects', done => {
      const mock = Object.create(Future.prototype);
      mock._fork = l => l(1);
      mock.promise().then(
        () => done(new Error('It resolved')),
        x => (expect(x).to.equal(1), done())
      );
    });

  });

  describe('#extractLeft()', () => {

    it('returns empty array', () => {
      expect(F.mock.extractLeft()).to.deep.equal([]);
    });

  });

  describe('#extractRight()', () => {

    it('returns empty array', () => {
      expect(F.mock.extractRight()).to.deep.equal([]);
    });

  });

});
