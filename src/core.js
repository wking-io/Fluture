/*eslint no-param-reassign:0, no-cond-assign:0, no-unmodified-loop-condition:0 */

import Denque from 'denque';

import {show, showf, noop} from './internal/fn';
import {Next, Done} from './iteration';
import FL from './internal/fl';
import type from 'sanctuary-type-identifiers';

const TYPEOF_FUTURE = 'fluture/Future';

const throwRejection = x => {
  throw new Error(`Rejected with ${show(x)}`);
};

export const Future = computation => new Computation(computation);
Future['@@type'] = TYPEOF_FUTURE;

export const isFuture = x => x instanceof Future || type(x) === TYPEOF_FUTURE;

//Core
//Represents any object that can be forked, serves to expose the _fork method
//in several ways to the user. It also provides a Fantasy Land function mapping.
//This is the base class for all types of Future.
export class Core extends Future{

  constructor(){} //eslint-disable-line

  [FL.ap](other){
    return new Sequence(this).ap(other);
  }

  [FL.map](mapper){
    return new Sequence(this).map(mapper);
  }

  [FL.bimap](lmapper, rmapper){
    return new Sequence(this).bimap(lmapper, rmapper);
  }

  [FL.chain](mapper){
    return new Sequence(this).chain(mapper);
  }

  ap(other){
    return new Sequence(this).ap(other);
  }

  map(mapper){
    return new Sequence(this).map(mapper);
  }

  bimap(lmapper, rmapper){
    return new Sequence(this).bimap(lmapper, rmapper);
  }

  chain(mapper){
    return new Sequence(this).chain(mapper);
  }

  mapRej(mapper){
    return new Sequence(this).mapRej(mapper);
  }

  race(other){
    return new Sequence(this).race(other);
  }

  both(other){
    return new Sequence(this).both(other);
  }

  or(other){
    return new Sequence(this).or(other);
  }

  fork(rej, res){
    return this._fork(rej, res);
  }

  value(res){
    return this._fork(throwRejection, res);
  }

  promise(){
    return new Promise((res, rej) => this._fork(rej, res));
  }

}

export const ap = (mx, mf) => mf.ap(mx);
export const map = (f, m) => m.map(f);
export const bimap = (f, g, m) => m.map(f, g);
export const chain = (f, m) => m.chain(f);
export const mapRej = (f, m) => m.mapRej(f);
export const race = (l, r) => l.race(r);
export const or = (l, r) => l.or(r);

export const fork = (rej, res, m) => m._fork(rej, res);
export const value = (res, m) => m.value(res);
export const promise = m => m.promise();

export class Computation extends Core{

  constructor(computation){
    super();
    this._computation = computation;
  }

  _fork(rej, res){
    let open = true;
    const f = this._computation(function Computation$rej(x){
      if(open){
        open = false;
        rej(x);
      }
    }, function Computation$res(x){
      if(open){
        open = false;
        res(x);
      }
    });
    return function Computation$cancel(){
      open && f && f();
      open = false;
    };
  }

  toString(){
    return `Future(${showf(this._computation)})`;
  }

}

export class Rejected extends Core{

  constructor(value){
    super();
    this._value = value;
  }

  ap(){
    return this;
  }

  map(){
    return this;
  }

  chain(){
    return this;
  }

  race(){
    return this;
  }

  both(){
    return this;
  }

  or(other){
    return other;
  }

  _fork(rej){
    rej(this._value);
    return noop;
  }

  toString(){
    return `Future.reject(${show(this._value)})`;
  }

}

export const reject = x => new Rejected(x);
export const isRejected = m => m instanceof Rejected;

export class Resolved extends Core{

  constructor(value){
    super();
    this._value = value;
  }

  race(){
    return this;
  }

  mapRej(){
    return this;
  }

  both(other){
    return other.map(x => [this._value, x]);
  }

  or(){
    return this;
  }

  _fork(rej, res){
    res(this._value);
    return noop;
  }

  toString(){
    return `Future.of(${show(this._value)})`;
  }

}

export const isResolved = m => m instanceof Resolved;
export const of = x => new Resolved(x);
Future[FL.of] = of;

class Never extends Core{

  ap(){
    return this;
  }

  map(){
    return this;
  }

  bimap(){
    return this;
  }

  chain(){
    return this;
  }

  mapRej(){
    return this;
  }

  race(other){
    return other;
  }

  both(){
    return this;
  }

  or(){
    return this;
  }

  _fork(){
    return noop;
  }

  toString(){
    return 'Future.never';
  }

}

export const never = new Never();
export const isNever = x => x === never;

export class Eager extends Core{
  constructor(future){
    super();
    this.rej = noop;
    this.res = noop;
    this.rejected = false;
    this.resolved = false;
    this.value = null;
    this.cancel = future._fork(x => {
      this.value = x;
      this.rejected = true;
      this.cancel = noop;
      this.rej(x);
    }, x => {
      this.value = x;
      this.resolved = true;
      this.cancel = noop;
      this.res(x);
    });
  }
  _fork(rej, res){
    if(this.rejected) rej(this.value);
    else if(this.resolved) res(this.value);
    else{
      this.rej = rej;
      this.res = res;
    }
    return this.cancel;
  }
}

export class Action{
  rejected(x){
    return new Rejected(x);
  }
  resolved(x){
    return new Resolved(x);
  }
  run(){
    return this;
  }
  cancel(){}
  toString(){
    return '';
  }
}

export class ApAction extends Action{
  constructor(other){
    super();
    this.other = other;
  }
  resolved(x){
    return this.other.map(f => f(x));
  }
  toString(){
    return `ap(${this.other.toString()})`;
  }
}

export class MapAction extends Action{
  constructor(mapper){
    super();
    this.mapper = mapper;
  }
  resolved(x){
    return new Resolved(this.mapper(x));
  }
  toString(){
    return `map(${showf(this.mapper)})`;
  }
}

export class BimapAction extends Action{
  constructor(lmapper, rmapper){
    super();
    this.lmapper = lmapper;
    this.rmapper = rmapper;
  }
  rejected(x){
    return new Rejected(this.lmapper(x));
  }
  resolved(x){
    return new Resolved(this.rmapper(x));
  }
  toString(){
    return `bimap(${showf(this.lmapper)}, ${showf(this.rmapper)})`;
  }
}

export class ChainAction extends Action{
  constructor(mapper){
    super();
    this.mapper = mapper;
  }
  resolved(x){
    return this.mapper(x);
  }
  toString(){
    return `chain(${showf(this.mapper)})`;
  }
}

export class MapRejAction extends Action{
  constructor(mapper){
    super();
    this.mapper = mapper;
  }
  rejected(x){
    return new Rejected(this.mapper(x));
  }
  toString(){
    return `mapRej(${showf(this.mapper)})`;
  }
}

export class RaceAction extends Action{
  constructor(other){
    super();
    this.other = other;
  }
  run(early){
    return new RaceActionState(early, this.other);
  }
  toString(){
    return `race(${this.other.toString()})`;
  }
}

export class RaceActionState extends RaceAction{
  constructor(early, other){
    super(other);
    this.cancel = other._fork(
      x => early(new Rejected(x)),
      x => early(new Resolved(x))
    );
  }
  rejected(x){
    this.cancel();
    return new Rejected(x);
  }
  resolved(x){
    this.cancel();
    return new Resolved(x);
  }
}

export class BothAction extends Action{
  constructor(other){
    super();
    this.other = other;
  }
  run(early){
    return new BothActionState(early, this.other);
  }
  resolved(x){
    return this.other.map(y => [x, y]);
  }
  toString(){
    return `both(${this.other.toString()})`;
  }
}

export class BothActionState extends BothAction{
  constructor(early, other){
    super(new Eager(other));
    this.cancel = this.other.cancel;
  }
}

export class OrAction extends Action{
  constructor(other){
    super();
    this.other = other;
  }
  run(early){
    return new OrActionState(early, this.other);
  }
  rejected(){
    return this.other;
  }
  toString(){
    return `or(${this.other.toString()})`;
  }
}

export class OrActionState extends OrAction{
  constructor(early, other){
    super(new Eager(other));
    this.cancel = this.other.cancel;
  }
  resolved(x){
    this.cancel();
    return new Resolved(x);
  }
}

const Undetermined = 0;
const Synchronous = 1;
const Asynchronous = 2;

export class Sequence extends Core{

  constructor(spawn, actions = []){
    super();
    this._spawn = spawn;
    this._actions = actions;
  }

  _transform(action){
    return new Sequence(this._spawn, this._actions.concat([action]));
  }

  ap(other){
    return this._transform(new ApAction(other));
  }

  map(mapper){
    return this._transform(new MapAction(mapper));
  }

  bimap(lmapper, rmapper){
    return this._transform(new BimapAction(lmapper, rmapper));
  }

  chain(mapper){
    return this._transform(new ChainAction(mapper));
  }

  mapRej(mapper){
    return this._transform(new MapRejAction(mapper));
  }

  race(other){
    return this._transform(new RaceAction(other));
  }

  both(other){
    return this._transform(new BothAction(other));
  }

  or(other){
    return this._transform(new OrAction(other));
  }

  _fork(rej, res){

    const actions = new Denque(this._actions), queue = new Denque();
    let action, cancel = noop, timing = Undetermined, future = this._spawn, settled;

    function cancelAll(){
      cancel();
      action && action.cancel();
      let running;
      while(running = queue.shift()) running.cancel();
      queue.clear();
      actions.clear();
      cancel = noop;
    }

    function absorb(m){
      future = m;
      settled = true;
      while(future instanceof Sequence){
        for(let i = future._actions.length - 1; i >= 0; i--) actions.unshift(future._actions[i]);
        future = future._spawn;
      }
    }

    function early(m){
      cancelAll();
      absorb(m);
      timing = timing === Undetermined ? Synchronous : drain();
    }

    function rejected(x){
      absorb(action.rejected(x));
      timing = timing === Undetermined ? Synchronous : drain();
    }

    function resolved(x){
      absorb(action.resolved(x));
      timing = timing === Undetermined ? Synchronous : drain();
    }

    function drain(){
      while(action = actions.shift() || queue.shift()){
        settled = false;
        timing = Undetermined;
        cancel = future._fork(rejected, resolved);
        if(settled) continue;
        action = action.run(early);
        if(settled) continue;
        let running;
        const runners = new Denque(actions.length);
        while(!settled && (running = actions.shift())) runners.push(running.run(early));
        if(settled) continue;
        while(running = runners.pop()) queue.unshift(running);
        if(timing !== Synchronous){
          timing = Asynchronous;
          return;
        }
      }
      cancel = future._fork(rej, res);
    }

    drain();

    return cancelAll;

  }

  toString(){
    return `${this._spawn.toString()}${this._actions.map(x => `.${x.toString()}`).join('')}`;
  }

}

export const chainRec = (step, init) => (function recur(x){
  return step(Next, Done, x).chain(o => o.done ? new Resolved(o.value) : recur(o.value));
}(init));

Future[FL.chainRec] = chainRec;
