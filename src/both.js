import {Core, isRejected, isNever, isFuture} from './core';
import {noop, partial1} from './internal/fn';
import {invalidArgument} from './internal/throw';

export function Both(left, right){
  this._left = left;
  this._right = right;
}

Both.prototype = Object.create(Core.prototype);

Both.prototype._fork = function Both$_fork(rej, res){
  let resolved = false, rejected = false, lcancel = noop, rcancel = noop;
  const tuple = new Array(2);
  lcancel = this._left._fork(function FutureBoth$fork$rejLeft(e){
    rejected = true; rcancel(); rej(e);
  }, function FutureBoth$fork$resLeft(x){
    tuple[0] = x;
    if(resolved) res(tuple);
    else (resolved = true);
  });
  rejected || (rcancel = this._right._fork(function FutureBoth$fork$rejRight(e){
    rejected = true; lcancel(); rej(e);
  }, function FutureBoth$fork$resRight(x){
    tuple[1] = x;
    if(resolved) res(tuple);
    else (resolved = true);
  }));
  return function FutureBoth$fork$cancel(){ lcancel(); rcancel() };
};

Both.prototype.toString = function Both$toString(){
  return `${this._left.toString()}.both(${this._right.toString()})`;
};

function both$left(left, right){
  if(!isFuture(right)) invalidArgument('Future.both', 1, 'be a Future', right);
  return isNever(left) || isRejected(left) ? left
       : isNever(right) || isRejected(right) ? right
       : new Both(left, right);
}

export function both(left, right){
  if(!isFuture(left)) invalidArgument('Future.both', 0, 'be a Future', left);
  if(arguments.length === 1) return partial1(both$left, left);
  return both$left(left, right);
}
