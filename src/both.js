import {Core, isRejected, isNever} from './core';
import {noop} from './internal/fn';

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

export const both = (left, right) => isNever(left) || isRejected(left) ? left
                                   : isNever(right) || isRejected(right) ? right
                                   : new Both(left, right);
