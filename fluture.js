////      ____ _         _
////     / ___| |       | |_
////    | |__ | | _   _ |  _\   _  ___  ___
////    |  __|| || | | || || | | ||  _// _ \
////    | |   | || |_| || || |_| || | |  __/
////    |_|   |_| \__,_||_| \__,_||_|  \___\
////
(function(global, f){

  'use strict';

  /*istanbul ignore next*/
  if(module && typeof module.exports !== 'undefined'){
    module.exports = f(require('inspect-f'));
  }

  else{
    global.Fluture = f(global.inspectf);
  }

}(/*istanbul ignore next*/(global || window || this), function(inspectf){

  'use strict';

  ///////////////////
  // Type checking //
  ///////////////////

  const TYPEOF_FUTURE = 'fluture/Future';
  const FL = {
    map: 'fantasy-land/map',
    bimap: 'fantasy-land/bimap',
    chain: 'fantasy-land/chain',
    chainRec: 'fantasy-land/chainRec',
    ap: 'fantasy-land/ap',
    of: 'fantasy-land/of'
  };

  function isForkable(m){
    return Boolean(m) && typeof m.fork === 'function' && m.fork.length >= 2;
  }

  function isFuture(m){
    return (m instanceof Future) || Boolean(m) && m['@@type'] === TYPEOF_FUTURE;
  }

  function isFunction(f){
    return typeof f === 'function';
  }

  function isBinary(f){
    return f.length >= 2;
  }

  function isTernary(f){
    return f.length >= 3;
  }

  function isPositiveInteger(n){
    return n === Infinity || (typeof n === 'number' && n > 0 && n % 1 === 0 && n === n);
  }

  function isObject(o){
    return o !== null && typeof o === 'object';
  }

  function isIterator(i){
    return isObject(i) && typeof i.next === 'function';
  }

  function isIteration(o){
    return isObject(o) && typeof o.done === 'boolean';
  }

  ///////////////
  // Utilities //
  ///////////////

  //A small string representing a value, but not containing the whole value.
  const preview = x =>
    typeof x === 'string'
    ? JSON.stringify(x)
    : Array.isArray(x)
    ? `[Array: ${x.length}]`
    : typeof x === 'function'
    ? typeof x.name === 'string' && x.name.length > 0
    ? `[Function: ${x.name}]`
    : /*istanbul ignore next*/ '[Function]' //Only for older JS engines.
    : x && typeof x === 'object'
    ? `[Object: ${Object.keys(x).map(String).join(', ')}]`
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

  const noop = function noop(){};
  const call = function call(f){f()};
  const padf = (sf, s) => s.replace(/^/gm, sf).replace(sf, '');
  const showf = f => padf('  ', inspectf(2, f));
  const fid = f => f.name ? f.name : '<anonymous>';
  const ordinal = ['first', 'second', 'third', 'fourth', 'fifth'];
  const Next = x => ({done: false, value: x});
  const Done = x => ({done: true, value: x});

  //Partially apply a function with a single argument.
  function unaryPartial(f, a){
    return function partial(b, c, d){
      switch(arguments.length){
        case 1: return f(a, b);
        case 2: return f(a, b, c);
        default: return f(a, b, c, d);
      }
    };
  }

  //Partially apply a function with two arguments.
  function binaryPartial(f, a, b){
    return function partial(c, d){ return arguments.length === 1 ? f(a, b, c) : f(a, b, c, d) };
  }

  //Partially apply a function with three arguments.
  function ternaryPartial(f, a, b, c){
    return function partial(d){ return f(a, b, c, d) };
  }

  ////////////
  // Errors //
  ////////////

  function error$invalidArgument(it, at, expected, actual){
    throw new TypeError(
      `${it} expects its ${ordinal[at]} argument to ${expected}\n  Actual: ${show(actual)}`
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
    if(!isFuture(it)) error$invalidContext('Future#fork', it);
    if(!isFunction(rej)) error$invalidArgument('Future#fork', 0, 'be a function', rej);
    if(!isFunction(res)) error$invalidArgument('Future#fork', 1, 'be a function', res);
  }

  function check$fork$f(f, c){
    if(!(f === undefined || (isFunction(f) && f.length === 0))) throw new TypeError(
      'Future#fork expected the computation to return a nullary function or void'
      + `\n  Actual: ${show(f)}\n  From calling: ${showf(c)}`
    );
  }

  function check$chain(it, f){
    if(!isFuture(it)) error$invalidContext('Future#chain', it);
    if(!isFunction(f)) error$invalidArgument('Future#chain', 0, 'be a function', f);
  }

  function check$chainRec(f){
    if(!isFunction(f)) error$invalidArgument('Future.chainRec', 0, 'be a function', f);
  }

  function check$chainRec$f(m, f, i, x){
    if(!isFuture(m)) throw new TypeError(
      'Future.chainRec expects the function its given to return a Future every'
      + ' time it is called. The value returned from'
      + (ordinal[i] ? ` the ${ordinal[i]} call` : ` call ${i}`)
      + ' was not a Future.'
      + `\n  Actual: ${show(m)}\n  From calling: ${showf(f)}\n  With: (Next, Done, ${show(x)})`
    );
  }

  function check$chainRec$it(it, i){
    if(!isIteration(it)) throw new TypeError(
      'Future.chainRec expects the function its given to return a Future of an'
      + ' Iteration every time it is called. The Future returned from'
      + (ordinal[i] ? ` the ${ordinal[i]} call` : ` call ${i}`)
      + ' did not resolve to a member of Iteration.'
      + '\n  You can create an uncomplete or complete Iteration using the next'
      + ' or done functions respectively. These are passed into your callback'
      + ' as first and second arguments.'
      + `\n  Actual: Future.of(${show(it)})`
    );
  }

  function check$chain$f(m, f, x){
    if(!isFuture(m)) throw new TypeError(
      'Future#chain expects the function its given to return a Future'
      + `\n  Actual: ${show(m)}\n  From calling: ${showf(f)}\n  With: ${show(x)}`
    );
  }

  function check$chainRej(it, f){
    if(!isFuture(it)) error$invalidContext('Future.chainRej', it);
    if(!isFunction(f)) error$invalidArgument('Future.chainRej', 0, 'a function', f);
  }

  function check$chainRej$f(m, f, x){
    if(!isFuture(m)) throw new TypeError(
      'Future.chainRej expects the function its given to return a Future'
      + `\n  Actual: ${show(m)}\n  From calling: ${showf(f)}\n  With: ${show(x)}`
    );
  }

  function check$map(it, f){
    if(!isFuture(it)) error$invalidContext('Future#map', it);
    if(!isFunction(f)) error$invalidArgument('Future#map', 0, 'be a function', f);
  }

  function check$mapRej(it, f){
    if(!isFuture(it)) error$invalidContext('Future#mapRej', it);
    if(!isFunction(f)) error$invalidArgument('Future#mapRej', 0, 'be a function', f);
  }

  function check$bimap(it, f, g){
    if(!isFuture(it)) error$invalidContext('Future#bimap', it);
    if(!isFunction(f)) error$invalidArgument('Future#bimap', 0, 'be a function', f);
    if(!isFunction(g)) error$invalidArgument('Future#bimap', 1, 'be a function', g);
  }

  function check$ap(it, m){
    if(!isFuture(it)) error$invalidContext('Future#ap', it);
    if(!isFuture(m)) error$invalidArgument('Future#ap', 0, 'be a Future', m);
  }

  function check$ap$f(f){
    if(!isFunction(f)) throw new TypeError(
      'Future#ap expects its first argument to be a Future of a Function'
      + `\n  Actual: Future.of(${show(f)})`
    );
  }

  function check$swap(it){
    if(!isFuture(it)) error$invalidContext('Future#swap', it);
  }

  function check$race(it, m){
    if(!isFuture(it)) error$invalidContext('Future#race', it);
    if(!isFuture(m)) error$invalidArgument('Future#race', 0, 'be a Future', m);
  }

  function check$or(it, m){
    if(!isFuture(it)) error$invalidContext('Future#or', it);
    if(!isFuture(m)) error$invalidArgument('Future#or', 0, 'be a Future', m);
  }

  function check$fold(it, f, g){
    if(!isFuture(it)) error$invalidContext('Future#fold', it);
    if(!isFunction(f)) error$invalidArgument('Future#fold', 0, 'be a function', f);
    if(!isFunction(g)) error$invalidArgument('Future#fold', 1, 'be a function', g);
  }

  function check$hook(it, f, g){
    if(!isFuture(it)) error$invalidContext('Future#hook', it);
    if(!isFunction(f)) error$invalidArgument('Future#hook', 0, 'be a function', f);
    if(!isFunction(g)) error$invalidArgument('Future#hook', 1, 'be a function', g);
  }

  function check$hook$f(m, f, x){
    if(!isFuture(m)) throw new TypeError(
      'Future#hook expects the first function its given to return a Future'
      + `\n  Actual: ${show(m)}\n  From calling: ${showf(f)}\n  With: ${show(x)}`
    );
  }

  function check$hook$g(m, g, x){
    if(!isFuture(m)) throw new TypeError(
      'Future#hook expects the second function its given to return a Future'
      + `\n  Actual: ${show(m)}\n  From calling: ${showf(g)}\n  With: ${show(x)}`
    );
  }

  function check$finally(it, m){
    if(!isFuture(it)) error$invalidContext('Future#finally', it);
    if(!isFuture(m)) error$invalidArgument('Future#finally', 0, 'be a Future', m);
  }

  function check$value(it, f){
    if(!isFuture(it)) error$invalidContext('Future#value', it);
    if(!isFunction(f)) error$invalidArgument('Future#value', 0, 'be a function', f);
  }

  function check$promise(it){
    if(!isFuture(it)) error$invalidContext('Future#promise', it);
  }

  function check$cache(it){
    if(!isFuture(it)) error$invalidContext('Future#cache', it);
  }

  function check$after(n){
    if(typeof n !== 'number') error$invalidArgument('Future.after', 0, 'be a number', n);
  }

  function check$cast(m){
    if(!isForkable(m)) error$invalidArgument('Future.cast', 0, 'be a Forkable', m);
  }

  function check$encase(f){
    if(!isFunction(f)) error$invalidArgument('Future.encase', 0, 'be a function', f);
  }

  function check$encase2(f){
    if(!isFunction(f)) error$invalidArgument('Future.encase2', 0, 'be a function', f);
    if(!isBinary(f)) error$invalidArgument('Future.encase2', 0, 'take two arguments', f);
  }

  function check$encase3(f){
    if(!isFunction(f)) error$invalidArgument('Future.encase3', 0, 'be a function', f);
    if(!isTernary(f)) error$invalidArgument('Future.encase3', 0, 'take three arguments', f);
  }

  function check$node(f){
    if(!isFunction(f)) error$invalidArgument('Future.node', 0, 'be a function', f);
  }

  function check$parallel(i, ms){
    if(!isPositiveInteger(i)) error$invalidArgument('Future.parallel', 0, 'be a positive integer', i);
    if(!Array.isArray(ms)) error$invalidArgument('Future.parallel', 1, 'be an array', ms);
  }

  function check$parallel$m(m, i){
    if(!isFuture(m)) throw new TypeError(
      'Future.parallel expects its second argument to be an array of Futures.'
      + ` The value at position ${i} in the array was not a Future\n  Actual: ${show(m)}`
    );
  }

  function check$do(f){
    if(!isFunction(f)) error$invalidArgument('Future.do', 0, 'be a function', f);
  }

  function check$do$g(g){
    if(!isIterator(g)) error$invalidArgument(
      'Future.do', 0, 'return an iterator, maybe you forgot the "*"', g
    );
  }

  function check$do$next(o){
    if(!isIteration(o)) throw new TypeError(
      'Future.do was given an invalid generator:'
      + ' Its iterator did not return a valid iteration from iterator.next()'
      + `\n  Actual: ${show(o)}`
    );
    if(!o.done && !isFuture(o.value)) throw new TypeError(
      'A non-Future was produced by iterator.next() in Future.do.'
      + ' If you\'re using a generator, make sure you always `yield` a Future'
      + `\n  Actual: ${o.value}`
    );
  }

  ////////////
  // Future //
  ////////////

  function Future(f){
    check$Future(f);
    return new SafeFuture(f);
  }

  function Future$of(x){
    return new FutureOf(x);
  }

  function Future$chainRec(f, init){
    if(arguments.length === 1) return unaryPartial(Future$chainRec, f);
    check$chainRec(f);
    return new ChainRec(f, init);
  }

  function Future$fork(rej, res){
    check$fork(this, rej, res);
    return this._f(rej, res);
  }

  function Future$chain(f){
    check$chain(this, f);
    return new FutureChain(this, f);
  }

  function Future$chainRej(f){
    check$chainRej(this, f);
    return new FutureChainRej(this, f);
  }

  function Future$map(f){
    check$map(this, f);
    return new FutureMap(this, f);
  }

  function Future$mapRej(f){
    check$mapRej(this, f);
    return new FutureMapRej(this, f);
  }

  function Future$bimap(f, g){
    check$bimap(this, f, g);
    return new FutureBimap(this, f, g);
  }

  function Future$ap(m){
    check$ap(this, m);
    return new FutureAp(this, m);
  }

  function Future$swap(){
    check$swap(this);
    return new FutureSwap(this);
  }

  function Future$inspect(){
    return this.toString();
  }

  function Future$race(m){
    check$race(this, m);
    return new FutureRace(this, m);
  }

  function Future$or(m){
    check$or(this, m);
    return new FutureOr(this, m);
  }

  function Future$fold(f, g){
    check$fold(this, f, g);
    return new FutureFold(this, f, g);
  }

  function Future$hook(dispose, consume){
    check$hook(this, dispose, consume);
    return new FutureHook(this, dispose, consume);
  }

  function Future$finally(m){
    check$finally(this, m);
    return new FutureFinally(this, m);
  }

  function Future$value(f){
    check$value(this, f);
    return this._f(
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
      _this._f(reject, resolve);
    });
  }

  function Future$cache(){
    check$cache(this);
    return new CachedFuture(this);
  }

  Future.prototype = {
    '@@type': TYPEOF_FUTURE,
    _f: null,
    fork: Future$fork,
    [FL.of]: Future$of,
    of: Future$of,
    [FL.chainRec]: Future$chainRec,
    [FL.chain]: Future$chain,
    chain: Future$chain,
    chainRej: Future$chainRej,
    [FL.map]: Future$map,
    map: Future$map,
    mapRej: Future$mapRej,
    [FL.bimap]: Future$bimap,
    bimap: Future$bimap,
    [FL.ap]: Future$ap,
    ap: Future$ap,
    swap: Future$swap,
    inspect: Future$inspect,
    race: Future$race,
    or: Future$or,
    fold: Future$fold,
    hook: Future$hook,
    finally: Future$finally,
    value: Future$value,
    promise: Future$promise,
    cache: Future$cache
  };

  Future[FL.of] = Future.of = Future$of;
  Future[FL.chainRec] = Future.chainRec = Future$chainRec;
  Future.Future = Future;

  Future.util = {
    Next,
    Done,
    isForkable,
    isFuture,
    isFunction,
    isBinary,
    isTernary,
    isPositiveInteger,
    isObject,
    isIterator,
    isIteration,
    preview,
    show,
    padf,
    showf,
    fid,
    unaryPartial,
    binaryPartial,
    ternaryPartial
  };

  /////////////
  // Classes //
  /////////////

  function UnsafeFuture(computation){
    this._f = computation;
  }

  UnsafeFuture.prototype = Object.create(Future.prototype);

  UnsafeFuture.prototype.toString = function UnsafeFuture$toString(){
    return `Future(${showf(this._f)})`;
  }

  //----------

  function SafeFuture(computation){
    this._computation = computation;
  }

  SafeFuture.prototype = Object.create(Future.prototype);

  SafeFuture.prototype._f = function SafeFuture$fork(rej, res){
    let open = true;
    const f = this._computation(function SafeFuture$fork$rej(x){
      if(open){
        open = false;
        rej(x);
      }
    }, function SafeFuture$fork$res(x){
      if(open){
        open = false;
        res(x);
      }
    });
    check$fork$f(f, this._computation);
    return function SafeFuture$fork$cancel(){
      open && f && f();
      open = false;
    };
  }

  SafeFuture.prototype.toString = function SafeFuture$toString(){
    return `Future(${showf(this._computation)})`;
  }

  //----------

  function ChainRec(iterate, init){
    this._iterate = iterate;
    this._init = init;
  }

  ChainRec.prototype = Object.create(Future.prototype);

  ChainRec.prototype._f = function ChainRec$fork(rej, res){
    const _this = this;
    let cancel = noop, i = 0;
    (function Future$chainRec$recur(state){
      let isSync = null;
      function Future$chainRec$res(it){
        check$chainRec$it(it, i);
        i = i + 1;
        if(isSync === null){
          isSync = true;
          state = it;
        }else{
          Future$chainRec$recur(it);
        }
      }
      while(!state.done){
        isSync = null;
        const m = _this._iterate(Next, Done, state.value);
        check$chainRec$f(m, _this._iterate, i, state.value);
        cancel = m._f(rej, Future$chainRec$res);
        if(isSync === true){
          continue;
        }else{
          isSync = false;
          return;
        }
      }
      res(state.value);
    }(Next(_this._init)));
    return function Future$chainRec$cancel(){ cancel() };
  }

  ChainRec.prototype.toString = function ChainRec$toString(){
    return `Future.chainRec(${showf(this._iterate)}, ${show(this._init)})`;
  }

  //----------

  function CachedFuture(pure){
    this._pure = pure;
    this._cancel = noop;
    this._queue = [];
    this._queued = 0;
    this._value = null;
    this._state = 0;
  }

  CachedFuture.STATE = {
    0: 'cold',
    1: 'pending',
    2: 'rejected',
    3: 'resolved'
  };

  CachedFuture.prototype = Object.create(Future.prototype);

  CachedFuture.prototype._addToQueue = function CachedFuture$addToQueue(rej, res){
    const _this = this;
    const i = _this._queue.push({2: rej, 3: res}) - 1;
    _this._queued = _this._queued + 1;
    return function CachedFuture$removeFromQueue(){
      if(_this._state > 1) return;
      _this._queue[i] = undefined;
      _this._queued = this._queued - 1;
      if(_this._queued === 0) _this.reset();
    };
  }

  CachedFuture.prototype._drainQueue = function CachedFuture$drainQueue(){
    const q = this._queue, l = q.length, s = this._state, v = this._value;
    for(let i = 0; i < l; i++){
      q[i] && q[i][s](v);
      q[i] = undefined;
    }
    this._queue = undefined;
    this._queued = 0;
  }

  CachedFuture.prototype.reject = function CachedFuture$reject(reason){
    this._value = reason;
    this._state = 2;
    this._drainQueue();
  }

  CachedFuture.prototype.resolve = function CachedFuture$resolve(value){
    this._value = value;
    this._state = 3;
    this._drainQueue();
  }

  CachedFuture.prototype.reset = function CachedFuture$reset(){
    this._cancel();
    this._cancel = noop;
    this._queue = [];
    this._queued = 0;
    this._value = undefined;
    this._state = 0;
  }

  CachedFuture.prototype.getState = function CachedFuture$getState(){
    return CachedFuture.STATE[this._state];
  }

  CachedFuture.prototype._f = function CachedFuture$fork(rej, res){
    const _this = this;
    let cancel = noop;
    switch(_this._state){
      case 1: cancel = _this._addToQueue(rej, res); break;
      case 2: rej(_this._value); cancel = noop; break;
      case 3: res(_this._value); cancel = noop; break;
      default:
        _this._state = 1;
        _this._addToQueue(rej, res);
        _this._cancel = _this._pure._f(
          function CachedFuture$fork$rej(x){ _this.reject(x) },
          function CachedFuture$fork$res(x){ _this.resolve(x) }
        );
    }
    return cancel;
  }

  CachedFuture.prototype.inspect = function CachedFuture$inspect(){
    const repr = this._state === 3
      ? show(this._value)
      : `<${this.getState()}>` + (this._state === 2 ? ` ${this._value}` : '');
    return `Future { ${repr} }`;
  }

  CachedFuture.prototype.toString = function CachedFuture$toString(){
    return `${this._pure.toString()}.cache()`;
  }

  //----------

  function FutureOf(value){
    this._value = value;
  }

  FutureOf.prototype = Object.create(Future.prototype);

  FutureOf.prototype._f = function FutureOf$fork(rej, res){
    res(this._value);
    return noop;
  }

  FutureOf.prototype.toString = function FutureOf$toString(){
    return `Future.of(${show(this._value)})`;
  }

  //----------

  function FutureChain(parent, chainer){
    this._parent = parent;
    this._chainer = chainer;
  }

  FutureChain.prototype = Object.create(Future.prototype);

  FutureChain.prototype._f = function FutureChain$fork(rej, res){
    const _this = this;
    let cancel;
    const r = _this._parent._f(rej, function FutureChain$fork$res(x){
      const m = _this._chainer(x);
      check$chain$f(m, _this._chainer, x);
      cancel = m._f(rej, res);
    });
    return cancel ? cancel : (cancel = r, function FutureChain$fork$cancel(){ cancel() });
  }

  FutureChain.prototype.toString = function FutureChain$toString(){
    return `${this._parent.toString()}.chain(${showf(this._chainer)})`;
  }

  //----------

  function FutureChainRej(parent, chainer){
    this._parent = parent;
    this._chainer = chainer;
  }

  FutureChainRej.prototype = Object.create(Future.prototype);

  FutureChainRej.prototype._f = function FutureChainRej$fork(rej, res){
    const _this = this;
    let cancel;
    const r = _this._parent._f(function FutureChainRej$fork$rej(x){
      const m = _this._chainer(x);
      check$chainRej$f(m, _this._chainer, x);
      cancel = m._f(rej, res);
    }, res);
    return cancel ? cancel : (cancel = r, function FutureChainRej$fork$cancel(){ cancel() });
  }

  FutureChainRej.prototype.toString = function FutureChainRej$toString(){
    return `${this._parent.toString()}.chainRej(${showf(this._chainer)})`;
  }

  //----------

  function FutureMap(parent, mapper){
    this._parent = parent;
    this._mapper = mapper;
  }

  FutureMap.prototype = Object.create(Future.prototype);

  FutureMap.prototype._f = function FutureMap$fork(rej, res){
    const _this = this;
    return _this._parent._f(rej, function FutureMap$fork$res(x){
      res(_this._mapper(x));
    });
  }

  FutureMap.prototype.toString = function FutureMap$toString(){
    return `${this._parent.toString()}.map(${showf(this._mapper)})`;
  }

  //----------

  function FutureMapRej(parent, mapper){
    this._parent = parent;
    this._mapper = mapper;
  }

  FutureMapRej.prototype = Object.create(Future.prototype);

  FutureMapRej.prototype._f = function FutureMapRej$fork(rej, res){
    const _this = this;
    return _this._parent._f(function FutureMapRej$fork$rej(x){
      rej(_this._mapper(x));
    }, res);
  }

  FutureMapRej.prototype.toString = function FutureMapRej$toString(){
    return `${this._parent.toString()}.mapRej(${showf(this._mapper)})`;
  }

  //----------

  function FutureBimap(parent, lmapper, rmapper){
    this._parent = parent;
    this._lmapper = lmapper;
    this._rmapper = rmapper;
  }

  FutureBimap.prototype = Object.create(Future.prototype);

  FutureBimap.prototype._f = function FutureBimap$fork(rej, res){
    const _this = this;
    return _this._parent._f(function FutureBimap$fork$rej(x){
      rej(_this._lmapper(x));
    }, function FutureBimap$fork$res(x){
      res(_this._rmapper(x));
    });
  }

  FutureBimap.prototype.toString = function FutureBimap$toString(){
    return `${this._parent.toString()}.bimap(${showf(this._lmapper)}, ${showf(this._rmapper)})`;
  }

  //----------

  function FutureAp(mval, mfunc){
    this._mval = mval;
    this._mfunc = mfunc;
  }

  FutureAp.prototype = Object.create(Future.prototype);

  FutureAp.prototype._f = function FutureAp$fork(_rej, res){
    let _f, _x, ok1, ok2, ko;
    const rej = x => ko || (ko = 1, _rej(x));
    const c1 = this._mval._f(rej, function FutureAp$fork$resThis(x){
      if(!ok1) return void (ok2 = 1, _x = x)
      check$ap$f(_f);
      res(_f(x));
    });
    const c2 = this._mfunc._f(rej, function FutureAp$fork$resThat(f){
      if(!ok2) return void (ok1 = 1, _f = f);
      check$ap$f(f);
      res(f(_x));
    });
    return function FutureAp$fork$cancel(){ c1(); c2() };
  }

  FutureAp.prototype.toString = function FutureAp$toString(){
    return `${this._mval.toString()}.ap(${this._mfunc.toString()})`;
  }

  //----------

  function FutureSwap(parent){
    this._parent = parent;
  }

  FutureSwap.prototype = Object.create(Future.prototype);

  FutureSwap.prototype._f = function FutureSwap$fork(rej, res){
    return this._parent._f(res, rej);
  }

  FutureSwap.prototype.toString = function FutureSwap$toString(){
    return `${this._parent.toString()}.swap()`;
  }

  //----------

  function FutureRace(left, right){
    this._left = left;
    this._right = right;
  }

  FutureRace.prototype = Object.create(Future.prototype);

  FutureRace.prototype._f = function FutureRace$fork(rej, res){
    let settled = false, lcancel = noop, rcancel = noop;
    function FutureRace$fork$rej(x){
      if(settled) return;
      settled = true; lcancel(); rcancel(); rej(x);
    }
    function FutureRace$fork$res(x){
      if(settled) return;
      settled = true; lcancel(); rcancel(); res(x);
    }
    lcancel = this._left._f(FutureRace$fork$rej, FutureRace$fork$res);
    settled || (rcancel = this._right._f(FutureRace$fork$rej, FutureRace$fork$res));
    return function FutureRace$fork$cancel(){ lcancel(); rcancel() };
  }

  FutureRace.prototype.toString = function FutureRace$toString(){
    return `${this._left.toString()}.race(${this._right.toString()})`;
  }

  //----------

  function FutureOr(left, right){
    this._left = left;
    this._right = right;
  }

  FutureOr.prototype = Object.create(Future.prototype);

  FutureOr.prototype._f = function FutureOr$fork(rej, res){
    let resolved = false, rejected = false, val, err, lcancel = noop, rcancel = noop;
    lcancel = this._left._f(
      _ => rejected ? rej(err) : resolved ? res(val) : (rejected = true),
      x => (resolved = true, rcancel(), res(x))
    );
    resolved || (rcancel = this._right._f(
      e => resolved || (rejected ? rej(e) : (err = e, rejected = true)),
      x => resolved || (rejected ? res(x) : (val = x, resolved = true))
    ));
    return function FutureOr$fork$cancel(){ lcancel(); rcancel() };
  }

  FutureOr.prototype.toString = function FutureOr$toString(){
    return `${this._left.toString()}.or(${this._right.toString()})`;
  }

  //----------

  function FutureFold(parent, lfold, rfold){
    this._parent = parent;
    this._lfold = lfold;
    this._rfold = rfold;
  }

  FutureFold.prototype = Object.create(Future.prototype);

  FutureFold.prototype._f = function FutureFold$fork(rej, res){
    const _this = this;
    return _this._parent._f(function FutureFold$fork$rej(x){
      res(_this._lfold(x));
    }, function FutureFold$fork$res(x){
      res(_this._rfold(x));
    });
  }

  FutureFold.prototype.toString = function FutureFold$toString(){
    return `${this._parent.toString()}.fold(${showf(this._lfold)}, ${showf(this._rfold)})`;
  }

  //----------

  function FutureHook(acquire, dispose, consume){
    this._acquire = acquire;
    this._dispose = dispose;
    this._consume = consume;
  }

  FutureHook.prototype = Object.create(Future.prototype);

  FutureHook.prototype._f = function FutureHook$fork(rej, res){
    const _this = this;
    let cancel, cancelAcquire = noop;
    cancelAcquire = _this._acquire._f(rej, function FutureHook$fork$res(resource){
      const disposer = function FutureHook$dispose(callback){
        const disposal = _this._dispose(resource);
        check$hook$f(disposal, _this._dispose, resource);
        cancel = disposal._f(rej, callback);
        return cancel;
      }
      const consumption = _this._consume(resource);
      check$hook$g(consumption, _this._consume, resource);
      cancel = function FutureHook$fork$cancelConsume(){
        disposer(noop)();
        cancelAcquire();
        cancelConsume();
      }
      const cancelConsume = consumption._f(
        x => disposer(_ => rej(x)),
        x => disposer(_ => res(x))
      );
    });
    cancel = cancel || cancelAcquire;
    return function FutureHook$fork$cancel(){ cancel() };
  }

  FutureHook.prototype.toString = function FutureHook$toString(){
    return `${this._acquire.toString()}.hook(${showf(this._dispose)}, ${showf(this._consume)})`;
  }

  //----------

  function FutureFinally(left, right){
    this._left = left;
    this._right = right;
  }

  FutureFinally.prototype = Object.create(Future.prototype);

  FutureFinally.prototype._f = function FutureFinally$fork(rej, res){
    const _this = this;
    let cancel;
    const r = _this._left._f(function FutureFinally$fork$rej(e){
      cancel = _this._right._f(rej, function FutureFinally$fork$rej$res(){ rej(e) });
    }, function FutureFinally$fork$res(x){
      cancel = _this._right._f(rej, function FutureFinally$fork$res$res(){ res(x) });
    });
    return cancel ? cancel : (cancel = r, function FutureFinally$fork$cancel(){ cancel() });
  }

  FutureFinally.prototype.toString = function FutureFinally$toString(){
    return `${this._left.toString()}.finally(${this._right.toString()})`;
  }

  /////////////////
  // Dispatchers //
  /////////////////

  //Creates a dispatcher for a nullary method.
  function createNullaryDispatcher(method){
    return function nullaryDispatch(m){
      if(m && typeof m[method] === 'function') return m[method]();
      error$invalidArgument(`Future.${method}`, 1, `have a "${method}" method`, m);
    };
  }

  //Creates a dispatcher for a unary method.
  function createUnaryDispatcher(method){
    return function unaryDispatch(a, m){
      if(arguments.length === 1) return unaryPartial(unaryDispatch, a);
      if(m && typeof m[method] === 'function') return m[method](a);
      error$invalidArgument(`Future.${method}`, 1, `have a "${method}" method`, m);
    };
  }

  //Creates a dispatcher for a binary method.
  function createBinaryDispatcher(method){
    return function binaryDispatch(a, b, m){
      if(arguments.length === 1) return unaryPartial(binaryDispatch, a);
      if(arguments.length === 2) return binaryPartial(binaryDispatch, a, b);
      if(m && typeof m[method] === 'function') return m[method](a, b);
      error$invalidArgument(`Future.${method}`, 2, `have a "${method}" method`, m);
    };
  }

  //Creates a dispatcher for a binary method, but takes the object first rather than last.
  function createInvertedBinaryDispatcher(method){
    return function invertedBinaryDispatch(m, a, b){
      if(arguments.length === 1) return unaryPartial(invertedBinaryDispatch, m);
      if(arguments.length === 2) return binaryPartial(invertedBinaryDispatch, m, a);
      if(m && typeof m[method] === 'function') return m[method](a, b);
      error$invalidArgument(`Future.${method}`, 0, `have a "${method}" method`, m);
    };
  }

  Future.chain = createUnaryDispatcher(FL.chain);
  Future.recur = createUnaryDispatcher('recur');
  Future.chainRej = createUnaryDispatcher('chainRej');
  Future.map = createUnaryDispatcher(FL.map);
  Future.mapRej = createUnaryDispatcher('mapRej');
  Future.bimap = createBinaryDispatcher(FL.bimap);
  Future.ap = createUnaryDispatcher(FL.ap);
  Future.swap = createNullaryDispatcher('swap');
  Future.fork = createBinaryDispatcher('fork');
  Future.race = createUnaryDispatcher('race');
  Future.or = createUnaryDispatcher('or');
  Future.fold = createBinaryDispatcher('fold');
  Future.hook = createInvertedBinaryDispatcher('hook');
  Future.finally = createUnaryDispatcher('finally');
  Future.value = createUnaryDispatcher('value');
  Future.promise = createNullaryDispatcher('promise');
  Future.cache = createNullaryDispatcher('cache');

  /////////////////////
  // Other functions //
  /////////////////////

  Future.isFuture = isFuture;
  Future.isForkable = isForkable;

  Future.reject = function Future$reject(x){
    return new UnsafeFuture(function Future$reject$fork(rej){
      rej(x);
      return noop;
    });
  };

  Future.after = function Future$after(n, x){
    if(arguments.length === 1) return unaryPartial(Future.after, n);
    check$after(n);
    return new UnsafeFuture(function Future$after$fork(rej, res){
      const t = setTimeout(res, n, x);
      return function Future$after$cancel(){ clearTimeout(t) };
    });
  };

  Future.cast = function Future$cast(m){
    check$cast(m);
    return new SafeFuture(function Future$cast$fork(rej, res){
      m.fork(rej, res);
    });
  };

  Future.encase = function Future$encase(f, x){
    check$encase(f);
    if(arguments.length === 1) return unaryPartial(Future.encase, f);
    return new UnsafeFuture(function Future$encase$fork(rej, res){
      let r;
      try{ r = f(x) }catch(e){ return void rej(e) }
      res(r);
      return noop;
    });
  };

  Future.encase2 = function Future$encase2(f, x, y){
    check$encase2(f);
    if(arguments.length === 1) return unaryPartial(Future.encase2, f);
    if(arguments.length === 2) return binaryPartial(Future.encase2, f, x);
    return new UnsafeFuture(function Future$encase2$fork(rej, res){
      let r;
      try{ r = f(x, y) }catch(e){ return void rej(e) }
      res(r);
      return noop;
    });
  };

  Future.encase3 = function Future$encase3(f, x, y, z){
    check$encase3(f);
    if(arguments.length === 1) return unaryPartial(Future.encase3, f);
    if(arguments.length === 2) return binaryPartial(Future.encase3, f, x);
    if(arguments.length === 3) return ternaryPartial(Future.encase3, f, x, y);
    return new UnsafeFuture(function Future$encase3$fork(rej, res){
      let r;
      try{ r = f(x, y, z) }catch(e){ return void rej(e) }
      res(r);
      return noop;
    });
  };

  Future.try = function Future$try(f){
    return Future.encase(f, undefined);
  };

  Future.node = function Future$node(f){
    check$node(f);
    return new SafeFuture(function Future$node$fork(rej, res){
      f(function Future$node$done(a, b){
        a ? rej(a) : res(b);
      });
    });
  };

  Future.parallel = function Future$parallel(i, ms){
    if(arguments.length === 1) return unaryPartial(Future.parallel, i);
    check$parallel(i, ms);
    const l = ms.length;
    return l < 1 ? Future$of([]) : new UnsafeFuture(function Future$parallel$fork(rej, res){
      let ko = false;
      let ok = 0;
      const cs = [];
      const out = new Array(l);
      const next = j => i < l ? fork(ms[i], i++) : (j === l && res(out));
      const fork = (m, j) => (check$parallel$m(m, j), cs[j] = m._f(
        e => ko || (rej(e), ko = true),
        x => ko || (out[j] = x, next(++ok))
      ));
      ms.slice(0, i).forEach(fork);
      return function Future$parallel$cancel(){ cs.forEach(call) };
    });
  };

  Future.do = function Future$do(f){
    check$do(f);
    return new UnsafeFuture(function Future$do$fork(rej, res){
      const g = f();
      check$do$g(g);
      return Future$chainRec(function Future$do$next(next, _, x){
        const o = g.next(x);
        check$do$next(o);
        return o.done ? Future$of(o) : o.value.map(next);
      }, undefined)._f(rej, res);
    });
  };

  return Future;

}));
