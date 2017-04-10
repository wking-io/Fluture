import {
  Future,
  isFuture,
  reject,
  of,
  never,
  isNever
} from './core';

import * as dispatchers from './dispatchers/index';

import {after} from './after';
import {both} from './both';
import {cache} from './cache';
import {chainRec} from './chain-rec';
import {encase, encase2, encase3, attempt} from './encase';
import {first} from './race';
import {go} from './go';
import {node} from './node';
import {parallel} from './parallel';
import {rejectAfter} from './reject-after';

import {error} from './internal/throw';

if(typeof Object.create !== 'function') error('Please polyfill Object.create to use Fluture');
if(typeof Object.assign !== 'function') error('Please polyfill Object.assign to use Fluture');

export default Object.assign(Future, dispatchers, {
  Future,
  isFuture,
  reject,
  of,
  never,
  isNever,
  after,
  both,
  cache,
  first,
  node,
  parallel,
  rejectAfter,
  chainRec,
  encase,
  encase2,
  encase3,
  attempt,
  go,
  try: attempt,
  do: go
});
