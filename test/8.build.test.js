import {expect} from 'chai';
import {noop} from './util';
import * as Fluture from '../index.mjs.js';

const Future = require('../index.js');

describe('CommonJS build output', function(){

  it('exports the Future constructor by default', function(){
    expect(Future).to.be.a('function');
    expect(Future(noop)).to.be.an.instanceof(Future);
  });

  it('has a Future property that refers to itself for import destructuring', function(){
    expect(Future.Future).to.equal(Future);
  });

  it('has all desired properties', function(){
    Object.keys(Fluture).forEach(key => {
      expect(typeof Future[key] === typeof Fluture[key]);
    });
  });

});
