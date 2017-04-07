import {Core, Resolved, isFuture} from './core';
import {isFunction, isIterator} from './internal/is';
import {isIteration} from './iteration';
import {show, showf} from './internal/fn';
import {invalidArgument, typeError} from './internal/throw';

const check$iterator = g => {
  if(!isIterator(g)) invalidArgument(
    'Future.do', 0, 'return an iterator, maybe you forgot the "*"', g
  );
};

const check$iteration = o => {
  if(!isIteration(o)) typeError(
    'Future.do was given an invalid generator:'
    + ' Its iterator did not return a valid iteration from iterator.next()'
    + `\n  Actual: ${show(o)}`
  );
  if(!o.done && !isFuture(o.value)) typeError(
    'A non-Future was produced by iterator.next() in Future.do.'
    + ' If you\'re using a generator, make sure you always `yield` a Future'
    + `\n  Actual: ${o.value}`
  );
};

export function Go(generator){
  this._generator = generator;
}

Go.prototype = Object.create(Core.prototype);

Go.prototype._fork = function Go$_fork(rej, res){
  const iterator = this._generator();
  check$iterator(iterator);
  (function recur(x){
    const iteration = iterator.next(x);
    check$iteration(iteration);
    return iteration.done ? new Resolved(iteration.value) : iteration.value.chain(recur);
  }(undefined))._fork(rej, res);
};

Go.prototype.toString = function Go$toString(){
  return `Future.do(${showf(this._generator)})`;
};

export const go = generator => {
  if(!isFunction(generator)) invalidArgument('Future.do', 0, 'be a Function', generator);
  return new Go(generator);
};
