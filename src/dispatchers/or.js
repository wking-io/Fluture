import {isFuture} from '../core';
import {partial1} from '../internal/fn';
import {invalidArgument} from '../internal/throw';

function or$left(left, right){
  if(!isFuture(right)) invalidArgument('Future.or', 1, 'be a Future', right);
  return left.or(right);
}

export function or(left, right){
  if(!isFuture(left)) invalidArgument('Future.or', 0, 'be a Future', left);
  if(arguments.length === 1) return partial1(or$left, left);
  return or$left(left, right);
}
