import {isFuture} from '../core';
import {partial1} from '../internal/fn';
import {invalidArgument} from '../internal/throw';

function both$left(left, right){
  if(!isFuture(right)) invalidArgument('Future.both', 1, 'be a Future', right);
  return left.both(right);
}

export function both(left, right){
  if(!isFuture(left)) invalidArgument('Future.both', 0, 'be a Future', left);
  if(arguments.length === 1) return partial1(both$left, left);
  return both$left(left, right);
}
