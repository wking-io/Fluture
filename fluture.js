/*global define FantasyLand inspectf*/
(function(global, f){

  'use strict';

  /*istanbul ignore next*/
  if(typeof module !== 'undefined'){
    module.exports = f(require('fantasy-land'), require('inspect-f'));
  }

  else if(typeof define === 'function' && define.amd){
    define(['fantasy-land', 'inspect-x', 'inspect-f'], f);
  }

  else{
    global.Fluture = f(FantasyLand, inspectf);
  }

}(/*istanbul ignore next*/(global || window || this), function(FL, inspectf){

  'use strict';

  /////////////
  // Helpers //
  /////////////

  function noop(){}
  function fork(m, rej, res){
    const clean = m._f(rej, res);
    return typeof clean === 'function' ? clean : noop;
  }

  ///////////////////
  // Type checking //
  ///////////////////

  function isForkable(m){
    return m && typeof m.fork === 'function' && m.fork.length >= 2;
  }

  function isFluture(m){
    return m instanceof FutureClass;
  }

  function isFunction(f){
    return typeof f === 'function';
  }

  function isPositiveInteger(n){
    return n === Infinity || (typeof n === 'number' && n > 0 && n % 1 === 0 && n === n);
  }

  ////////////////////
  // Error handling //
  ////////////////////

  //A small string representing a value, but not containing the whole value.
  const preview = x =>
    typeof x === 'string'
    ? JSON.stringify(x)
    : Array.isArray(x)
    ? `[Array ${x.length}]`
    : typeof x === 'function'
    ? typeof x.name === 'string' && x.name.length > 0
    ? `[Function ${x.name}]`
    : '[Function]'
    : x && x.toString === Object.prototype.toString
    ? `[Object ${Object.keys(x).map(String).join(', ')}]`
    : String(x);

  //A show function to provide a slightly more meaningful representation of values.
  const show = x =>
    typeof x === 'string'
    ? preview(x)
    : Array.isArray(x)
    ? `[${x.map(preview).join(', ')}]`
    : x && (typeof x.toString === 'function')
    ? x.toString === Object.prototype.toString
    ? `{${Object.keys(x).reduce((o, k) => o.concat(`${preview(k)}: ${preview(x[k])}`), []).join(', ')}}`
    : x.toString()
    : preview(x);

  const showf = f => inspectf(2, f).replace(/^/gm, '  ').trim();

  function error$invalidArgument(it, at, expected, actual){
    throw new TypeError(
      `${it} expects argument ${at} to ${expected}\n  Actual: ${show(actual)}`
    );
  }

  function error$invalidContext(it, actual){
    throw new TypeError(
      `${it} was invoked outside the context of a Future. You might want to use`
      + ` a dispatcher instead\n  Called on: ${show(actual)}`
    )
  }

  function check$Future(fork){
    if(!isFunction(fork)) error$invalidArgument('Future', 0, 'be a function', fork);
  }

  function check$fork(it, rej, res){
    if(!isFluture(it)) error$invalidContext('Future#fork', it);
    if(!isFunction(rej)) error$invalidArgument('Future#fork', 0, 'be a function', rej);
    if(!isFunction(res)) error$invalidArgument('Future#fork', 1, 'be a function', res);
  }

  function check$chain(it, f){
    if(!isFluture(it)) error$invalidContext('Future#chain', it);
    if(!isFunction(f)) error$invalidArgument('Future#chain', 0, 'be a function', f);
  }

  function check$chain$f(m, f, x){
    if(!isFluture(m)) throw new TypeError(
      'Future#chain expects the function its given to return a Future'
      + `\n  Actual: ${show(m)}\n  From calling: ${showf(f)}\n  With: ${show(x)}`
    );
  }

  function check$chainRej(it, f){
    if(!isFluture(it)) error$invalidContext('Future.chainRej', it);
    if(!isFunction(f)) error$invalidArgument('Future.chainRej', 0, 'a function', f);
  }

  function check$chainRej$f(m, f, x){
    if(!isFluture(m)) throw new TypeError(
      'Future.chainRej expects the function its given to return a Future'
      + `\n  Actual: ${show(m)}\n  From calling: ${showf(f)}\n  With: ${show(x)}`
    );
  }

  function check$map(it, f){
    if(!isFluture(it)) error$invalidContext('Future#map', it);
    if(!isFunction(f)) error$invalidArgument('Future#map', 0, 'be a function', f);
  }

  function check$ap(it, m){
    if(!isFluture(it)) error$invalidContext('Future#ap', it);
    if(!isFluture(m)) error$invalidArgument('Future#ap', 0, 'be a Future', m);
  }

  function check$ap$f(f){
    if(!isFunction(f)) throw new TypeError(
      `Future#ap can only be used on Future<Function> but was used on a Future of: ${show(f)}`
    );
  }

  function check$race(it, m){
    if(!isFluture(it)) error$invalidContext('Future#race', it);
    if(!isFluture(m)) error$invalidArgument('Future#race', 0, 'be a Future', m);
  }

  function check$or(it, m){
    if(!isFluture(it)) error$invalidContext('Future#or', it);
    if(!isFluture(m)) error$invalidArgument('Future#or', 0, 'be a Future', m);
  }

  function check$fold(it, f, g){
    if(!isFluture(it)) error$invalidContext('Future#fold', it);
    if(!isFunction(f)) error$invalidArgument('Future#fold', 0, 'be a function', f);
    if(!isFunction(g)) error$invalidArgument('Future#fold', 1, 'be a function', g);
  }

  function check$value(it, f){
    if(!isFluture(it)) error$invalidContext('Future#value', it);
    if(!isFunction(f)) error$invalidArgument('Future#value', 0, 'be a function', f);
  }

  function check$promise(it){
    if(!isFluture(it)) error$invalidContext('Future#promise', it);
  }

  function check$cache(it){
    if(!isFluture(it)) error$invalidContext('Future#cache', it);
  }

  function check$cache$settle(oldState, newState, oldValue, newValue){
    if(oldState !== 'pending') throw new Error(
      'A cached Future may only resolve or reject once;'
      + ` tried to go into a ${newState} state while already ${oldState}.`
      + ' Please check your cached Future and make sure it does not call res or rej multiple times'
      + `\n  It was ${oldState} with: ${show(oldValue)}`
      + `\n  It got ${newState} with: ${show(newValue)}`
    );
  }

  function check$after(n){
    if(typeof n !== 'number') error$invalidArgument('Future.after', 0, 'be a number', n);
  }

  function check$cast(m){
    if(!isForkable(m)) error$invalidArgument('Future.cast', 0, 'be a Forkable', m);
  }

  function check$encase(f){
    if(typeof f !== 'function') error$invalidArgument('Future.encase', 0, 'be a function', f);
  }

  function check$node(f){
    if(typeof f !== 'function') error$invalidArgument('Future.node', 0, 'be a function', f);
  }

  function check$parallel(i, ms){
    if(!isPositiveInteger(i)) error$invalidArgument('Future.parallel', 0, 'be a positive integer', i);
    if(!Array.isArray(ms)) error$invalidArgument('Future.parallel', 0, 'be an array', ms);
  }

  function check$parallel$m(m, i){
    if(!isFluture(m)) throw new TypeError(
      'Future.parallel expects argument 1 to be an array of Futures.'
      + ` The value at position ${i} in the array was not a Future.\n  Actual: ${show(m)}`
    );
  }

  ////////////
  // Future //
  ////////////

  function FutureClass(f){
    this._f = f;
  }

  function Future(f){
    check$Future(f);
    return new FutureClass(f);
  }

  function Future$of(x){
    return new FutureClass(function Future$of$fork(rej, res){
      res(x);
    });
  }

  function Future$fork(rej, res){
    check$fork(this, rej, res);
    let immediate = false, clear;
    clear = fork(this, function Future$fork$rej(x){
      rej(x);
      clear ? clear() : (immediate = true);
    }, function Future$fork$res(x){
      res(x);
      clear ? clear() : (immediate = true);
    });
    immediate && clear();
    return clear;
  }

  function Future$chain(f){
    check$chain(this, f);
    const _this = this;
    return new FutureClass(function Future$chain$fork(rej, res){
      let cleared = false, clearThat = noop;
      const clearThis = fork(_this, function Future$chain$rej(x){
        cleared || rej(x);
      }, function Future$chain$res(x){
        if(cleared) return;
        const m = f(x);
        check$chain$f(m, f, x);
        clearThat = fork(m, e => cleared || rej(e), x => cleared || res(x));
      });
      return function Future$chain$clear(){
        cleared = true;
        clearThis();
        clearThat();
      };
    });
  }

  function Future$chainRej(f){
    check$chainRej(this, f);
    const _this = this;
    return new FutureClass(function Future$chainRej$fork(rej, res){
      let cleared = false, clearThat = noop;
      const clearThis = fork(_this, function Future$chainRej$rej(x){
        if(cleared) return;
        const m = f(x);
        check$chainRej$f(m, f, x);
        clearThat = fork(m, e => cleared || rej(e), x => cleared || res(x));
      }, function Future$chainRej$res(x){
        cleared || res(x);
      });
      return function Future$chainRej$clear(){
        cleared = true;
        clearThis();
        clearThat();
      };
    });
  }

  function Future$map(f){
    check$map(this, f);
    const _this = this;
    return new FutureClass(function Future$map$fork(rej, res){
      let cleared = false;
      const clear = fork(_this, function Future$map$rej(x){
        cleared || rej(x);
      }, function Future$map$res(x){
        cleared || res(f(x));
      });
      return function Future$map$clear(){
        cleared = true;
        clear();
      };
    });
  }

  function Future$ap(m){
    check$ap(this, m);
    const _this = this;
    return new FutureClass(function Future$ap$fork(g, res){
      let _f, _x, ok1, ok2, ko, cleared = false;
      const rej = x => cleared || ko || (ko = 1, g(x));
      const clearThis = fork(_this, rej, function Future$ap$resThis(f){
        if(cleared) return;
        if(!ok2) return void (ok1 = 1, _f = f);
        check$ap$f(f);
        res(f(_x));
      });
      const clearThat = fork(m, rej, function Future$ap$resThat(x){
        if(cleared) return;
        if(!ok1) return void (ok2 = 1, _x = x)
        check$ap$f(_f);
        res(_f(x));
      });
      return function Future$ap$clear(){
        cleared = true;
        clearThis();
        clearThat();
      };
    });
  }

  function Future$toString(){
    return `Future(${this._f.toString()})`;
  }

  function Future$race(m){
    check$race(this, m);
    const _this = this;
    return new FutureClass(function Future$race$fork(rej, res){
      let settled = false, cleared = false;
      const once = f => a => cleared || settled || (settled = true, f(a));
      const clearThis = fork(_this, once(rej), once(res));
      const clearThat = fork(m, once(rej), once(res));
      return function Future$race$clear(){
        cleared = true;
        clearThis();
        clearThat();
      };
    });
  }

  function Future$or(m){
    check$or(this, m);
    const _this = this;
    return new FutureClass(function Future$or$fork(rej, res){
      let ok = false, ko = false, val, err, cleared = false;
      const clearThis = fork(_this,
        () => cleared || ko ? rej(err) : ok ? res(val) : (ko = true),
        x => cleared || (ok = true, res(x))
      );
      const clearThat = fork(m,
        e => cleared || ok || (ko ? rej(e) : (err = e, ko = true)),
        x => cleared || ok || (ko ? res(x) : (val = x, ok = true))
      );
      return function Future$or$clear(){
        cleared = true;
        clearThis();
        clearThat();
      };
    });
  }

  function Future$fold(f, g){
    check$fold(this, f, g);
    const _this = this;
    return new FutureClass(function Future$fold$fork(rej, res){
      let cleared = false;
      const clear = fork(_this, e => cleared || res(f(e)), x => cleared || res(g(x)));
      return function Future$fold$clear(){
        cleared = true;
        clear();
      }
    });
  }

  function Future$value(f){
    check$value(this, f);
    return this.fork(
      function Future$value$rej(e){
        throw new Error(
          `Future#value was called on a rejected Future\n  Actual: Future.reject(${show(e)})`
        );
      },
      f
    );
  }

  function Future$promise(){
    check$promise(this);
    const _this = this;
    return new Promise(function Future$promise$do(resolve, reject){
      _this.fork(reject, resolve);
    });
  }

  function Future$cache(){
    check$cache(this);
    const _this = this;
    let que = [], value, state = 'idle';
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
        case 'pending': que.push({rejected: rej, resolved: res}); break;
        case 'rejected': rej(value); break;
        case 'resolved': res(value); break;
        case 'idle':
          state = 'pending';
          que.push({rejected: rej, resolved: res});
          _this._f(settleWith('rejected'), settleWith('resolved'));
      }
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
    inspect: Future$toString,
    race: Future$race,
    or: Future$or,
    fold: Future$fold,
    value: Future$value,
    promise: Future$promise,
    cache: Future$cache
  };

  //Expose `of` statically as well.
  Future[FL.of] = Future.of = Future$of;

  //Expose Future statically for ease of destructuring.
  Future.Future = Future;

  /////////////////
  // Dispatchers //
  /////////////////

  //Creates a dispatcher for a nullary method.
  function createNullaryDispatcher(method){
    return function dispatch(m){
      if(m && typeof m[method] === 'function') return m[method]();
      error$invalidArgument(`Future.${method}`, 1, `have a "${method}" method`, m);
    };
  }

  //Creates a dispatcher for a unary method.
  function createUnaryDispatcher(method){
    return function dispatch(a, m){
      if(arguments.length === 1) return m => dispatch(a, m);
      if(m && typeof m[method] === 'function') return m[method](a);
      error$invalidArgument(`Future.${method}`, 1, `have a "${method}" method`, m);
    };
  }

  //Creates a dispatcher for a binary method.
  function createBinaryDispatcher(method){
    return function dispatch(a, b, m){
      if(arguments.length === 1) return (b, m) => m ? dispatch(a, b, m) : dispatch(a, b);
      if(arguments.length === 2) return m => dispatch(a, b, m);
      if(m && typeof m[method] === 'function') return m[method](a, b);
      error$invalidArgument(`Future.${method}`, 2, `have a "${method}" method`, m);
    };
  }

  Future.chain = createUnaryDispatcher('chain');
  Future.chainRej = createUnaryDispatcher('chainRej');
  Future.map = createUnaryDispatcher('map');
  Future.fork = createBinaryDispatcher('fork');
  Future.race = createUnaryDispatcher('race');
  Future.or = createUnaryDispatcher('or');
  Future.fold = createBinaryDispatcher('fold');
  Future.value = createUnaryDispatcher('value');
  Future.promise = createNullaryDispatcher('promise');
  Future.cache = createNullaryDispatcher('cache');

  Future.ap = function dispatch$ap(m, a){
    if(arguments.length === 1) return a => dispatch$ap(m, a);
    if(m && typeof m.ap === 'function') return m.ap(a);
    error$invalidArgument('Future.ap', 0, 'have a "ap" method', m);
  };

  //////////////////
  // Constructors //
  //////////////////

  Future.reject = function Future$reject(x){
    return new FutureClass(function Future$reject$fork(rej){
      rej(x);
    });
  };

  Future.after = function Future$after(n, x){
    if(arguments.length === 1) return x => Future$after(n, x);
    check$after(n);
    return new FutureClass(function Future$after$fork(rej, res){
      const id = setTimeout(res, n, x);
      return function Future$after$clear(){
        clearTimeout(id);
      };
    })
  };

  Future.cast = function Future$cast(m){
    if(m instanceof FutureClass){
      return m;
    }
    check$cast(m);
    return new FutureClass(function Future$cast$fork(rej, res){
      m.fork(rej, res);
    });
  };

  Future.encase = function Future$encase(f, x){
    if(arguments.length === 1) return x => Future$encase(f, x);
    check$encase(f);
    return new FutureClass(function Future$encase$fork(rej, res){
      let y;
      try{
        y = f(x);
      }
      catch(err){
        return void rej(err);
      }
      res(y);
    });
  };

  Future.try = function Future$try(f){
    return Future.encase(f, undefined);
  };

  Future.node = function Future$node(f){
    check$node(f);
    return new FutureClass(function Future$node$fork(rej, res){
      f((a, b) => a ? rej(a) : res(b));
    });
  };

  Future.parallel = function Future$parallel(i, ms){
    if(arguments.length === 1) return ms => Future$parallel(i, ms);
    check$parallel(i, ms);
    const l = ms.length;
    return l < 1 ? Future$of([]) : new FutureClass(function Future$parallel$fork(rej, res){
      let ko = false, ok = 0, cleared = false;
      const clears = [], out = new Array(l);
      const next = j => i < l ? run(ms[i], i++) : (j === l && res(out));
      const run = (m, j) => {
        check$parallel$m(m, j);
        clears.push(fork(m,
          e => cleared || ko || (rej(e), ko = true),
          x => cleared || ko || (out[j] = x, next(++ok))
        ));
      }
      ms.slice(0, i).forEach(run);
      return function Future$parallel$clear(){
        cleared = true;
        clears.forEach(f => f());
      };
    });
  };

  //Export Future factory.
  return Future;

}));
