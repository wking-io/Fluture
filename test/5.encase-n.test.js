import {expect} from 'chai';
import {Future, encaseN, encaseN2, encaseN3, node} from '../index.es.js';
import * as U from './util';
import type from 'sanctuary-type-identifiers';

const unaryNoop = (a, f) => void f;
const binaryNoop = (a, b, f) => void f;
const ternaryNoop = (a, b, c, f) => void f;

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

describe('encaseN()', () => {

  it('is a curried binary function', () => {
    expect(encaseN).to.be.a('function');
    expect(encaseN.length).to.equal(2);
    expect(encaseN(U.noop)).to.be.a('function');
  });

  it('throws TypeError when not given a function', () => {
    const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];
    const fs = xs.map(x => () => encaseN(x));
    fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
  });

  it('returns an instance of Future', () => {
    expect(encaseN(unaryNoop, null)).to.be.an.instanceof(Future);
  });

});

describe('encaseN2()', () => {

  it('is a curried ternary function', () => {
    expect(encaseN2).to.be.a('function');
    expect(encaseN2.length).to.equal(3);
    expect(encaseN2((a, b) => b)).to.be.a('function');
    expect(encaseN2((a, b) => b)(1)).to.be.a('function');
    expect(encaseN2((a, b) => b, 1)).to.be.a('function');
  });

  it('throws TypeError when not given a function', () => {
    const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];
    const fs = xs.map(x => () => encaseN2(x));
    fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
  });

  it('returns an instance of Future', () => {
    expect(encaseN2(binaryNoop, null, null)).to.be.an.instanceof(Future);
  });

});

describe('encaseN3()', () => {

  it('is a curried quaternary function', () => {
    expect(encaseN3).to.be.a('function');
    expect(encaseN3.length).to.equal(4);
    expect(encaseN3((a, b, c) => c)).to.be.a('function');
    expect(encaseN3((a, b, c) => c)(1)).to.be.a('function');
    expect(encaseN3((a, b, c) => c, 1)).to.be.a('function');
    expect(encaseN3((a, b, c) => c)(1)(2)).to.be.a('function');
    expect(encaseN3((a, b, c) => c, 1)(2)).to.be.a('function');
    expect(encaseN3((a, b, c) => c)(1, 2)).to.be.a('function');
    expect(encaseN3((a, b, c) => c, 1, 2)).to.be.a('function');
  });

  it('throws TypeError when not given a function', () => {
    const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];
    const fs = xs.map(x => () => encaseN3(x));
    fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
  });

  it('returns an instance of Future', () => {
    expect(encaseN3(ternaryNoop, null, null, null)).to.be.an.instanceof(Future);
  });

});

describe('EncaseN', () => {

  it('extends Future', () => {
    expect(encaseN(U.noop, 1)).to.be.an.instanceof(Future);
  });

  it('is considered a member of fluture/Fluture', () => {
    expect(type(encaseN(U.noop, 1))).to.equal(Future['@@type']);
  });

  describe('#fork()', () => {

    describe('(nullary)', () => {

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

    describe('(unary)', () => {

      it('rejects when the callback is called with (err)', () => {
        const f = (a, done) => done(U.error);
        return U.assertRejected(encaseN(f, 'a'), U.error);
      });

      it('resolves when the callback is called with (null, a)', () => {
        const f = (a, done) => done(null, a);
        return U.assertResolved(encaseN(f, 'a'), 'a');
      });

      it('ensures no continuations are called after the first resolve', done => {
        const f = (a, done) => { done(null, 'a'); done(null, 'b'); done(U.error) };
        encaseN(f, 'a').fork(U.failRej, _ => done());
      });

      it('ensures no continuations are called after the first reject', done => {
        const f = (a, done) => { done(U.error); done(null, 'b'); done(U.error) };
        encaseN(f, 'a').fork(_ => done(), U.failRes);
      });

      it('ensures no continuations are called after cancel', done => {
        const f = (a, done) => setTimeout(done, 5);
        encaseN(f, 'a').fork(U.failRej, U.failRes)();
        setTimeout(done, 20);
      });

    });

    describe('(binary)', () => {

      it('rejects when the callback is called with (err)', () => {
        const f = (a, b, done) => done(U.error);
        return U.assertRejected(encaseN2(f, 'a', 'b'), U.error);
      });

      it('resolves when the callback is called with (null, a)', () => {
        const f = (a, b, done) => done(null, a);
        return U.assertResolved(encaseN2(f, 'a', 'b'), 'a');
      });

      it('ensures no continuations are called after the first resolve', done => {
        const f = (a, b, done) => { done(null, 'a'); done(null, 'b'); done(U.error) };
        encaseN2(f, 'a', 'b').fork(U.failRej, _ => done());
      });

      it('ensures no continuations are called after the first reject', done => {
        const f = (a, b, done) => { done(U.error); done(null, 'b'); done(U.error) };
        encaseN2(f, 'a', 'b').fork(_ => done(), U.failRes);
      });

      it('ensures no continuations are called after cancel', done => {
        const f = (a, b, done) => setTimeout(done, 5);
        encaseN2(f, 'a', 'b').fork(U.failRej, U.failRes)();
        setTimeout(done, 20);
      });

    });

    describe('(ternary)', () => {

      it('rejects when the callback is called with (err)', () => {
        const f = (a, b, c, done) => done(U.error);
        return U.assertRejected(encaseN3(f, 'a', 'b', 'c'), U.error);
      });

      it('resolves when the callback is called with (null, a)', () => {
        const f = (a, b, c, done) => done(null, a);
        return U.assertResolved(encaseN3(f, 'a', 'b', 'c'), 'a');
      });

      it('ensures no continuations are called after the first resolve', done => {
        const f = (a, b, c, done) => { done(null, 'a'); done(null, 'b'); done(U.error) };
        encaseN3(f, 'a', 'b', 'c').fork(U.failRej, _ => done());
      });

      it('ensures no continuations are called after the first reject', done => {
        const f = (a, b, c, done) => { done(U.error); done(null, 'b'); done(U.error) };
        encaseN3(f, 'a', 'b', 'c').fork(_ => done(), U.failRes);
      });

      it('ensures no continuations are called after cancel', done => {
        const f = (a, b, c, done) => setTimeout(done, 5);
        encaseN3(f, 'a', 'b', 'c').fork(U.failRej, U.failRes)();
        setTimeout(done, 20);
      });

    });

  });

  describe('#toString()', () => {

    it('returns the code to create the EncaseN', () => {
      const m0 = node(unaryNoop);
      const m1 = encaseN(unaryNoop, null);
      const m2 = encaseN2(binaryNoop, null, null);
      const m3 = encaseN3(ternaryNoop, null, null, null);
      expect(m0.toString()).to.equal(`Future.node(${unaryNoop.toString()})`);
      expect(m1.toString()).to.equal(`Future.encaseN(${unaryNoop.toString()}, null)`);
      expect(m2.toString()).to.equal(`Future.encaseN2(${binaryNoop.toString()}, null, null)`);
      expect(m3.toString()).to.equal(
        `Future.encaseN3(${ternaryNoop.toString()}, null, null, null)`
      );
    });

  });

});
