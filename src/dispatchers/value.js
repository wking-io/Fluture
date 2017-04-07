import {isFuture} from '../core';
import {partial1} from '../internal/fn';
import {isFunction} from '../internal/is';
import {invalidArgument} from '../internal/throw';

function value$cont(cont, m){
  if(!isFuture(m)) invalidArgument('Future.value', 1, 'be a Future', m);
  return m.value(cont);
}

export function value(cont, m){
  if(!isFunction(cont)) invalidArgument('Future.value', 0, 'be a Function', cont);
  if(arguments.length === 1) return partial1(value$cont, cont);
  return value$cont(cont, m);
}
