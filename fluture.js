/*global define*/
/*global FantasyLand*/
/*global _*/
(function(global, f){

  'use strict';

  /* istanbul ignore else */
  if(typeof module !== 'undefined'){
    module.exports = f(require('fantasy-land'), require('lodash.curry'));
  }

  else if(typeof define === 'function' && define.amd){
    define(['fantasy-land', 'lodash.curry'], f);
  }

  else{
    global.Fluture = f(FantasyLand, _.curry);
  }

}(global || window || this, function(FL, curry){

  'use strict';

  //A toString function to provide a slightly more meaningful representation of values.
  const toString = x =>
    typeof x === 'string'
    ? JSON.stringify(x)
    : Array.isArray(x)
    ? `[${x.map(toString).join(', ')}]`
    : x && (typeof x.toString === 'function')
    ? x.toString === Object.prototype.toString
    ? `{${Object.keys(x).reduce((o, k) => o.concat(`"${k}": ${toString(x[k])}`), []).join(', ')}}`
    : x.toString()
    : String(x);

  function error(message, actual){
    return message + '\n  Actual: ' + actual;
  }

  //Check input to Future.
  function check$Future(fork){
    if(typeof fork !== 'function') throw new TypeError(error(
      'Future expects its argument to be a function',
      toString(fork)
    ));
  }

  //Check input to Future#fork.
  function check$fork$rej(f){
    if(typeof f !== 'function') throw new TypeError(error(
      'Future#fork expects its first argument to be a function',
      toString(f)
    ));
  }

  //Check input to Future#fork.
  function check$fork$res(f){
    if(typeof f !== 'function') throw new TypeError(error(
      'Future#fork expects its second argument to be a function',
      toString(f)
    ));
  }

  //Check input to Future#chain.
  function check$chain(f){
    if(typeof f !== 'function') throw new TypeError(error(
      'Future#chain expects its argument to be a function',
      toString(f)
    ));
  }

  //Check output from the function passed to Future#chain.
  function check$chain$f(m, f, x){
    if(!m || typeof m.fork !== 'function') throw new TypeError(error(
      'Future#chain expects the function its given to return a Future',
      `${toString(m)}\n  From calling: ${toString(f)}\n  With: ${toString(x)}`
    ));
  }

  //Check input to Future#map.
  function check$map(f){
    if(typeof f !== 'function') throw new TypeError(error(
      'Future#map expects its argument to be a function',
      toString(f)
    ));
  }

  //Check input to Future#ap.
  function check$ap(m){
    if(!m || typeof m.fork !== 'function') throw new TypeError(error(
      'Future#ap expects its argument to be a Future',
      toString(m)
    ));
  }

  //Check resolution value of the Future on which #ap was called.
  function check$ap$f(f){
    if(typeof f !== 'function') throw new TypeError(error(
      'Future#ap was called on something other than Future<Function>',
      `Future.of(${toString(f)})`
    ));
  }

  //The of method.
  function Future$of(x){
    return new Future(function Future$of$fork(rej, res){
      res(x)
    });
  }

  //Create the new Future.
  //Uses `createFn` factories to allow for inlining and function naming.
  //Uses `Object.create` to generate the right inheritance tree.
  function Future(f){
    check$Future(f);
    this._f = f;
    return this;
  }

  //A createFuture function which pretends to be Future.
  function createFuture(f){
    return new Future(f);
  }

  //Give Future a prototype.
  Future.prototype = createFuture.prototype = {

    _f: null,

    fork: function Future$fork(rej, res){
      check$fork$rej(rej);
      check$fork$res(res);
      this._f(rej, res);
    },

    [FL.of]: Future$of,

    [FL.chain]: function Future$chain(f){
      check$chain(f);
      const _this = this;
      return new Future(function Future$chain$fork(rej, res){
        _this.fork(rej, function Future$chain$res(x){
          const m = f(x);
          check$chain$f(m, f, x);
          m.fork(rej, res);
        });
      });
    },

    [FL.map]: function Future$map(f){
      check$map(f);
      const _this = this;
      return new Future(function Future$map$fork(rej, res){
        _this.fork(rej, function Future$map$res(x){
          res(f(x));
        });
      });
    },

    [FL.ap]: function Future$ap(m){
      check$ap(m);
      const _this = this;
      return new Future(function Future$ap$fork(g, h){
        let _f, _x, ok1, ok2, ko;
        const rej = x => ko || (ko = 1, g(x));
        _this.fork(rej, function Future$ap$resThis(f){
          if(!ok2) return void (ok1 = 1, _f = f);
          check$ap$f(f);
          h(f(_x));
        });
        m.fork(rej, function Future$ap$resThat(x){
          if(!ok1) return void (ok2 = 1, _x = x)
          check$ap$f(_f);
          h(_f(x));
        });
      });
    },

    toString: function Future$toString(){
      return `Future(${toString(this._f)})`;
    }

  };

  //Expose `of` statically as well.
  Future[FL.of] = createFuture[FL.of] = Future$of;

  //Expose Future statically for ease of destructuring.
  createFuture.Future = Future;

  //Turn a continuation-passing-style function into a function which returns a Future.
  createFuture.liftNode = function Future$liftNode(f){
    return function Future$liftNode$lifted(){
      const xs = arguments;
      return new Future(function Future$liftNode$fork(rej, res){
        return f(...xs, function Future$liftNode$callback(err, result){
          err ? rej(err) : res(result);
        });
      });
    };
  };

  //Turn a function which returns a Promise into a function which returns a Future.
  createFuture.liftPromise = function Future$liftPromise(f){
    return function Future$liftPromise$lifted(){
      const xs = arguments;
      return new Future(function Future$liftPromise$fork(rej, res){
        return f(...xs).then(res, rej);
      });
    };
  };

  //Create a Future which rejects witth the given value.
  createFuture.reject = function Future$reject(x){
    return new Future(function Future$reject$fork(rej){
      rej(x);
    });
  };

  //Create a Future which resolves after the given time with the given value.
  createFuture.after = curry(function Future$after(n, x){
    return new Future(function Future$after$fork(rej, res){
      setTimeout(res, n, x);
    })
  });

  //Create a Future which resolves with the return value of the given function,
  //or rejects with the exception thrown by the given function.
  createFuture.try = function Future$try(f){
    return new Future(function Future$try$fork(rej, res){
      try{
        res(f());
      }
      catch(err){
        rej(err);
      }
    });
  };

  //Export Future factory.
  return createFuture;

}));
