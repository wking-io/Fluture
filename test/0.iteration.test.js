import {expect} from 'chai';
import {Next, Done, isIteration} from '../src/internal/iteration';

describe('Iteration', function(){

  describe('.Next()', function(){

    it('returns an uncomplete Iteration of the given value', function(){
      var actual = Next(42);
      expect(isIteration(actual)).to.equal(true);
      expect(actual.done).to.equal(false);
      expect(actual.value).to.equal(42);
    });

  });

  describe('.Done()', function(){

    it('returns a complete Iteration of the given value', function(){
      var actual = Done(42);
      expect(isIteration(actual)).to.equal(true);
      expect(actual.done).to.equal(true);
      expect(actual.value).to.equal(42);
    });

  });

});
