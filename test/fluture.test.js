const expect = require('chai').expect;
const Future = require('../fluture');

const noop = () => {};
const identity = x => x;
const compose = f => g => x => f(g(x));
const add = a => b => a + b;
const mult = a => b => a * b;
const error = new Error('It broke');

const failRes = x => {
  throw new Error(`Invalidly entered resolution branch with value ${x}`);
};

const failRej = x => {
  throw new Error(`Invalidly entered rejection branch with value ${x}`);
};

const assertEqual = (a, b) => new Promise(done =>
  a.fork(failRej, a => b.fork(failRej, b => (
    expect(a).to.equal(b),
    done()
  )))
);

const assertResolved = (m, x) => new Promise(done => m.fork(
  failRej,
  y => (expect(y).to.equal(x), done())
));

const assertRejected = (m, x) => new Promise(done => m.fork(
  y => (expect(y).to.equal(x), done()),
  failRes
));

describe('Future', () => {

  describe('constructor', () => {

    it('is a unary function', () => {
      expect(Future).to.be.a('function');
      expect(Future.length).to.equal(1);
    });

    it('throws TypeError when not given a function', () => {
      const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];
      const fs = xs.map(x => () => Future(x));
      fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
    });

    it('returns a Future when given a function', () => {
      const actual = Future(noop);
      expect(actual).to.be.an.instanceof(Future);
    });

  });

  describe('.of()', () => {

    it('returns an instance of Future', () => {
      expect(Future.of(1)).to.be.an.instanceof(Future);
    });

    it('treats the value as inner', () => {
      const m = Future.of(1);
      return assertResolved(m, 1);
    });

  });

  describe('.reject()', () => {

    it('returns an instance of Future', () => {
      expect(Future.reject(1)).to.be.an.instanceof(Future);
    });

    it('treats the value as inner', () => {
      const m = Future.reject(1);
      return assertRejected(m, 1);
    });

  });

  describe('#fork()', () => {

    it('throws TypeError when first argument is not a function', () => {
      const m = Future.of(1);
      const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];
      const fs = xs.map(x => () => m.fork(x, noop));
      fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
    });

    it('throws TypeError when second argument is not a function', () => {
      const m = Future.of(1);
      const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];
      const fs = xs.map(x => () => m.fork(noop, x));
      fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
    });

    it('does not throw when both arguments are functions', () => {
      const m = Future.of(1);
      const f = () => m.fork(noop, noop);
      expect(f).to.not.throw(TypeError);
    });

    it('passes rejection value to first argument', () => {
      const m = Future.reject(1);
      m.fork(x => expect(x).to.equal(1), failRes);
    });

    it('passes resolution value to second argument', () => {
      const m = Future.of(1);
      m.fork(failRej, x => expect(x).to.equal(1));
    });

  });

  describe('#chain()', () => {

    const m = Future.of(1);
    const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];

    it('throws TypeError when not given a function', () => {
      const fs = xs.map(x => () => m.chain(x));
      fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
    });

    it('throws TypeError when the given function does not return Future', () => {
      const fs = xs.map(x => () => m.chain(() => x).fork(noop, noop));
      fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
    });

    it('calls the given function with the inner of the Future', () => {
      m.chain(x => (expect(x).to.equal(1), Future.of(null))).fork(noop, noop);
    });

    it('returns a Future with an inner equal to the returned Future', () => {
      const actual = m.chain(() => Future.of(2));
      return assertResolved(actual, 2);
    });

  });

  describe('#ap()', () => {

    it('throws TypeError when not given Future', () => {
      const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null, x => x];
      const fs = xs.map(x => () => Future.of(noop).ap(x));
      fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
    });

    it('throws TypeError when not not called on Future<Function>', () => {
      const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];
      const fs = xs.map(x => () => Future.of(x).ap(Future.of(1)).fork(noop, noop));
      fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
    });

    it('applies its inner to the inner of the other', () => {
      const actual = Future.of(add(1)).ap(Future.of(1));
      return assertResolved(actual, 2);
    });

  });

  describe('#map()', () => {

    it('throws TypeError when not given a function', () => {
      const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];
      const fs = xs.map(x => () => Future.of(1).map(x));
      fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
    });

    it('applies the given function to its inner', () => {
      const actual = Future.of(1).map(add(1));
      return assertResolved(actual, 2);
    });

  });

  describe('#toString()', () => {

    it('returns a string representation', () => {
      const actual = Future(x => x).toString();
      expect(actual).to.equal('Future(x => x)');
    });

  });

});

describe('Lawfullness', () => {

  describe('Functor', () => {

    it('identity', () => {
      const a = Future.of(1);
      const b = a.map(identity);
      return assertEqual(a, b);
    });

    it('composition', () => {
      const x = Future.of(1);
      const a = x.map(compose(mult(2))(add(1)));
      const b = x.map(add(1)).map(mult(2));
      return assertEqual(a, b);
    });

  });

  describe('Apply', () => {

    it('composition', () => {
      const f = Future.of(mult(2));
      const g = Future.of(add(1));
      const x = Future.of(1);
      const a = f.map(compose).ap(g).ap(x);
      const b = f.ap(g.ap(x));
      return assertEqual(a, b);
    });

  });

  describe('Applicative', () => {

    it('identity', () => {
      const a = Future.of(1);
      const b = Future.of(identity).ap(a);
      return assertEqual(a, b);
    });

    it('homomorphism', () => {
      const f = add(1);
      const x = 1;
      const a = Future.of(f).ap(Future.of(x));
      const b = Future.of(f(x));
      return assertEqual(a, b);
    });

    it('interchange', () => {
      const f = Future.of(add(1));
      const x = 1;
      const a = f.ap(Future.of(x));
      const b = Future.of(g => g(x)).ap(f);
      return assertEqual(a, b);
    });

  });

  describe('Chain', () => {

    it('associativity', () => {
      const x = Future.of(1);
      const f = compose(Future.of)(add(1));
      const g = compose(Future.of)(mult(2));
      const a = x.chain(f).chain(g);
      const b = x.chain(x => f(x).chain(g));
      return assertEqual(a, b);
    });

  });

});

describe('Utilities', () => {

  describe('.liftNode()', () => {

    const nodeCallbackRes = f => f(null, 'It worked');
    const nodeCallbackErr = f => f(error);

    it('returns a function that returns a Future', () => {
      const f = Future.liftNode(noop);
      expect(f).to.be.a('function');
      expect(f()).to.be.an.instanceof(Future);
    });

    it('the Future resolves with a node-style result', () => {
      const f = Future.liftNode(nodeCallbackRes);
      return assertResolved(f(), 'It worked');
    });

    it('the Future rejects with a node-style error', () => {
      const f = Future.liftNode(nodeCallbackErr);
      return assertRejected(f(), error);
    });

  });

  describe('.liftPromise()', () => {

    const promiseRes = () => new Promise(res => res('It worked'));
    const promiseRej = () => new Promise((res, rej) => rej(error));

    it('returns a function that returns a Future', () => {
      const f = Future.liftPromise(noop);
      expect(f).to.be.a('function');
      expect(f()).to.be.an.instanceof(Future);
    });

    it('the Future resolves with the value of the resolved Promise', () => {
      const f = Future.liftPromise(promiseRes);
      return assertResolved(f(), 'It worked');
    });

    it('the Future rejects with the value of the rejected Promise', () => {
      const f = Future.liftPromise(promiseRej);
      return assertRejected(f(), error);
    });

  });

  describe('.try()', () => {

    it('returns a Future which resolves with the return value of the function', () => {
      const actual = Future.try(() => 1);
      return assertResolved(actual, 1);
    });

    it('returns a Future which rejects with the exception thrown by the function', () => {
      const actual = Future.try(() => {
        throw error;
      });
      return assertRejected(actual, error);
    });

  });

  describe('.after()', () => {

    it('is curried', () => {
      expect(Future.after(20)).to.be.a('function');
    });

    it('returns a Future which eventually resolves with the given value', () => {
      const actual = Future.after(20, 1);
      return assertResolved(actual, 1);
    });

  });

});
