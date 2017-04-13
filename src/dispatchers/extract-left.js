import {isFuture} from '../core';
import {invalidArgument} from '../internal/throw';

export function extractLeft(m){
  if(!isFuture(m)) invalidArgument('Future.extractLeft', 0, 'be a Future', m);
  return m.extractLeft();
}
