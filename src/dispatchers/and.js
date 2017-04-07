import {isFuture} from '../core';
import {partial1} from '../internal/fn';
import {invalidArgument} from '../internal/throw';

function and$left(left, right){
  if(!isFuture(right)) invalidArgument('Future.and', 1, 'be a Future', right);
  return left.and(right);
}

export function and(left, right){
  if(!isFuture(left)) invalidArgument('Future.and', 0, 'be a Future', left);
  if(arguments.length === 1) return partial1(and$left, left);
  return and$left(left, right);
}
