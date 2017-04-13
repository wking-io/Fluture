import {expect} from 'chai';
import {Future, node} from '../index.es.js';
import U from './util';
import type from 'sanctuary-type-identifiers';

describe('node()', () => {

  it('throws TypeError when not given a function', () => {
    const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];
    const fs = xs.map(x => () => node(x));
    fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
  });

  it('returns an instance of Future', () => {
    expect(node(U.noop)).to.be.an.instanceof(Future);
  });

});

describe('FutureNode', () => {

  it('extends Future', () => {
    expect(node(U.noop)).to.be.an.instanceof(Future);
  });

  it('is considered a member of fluture/Fluture', () => {
    expect(type(node(U.noop))).to.equal(Future['@@type']);
  });

  describe('#fork()', () => {

    it('rejects when the callback is called with (err)', () => {
      const f = done => done(U.error);
      return U.assertRejected(node(f), U.error);
    });

    it('resolves when the callback is called with (null, a)', () => {
      const f = done => done(null, 'a');
      return U.assertResolved(node(f), 'a');
    });

    it('ensures no continuations are called after the first resolve', done => {
      const f = done => { done(null, 'a'); done(null, 'b'); done(U.error) };
      node(f).fork(U.failRej, _ => done());
    });

    it('ensures no continuations are called after the first reject', done => {
      const f = done => { done(U.error); done(null, 'b'); done(U.error) };
      node(f).fork(_ => done(), U.failRes);
    });

    it('ensures no continuations are called after cancel', done => {
      const f = done => setTimeout(done, 5);
      node(f).fork(U.failRej, U.failRes)();
      setTimeout(done, 20);
    });

  });

  describe('#toString()', () => {

    it('returns the code to create the FutureNode', () => {
      const f = done => done(1);
      const m = node(f);
      expect(m.toString()).to.equal(`Future.node(${f.toString()})`);
    });

  });

});
