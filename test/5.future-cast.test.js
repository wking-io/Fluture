'use strict';

const expect = require('chai').expect;
const Future = require('../fluture.js');
const SafeFuture = Future.classes.SafeFuture;
const U = require('./util');

describe('Future.cast()', () => {

  it('returns an instance of SafeFuture', () => {
    expect(Future.cast(Future.of(1))).to.be.an.instanceof(SafeFuture);
  });

  describe('#fork()', () => {

    it('rejects if the Forkable calls the left', () => {
      const forkable = {fork: (l, r) => (r, l(U.error))};
      return U.assertRejected(Future.cast(forkable), U.error);
    });

    it('resolves if the Forkable calls the right', () => {
      const forkable = {fork: (l, r) => r(1)};
      return U.assertResolved(Future.cast(forkable), 1);
    });

    it('ensures no continuations are called after the first resolve', done => {
      const forkable = {fork: (l, r) => { r(1); r(2); l(3) }};
      Future.cast(forkable).fork(U.failRej, _ => done());
    });

    it('ensures no continuations are called after the first reject', done => {
      const forkable = {fork: (l, r) => { l(1); r(2); l(3) }};
      Future.cast(forkable).fork(_ => done(), U.failRes);
    });

  });

});
