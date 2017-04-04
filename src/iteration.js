import {isObject, isBoolean} from './internal/is';

export class Iteration{
  constructor(done, value){
    this.done = done;
    this.value = value;
  }
}

export const Next = x => new Iteration(false, x);
export const Done = x => new Iteration(true, x);
export const isIteration = x => x instanceof Iteration || isObject(x) && isBoolean(x.done);
