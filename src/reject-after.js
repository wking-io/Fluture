import {After} from './after';
import {show} from './internal/fn';

export class RejectAfter extends After{

  _fork(rej){
    const id = setTimeout(rej, this._time, this._value);
    return () => { clearTimeout(id) };
  }

  toString(){
    return `Future.rejectAfter(${show(this._time)}, ${show(this._value)})`;
  }

}

export const rejectAfter = (n, x) => new RejectAfter(n, x);
