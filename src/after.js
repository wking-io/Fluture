import {Sequence, Core, isRejected, isResolved, isNever, never} from './core';
import {show} from './internal/fn';

export function After(time, value){
  this._time = time;
  this._value = value;
}

After.prototype = Object.create(Core.prototype);

After.prototype.race = function After$race(other){
  return isRejected(other) ? other
       : isResolved(other) ? other
       : isNever(other) ? this
       : other instanceof After ? other._time < this._time ? other : this
       : new Sequence(this).race(other);
};

After.prototype._fork = function After$_fork(rej, res){
  const id = setTimeout(res, this._time, this._value);
  return () => { clearTimeout(id) };
};

After.prototype.toString = function After$toString(){
  return `Future.after(${show(this._time)}, ${show(this._value)})`;
};

export const after = (n, x) => n === Infinity ? never : new After(n, x);
