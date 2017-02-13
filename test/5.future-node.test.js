'use strict';

const expect = require('chai').expect;
const Future = require('../fluture.js');
const FutureNode = Future.classes.FutureNode;
const U = require('./util');
const type = require('sanctuary-type-identifiers');

describe('Future.node()', () => {

  it('throws TypeError when not given a function', () => {
    const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];
    const fs = xs.map(x => () => Future.node(x));
    fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
  });

  it('returns an instance of FutureNode', () => {
    expect(Future.node(U.noop)).to.be.an.instanceof(FutureNode);
  });

});

describe('FutureNode', () => {

  it('extends Future', () => {
    expect(new FutureNode).to.be.an.instanceof(Future);
  });

  it('is considered a member of fluture/Fluture', () => {
    expect(type(new FutureNode)).to.equal('fluture/Future');
  });

  describe('#fork()', () => {

    it('rejects when the callback is called with (err)', () => {
      const f = done => done(U.error);
      return U.assertRejected(new FutureNode(f), U.error);
    });

    it('resolves when the callback is called with (null, a)', () => {
      const f = done => done(null, 'a');
      return U.assertResolved(new FutureNode(f), 'a');
    });

    it('ensures no continuations are called after the first resolve', done => {
      const f = done => { done(null, 'a'); done(null, 'b'); done(U.error) };
      new FutureNode(f).fork(U.failRej, _ => done());
    });

    it('ensures no continuations are called after the first reject', done => {
      const f = done => { done(U.error); done(null, 'b'); done(U.error) };
      new FutureNode(f).fork(_ => done(), U.failRes);
    });

    it('ensures no continuations are called after cancel', done => {
      const f = done => setTimeout(done, 5);
      new FutureNode(f).fork(U.failRej, U.failRes)();
      setTimeout(done, 20);
    });

  });

  describe('#toString()', () => {

    it('returns the code to create the FutureNode', () => {
      const m = new FutureNode(done => done(1));
      expect(m.toString()).to.equal('Future.node(done => done(1))');
    });

  });

});
