import {Core} from './core';
import {noop, show, showf, partial1, partial2, partial3} from './internal/fn';
import {isThenable, isFunction} from './internal/is';
import {invalidArgument, typeError} from './internal/throw';

function check$promise(p, f, a, b, c){
  return isThenable(p) ? p : typeError(
    'Future.fromPromise expects the function its given to return a Promise/Thenable'
    + `\n  Actual: ${show(p)}\n  From calling: ${showf(f)}`
    + `\n  With a: ${show(a)}`
    + (arguments.length > 3 ? `\n  With b: ${show(b)}` : '')
    + (arguments.length > 4 ? `\n  With c: ${show(c)}` : '')
  );
}

function FromPromise$1$fork(rej, res){
  const {_fn, _a} = this;
  check$promise(_fn(_a), _fn, _a).then(res, rej);
  return noop;
}

function FromPromise$2$fork(rej, res){
  const {_fn, _a, _b} = this;
  check$promise(_fn(_a, _b), _fn, _a, _b).then(res, rej);
  return noop;
}

function FromPromise$3$fork(rej, res){
  const {_fn, _a, _b, _c} = this;
  check$promise(_fn(_a, _b, _c), _fn, _a, _b, _c).then(res, rej);
  return noop;
}

const forks = [noop, FromPromise$1$fork, FromPromise$2$fork, FromPromise$3$fork];

function FromPromise(fn, a, b, c){
  this._length = arguments.length - 1;
  this._fn = fn;
  this._a = a;
  this._b = b;
  this._c = c;
  this._fork = forks[this._length];
}

FromPromise.prototype = Object.create(Core);

FromPromise.prototype.toString = function FromPromise$toString(){
  const args = [this._a, this._b, this._c].slice(0, this._length).map(show).join(', ');
  const name = `fromPromise${this._length > 1 ? this._length : ''}`;
  return `Future.${name}(${show(this._fn)}, ${args})`;
};

export function fromPromise(f, x){
  if(!isFunction(f)) invalidArgument('Future.fromPromise', 0, 'be a function', f);
  if(arguments.length === 1) return partial1(fromPromise, f);
  return new FromPromise(f, x);
}

export function fromPromise2(f, x, y){
  if(!isFunction(f)) invalidArgument('Future.fromPromise2', 0, 'be a function', f);
  switch(arguments.length){
    case 1: return partial1(fromPromise2, f);
    case 2: return partial2(fromPromise2, f, x);
    default: return new FromPromise(f, x, y);
  }
}

export function fromPromise3(f, x, y, z){
  if(!isFunction(f)) invalidArgument('Future.fromPromise3', 0, 'be a function', f);
  switch(arguments.length){
    case 1: return partial1(fromPromise3, f);
    case 2: return partial2(fromPromise3, f, x);
    case 3: return partial3(fromPromise3, f, x, y);
    default: return new FromPromise(f, x, y, z);
  }
}
