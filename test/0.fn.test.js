import {expect} from 'chai';
import * as fn from '../src/internal/fn';

describe('fn', () => {

  describe('.padf()', () => {

    it('left-pads string representations of functions', () => {
      const f = () => {
        return 42;
      };
      const input = f.toString();
      const inputLines = input.split('\n');
      const actualLines = fn.padf('--', input).split('\n');
      expect(actualLines[0]).to.equal(inputLines[0]);
      expect(actualLines[1]).to.equal('--' + inputLines[1]);
      expect(actualLines[2]).to.equal('--' + inputLines[2]);
    });

  });

  describe('.partial1()', () => {

    it('can partially apply binary functions', () => {
      function binary(a, b){ return a + b }
      expect(fn.partial1(binary, 1)(1)).to.equal(2);
    });

    it('can partially apply ternary functions', () => {
      function ternary(a, b, c){ return a + b + c }
      expect(fn.partial1(ternary, 1)(1, 1)).to.equal(3);
    });

    it('can partially apply quaternary functions', () => {
      function quaternary(a, b, c, d){ return a + b + c + d }
      expect(fn.partial1(quaternary, 1)(1, 1, 1)).to.equal(4);
    });

  });

  describe('.partial2()', () => {

    it('can partially apply ternary functions', () => {
      function ternary(a, b, c){ return a + b + c }
      expect(fn.partial2(ternary, 1, 1)(1)).to.equal(3);
    });

    it('can partially apply quaternary functions', () => {
      function quaternary(a, b, c, d){ return a + b + c + d }
      expect(fn.partial2(quaternary, 1, 1)(1, 1)).to.equal(4);
    });

  });

  describe('.partial3()', () => {

    it('can partially apply quaternary functions', () => {
      function quaternary(a, b, c, d){ return a + b + c + d }
      expect(fn.partial3(quaternary, 1, 1, 1)(1)).to.equal(4);
    });

  });

});
