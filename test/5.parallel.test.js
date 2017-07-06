import {expect} from 'chai';
import {Future, parallel, of, reject, after} from '../index.es.js';
import * as U from './util';
import * as F from './futures';
import type from 'sanctuary-type-identifiers';

describe('parallel()', () => {

  it('is a curried binary function', () => {
    expect(parallel).to.be.a('function');
    expect(parallel.length).to.equal(2);
    expect(parallel(1)).to.be.a('function');
  });

  it('throws when given something other than PositiveInteger as a first argument', () => {
    const xs = [0, -1, 1.5, NaN, '1', 'one'];
    const fs = xs.map(x => () => parallel(x)([]));
    fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
  });

  it('throws when given something other than Array as second argument', () => {
    const xs = [NaN, {}, 1, 'a', new Date, undefined, null, F.resolved];
    const fs = xs.map(x => () => parallel(1)(x));
    fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
  });

  it('returns an instance of Future', () => {
    expect(parallel(1, [])).to.be.an.instanceof(Future);
  });

});

describe('Parallel', () => {

  it('extends Future', () => {
    expect(parallel(1, [])).to.be.an.instanceof(Future);
  });

  it('is considered a member of fluture/Fluture', () => {
    expect(type(parallel(1, []))).to.equal(Future['@@type']);
  });

  describe('#fork()', () => {

    it('throws when the Array contains something other than Futures', () => {
      const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];
      const fs = xs.map(x => () => parallel(1, [x]).fork(U.noop, U.noop));
      fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
    });

    it('parallelizes execution', function(){
      this.timeout(70);
      const actual = parallel(2, [
        after(20, 'a'),
        after(20, 'b'),
        after(20, 'c'),
        after(20, 'd'),
        after(20, 'e')
      ]);
      return U.assertResolved(actual, ['a', 'b', 'c', 'd', 'e']);
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
      const actual = parallel(2, U.repeat(8, m));
      return U.assertResolved(actual, U.repeat(8, 'a'));
    });

    it('runs all in parallel when given number larger than the array length', function(){
      this.slow(80);
      this.timeout(50);
      const actual = parallel(10, [after(35, 'a'), after(35, 'b')]);
      return U.assertResolved(actual, ['a', 'b']);
    });

    it('resolves to an empty array when given an empty array', () => {
      return U.assertResolved(parallel(1, []), []);
    });

    it('runs all in parallel when given Infinity', function(){
      this.slow(80);
      this.timeout(50);
      const actual = parallel(Infinity, [after(35, 'a'), after(35, 'b')]);
      return U.assertResolved(actual, ['a', 'b']);
    });

    it('rejects if one of the input rejects', () => {
      const actual = parallel(2, [F.resolved, reject('err')]);
      return U.assertRejected(actual, 'err');
    });

    it('does not reject multiple times', done => {
      const actual = parallel(2, [F.rejectedSlow, F.rejected]);
      actual.fork(_ => done(), U.failRes);
    });

    it('cancels Futures when cancelled', done => {
      const m = Future(() => () => done());
      const cancel = parallel(1, [m]).fork(U.noop, U.noop);
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
      const cancel = parallel(2, [m, m, m, m]).fork(U.failRej, U.failRes);
      setTimeout(() => {
        cancel();
        expect(i).to.equal(2);
        expect(j).to.equal(2);
        done();
      }, 30);
    });

    it('[GH #123] does not cancel settled computations', done => {
      const m1 = Object.create(F.mock);
      const m2 = Object.create(F.mock);

      m1._fork = (rej, res) => {
        setTimeout(res, 10, 1);
        return () => done(U.error);
      };

      m2._fork = rej => {
        setTimeout(rej, 20, 2);
        return () => done(U.error);
      };

      parallel(2, [m1, m2]).fork(U.noop, U.noop);
      setTimeout(done, 50, null);
    });

    it('does not resolve after being cancelled', done => {
      const cancel = parallel(1, [F.resolvedSlow, F.resolvedSlow])
      .fork(U.failRej, U.failRes);
      setTimeout(cancel, 10);
      setTimeout(done, 50);
    });

    it('does not reject after being cancelled', done => {
      const cancel = parallel(1, [F.rejectedSlow, F.rejectedSlow])
      .fork(U.failRej, U.failRes);
      setTimeout(cancel, 10);
      setTimeout(done, 50);
    });

  });

  describe('#toString()', () => {

    it('returns the code to create the Parallel', () => {
      const m = parallel(Infinity, [of(1), of(2)]);
      const s = 'Future.parallel(2, [Future.of(1), Future.of(2)])';
      expect(m.toString()).to.equal(s);
    });

  });

});
