import {Core, Resolved} from './core';
import {showf} from './internal/fn';

export class Go extends Core{

  constructor(generator){
    super();
    this._generator = generator;
  }

  _fork(rej, res){
    const iterator = this._generator();
    // check$do$g(iterator);
    (function recur(x){
      const iteration = iterator.next(x);
      // check$do$next(iteration);
      return iteration.done ? new Resolved(iteration.value) : iteration.value.chain(recur);
    }(undefined))._fork(rej, res);
  }

  toString(){
    return `Future.do(${showf(this._generator)})`;
  }

}

export const go = generator => new Go(generator);
