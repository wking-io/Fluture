import {Core, isRejected, Resolved} from './core';

export class Parallel extends Core{

  constructor(max, futures){
    super();
    this._futures = futures;
    this._length = futures.length;
    this._max = Math.min(this._length, max);
  }

  _fork(rej, res){
    const {_futures, _length, _max} = this;
    const cancels = new Array(_max), out = new Array(_length);
    let i = _max, ok = 0;
    const cancelAll = () => {
      for(let n = 0; n < _max; n++) cancels[n] && cancels[n]();
    };
    const run = function Parallel$fork$run(future, j, c){
      cancels[c] = future._fork(function Parallel$fork$rej(reason){
        cancelAll();
        rej(reason);
      }, function Parallel$fork$res(value){
        out[j] = value;
        ok = ok + 1;
        if(i < _length) run(_futures[i], i++, c);
        else if(ok === _length) res(out);
      });
    };
    for(let n = 0; n < _max; n++) run(_futures[n], n, n);
    return cancelAll;
  }

}

const emptyArray = new Resolved([]);

export const parallel = (max, futures) =>
  futures.length === 0 ? emptyArray : futures.find(isRejected) || new Parallel(max, futures);
