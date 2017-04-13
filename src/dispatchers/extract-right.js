import {isFuture} from '../core';
import {invalidArgument} from '../internal/throw';

export function extractRight(m){
  if(!isFuture(m)) invalidArgument('Future.extractRight', 0, 'be a Future', m);
  return m.extractRight();
}
