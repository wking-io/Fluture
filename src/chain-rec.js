import {Future, Core, isFuture} from './core';
import {Next, Done, isIteration} from './internal/iteration';
import {Undetermined, Synchronous, Asynchronous} from './internal/timing';
import {show, showf, noop, partial1} from './internal/fn';
import {isFunction} from './internal/is';
import {invalidArgument, typeError} from './internal/throw';
import {FL, ordinal} from './internal/const';

function check$chainRec$future(m, f, i, x){
  if(!isFuture(m)) typeError(
    'Future.chainRec expects the function its given to return a Future every'
    + ' time it is called. The value returned from'
    + (ordinal[i] ? ` the ${ordinal[i]} call` : ` call ${i}`)
    + ' was not a Future.'
    + `\n  Actual: ${show(m)}\n  From calling: ${showf(f)}\n  With: (Next, Done, ${show(x)})`
  );
}

function check$chainRec$it(it, i){
  if(!isIteration(it)) typeError(
    'Future.chainRec expects the function its given to return a Future of an'
    + ' Iteration every time it is called. The Future returned from'
    + (ordinal[i] ? ` the ${ordinal[i]} call` : ` call ${i}`)
    + ' did not resolve to a member of Iteration.'
    + '\n  You can create an uncomplete or complete Iteration using the next'
    + ' or done functions respectively. These are passed into your callback'
    + ' as first and second arguments.'
    + `\n  Actual: Future.of(${show(it)})`
  );
}

export function ChainRec(step, init){
  this._step = step;
  this._init = init;
}

ChainRec.prototype = Object.create(Core.prototype);

ChainRec.prototype._fork = function ChainRec$_fork(rej, res){

  const {_step, _init} = this;
  let i = 0, timing = Undetermined, cancel = noop, state = Next(_init);

  function resolved(it){
    check$chainRec$it(it, i);
    state = it;
    i = i + 1;
    timing = timing === Undetermined ? Synchronous : drain();
  }

  function drain(){
    while(!state.done){
      timing = Undetermined;
      const m = _step(Next, Done, state.value);
      check$chainRec$future(m, _step, i, state.value);
      cancel = m._fork(rej, resolved);
      if(timing !== Synchronous){
        timing = Asynchronous;
        return;
      }
    }
    res(state.value);
  }

  drain();

  return function Future$chainRec$cancel(){ cancel() };

};

ChainRec.prototype.toString = function ChainRec$toString(){
  return `Future.chainRec(${showf(this._step)}, ${show(this._init)})`;
};

function chainRec$step(step, init){
  return new ChainRec(step, init);
}

export function chainRec(step, init){
  if(!isFunction(step)) invalidArgument('Future.chainRec', 0, 'be a Function', step);
  if(arguments.length === 1) return partial1(chainRec$step, step);
  return chainRec$step(step, init);
}

Future[FL.chainRec] = chainRec;
