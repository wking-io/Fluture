import {Core, isNever, never, isFuture} from './core';
import {show, mapArray} from './internal/fn';
import {typeError} from './internal/throw';

const check$first = (m, i) => isFuture(m) ? m : typeError(
  'Future.first expects its first argument to be an array of Futures.'
  + ` The value at position ${i} in the array was not a Future\n  Actual: ${show(m)}`
);

export function Race(futures){
  this._futures = futures;
}

Race.prototype = Object.create(Core.prototype);

Race.prototype.race = function Race$race(other){
  return isNever(other) ? this
       : new Race(this._futures.concat(other instanceof Race ? other._futures : [other]));
};

Race.prototype._fork = function Race$_fork(rej, res){
  const l = this._futures.length, cancels = new Array(l);
  let settled = false;
  const cancelAll = () => {
    for(let n = 0; n < l; n++) cancels[n] && cancels[n]();
  };
  const reject = x => {
    if(settled) return;
    settled = true;
    cancelAll();
    rej(x);
  };
  const resolve = x => {
    if(settled) return;
    settled = true;
    cancelAll();
    res(x);
  };
  for(let i = 0; i < l; i++){
    cancels[i] = this._futures[i]._fork(reject, resolve);
    if(settled) break;
  }
  return cancelAll;
};

Race.prototype.toString = function Race$toString(){
  return `Future.first(${show(this._futures)})`;
};

export const first = xs => {
  const futures = mapArray(xs, check$first);
  return futures.length === 0 ? never
  : futures.length === 1 ? futures[0]
  : new Race(futures);
};
