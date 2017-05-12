import {expect} from 'chai';
import {namespace, name, version} from '../src/internal/const';
import {
  error,
  typeError,
  invalidArgument,
  invalidContext,
  invalidFuture
} from '../src/internal/throw';

describe('throw', () => {

  describe('error()', () => {

    it('throws an Error with the given message', () => {
      const msg = 'Oh no!';
      expect(_ => error(msg)).to.throw(Error, msg);
    });

  });

  describe('typeError()', () => {

    it('throws a TypeError with the given message', () => {
      const msg = 'Oh no!';
      expect(_ => typeError(msg)).to.throw(TypeError, msg);
    });

  });

  describe('invalidArgument()', () => {

    it('throws a TypeError with a computed message', () => {
      const f = _ => invalidArgument('Foo', 2, 'rock', 'meh');
      expect(f).to.throw(TypeError, 'Foo expects its third argument to rock\n  Actual: "meh"');
    });

  });

  describe('invalidContext()', () => {

    it('throws a TypeError with a computed message', () => {
      const f = _ => invalidContext('Foo', 'meh');
      expect(f).to.throw(TypeError,
        'Foo was invoked outside the context of a Future. '
      + 'You might want to use a dispatcher instead\n  Called on: "meh"'
      );
    });

  });

  describe('invalidFuture()', () => {

    const mockType = identifier => ({constructor: {'@@type': identifier}});

    it('throws a TypeError with a computed message', () => {
      const f = _ => invalidFuture(
        'Deep Thought', 'the answer to be 42', 43,
        '\n  See: https://en.wikipedia.org/wiki/Off-by-one_error'
      );
      expect(f).to.throw(TypeError,
        'Deep Thought expects the answer to be 42.\n  Actual: 43 :: Number'
      + '\n  See: https://en.wikipedia.org/wiki/Off-by-one_error'
      );
    });

    it('Warns us when nothing seems wrong', () => {
      const f = _ => invalidFuture('Foo', 0, mockType(`${namespace}/${name}@${version}`));
      expect(f).to.throw(TypeError, 'Nothing seems wrong. Contact the Fluture maintainers.');
    });

    it('Warns us about Futures from other sources', () => {
      const f = _ => invalidFuture('Foo', 0, mockType(`bobs-tinkershop/${name}@${version}`));
      expect(f).to.throw(TypeError, 'Got a Future from bobs-tinkershop.');
    });

    it('Warns us about Futures from unnamed sources', () => {
      const f = _ => invalidFuture('Foo', 0, mockType(name));
      expect(f).to.throw(TypeError, 'Got an unscoped Future.');
    });

    it('Warns about older versions', () => {
      const f = _ => invalidFuture('Foo', 0, mockType(`${namespace}/${name}@${version - 1}`));
      expect(f).to.throw(TypeError, 'The Future was created by an older version');
    });

    it('Warns about newer versions', () => {
      const f = _ => invalidFuture('Foo', 0, mockType(`${namespace}/${name}@${version + 1}`));
      expect(f).to.throw(TypeError, 'The Future was created by a newer version');
    });

  });

});
