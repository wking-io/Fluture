import {Sequence, Core, isRejected, isResolved, isNever} from './core';
import {show} from './internal/fn';

export class After extends Core{

  constructor(time, value){
    super();
    this._time = time;
    this._value = value;
  }

  race(other){
    return isRejected(other) ? other
         : isResolved(other) ? other
         : isNever(other) ? this
         : other instanceof After ? other._time < this._time ? other : this
         : new Sequence(this).race(other);
  }

  _fork(rej, res){
    const id = setTimeout(res, this._time, this._value);
    return () => { clearTimeout(id) };
  }

  toString(){
    return `Future.after(${show(this._time)}, ${show(this._value)})`;
  }

}

export const after = (n, x) => new After(n, x);
