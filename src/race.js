import {Core, isNever, never} from './core';
import {show} from './internal/fn';

export class Race extends Core{

  constructor(futures){
    super();
    this._futures = futures;
  }

  race(other){
    return isNever(other) ? this
         : new Race(this._futures.concat(other instanceof Race ? other._futures : [other]));
  }

  _fork(rej, res){
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
  }

  toString(){
    return this._futures.length === 2
    ? `${this._futures[0].toString()}.race(${this._futures[1].toString()})`
    : `Future.first(${show(this._futures)})`;
  }

}

export const first = futures =>
  futures.length === 0 ? never
  : futures.length === 1 ? futures[0]
  : new Race(futures);
