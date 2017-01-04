'use strict';

const expect = require('chai').expect;
const Future = require('../fluture.js');
const FutureParallel = Future.classes.FutureParallel;
const U = require('./util');
const F = require('./futures');
const type = require('sanctuary-type-identifiers');

describe('Future.parallel()', () => {

  it('is a curried binary function', () => {
    expect(Future.parallel).to.be.a('function');
    expect(Future.parallel.length).to.equal(2);
    expect(Future.parallel(1)).to.be.a('function');
  });

  it('throws when given something other than PositiveInteger as a first argument', () => {
    const xs = [0, -1, 1.5, NaN, '1', 'one'];
    const fs = xs.map(x => () => Future.parallel(x)([]));
    fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
  });

  it('throws when given something other than Array as second argument', () => {
    const xs = [NaN, {}, 1, 'a', new Date, undefined, null, F.resolved];
    const fs = xs.map(x => () => Future.parallel(1)(x));
    fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
  });

  it('returns an instance of FutureParallel', () => {
    expect(Future.parallel(1, [])).to.be.an.instanceof(FutureParallel);
  });

});

describe('FutureParallel', () => {

  it('extends Future', () => {
    expect(new FutureParallel(1, [])).to.be.an.instanceof(Future);
  });

  it('is considered a member of fluture/Fluture', () => {
    expect(type(new FutureParallel(1, []))).to.equal('fluture/Future');
  });

  describe('#fork()', () => {

    it('throws when the Array contains something other than Futures', () => {
      const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];
      const fs = xs.map(x => () => new FutureParallel(1, [x]).fork(U.noop, U.noop));
      fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
    });

    it('parallelizes execution', function(){
      this.slow(80);
      this.timeout(50);
      const actual = new FutureParallel(2, [Future.after(35, 'a'), Future.after(35, 'b')]);
      return U.assertResolved(actual, ['a', 'b']);
    });

    it('limits parallelism to the given number', () => {
      let running = 0;
      const m = Future((rej, res) => {
        running++;
        if(running > 2) return void rej(new Error('More than two running in parallel'));
        return void setTimeout(() => {
          running--;
          res('a');
        }, 20);
      });
      const actual = new FutureParallel(2, U.repeat(8, m));
      return U.assertResolved(actual, U.repeat(8, 'a'));
    });

    it('runs all in parallel when given number larger than the array length', function(){
      this.slow(80);
      this.timeout(50);
      const actual = new FutureParallel(10, [Future.after(35, 'a'), Future.after(35, 'b')]);
      return U.assertResolved(actual, ['a', 'b']);
    });

    it('resolves to an empty array when given an empty array', () => {
      return U.assertResolved(new FutureParallel(1, []), []);
    });

    it('runs all in parallel when given Infinity', function(){
      this.slow(80);
      this.timeout(50);
      const actual = new FutureParallel(Infinity, [Future.after(35, 'a'), Future.after(35, 'b')]);
      return U.assertResolved(actual, ['a', 'b']);
    });

    it('rejects if one of the input rejects', () => {
      const actual = new FutureParallel(2, [F.resolved, Future.reject('err')]);
      return U.assertRejected(actual, 'err');
    });

    it('does not reject multiple times', done => {
      const actual = new FutureParallel(2, [F.rejectedSlow, F.rejected]);
      actual.fork(_ => done(), U.failRes);
    });

    it('cancels all Futures when cancelled', done => {
      const m = Future(() => () => done());
      const cancel = new FutureParallel(1, [m]).fork(U.noop, U.noop);
      setTimeout(cancel, 20);
    });

    it('cancels only running Futures when cancelled', done => {
      let i = 0, j = 0;
      const m = Future((rej, res) => {
        const x = setTimeout(x => {j += 1; res(x)}, 20, 1);
        return () => {
          i += 1;
          clearTimeout(x);
        };
      });
      const cancel = new FutureParallel(2, [m, m, m, m]).fork(U.failRej, U.failRes);
      setTimeout(() => {
        cancel();
        expect(i).to.equal(2);
        expect(j).to.equal(2);
        done();
      }, 30);
    });

    it('does not resolve after being cancelled', done => {
      const cancel = new FutureParallel(1, [F.resolvedSlow, F.resolvedSlow])
      .fork(U.failRej, U.failRes);
      setTimeout(cancel, 10);
      setTimeout(done, 50);
    });

    it('does not reject after being cancelled', done => {
      const cancel = new FutureParallel(1, [F.rejectedSlow, F.rejectedSlow])
      .fork(U.failRej, U.failRes);
      setTimeout(cancel, 10);
      setTimeout(done, 50);
    });

  });

  describe('#toString()', () => {

    it('returns the code to create the FutureParallel', () => {
      const m = new FutureParallel(Infinity, [Future.of(1), Future.of(2)]);
      const s = 'Future.parallel(2, [Future.of(1), Future.of(2)])';
      expect(m.toString()).to.equal(s);
    });

  });

});
