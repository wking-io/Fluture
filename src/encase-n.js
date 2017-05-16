import {Core} from './core';
import {show, showf, partial1, partial2, partial3} from './internal/fn';
import {isFunction} from './internal/is';
import {invalidArgument} from './internal/throw';

function EncaseN$0$fork(rej, res){
  let open = true;
  this._fn(function EncaseN$0$done(err, val){
    if(open){
      open = false;
      err ? rej(err) : res(val);
    }
  });
  return function EncaseN$0$cancel(){ open = false };
}

function EncaseN$1$fork(rej, res){
  let open = true;
  this._fn(this._a, function EncaseN$1$done(err, val){
    if(open){
      open = false;
      err ? rej(err) : res(val);
    }
  });
  return function EncaseN$1$cancel(){ open = false };
}

function EncaseN$2$fork(rej, res){
  let open = true;
  this._fn(this._a, this._b, function EncaseN$2$done(err, val){
    if(open){
      open = false;
      err ? rej(err) : res(val);
    }
  });
  return function EncaseN$2$cancel(){ open = false };
}

function EncaseN$3$fork(rej, res){
  let open = true;
  this._fn(this._a, this._b, this._c, function EncaseN$3$done(err, val){
    if(open){
      open = false;
      err ? rej(err) : res(val);
    }
  });
  return function EncaseN$3$cancel(){ open = false };
}

function EncaseN$0$toString(){
  const {_fn} = this;
  return `Future.node(${showf(_fn)})`;
}

function EncaseN$1$toString(){
  const {_fn, _a} = this;
  return `Future.encaseN(${showf(_fn)}, ${show(_a)})`;
}

function EncaseN$2$toString(){
  const {_fn, _a, _b} = this;
  return `Future.encaseN2(${showf(_fn)}, ${show(_a)}, ${show(_b)})`;
}

function EncaseN$3$toString(){
  const {_fn, _a, _b, _c} = this;
  return `Future.encaseN3(${showf(_fn)}, ${show(_a)}, ${show(_b)}, ${show(_c)})`;
}

const forks = [EncaseN$0$fork, EncaseN$1$fork, EncaseN$2$fork, EncaseN$3$fork];

const toStrings = [
  EncaseN$0$toString,
  EncaseN$1$toString,
  EncaseN$2$toString,
  EncaseN$3$toString
];

function EncaseN(fn, a, b, c){
  const len = arguments.length - 1;
  this._fn = fn;
  this._a = a;
  this._b = b;
  this._c = c;
  this._fork = forks[len];
  this.toString = toStrings[len];
}

EncaseN.prototype = Object.create(Core);

export function node(f){
  if(!isFunction(f)) invalidArgument('Future.node', 0, 'be a function', f);
  return new EncaseN(f);
}

export function encaseN(f, x){
  if(!isFunction(f)) invalidArgument('Future.encaseN', 0, 'be a function', f);
  if(arguments.length === 1) return partial1(encaseN, f);
  return new EncaseN(f, x);
}

export function encaseN2(f, x, y){
  if(!isFunction(f)) invalidArgument('Future.encaseN2', 0, 'be a function', f);
  switch(arguments.length){
    case 1: return partial1(encaseN2, f);
    case 2: return partial2(encaseN2, f, x);
    default: return new EncaseN(f, x, y);
  }
}

export function encaseN3(f, x, y, z){
  if(!isFunction(f)) invalidArgument('Future.encaseN3', 0, 'be a function', f);
  switch(arguments.length){
    case 1: return partial1(encaseN3, f);
    case 2: return partial2(encaseN3, f, x);
    case 3: return partial3(encaseN3, f, x, y);
    default: return new EncaseN(f, x, y, z);
  }
}
