import {expect} from 'chai';
import {Next, Done, isIteration} from '../src/internal/iteration';

describe('Iteration', () => {

  describe('.Next()', () => {

    it('returns an uncomplete Iteration of the given value', () => {
      const actual = Next(42);
      expect(isIteration(actual)).to.equal(true);
      expect(actual.done).to.equal(false);
      expect(actual.value).to.equal(42);
    });

  });

  describe('.Done()', () => {

    it('returns a complete Iteration of the given value', () => {
      const actual = Done(42);
      expect(isIteration(actual)).to.equal(true);
      expect(actual.done).to.equal(true);
      expect(actual.value).to.equal(42);
    });

  });

});
