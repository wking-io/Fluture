'use strict';

const expect = require('chai').expect;
const Future = require('../fluture.js');
const U = require('./util');
const F = require('./futures');
const S = require('sanctuary');

describe('Future', () => {

  it('instances are considered members of Future through @@type', () => {
    expect(S.type(F.mock)).to.equal('fluture/Future');
    expect(S.is(Future, F.mock)).to.equal(true);
  });

  describe('.util', () => {

    const util = Future.util;

    describe('.isForkable()', () => {

      const ms = [{fork: (a, b) => ({a, b})}, {fork: (a, b, c) => ({a, b, c})}];
      const xs = [NaN, 1, true, undefined, null, [], {}, {fork: true}, {fork: () => {}}];

      it('returns true when given a Forkable', () => {
        ms.forEach(m => expect(util.isForkable(m)).to.equal(true));
      });

      it('returns false when not given a Forkable', () => {
        xs.forEach(x => expect(util.isForkable(x)).to.equal(false));
      });

    });

    describe('.isFuture()', () => {

      const ms = [F.mock];
      const xs = [NaN, 1, true, undefined, null, [], {}, {fork: (a, b) => ({a, b})}];

      it('returns true when given a Future', () => {
        ms.forEach(m => expect(util.isFuture(m)).to.equal(true));
      });

      it('returns false when not given a Future', () => {
        xs.forEach(x => expect(util.isFuture(x)).to.equal(false));
      });

    });

    describe('.isThenable()', () => {

      const ps = [
        Promise.resolve(1),
        Promise.reject(1),
        new Promise(U.noop),
        {then: U.noop},
        {then: a => a},
        {then: (a, b) => b}
      ];

      const values = [NaN, 1, true, undefined, null, [], {}];
      const xs = values.concat([U.noop]).concat(values.map(x => ({then: x})));

      it('returns true when given a Thenable', () => {
        ps.forEach(p => expect(util.isThenable(p)).to.equal(true));
      });

      it('returns false when not given a Thenable', () => {
        xs.forEach(x => expect(util.isThenable(x)).to.equal(false));
      });

    });

    describe('.isFunction()', () => {

      const fs = [() => {}, function(){}, Future];
      const xs = [NaN, 1, true, undefined, null, [], {}];

      it('returns true when given a Function', () => {
        fs.forEach(f => expect(util.isFunction(f)).to.equal(true));
      });

      it('returns false when not given a Function', () => {
        xs.forEach(x => expect(util.isFunction(x)).to.equal(false));
      });

    });

    describe('.isBinary()', () => {

      const fs = [(a, b) => b, (a, b, c) => c];
      const xs = [U.noop, a => a];

      it('returns true when given a binary Function', () => {
        fs.forEach(f => expect(util.isBinary(f)).to.equal(true));
      });

      it('returns false when not given a binary Function', () => {
        xs.forEach(x => expect(util.isBinary(x)).to.equal(false));
      });

    });

    describe('.isTernary()', () => {

      const fs = [(a, b, c) => c, (a, b, c, d) => d];
      const xs = [U.noop, a => a, (a, b) => b];

      it('returns true when given a ternary Function', () => {
        fs.forEach(f => expect(util.isTernary(f)).to.equal(true));
      });

      it('returns false when not given a ternary Function', () => {
        xs.forEach(x => expect(util.isTernary(x)).to.equal(false));
      });

    });

    describe('.isPositiveInteger()', () => {

      const is = [1, 2, 99999999999999999999, Infinity];
      const xs = [NaN, 0, -0, -1, -99999999999999999, -Infinity, '1', [], {}];

      it('returns true when given a PositiveInteger', () => {
        is.forEach(i => expect(util.isPositiveInteger(i)).to.equal(true));
      });

      it('returns false when not given a PositiveInteger', () => {
        xs.forEach(x => expect(util.isPositiveInteger(x)).to.equal(false));
      });

    });

    describe('.isObject()', () => {

      function O(){}
      const os = [{}, {foo: 1}, Object.create(null), new O, []];
      const xs = [1, true, NaN, null, undefined, ''];

      it('returns true when given an Object', () => {
        os.forEach(i => expect(util.isObject(i)).to.equal(true));
      });

      it('returns false when not given an Object', () => {
        xs.forEach(x => expect(util.isObject(x)).to.equal(false));
      });

    });

    describe('.isIterator()', () => {

      const is = [{next: () => {}}, {next: x => x}, (function*(){}())];
      const xs = [1, true, NaN, null, undefined, '', {}, {next: 1}];

      it('returns true when given an Iterator', () => {
        is.forEach(i => expect(util.isIterator(i)).to.equal(true));
      });

      it('returns false when not given an Iterator', () => {
        xs.forEach(x => expect(util.isIterator(x)).to.equal(false));
      });

    });

    describe('.isIteration()', () => {

      const is = [{done: true}, {value: 2, done: false}, (function*(){}()).next()];
      const xs = [null, '', {}, {value: 1, done: 1}];

      it('returns true when given an Iteration', () => {
        is.forEach(i => expect(util.isIteration(i)).to.equal(true));
      });

      it('returns false when not given an Iteration', () => {
        xs.forEach(x => expect(util.isIteration(x)).to.equal(false));
      });

    });

    describe('.padf()', () => {

      it('left-pads string representations of functions', () => {
        const f = () => {
          return 42;
        };
        const input = f.toString();
        const inputLines = input.split('\n');
        const actualLines = util.padf('--', input).split('\n');
        expect(actualLines[0]).to.equal(inputLines[0]);
        expect(actualLines[1]).to.equal('--' + inputLines[1]);
        expect(actualLines[2]).to.equal('--' + inputLines[2]);
      });

    });

    describe('.fid()', () => {

      it('returns the name of a function', () => {
        function foo(){}
        expect(util.fid(foo)).to.equal('foo');
      });

      it('returns <anonymous> for unnamed functions', () => {
        expect(util.fid(() => {})).to.equal('<anonymous>');
      });

    });

    describe('.unaryPartial()', () => {

      it('can partially apply binary functions', () => {
        function binary(a, b){ return a + b }
        expect(util.unaryPartial(binary, 1)(1)).to.equal(2);
      });

      it('can partially apply ternary functions', () => {
        function ternary(a, b, c){ return a + b + c }
        expect(util.unaryPartial(ternary, 1)(1, 1)).to.equal(3);
      });

      it('can partially apply quaternary functions', () => {
        function quaternary(a, b, c, d){ return a + b + c + d }
        expect(util.unaryPartial(quaternary, 1)(1, 1, 1)).to.equal(4);
      });

    });

    describe('.binaryPartial()', () => {

      it('can partially apply ternary functions', () => {
        function ternary(a, b, c){ return a + b + c }
        expect(util.binaryPartial(ternary, 1, 1)(1)).to.equal(3);
      });

      it('can partially apply quaternary functions', () => {
        function quaternary(a, b, c, d){ return a + b + c + d }
        expect(util.binaryPartial(quaternary, 1, 1)(1, 1)).to.equal(4);
      });

    });

    describe('.ternaryPartial()', () => {

      it('can partially apply quaternary functions', () => {
        function quaternary(a, b, c, d){ return a + b + c + d }
        expect(util.ternaryPartial(quaternary, 1, 1, 1)(1)).to.equal(4);
      });

    });

    describe('.Next()', () => {

      it('returns an uncomplete Iteration of the given value', () => {
        const actual = util.Next(42);
        expect(util.isIteration(actual)).to.equal(true);
        expect(actual.done).to.equal(false);
        expect(actual.value).to.equal(42);
      });

    });

    describe('.Done()', () => {

      it('returns a complete Iteration of the given value', () => {
        const actual = util.Done(42);
        expect(util.isIteration(actual)).to.equal(true);
        expect(actual.done).to.equal(true);
        expect(actual.value).to.equal(42);
      });

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

    it('dispatches to #_f()', done => {
      const a = () => {};
      const b = () => {};
      const mock = Object.create(F.mock);
      mock._f = (x, y) => {
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

    it('throws when invoked out of context', () => {
      const f = () => Future.prototype.fork.call(null, U.noop, U.noop);
      expect(f).to.throw(TypeError, /Future/);
    });

    it('throws TypeError when first argument is not a function', () => {
      const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];
      const fs = xs.map(x => () => F.mock.fork(x, U.noop));
      fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
    });

    it('throws TypeError when second argument is not a function', () => {
      const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];
      const fs = xs.map(x => () => F.mock.fork(U.noop, x));
      fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
    });

    it('does not throw when both arguments are functions', () => {
      const f = () => F.mock.fork(U.noop, U.noop);
      expect(f).to.not.throw(TypeError);
    });

    it('dispatches to #_f()', done => {
      const mock = Object.create(Future.prototype);
      const a = () => {};
      const b = () => {};
      mock._f = (x, y) => {
        expect(x).to.equal(a);
        expect(y).to.equal(b);
        done();
      };
      mock.fork(a, b);
    });

  });

  describe('#value()', () => {

    it('throws when invoked out of context', () => {
      const f = () => F.mock.value.call(null, U.noop);
      expect(f).to.throw(TypeError, /Future/);
    });

    it('throws TypeError when not given a function', () => {
      const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];
      const fs = xs.map(x => () => F.mock.value(x));
      fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
    });

    it('dispatches to #_f(), using the input as resolution callback', done => {
      const mock = Object.create(Future.prototype);
      const res = () => {};
      mock._f = (l, r) => {
        expect(r).to.equal(res);
        done();
      };
      mock.value(res);
    });

    it('throws when _f calls the rejection callback', () => {
      const mock = Object.create(Future.prototype);
      mock._f = l => {l(1)};
      expect(() => mock.value(U.noop)).to.throw(Error);
    });

    it('returns the return value of #_f()', () => {
      const mock = Object.create(Future.prototype);
      const sentinel = {};
      mock._f = () => sentinel;
      expect(mock.value(U.noop)).to.equal(sentinel);
    });

  });

  describe('#promise()', () => {

    it('throws when invoked out of context', () => {
      const f = () => F.mock.promise.call(null);
      expect(f).to.throw(TypeError, /Future/);
    });

    it('returns a Promise', () => {
      const actual = F.mock.promise();
      expect(actual).to.be.an.instanceof(Promise);
    });

    it('resolves if the Future resolves', done => {
      const mock = Object.create(Future.prototype);
      mock._f = (l, r) => r(1);
      mock.promise().then(
        x => (expect(x).to.equal(1), done()),
        done
      );
    });

    it('rejects if the Future rejects', done => {
      const mock = Object.create(Future.prototype);
      mock._f = l => l(1);
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
