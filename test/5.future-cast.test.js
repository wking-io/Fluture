'use strict';

const expect = require('chai').expect;
const Future = require('../fluture.js');
const FutureCast = Future.classes.FutureCast;
const U = require('./util');

describe('Future.cast()', () => {

  it('throws TypeError when not given a Forkable', () => {
    const xs = [null, {}, {fork: a => a}];
    const fs = xs.map(x => () => Future.cast(x));
    fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
  });

  it('returns an instance of FutureCast', () => {
    expect(Future.cast(Future.of(1))).to.be.an.instanceof(FutureCast);
  });

});

describe('FutureCast', () => {

  it('extends Future', () => {
    expect(new FutureCast).to.be.an.instanceof(Future);
  });

  describe('#fork()', () => {

    it('rejects if the Forkable calls the left', () => {
      const forkable = {fork: (l, r) => (r, l(U.error))};
      return U.assertRejected(new FutureCast(forkable), U.error);
    });

    it('resolves if the Forkable calls the right', () => {
      const forkable = {fork: (l, r) => r(1)};
      return U.assertResolved(new FutureCast(forkable), 1);
    });

    it('ensures no continuations are called after the first resolve', done => {
      const forkable = {fork: (l, r) => { r(1); r(2); l(3) }};
      new FutureCast(forkable).fork(U.failRej, _ => done());
    });

    it('ensures no continuations are called after the first reject', done => {
      const forkable = {fork: (l, r) => { l(1); r(2); l(3) }};
      new FutureCast(forkable).fork(_ => done(), U.failRes);
    });

  });

  describe('#toString()', () => {

    it('returns the code to create the FutureCast', () => {
      const m = new FutureCast(Future.of(1));
      expect(m.toString()).to.equal('Future.cast(Future.of(1))');
    });

  });

});
