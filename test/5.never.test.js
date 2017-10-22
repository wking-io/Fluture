import {expect} from 'chai';
import {Future, never} from '../index.mjs.js';
import * as U from './util';
import type from 'sanctuary-type-identifiers';

describe('Never', function(){

  it('extends Future', function(){
    expect(never).to.be.an.instanceof(Future);
  });

  it('is considered a member of fluture/Fluture', function(){
    expect(type(never)).to.equal(Future['@@type']);
  });

  describe('#fork()', function(){

    it('does nothing and returns a noop cancel function', function(){
      var m = never;
      var cancel = m.fork(U.noop, U.noop);
      cancel();
    });

  });

  describe('#toString()', function(){

    it('returns the code to create the Never', function(){
      var m = never;
      expect(m.toString()).to.equal('Future.never');
    });

  });

});
