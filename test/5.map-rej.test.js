import {expect} from 'chai';
import {Future, mapRej, of} from '../index.es.js';
import * as U from './util';
import * as F from './futures';
import type from 'sanctuary-type-identifiers';

const testInstance = mapRej => {

  it('is considered a member of fluture/Fluture', () => {
    expect(type(mapRej(F.rejected, U.bang))).to.equal(Future['@@type']);
  });

  describe('#fork()', () => {

    it('applies the given function to its rejection reason', () => {
      const actual = mapRej(F.rejected, U.bang);
      return U.assertRejected(actual, 'rejected!');
    });

    it('does not map resolved state', () => {
      const actual = mapRej(F.resolved, _ => 'mapped');
      return U.assertResolved(actual, 'resolved');
    });

    it('does not resolve after being cancelled', done => {
      mapRej(F.resolvedSlow, U.failRej).fork(U.failRej, U.failRes)();
      setTimeout(done, 25);
    });

    it('does not reject after being cancelled', done => {
      mapRej(F.rejectedSlow, U.failRej).fork(U.failRej, U.failRes)();
      setTimeout(done, 25);
    });

  });

};

describe('mapRej()', () => {

  it('is a curried binary function', () => {
    expect(mapRej).to.be.a('function');
    expect(mapRej.length).to.equal(2);
    expect(mapRej(U.noop)).to.be.a('function');
  });

  it('throws when not given a Function as first argument', () => {
    const f = () => mapRej(1, F.resolved);
    expect(f).to.throw(TypeError, /Future.*first/);
  });

  it('throws when not given a Future as second argument', () => {
    const f = () => mapRej(U.add(1), 1);
    expect(f).to.throw(TypeError, /Future.*second/);
  });

  testInstance((m, f) => mapRej(f, m));

});

describe('Future#mapRej()', () => {

  it('throws when invoked out of context', () => {
    const f = () => of(1).mapRej.call(null, U.noop);
    expect(f).to.throw(TypeError, /Future/);
  });

  it('throws TypeError when not given a function', () => {
    const xs = [NaN, {}, [], 1, 'a', new Date, undefined, null];
    const fs = xs.map(x => () => of(1).mapRej(x));
    fs.forEach(f => expect(f).to.throw(TypeError, /Future/));
  });

  testInstance((m, f) => m.mapRej(f));

});
