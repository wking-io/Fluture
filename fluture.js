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

  ////////////////////
  // Error handling //
  ////////////////////

  //A toString function to provide a slightly more meaningful representation of values.
  const toString = x =>
    typeof x === 'string'
    ? JSON.stringify(x)
    : Array.isArray(x)
    ? `[${x.map(toString).join(', ')}]`
    : x && (typeof x.toString === 'function')
    ? x.toString === Object.prototype.toString
    ? `{${Object.keys(x).reduce((o, k) => o.concat(`${toString(k)}: ${toString(x[k])}`), []).join(', ')}}`
    : x.toString()
    : String(x);

  function error$invalidArgument(it, at, expected, actual){
    throw new TypeError(
      `${it} expects argument ${at} to ${expected}\n  Actual: ${toString(actual)}`
    );
  }

  function error$invalidContext(it, actual){
    throw new TypeError(
      `${it} was invoked outside the context of a Future. You might want to use`
      + ` a dispatcher instead\n  Called on: ${toString(actual)}`
    )
  }

  //Check input to Future.
  function check$Future(fork){
    if(typeof fork !== 'function') error$invalidArgument('Future', 0, 'be a function', fork);
  }

  //Check input to Future#fork.
  function check$fork(it, rej, res){
    if(!(it instanceof FutureClass)) error$invalidContext('Future#chain', it);
    if(typeof rej !== 'function') error$invalidArgument('Future#fork', 0, 'be a function', rej);
    if(typeof res !== 'function') error$invalidArgument('Future#fork', 1, 'be a function', res);
  }

  //Check input to Future#chain.
  function check$chain(it, f){
    if(!(it instanceof FutureClass)) error$invalidContext('Future#chain', it);
    if(typeof f !== 'function') error$invalidArgument('Future#chain', 0, 'be a function', f);
  }

  //Check output from the function passed to Future#chain.
  function check$chain$f(m, f, x){
    if(!(m instanceof FutureClass)) throw new TypeError(
      'Future#chain expects the function its given to return a Future'
      + `\n  Actual: ${toString(m)}\n  From calling: ${toString(f)}\n  With: ${toString(x)}`
    );
  }

  function check$chainRej(it, f){
    if(!(it instanceof FutureClass)) error$invalidContext('Future.chainRej', it);
    if(typeof f !== 'function') error$invalidArgument('Future.chainRej', 0, 'a function', f);
  }

  function check$chainRej$f(m, f, x){
    if(!(m instanceof FutureClass)) throw new TypeError(
      'Future.chainRej expects the function its given to return a Future'
      + `\n  Actual: ${toString(m)}\n  From calling: ${toString(f)}\n  With: ${toString(x)}`
    );
  }

  //Check input to Future#map.
  function check$map(it, f){
    if(!(it instanceof FutureClass)) error$invalidContext('Future#map', it);
    if(typeof f !== 'function') error$invalidArgument('Future#map', 0, 'be a function', f);
  }

  //Check input to Future#ap.
  function check$ap(it, m){
    if(!(it instanceof FutureClass)) error$invalidContext('Future#map', it);
    if(!(m instanceof FutureClass)) error$invalidArgument('Future#ap', 0, 'be a Future', m);
  }

  //Check resolution value of the Future on which #ap was called.
  function check$ap$f(f){
    if(typeof f !== 'function') throw new TypeError(
      `Future#ap can only b used on Future<Function> but was used on: ${toString(f)}`
    );
  }

  function check$race(it, m){
    if(!(it instanceof FutureClass)) error$invalidContext('Future.race', it);
    if(!(m instanceof FutureClass)) error$invalidArgument('Future.race', 0, 'be a function', m);
  }

  function check$cache(m){
    if(!(m instanceof FutureClass)) error$invalidArgument('Future.cache', 0, 'be a Future', m);
  }

  function check$cache$settle(oldState, newState, oldValue, newValue){
    if(oldState > 1) throw new Error(
      'Future.cache expects the Future it wraps to only resolve or reject once; '
      + ' a cached Future tried to ' + (newState === 2 ? 'reject' : 'resolve') + ' a second time.'
      + ' Please check your cached Future and make sure it does not call res or rej multiple times'
      + '\n  It was ' + (oldState === 2 ? 'rejected' : 'resolved') + ' with: ' + toString(oldValue)
      + '\n  It got ' + (newState === 2 ? 'rejected' : 'resolved') + ' with: ' + toString(newValue)
    );
  }

  function check$liftNode(f){
    if(typeof f !== 'function') error$invalidArgument('Future.liftNode', 0, 'be a function', f);
  }

  function check$liftPromise(f){
    if(typeof f !== 'function') error$invalidArgument('Future.liftPromise', 0, 'be a function', f);
  }

  function check$liftPromise$f(m, f, x){
    if(!m || typeof m.then !== 'function') throw new TypeError(
      'Future.liftPromise expects the function its given to return a Promise'
      + `\n  Actual: ${toString(m)}\n  From calling: ${toString(f)}\n  With: ${toString(x)}`
    );
  }

  function check$after(n){
    if(typeof n !== 'number') error$invalidArgument('Future.after', 0, 'be a number', n);
  }

  function check$try(f){
    if(typeof f !== 'function') error$invalidArgument('Future.try', 0, 'be a function', f);
  }

  function check$node(f){
    if(typeof f !== 'function') error$invalidArgument('Future.node', 0, 'be a function', f);
  }

  ////////////
  // Future //
  ////////////

  //Constructor.
  function FutureClass(f){
    this._f = f;
  }

  //A createFuture function which pretends to be Future.
  function Future(f){
    check$Future(f);
    return new FutureClass(f);
  }

  //The of method.
  function Future$of(x){
    return new FutureClass(function Future$of$fork(rej, res){
      res(x)
    });
  }

  function Future$fork(rej, res){
    check$fork(this, rej, res);
    this._f(rej, res);
  }

  function Future$chain(f){
    check$chain(this, f);
    const _this = this;
    return new FutureClass(function Future$chain$fork(rej, res){
      _this._f(rej, function Future$chain$res(x){
        const m = f(x);
        check$chain$f(m, f, x);
        m._f(rej, res);
      });
    });
  }

  function Future$chainRej(f){
    check$chainRej(this, f);
    const _this = this;
    return new FutureClass(function Future$chainRej$fork(rej, res){
      _this._f(function Future$chainRej$rej(x){
        const m = f(x);
        check$chainRej$f(m, f, x);
        m._f(rej, res);
      }, res);
    });
  }

  function Future$map(f){
    check$map(this, f);
    const _this = this;
    return new FutureClass(function Future$map$fork(rej, res){
      _this._f(rej, function Future$map$res(x){
        res(f(x));
      });
    });
  }

  function Future$ap(m){
    check$ap(this, m);
    const _this = this;
    return new FutureClass(function Future$ap$fork(g, h){
      let _f, _x, ok1, ok2, ko;
      const rej = x => ko || (ko = 1, g(x));
      _this._f(rej, function Future$ap$resThis(f){
        if(!ok2) return void (ok1 = 1, _f = f);
        check$ap$f(f);
        h(f(_x));
      });
      m._f(rej, function Future$ap$resThat(x){
        if(!ok1) return void (ok2 = 1, _x = x)
        check$ap$f(_f);
        h(_f(x));
      });
    });
  }

  function Future$toString(){
    return `Future(${toString(this._f)})`;
  }

  function Future$race(m){
    check$race(this, m);
    const _this = this;
    return new FutureClass(function Future$race$fork(rej, res){
      let settled = false;
      const once = f => a => settled || (settled = true, f(a));
      _this._f(once(rej), once(res));
      m._f(once(rej), once(res));
    });
  }

  //Give Future a prototype.
  FutureClass.prototype = Future.prototype = {
    _f: null,
    fork: Future$fork,
    [FL.of]: Future$of,
    of: Future$of,
    [FL.chain]: Future$chain,
    chain: Future$chain,
    chainRej: Future$chainRej,
    [FL.map]: Future$map,
    map: Future$map,
    [FL.ap]: Future$ap,
    ap: Future$ap,
    toString: Future$toString,
    race: Future$race
  };

  //Expose `of` statically as well.
  Future[FL.of] = Future.of = Future$of;

  //Expose Future statically for ease of destructuring.
  Future.Future = Future;

  /////////////////
  // Dispatchers //
  /////////////////

  //Creates a dispatcher for a unary method.
  function createUnaryDispatcher(method){
    return curry(function dispatch(a, m){
      if(m && typeof m[method] === 'function') return m[method](a);
      error$invalidArgument(`Future.${method}`, 1, `have a "${method}" method`, m);
    });
  }

  //Creates a dispatcher for a binary method.
  function createBinaryDispatcher(method){
    return curry(function dispatch(a, b, m){
      if(m && typeof m[method] === 'function') return m[method](a, b);
      error$invalidArgument(`Future.${method}`, 2, `have a "${method}" method`, m);
    });
  }

  //chain :: Chain m => (a -> m b) -> m a -> m b
  Future.chain = createUnaryDispatcher('chain');

  //chainRej :: (a -> Future a c) -> Future a b -> Future a c
  Future.chainRej = createUnaryDispatcher('chainRej');

  //map :: Functor m => (a -> b) -> m a -> m b
  Future.map = createUnaryDispatcher('map');

  //ap :: Apply m => m (a -> b) -> m a -> m b
  Future.ap = curry(function dispatch$ap(m, a){
    if(m && typeof m.ap === 'function') return m.ap(a);
    error$invalidArgument('Future.ap', 0, 'have a "ap" method', m);
  });

  //fork :: (a -> Void) -> (b -> Void) -> Future a b -> Void
  Future.fork = createBinaryDispatcher('fork');

  //race :: Future a b -> Future a b -> Future a b
  Future.race = createUnaryDispatcher('race');

  ///////////////
  // Utilities //
  ///////////////

  /**
   * Cache a Future
   *
   * Returns a Future which caches the resolution value of the given Future so
   * that whenever it's forked, it can load the value from cache rather than
   * reexecuting the chain.
   *
   * @param {Future} m The Future to be cached.
   *
   * @return {Future} The Future which does the caching.
   */
  Future.cache = function Future$cache(m){
    check$cache(m);
    let que = [];
    let value, state;
    const settleWith = newState => function Future$cache$settle(newValue){
      check$cache$settle(state, newState, value, newValue);
      value = newValue; state = newState;
      for(let i = 0, l = que.length; i < l; i++){
        que[i][state](value);
        que[i] = undefined;
      }
      que = undefined;
    };
    return new FutureClass(function Future$cache$fork(rej, res){
      switch(state){
        case 1: que.push({2: rej, 3: res}); break;
        case 2: rej(value); break;
        case 3: res(value); break;
        default:
          state = 1;
          que.push({2: rej, 3: res});
          m.fork(settleWith(2), settleWith(3));
      }
    });
  };

  /**
   * Turn a node continuation-passing-style function into a function which returns a Future.
   *
   * Takes a function which uses a node-style callback for continuation and
   * returns a function which returns a Future for continuation.
   *
   * @sig liftNode :: (x..., (a, b -> Void) -> Void) -> x... -> Future[a, b]
   *
   * @param {Function} f The node function to wrap.
   *
   * @return {Function} A function which returns a Future.
   */
  Future.liftNode = function Future$liftNode(f){
    check$liftNode(f);
    return function Future$liftNode$lifted(){
      const xs = arguments;
      return new FutureClass(function Future$liftNode$fork(rej, res){
        return f(...xs, function Future$liftNode$callback(err, result){
          err ? rej(err) : res(result);
        });
      });
    };
  };

  /**
   * Turn a function which returns a Promise into a function which returns a Future.
   *
   * @sig liftPromise :: (x... -> Promise a b) -> x... -> Future a b
   *
   * @param {Function} f The function to wrap.
   *
   * @return {Function} A function which returns a Future.
   */
  Future.liftPromise = function Future$liftPromise(f){
    check$liftPromise(f);
    return function Future$liftPromise$lifted(){
      const xs = arguments;
      return new FutureClass(function Future$liftPromise$fork(rej, res){
        const m = f(...xs);
        check$liftPromise$f(m, f, xs);
        return m.then(res, rej);
      });
    };
  };

  //Create a Future which rejects witth the given value.
  Future.reject = function Future$reject(x){
    return new FutureClass(function Future$reject$fork(rej){
      rej(x);
    });
  };

  //Create a Future which resolves after the given time with the given value.
  Future.after = curry(function Future$after(n, x){
    check$after(n);
    return new FutureClass(function Future$after$fork(rej, res){
      setTimeout(res, n, x);
    })
  });

  //Create a Future which resolves with the return value of the given function,
  //or rejects with the exception thrown by the given function.
  Future.try = function Future$try(f){
    check$try(f);
    return new FutureClass(function Future$try$fork(rej, res){
      try{
        res(f());
      }
      catch(err){
        rej(err);
      }
    });
  };

  /**
   * Allow one-off wrapping of a function that requires a node-style callback.
   *
   * @sig fromNode :: ((err, a) -> Void) -> Future[Error, a]
   *
   * @param {Function} f The operation expected to eventaully call the callback.
   *
   * @return {Future}
   *
   * @example
   *
   *     node(done => MySql.connect(done))
   *     .fork(console.error, console.log)
   *
   */
  Future.node = function Future$node(f){
    check$node(f);
    return new FutureClass(function Future$node$fork(rej, res){
      f((a, b) => a ? rej(a) : res(b));
    });
  };

  //Export Future factory.
  return Future;

}));
