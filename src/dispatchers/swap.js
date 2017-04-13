import {isFuture} from '../core';
import {invalidArgument} from '../internal/throw';

export function swap(m){
  if(!isFuture(m)) invalidArgument('Future.swap', 0, 'be a Future', m);
  return m.swap();
}
