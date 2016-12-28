'use strict';

const expect = require('chai').expect;
const Future = require('../fluture.js');
const FutureFromForkable = Future.classes.FutureFromForkable;

describe('Future.cast()', () => {

  it('returns an instance of FutureFromForkable', () => {
    expect(Future.cast(Future.of(1))).to.be.an.instanceof(FutureFromForkable);
  });

});
