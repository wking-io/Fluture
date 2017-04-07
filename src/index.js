import {
  Future,
  isFuture,
  reject,
  isRejected,
  of,
  isResolved,
  never,
  isNever,
  chainRec
} from './core';

import * as dispatchers from './dispatchers/index';

import {after} from './after';
import {both} from './both';
import {first} from './race';
import {go} from './go';
import {parallel} from './parallel';
import {rejectAfter} from './reject-after';

import {error} from './internal/throw';

if(typeof Object.create !== 'function') error('Please polyfill Object.create to use Fluture');
if(typeof Object.assign !== 'function') error('Please polyfill Object.assign to use Fluture');

export default Object.assign(Future, dispatchers, {
  Future,
  isFuture,
  reject,
  isRejected,
  of,
  isResolved,
  never,
  isNever,
  after,
  both,
  first,
  parallel,
  rejectAfter,
  chainRec,
  go,
  do: go
});
