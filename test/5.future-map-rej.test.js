'use strict';

const expect = require('chai').expect;
const Future = require('../fluture.js');
const FutureMapRej = Future.classes.FutureMapRej;
const U = require('./util');
const F = require('./futures');

describe('Future.mapRej()', () => {

  it('is a curried binary function', () => {
    expect(Future.mapRej).to.be.a('function');
    expect(Future.mapRej.length).to.equal(2);
    expect(Future.mapRej(U.noop)).to.be.a('function');
  });

  it('throws when not given a Function as first argument', () => {
    const f = () => Future.mapRej(1, F.resolved);
    expect(f).to.throw(TypeError, /Future.*first/);
  });

  it('throws when not given a Future as second argument', () => {
    const f = () => Future.mapRej(U.add(1), 1);
    expect(f).to.throw(TypeError, /Future.*second/);
  });

  it('returns an instance of FutureMapRej', () => {
    expect(Future.mapRej(U.bang, F.resolved)).to.be.an.instanceof(FutureMapRej);
  });

});

describe('Future#mapRej()', () => {

  it('throws when invoked out of context', () => {
    const f = () => Future.of(1).mapRej.call(null, U.noop);
    expect(f).to.throw(TypeError, /Future/);
  });

  it('throws TypeError when not given a function', () => {
    const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];
    const fs = xs.map(x => () => Future.of(1).mapRej(x));
    fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
  });

  it('returns an instance of FutureMapRej', () => {
    expect(F.resolved.mapRej(U.bang)).to.be.an.instanceof(FutureMapRej);
  });

});

describe('FutureMapRej', () => {

  it('extends Future', () => {
    expect(new FutureMapRej).to.be.an.instanceof(Future);
  });

  describe('#fork()', () => {

    it('applies the given function to its rejection reason', () => {
      const actual = F.rejected.mapRej(U.bang);
      return U.assertRejected(actual, 'rejected!');
    });

    it('does not map resolved state', () => {
      const actual = F.resolved.mapRej(_ => 'mapped');
      return U.assertResolved(actual, 'resolved');
    });

    it('does not resolve after being cancelled', done => {
      F.resolvedSlow.mapRej(U.failRej).fork(U.failRej, U.failRes)();
      setTimeout(done, 25);
    });

    it('does not reject after being cancelled', done => {
      F.rejectedSlow.mapRej(U.failRej).fork(U.failRej, U.failRes)();
      setTimeout(done, 25);
    });

  });

  describe('#toString()', () => {

    it('returns the code to create the FutureMapRej', () => {
      const m = F.resolved.mapRej(x => x);
      const s = 'Future.of("resolved").mapRej(x => x)';
      expect(m.toString()).to.equal(s);
    });

  });

});
