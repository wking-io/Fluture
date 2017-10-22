import {Future, of, never, after} from '../index.mjs.js';
import {expect} from 'chai';
import {add, bang, noop, error, assertResolved, assertRejected} from './util';
import {resolved, rejected, resolvedSlow} from './futures';
import {Sequence, Core} from '../src/core';
import {StateT} from 'fantasy-states';

describe('Sequence', function(){

  var dummy = new Sequence(resolved);

  describe('ap', function(){

    var seq = of(bang).ap(dummy);

    describe('#fork()', function(){

      it('runs the action', function(){
        return assertResolved(seq, 'resolved!');
      });

    });

    describe('#toString()', function(){

      it('returns code to create the same data-structure', function(){
        var expected = 'Future.of(' + bang.toString() + ').ap(Future.of("resolved")).map(' + bang.toString() + ')';
        expect(seq.map(bang).toString()).to.equal(expected);
      });

    });

  });

  describe('map', function(){

    var seq = dummy.map(bang);

    describe('#fork()', function(){

      it('runs the action', function(){
        return assertResolved(seq, 'resolved!');
      });

    });

    describe('#toString()', function(){

      it('returns code to create the same data-structure', function(){
        expect(seq.toString()).to.equal('Future.of("resolved").map(' + bang.toString() + ')');
      });

    });

  });

  describe('bimap', function(){

    var seq = dummy.bimap(add(1), bang);

    describe('#fork()', function(){

      it('runs the action', function(){
        return assertResolved(seq, 'resolved!');
      });

    });

    describe('#toString()', function(){

      it('returns code to create the same data-structure', function(){
        expect(seq.toString()).to.equal('Future.of("resolved").bimap(' + add(1).toString() + ', ' + bang.toString() + ')');
      });

    });

  });

  describe('chain', function(){

    var seq = dummy.chain(function(x){ return of(bang(x)) });

    describe('#fork()', function(){

      it('runs the action', function(){
        return assertResolved(seq, 'resolved!');
      });

    });

    describe('#toString()', function(){

      it('returns code to create the same data-structure', function(){
        expect(seq.toString()).to.equal('Future.of("resolved").chain(function (x){ return of(bang(x)) })');
      });

    });

  });

  describe('mapRej', function(){

    var seq = dummy.mapRej(add(1));

    describe('#fork()', function(){

      it('runs the action', function(){
        return assertResolved(seq, 'resolved');
      });

    });

    describe('#toString()', function(){

      it('returns code to create the same data-structure', function(){
        expect(seq.toString()).to.equal('Future.of("resolved").mapRej(' + add(1).toString() + ')');
      });

    });

  });

  describe('chainRej', function(){

    var seq = dummy.chainRej(function(){ return of(1) });

    describe('#fork()', function(){

      it('runs the action', function(){
        return assertResolved(seq, 'resolved');
      });

    });

    describe('#toString()', function(){

      it('returns code to create the same data-structure', function(){
        expect(seq.toString()).to.equal('Future.of("resolved").chainRej(function (){ return of(1) })');
      });

    });

  });

  describe('race', function(){

    var seq = dummy.race(dummy);

    it('returns itself when racing Never', function(){
      expect(dummy.race(never)).to.equal(dummy);
    });

    describe('#fork()', function(){

      it('runs the action', function(){
        return assertResolved(seq, 'resolved');
      });

    });

    describe('#toString()', function(){

      it('returns code to create the same data-structure', function(){
        expect(seq.toString()).to.equal('Future.of("resolved").race(Future.of("resolved"))');
      });

    });

  });

  describe('both', function(){

    var seq = dummy.both(dummy);

    describe('#fork()', function(){

      it('runs the action', function(){
        return assertResolved(seq, ['resolved', 'resolved']);
      });

    });

    describe('#toString()', function(){

      it('returns code to create the same data-structure', function(){
        expect(seq.toString()).to.equal('Future.of("resolved").both(Future.of("resolved"))');
      });

    });

  });

  describe('and', function(){

    var seq = dummy.and(dummy);

    describe('#fork()', function(){

      it('runs the action', function(){
        return assertResolved(seq, 'resolved');
      });

    });

    describe('#toString()', function(){

      it('returns code to create the same data-structure', function(){
        expect(seq.toString()).to.equal('Future.of("resolved").and(Future.of("resolved"))');
      });

    });

  });

  describe('or', function(){

    var seq = dummy.or(dummy);

    describe('#fork()', function(){

      it('runs the action', function(){
        return assertResolved(seq, 'resolved');
      });

    });

    describe('#toString()', function(){

      it('returns code to create the same data-structure', function(){
        expect(seq.toString()).to.equal('Future.of("resolved").or(Future.of("resolved"))');
      });

    });

  });

  describe('swap', function(){

    var seq = dummy.swap();
    var nseq = new Sequence(rejected).swap();

    describe('#fork()', function(){

      it('swaps from right to left', function(){
        return assertRejected(seq, 'resolved');
      });

      it('swaps from left to right', function(){
        return assertResolved(nseq, 'rejected');
      });

    });

    describe('#toString()', function(){

      it('returns code to create the same data-structure', function(){
        expect(seq.toString()).to.equal('Future.of("resolved").swap()');
      });

    });

  });

  describe('fold', function(){

    var seq = dummy.fold(function(){ return 0 }, function(){ return 1 });

    describe('#fork()', function(){

      it('runs the action', function(){
        return assertResolved(seq, 1);
      });

    });

    describe('#toString()', function(){

      it('returns code to create the same data-structure', function(){
        expect(seq.toString()).to.equal('Future.of("resolved").fold(function (){ return 0 }, function (){ return 1 })');
      });

    });

  });

  describe('finally', function(){

    var seq = dummy.finally(dummy);

    describe('#fork()', function(){

      it('runs the action', function(){
        return assertResolved(seq, 'resolved');
      });

      it('runs the other if the left rejects', function(done){
        var other = Future(function(){done()});
        var m = new Sequence(rejected).finally(other);
        m.fork(noop, noop);
      });

    });

    describe('#toString()', function(){

      it('returns code to create the same data-structure', function(){
        expect(seq.toString()).to.equal('Future.of("resolved").finally(Future.of("resolved"))');
      });

    });

  });

  describe('in general', function(){

    describe('#fork()', function(){

      it('is capable of joining', function(){
        var m = new Sequence(of('a'))
        //eslint-disable-next-line max-nested-callbacks
        .chain(function(x){ return after(5, (x + 'b')).chain(function(x){ return after(5, (x + 'c')) }) })
        .chain(function(x){ return after(5, (x + 'd')) })
        .chain(function(x){ return of((x + 'e')) })
        .chain(function(x){ return after(5, (x + 'f')) });
        return assertResolved(m, 'abcdef');
      });

      it('is capable of early termination', function(done){
        var slow = new Sequence(Future(function(){
          var id = setTimeout(done, 20, new Error('Not terminated'));
          return function(){ return clearTimeout(id) };
        }));
        var m = slow.race(slow).race(slow).race(slow).race(resolved);
        m.fork(noop, noop);
        setTimeout(done, 40, null);
      });

      it('cancels running actions when one early-terminates asynchronously', function(done){
        var slow = new Sequence(Future(function(){
          var id = setTimeout(done, 50, new Error('Not terminated'));
          return function(){ return clearTimeout(id) };
        }));
        var m = slow.race(slow).race(slow).race(slow).race(resolvedSlow);
        m.fork(noop, noop);
        setTimeout(done, 100, null);
      });

      it('does not run actions unnecessarily when one early-terminates synchronously', function(done){
        var broken = new Sequence(Future(function(){ console.log('broken'); done(error) }));
        var m = resolvedSlow.race(broken).race(broken).race(resolved);
        m.fork(noop, function(){ return done() });
      });

      it('resolves the left-hand side first when running actions in parallel', function(){
        var m = new Sequence(of(1)).map(function(x){ return x }).chain(function(x){ return of(x) });
        return assertResolved(m.race(of(2)), 1);
      });

      it('does not forget about actions to run after early termination', function(){
        var m = new Sequence(after(30, 'a'))
                  .race(new Sequence(after(20, 'b')))
                  .map(function(x){ return (x + 'c') });
        return assertResolved(m, 'bc');
      });

      it('does not run early terminating actions twice, or cancel them', function(done){
        var mock = Object.create(Core);
        mock._fork = function(l, r){ return r(done()) || (function(){ return done(error) }) };
        var m = new Sequence(after(30, 'a')).map(function(x){ return (x + 'b') }).race(mock);
        m.fork(noop, noop);
      });

      it('does not run run concurrent computations twice', function(done){
        var ran = false;
        var mock = Future(function(){ ran ? done(error) : (ran = true) });
        var m = new Sequence(resolvedSlow).chain(function(){ return resolvedSlow }).race(mock);
        m.fork(done, function(){ return done() });
      });

      it('returns a cancel function which cancels all running actions', function(done){
        var i = 0;
        var started = function(){ return void i++ };
        var cancelled = function(){ return --i < 1 && done() };
        var slow = Future(function(){ return started() || (function(){ return cancelled() }) });
        var m = slow.race(slow).race(slow).race(slow).race(slow);
        var cancel = m.fork(noop, noop);
        expect(i).to.equal(5);
        cancel();
      });

    });

  });

  describe('Bug 2017-06-02, reported by @d3vilroot', function(){

    var Middleware = StateT(Future);
    var slow = Middleware.lift(after(10, null));
    var program = slow.chain(function(){ return slow.chain(function(){ return slow }) }).evalState(null);

    it('does not occur', function(done){
      program.fork(done, function(){ return done() });
    });

  });

});
