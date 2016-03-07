/*global define*/
/*global FantasyLand*/
(function(global, f){

  'use strict';

  /* istanbul ignore else */
  if(typeof module !== 'undefined'){
    module.exports = f(require('fantasy-land'));
  }

  else if(typeof define === 'function' && define.amd){
    define(['fantasy-land'], f);
  }

  else{
    global.Fluture = f(FantasyLand);
  }

}(global || window || this, function(FL){

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

  const isFuture = x => x && typeof x.fork === 'function';

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
    if(!isFuture(m)) throw new TypeError(error(
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

  //Create a fork method.
  function createFork(fork){
    return function Future$fork(rej, res){
      check$fork$rej(rej);
      check$fork$res(res);
      fork(rej, res);
    };
  }

  //Create a chain method.
  function createChain(fork){
    return function Future$chain(f){
      check$chain(f);
      return Future(function Future$chain$fork(rej, res){
        fork(rej, function Future$chain$res(x){
          const m = f(x);
          check$chain$f(m, f, x);
          m.fork(rej, res);
        });
      });
    };
  }

  //Create a map method.
  function createMap(chain){
    return function Future$map(f){
      check$map(f);
      return chain(function Future$map$chain(x){
        return Future$of(f(x));
      });
    };
  }

  //Create an ap method.
  function createAp(fork){
    return function Future$ap(m){
      check$ap(m);
      return Future(function Future$ap$fork(g, h){
        let _f, _x, ok1 = false, ok2 = false, ko = false;
        const rej = x => ko || (ko = true, g(x));
        fork(rej, function Future$ap$resThis(f){
          if(!ok2) return void (ok1 = true, _f = f);
          check$ap$f(f);
          h(f(_x));
        });
        m.fork(rej, function Future$ap$resThat(x){
          if(!ok1) return void (ok2 = true, _x = x)
          check$ap$f(_f);
          h(_f(x));
        });
      });
    };
  }

  //The of method.
  function Future$of(x){
    return Future(function Future$of$fork(rej, res){
      res(x)
    });
  }

  //Create the new Future.
  //Uses `createFn` factories to allow for inlining and function naming.
  //Uses `Object.create` to generate the right inheritance tree.
  function Future(f){
    check$Future(f);
    const future = Object.create(Future.prototype);
    future.fork = createFork(f);
    future[FL.chain] = createChain(future.fork);
    future[FL.map] = createMap(future[FL.chain]);
    future[FL.ap] = createAp(future.fork);
    future.toString = function Future$toString(){
      return `Future(${toString(f)})`;
    };
    return future;
  }

  //Give Future a prototype.
  //`of` Is allowed in the prototype because it's static.
  Future.prototype = {[FL.of]: Future$of};

  //Expose `of` statically as well.
  Future[FL.of] = Future$of;

  //Expose Future statically for ease of destructuring.
  Future.Future = Future;

  //Turn a curried function into a function which may also accept multiple arguments at once.
  const uncurry = (n, f) => {
    return function uncurry$uncurried(){
      const xs = arguments;
      const l = xs.length;
      switch(l){
        case 0: return uncurry(n, f);
        case 1: return n > 1 ? uncurry(n - 1, f(xs[0])) : f(xs[0]);
        case 2: return n > 2 ? uncurry(n - 2, f(xs[0])(xs[1])) : f(xs[0])(xs[1]);
        default:
          for(let i = 0; i < l && n > 0; i++, n--){
            f = f(xs[i])
          }
          return n < 1 ? f : uncurry(n, f);
      }
    };
  };

  //Turn a continuation-passing-style function into a function which returns a Future.
  Future.liftNode = function Future$liftNode(f){
    return function Future$liftNode$lifted(){
      const xs = arguments;
      return Future(function Future$liftNode$fork(rej, res){
        return f(...xs, function Future$liftNode$callback(err, result){
          err ? rej(err) : res(result);
        });
      });
    };
  };

  //Turn a function which returns a Promise into a function which returns a Future.
  Future.liftPromise = function Future$liftPromise(f){
    return function Future$liftPromise$lifted(){
      const xs = arguments;
      return Future(function Future$liftPromise$fork(rej, res){
        return f(...xs).then(res, rej);
      });
    };
  };

  //Create a Future which rejects witth the given value.
  Future.reject = function Future$reject(x){
    return Future(function Future$reject$fork(rej){
      rej(x);
    });
  };

  //Create a Future which resolves after the given time with the given value.
  Future.after = uncurry(2, n => x => Future(function Future$after$fork(rej, res){
    setTimeout(res, n, x);
  }));

  //Create a Future which resolves with the return value of the given function,
  //or rejects with the exception thrown by the given function.
  Future.try = f => Future(function Future$try$fork(rej, res){
    try{
      res(f());
    }
    catch(err){
      rej(err);
    }
  });

  //Export Future.
  return Future;

}));
