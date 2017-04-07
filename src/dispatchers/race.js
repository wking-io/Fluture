import {isFuture} from '../core';
import {partial1} from '../internal/fn';
import {invalidArgument} from '../internal/throw';

function race$right(right, left){
  if(!isFuture(left)) invalidArgument('Future.race', 1, 'be a Future', left);
  return left.race(right);
}

export function race(right, left){
  if(!isFuture(right)) invalidArgument('Future.race', 0, 'be a Future', right);
  if(arguments.length === 1) return partial1(race$right, right);
  return race$right(right, left);
}
