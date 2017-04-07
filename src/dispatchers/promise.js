import {isFuture} from '../core';
import {invalidArgument} from '../internal/throw';

export function promise(m){
  if(!isFuture(m)) invalidArgument('Future.promise', 0, 'be a Future', m);
  return m.promise();
}
