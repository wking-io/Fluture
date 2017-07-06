import {Core, Resolved, isFuture} from './core';
import {invalidArgument, invalidFuture} from './internal/throw';
import {noop, show, mapArray, partial1} from './internal/fn';
import {isUnsigned, isArray} from './internal/is';

const check$parallel = (m, i) => isFuture(m) ? m : invalidFuture(
  'Future.parallel',
  'its second argument to be an array of valid Futures. '
+ `The value at position ${i} in the array is not a Future`,
  m
);

export function Parallel(max, futures){
  this._futures = futures;
  this._length = futures.length;
  this._max = Math.min(this._length, max);
}

Parallel.prototype = Object.create(Core);

Parallel.prototype._fork = function Parallel$_fork(rej, res){

  const {_futures, _length, _max} = this;
  const cancels = new Array(_max), out = new Array(_length);
  let i = _max;

  function Parallel$fork$cancelAll(){
    for(let n = 0; n < _max; n++) cancels[n] && cancels[n]();
  }

  function Parallel$fork$run(idx, cancelSlot){
    cancels[cancelSlot] = _futures[idx]._fork(function Parallel$fork$rej(reason){
      cancels[cancelSlot] = noop;
      Parallel$fork$cancelAll();
      rej(reason);
    }, function Parallel$fork$res(value){
      out[idx] = value;

      if(i < _length){
        Parallel$fork$run(i++, cancelSlot);
      } else {
        cancels[cancelSlot] = noop;
        if(++i - _max === _length) res(out);
      }
    });
  }

  for(let n = 0; n < _max; n++) Parallel$fork$run(n, n);

  return Parallel$fork$cancelAll;

};

Parallel.prototype.toString = function Parallel$toString(){
  return `Future.parallel(${this._max}, ${show(this._futures)})`;
};

const emptyArray = new Resolved([]);

function parallel$max(max, xs){
  if(!isArray(xs)) invalidArgument('Future.parallel', 1, 'be an array', xs);
  const futures = mapArray(xs, check$parallel);
  return futures.length === 0 ? emptyArray : new Parallel(max, futures);
}

export function parallel(max, xs){
  if(!isUnsigned(max)) invalidArgument('Future.parallel', 0, 'be a positive integer', max);
  if(arguments.length === 1) return partial1(parallel$max, max);
  return parallel$max(max, xs);
}
