import {expect} from 'chai';
import * as bc from '../src/internal/bc';

describe('bc', function(){

  describe('.setImmediate()', function(){

    it('calls the given function with the given argument', function(done){
      bc.setImmediate(done, null);
    });

    it('schedules the function call relatively quickly', function(done){
      var message = '';
      bc.setImmediate(function(x){ message = x }, 'hello');
      setTimeout(function(){
        expect(message).to.equal('hello');
        done();
      });
    });

  });

});
