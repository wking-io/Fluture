import {expect} from 'chai';
import * as fn from '../src/internal/fn';

describe('fn', function(){

  describe('.padf()', function(){

    it('left-pads string representations of functions', function(){
      var f = function(){
        return 42;
      };

      var input = f.toString();
      var inputLines = input.split('\n');
      var actualLines = fn.padf('--', input).split('\n');
      expect(actualLines[0]).to.equal(inputLines[0]);
      expect(actualLines[1]).to.equal('--' + inputLines[1]);
      expect(actualLines[2]).to.equal('--' + inputLines[2]);
    });

  });

  describe('.partial1()', function(){

    it('can partially apply binary functions', function(){
      function binary(a, b){ return a + b }

      expect(fn.partial1(binary, 1)(1)).to.equal(2);
    });

    it('can partially apply ternary functions', function(){
      function ternary(a, b, c){ return a + b + c }

      expect(fn.partial1(ternary, 1)(1, 1)).to.equal(3);
    });

    it('can partially apply quaternary functions', function(){
      function quaternary(a, b, c, d){ return a + b + c + d }

      expect(fn.partial1(quaternary, 1)(1, 1, 1)).to.equal(4);
    });

  });

  describe('.partial2()', function(){

    it('can partially apply ternary functions', function(){
      function ternary(a, b, c){ return a + b + c }

      expect(fn.partial2(ternary, 1, 1)(1)).to.equal(3);
    });

    it('can partially apply quaternary functions', function(){
      function quaternary(a, b, c, d){ return a + b + c + d }

      expect(fn.partial2(quaternary, 1, 1)(1, 1)).to.equal(4);
    });

  });

  describe('.partial3()', function(){

    it('can partially apply quaternary functions', function(){
      function quaternary(a, b, c, d){ return a + b + c + d }

      expect(fn.partial3(quaternary, 1, 1, 1)(1)).to.equal(4);
    });

  });

});
