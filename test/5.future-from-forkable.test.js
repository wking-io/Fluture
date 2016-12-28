'use strict';

const expect = require('chai').expect;
const Future = require('../fluture.js');
const FutureFromForkable = Future.classes.FutureFromForkable;
const U = require('./util');
const F = require('./futures');
const RamdaFuture = require('ramda-fantasy').Future;
const DataTask = require('data.task');

describe('Future.fromForkable()', () => {

  it('throws TypeError when not given a Forkable', () => {
    const xs = [null, {}, {fork: a => a}];
    const fs = xs.map(x => () => Future.fromForkable(x));
    fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
  });

  it('returns an instance of FutureFromForkable', () => {
    expect(Future.fromForkable(Future.of(1))).to.be.an.instanceof(FutureFromForkable);
  });

});

describe('FutureFromForkable', () => {

  it('extends Future', () => {
    expect(new FutureFromForkable).to.be.an.instanceof(Future);
  });

  describe('#fork()', () => {

    it('rejects if the Forkable calls the left', () => {
      const forkable = {fork: (l, r) => (r, l(U.error))};
      return U.assertRejected(new FutureFromForkable(forkable), U.error);
    });

    it('resolves if the Forkable calls the right', () => {
      const forkable = {fork: (l, r) => r(1)};
      return U.assertResolved(new FutureFromForkable(forkable), 1);
    });

    it('ensures no continuations are called after the first resolve', done => {
      const forkable = {fork: (l, r) => { r(1); r(2); l(3) }};
      new FutureFromForkable(forkable).fork(U.failRej, _ => done());
    });

    it('ensures no continuations are called after the first reject', done => {
      const forkable = {fork: (l, r) => { l(1); r(2); l(3) }};
      new FutureFromForkable(forkable).fork(_ => done(), U.failRes);
    });

    it('preserves cancellation', done => {
      const m = new FutureFromForkable(F.resolvedSlow);
      const cancel = m.fork(U.failRej, U.failRes);
      cancel();
      setTimeout(done, 25);
    });

  });

  describe('#toString()', () => {

    it('returns the code to create the FutureFromForkable', () => {
      const m = new FutureFromForkable(Future.of(1));
      expect(m.toString()).to.equal('Future.fromForkable(Future.of(1))');
    });

  });

});

describe('Usage: Future.fromForkable()', () => {

  it('converts Ramda Fantasy Futures', () => {
    const m = Future.fromForkable(RamdaFuture.of(1));
    expect(m).to.be.an.instanceof(FutureFromForkable);
    return U.assertResolved(m, 1);
  });

  it('converts Data Tasks', () => {
    const m = Future.fromForkable(DataTask.of(1));
    expect(m).to.be.an.instanceof(FutureFromForkable);
    return U.assertResolved(m, 1);
  });

});
