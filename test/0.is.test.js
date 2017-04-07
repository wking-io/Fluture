import {expect} from 'chai';
import U from './util';
import Future from '..';
import * as util from '../src/internal/is';

describe('is', () => {

  describe('.isThenable()', () => {

    const ps = [
      Promise.resolve(1),
      new Promise(U.noop),
      {then: U.noop},
      {then: a => a},
      {then: (a, b) => b}
    ];

    const values = [NaN, 1, true, undefined, null, [], {}];
    const xs = values.concat([U.noop]).concat(values.map(x => ({then: x})));

    it('returns true when given a Thenable', () => {
      ps.forEach(p => expect(util.isThenable(p)).to.equal(true));
    });

    it('returns false when not given a Thenable', () => {
      xs.forEach(x => expect(util.isThenable(x)).to.equal(false));
    });

  });

  describe('.isFunction()', () => {

    const fs = [() => {}, function(){}, Future];
    const xs = [NaN, 1, true, undefined, null, [], {}];

    it('returns true when given a Function', () => {
      fs.forEach(f => expect(util.isFunction(f)).to.equal(true));
    });

    it('returns false when not given a Function', () => {
      xs.forEach(x => expect(util.isFunction(x)).to.equal(false));
    });

  });

  describe('.isBinary()', () => {

    const fs = [(a, b) => b, (a, b, c) => c];
    const xs = [U.noop, a => a];

    it('returns true when given a binary Function', () => {
      fs.forEach(f => expect(util.isBinary(f)).to.equal(true));
    });

    it('returns false when not given a binary Function', () => {
      xs.forEach(x => expect(util.isBinary(x)).to.equal(false));
    });

  });

  describe('.isTernary()', () => {

    const fs = [(a, b, c) => c, (a, b, c, d) => d];
    const xs = [U.noop, a => a, (a, b) => b];

    it('returns true when given a ternary Function', () => {
      fs.forEach(f => expect(util.isTernary(f)).to.equal(true));
    });

    it('returns false when not given a ternary Function', () => {
      xs.forEach(x => expect(util.isTernary(x)).to.equal(false));
    });

  });

  describe('.isUnsigned()', () => {

    const is = [1, 2, 99999999999999999999, Infinity];
    const xs = [NaN, 0, -0, -1, -99999999999999999, -Infinity, '1', [], {}];

    it('returns true when given a PositiveInteger', () => {
      is.forEach(i => expect(util.isUnsigned(i)).to.equal(true));
    });

    it('returns false when not given a PositiveInteger', () => {
      xs.forEach(x => expect(util.isUnsigned(x)).to.equal(false));
    });

  });

  describe('.isObject()', () => {

    function O(){}
    const os = [{}, {foo: 1}, Object.create(null), new O, []];
    const xs = [1, true, NaN, null, undefined, ''];

    it('returns true when given an Object', () => {
      os.forEach(i => expect(util.isObject(i)).to.equal(true));
    });

    it('returns false when not given an Object', () => {
      xs.forEach(x => expect(util.isObject(x)).to.equal(false));
    });

  });

  describe('.isIterator()', () => {

    const is = [{next: () => {}}, {next: x => x}, (function*(){}())];
    const xs = [1, true, NaN, null, undefined, '', {}, {next: 1}];

    it('returns true when given an Iterator', () => {
      is.forEach(i => expect(util.isIterator(i)).to.equal(true));
    });

    it('returns false when not given an Iterator', () => {
      xs.forEach(x => expect(util.isIterator(x)).to.equal(false));
    });

  });

});
