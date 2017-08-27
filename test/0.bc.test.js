import {expect} from 'chai';
import * as bc from '../src/internal/bc';

describe('bc', () => {

  describe('.setImmediate()', () => {

    it('calls the given function with the given argument', done => {
      bc.setImmediate(done, null);
    });

    it('schedules the function call relatively quickly', done => {
      let message = '';
      bc.setImmediate(x => { message = x }, 'hello');
      setTimeout(() => {
        expect(message).to.equal('hello');
        done();
      });
    });

  });

});
