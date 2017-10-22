import {expect} from 'chai';
import {Future, cache, of, reject, after} from '../index.mjs.js';
import {Cached} from '../src/cache';
import * as U from './util';
import type from 'sanctuary-type-identifiers';

describe('cache()', function(){

  it('throws when not given a Future', function(){
    var f = function(){ return cache(1) };
    expect(f).to.throw(TypeError, /Future/);
  });

  it('is considered a member of fluture/Fluture', function(){
    expect(type(cache(of(1)))).to.equal(Future['@@type']);
  });

  describe('#fork()', function(){

    it('resolves with the resolution value of the given Future', function(){
      U.assertResolved(cache(of(1)), 1);
    });

    it('rejects with the rejection reason of the given Future', function(){
      U.assertRejected(cache(reject(U.error)), U.error);
    });

    it('only forks its given Future once', function(){
      var m = cache(Future(U.onceOrError(function(rej, res){ return res(1) })));
      m.fork(U.noop, U.noop);
      m.fork(U.noop, U.noop);
      return U.assertResolved(m, 1);
    });

    it('resolves all forks once a delayed resolution happens', function(){
      var m = cache(after(20, 1));
      var a = U.assertResolved(m, 1);
      var b = U.assertResolved(m, 1);
      var c = U.assertResolved(m, 1);
      return Promise.all([a, b, c]);
    });

    it('rejects all forks once a delayed rejection happens', function(){
      var m = cache(Future(function(rej){ return void setTimeout(rej, 20, U.error) }));
      var a = U.assertRejected(m, U.error);
      var b = U.assertRejected(m, U.error);
      var c = U.assertRejected(m, U.error);
      return Promise.all([a, b, c]);
    });

    it('rejects all new forks after a rejection happened', function(){
      var m = cache(reject('err'));
      m.fork(U.noop, U.noop);
      return U.assertRejected(m, 'err');
    });

    it('it forks the internal Future again when forked after having been cancelled', function(done){
      var m = cache(Future(function(rej, res){
        var o = {cancelled: false};
        var id = setTimeout(res, 20, o);
        return function(){ return (o.cancelled = true, clearTimeout(id)) };
      }));
      var clear = m.fork(U.noop, U.noop);
      setTimeout(function(){
        clear();
        m.fork(U.noop, function(v){ return (expect(v).to.have.property('cancelled', false), done()) });
      }, 10);
    });

    it('does not reset when one of multiple listeners is cancelled', function(done){
      var m = cache(Future(function(rej, res){
        setTimeout(res, 5, 1);
        return function(){ return done(new Error('Reset happened')) };
      }));
      var cancel = m.fork(U.noop, U.noop);
      m.fork(U.noop, U.noop);
      cancel();
      setTimeout(done, 20);
    });

    it('does not change when cancelled after settled', function(done){
      var m = cache(Future(function(rej, res){
        res(1);
        return function(){ return done(new Error('Cancelled after settled')) };
      }));
      var cancel = m.fork(U.noop, U.noop);
      setTimeout(function(){
        cancel();
        done();
      }, 5);
    });

  });

  describe('#resolve()', function(){

    it('does nothing when state is rejected', function(){
      var m = cache(Future(U.noop));
      m.reject(1);
      m.resolve(2);
      expect(m._state).to.equal(Cached.Rejected);
    });

  });

  describe('#reject()', function(){

    it('does nothing when state is resolved', function(){
      var m = cache(Future(U.noop));
      m.resolve(1);
      m.reject(2);
      expect(m._state).to.equal(Cached.Resolved);
    });

  });

  describe('#_addToQueue()', function(){

    it('does nothing when state is settled', function(){
      var m = cache(Future(U.noop));
      m.resolve(1);
      m._addToQueue(U.noop, U.noop);
      expect(m._queued).to.equal(0);
    });

  });

  describe('#_drainQueue()', function(){

    it('is idempotent', function(){
      var m = cache(of(1));
      m._drainQueue();
      m._drainQueue();
      m.fork(U.noop, U.noop);
      m._drainQueue();
      m._drainQueue();
    });

  });

  describe('#run()', function(){

    it('is idempotent', function(){
      var m = cache(of(1));
      m.run();
      m.run();
    });

  });

  describe('#reset()', function(){

    it('is idempotent', function(){
      var m = cache(of(1));
      m.reset();
      m.fork(U.noop, U.noop);
      m.reset();
      m.reset();
    });

  });

  describe('#toString()', function(){

    it('returns the code to create the Cached', function(){
      var m = cache(of(1));
      var s = 'Future.cache(Future.of(1))';
      expect(m.toString()).to.equal(s);
    });

  });

  describe('#extractLeft()', function(){

    it('returns empty array for cold Cacheds', function(){
      expect(cache(reject(1)).extractLeft()).to.deep.equal([]);
    });

    it('returns array with reason for rejected Cacheds', function(){
      var m = cache(reject(1));
      m.run();
      expect(m.extractLeft()).to.deep.equal([1]);
    });

  });

  describe('#extractRight()', function(){

    it('returns empty array for cold Cacheds', function(){
      expect(cache(of(1)).extractRight()).to.deep.equal([]);
    });

    it('returns array with value for resolved Cacheds', function(){
      var m = cache(of(1));
      m.run();
      expect(m.extractRight()).to.deep.equal([1]);
    });

  });

});
