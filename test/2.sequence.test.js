import {Future, of, never} from '../index.es.js';
import {expect} from 'chai';
import {add, bang, noop, assertResolved, assertRejected} from './util';
import {resolved, rejected} from './futures';
import {Sequence} from '../src/core';

describe('Sequence', () => {

  const dummy = new Sequence(resolved, []);

  describe('ap', () => {

    const seq = dummy.ap(of(bang));

    describe('#fork()', () => {

      it('runs the action', () => {
        return assertResolved(seq, 'resolved!');
      });

    });

    describe('#toString()', () => {

      it('returns code to create the same data-structure', () => {
        expect(seq.toString()).to.equal('Future.of("resolved").ap(Future.of(s => `${s}!`))');
      });

    });

  });

  describe('map', () => {

    const seq = dummy.map(bang);

    describe('#fork()', () => {

      it('runs the action', () => {
        return assertResolved(seq, 'resolved!');
      });

    });

    describe('#toString()', () => {

      it('returns code to create the same data-structure', () => {
        expect(seq.toString()).to.equal('Future.of("resolved").map(s => `${s}!`)');
      });

    });

  });

  describe('bimap', () => {

    const seq = dummy.bimap(add(1), bang);

    describe('#fork()', () => {

      it('runs the action', () => {
        return assertResolved(seq, 'resolved!');
      });

    });

    describe('#toString()', () => {

      it('returns code to create the same data-structure', () => {
        expect(seq.toString()).to.equal('Future.of("resolved").bimap(b => a + b, s => `${s}!`)');
      });

    });

  });

  describe('chain', () => {

    const seq = dummy.chain(x => of(bang(x)));

    describe('#fork()', () => {

      it('runs the action', () => {
        return assertResolved(seq, 'resolved!');
      });

    });

    describe('#toString()', () => {

      it('returns code to create the same data-structure', () => {
        expect(seq.toString()).to.equal('Future.of("resolved").chain(x => of(bang(x)))');
      });

    });

  });

  describe('mapRej', () => {

    const seq = dummy.mapRej(add(1));

    describe('#fork()', () => {

      it('runs the action', () => {
        return assertResolved(seq, 'resolved');
      });

    });

    describe('#toString()', () => {

      it('returns code to create the same data-structure', () => {
        expect(seq.toString()).to.equal('Future.of("resolved").mapRej(b => a + b)');
      });

    });

  });

  describe('chainRej', () => {

    const seq = dummy.chainRej(_ => of(1));

    describe('#fork()', () => {

      it('runs the action', () => {
        return assertResolved(seq, 'resolved');
      });

    });

    describe('#toString()', () => {

      it('returns code to create the same data-structure', () => {
        expect(seq.toString()).to.equal('Future.of("resolved").chainRej(_ => of(1))');
      });

    });

  });

  describe('race', () => {

    const seq = dummy.race(dummy);

    it('returns itself when racing Never', () => {
      expect(dummy.race(never)).to.equal(dummy);
    });

    describe('#fork()', () => {

      it('runs the action', () => {
        return assertResolved(seq, 'resolved');
      });

      it('is capable of early termination', done => {
        const slow = Future(() => {
          const id = setTimeout(done, 20, new Error('Not terminated'));
          return () => clearTimeout(id);
        });
        const m = slow.race(slow).race(slow).race(slow).race(resolved);
        m.fork(noop, noop);
        setTimeout(done, 40, null);
      });

    });

    describe('#toString()', () => {

      it('returns code to create the same data-structure', () => {
        expect(seq.toString()).to.equal('Future.of("resolved").race(Future.of("resolved"))');
      });

    });

  });

  describe('both', () => {

    const seq = dummy.both(dummy);

    describe('#fork()', () => {

      it('runs the action', () => {
        return assertResolved(seq, ['resolved', 'resolved']);
      });

    });

    describe('#toString()', () => {

      it('returns code to create the same data-structure', () => {
        expect(seq.toString()).to.equal('Future.of("resolved").both(Future.of("resolved"))');
      });

    });

  });

  describe('and', () => {

    const seq = dummy.and(dummy);

    describe('#fork()', () => {

      it('runs the action', () => {
        return assertResolved(seq, 'resolved');
      });

    });

    describe('#toString()', () => {

      it('returns code to create the same data-structure', () => {
        expect(seq.toString()).to.equal('Future.of("resolved").and(Future.of("resolved"))');
      });

    });

  });

  describe('or', () => {

    const seq = dummy.or(dummy);

    describe('#fork()', () => {

      it('runs the action', () => {
        return assertResolved(seq, 'resolved');
      });

    });

    describe('#toString()', () => {

      it('returns code to create the same data-structure', () => {
        expect(seq.toString()).to.equal('Future.of("resolved").or(Future.of("resolved"))');
      });

    });

  });

  describe('swap', () => {

    const seq = dummy.swap();
    const nseq = new Sequence(rejected, []).swap();

    describe('#fork()', () => {

      it('swaps from right to left', () => {
        return assertRejected(seq, 'resolved');
      });

      it('swaps from left to right', () => {
        return assertResolved(nseq, 'rejected');
      });

    });

    describe('#toString()', () => {

      it('returns code to create the same data-structure', () => {
        expect(seq.toString()).to.equal('Future.of("resolved").swap()');
      });

    });

  });

  describe('fold', () => {

    const seq = dummy.fold(_ => 0, _ => 1);

    describe('#fork()', () => {

      it('runs the action', () => {
        return assertResolved(seq, 1);
      });

    });

    describe('#toString()', () => {

      it('returns code to create the same data-structure', () => {
        expect(seq.toString()).to.equal('Future.of("resolved").fold(_ => 0, _ => 1)');
      });

    });

  });

  describe('finally', () => {

    const seq = dummy.finally(dummy);

    describe('#fork()', () => {

      it('runs the action', () => {
        return assertResolved(seq, 'resolved');
      });

      it('runs the other if the left rejects', done => {
        const other = Future(() => {done()});
        const m = new Sequence(rejected, []).finally(other);
        m.fork(noop, noop);
      });

    });

    describe('#toString()', () => {

      it('returns code to create the same data-structure', () => {
        expect(seq.toString()).to.equal('Future.of("resolved").finally(Future.of("resolved"))');
      });

    });

  });

});
