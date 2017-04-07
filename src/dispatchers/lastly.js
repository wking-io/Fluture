import {isFuture} from '../core';
import {partial1} from '../internal/fn';
import {invalidArgument} from '../internal/throw';

function lastly$right(right, left){
  if(!isFuture(left)) invalidArgument('Future.finally', 1, 'be a Future', left);
  return left.finally(right);
}

export function lastly(right, left){
  if(!isFuture(right)) invalidArgument('Future.finally', 0, 'be a Future', right);
  if(arguments.length === 1) return partial1(lastly$right, right);
  return lastly$right(right, left);
}
