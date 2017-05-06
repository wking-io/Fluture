import {
  Future,
  isFuture,
  reject,
  of,
  never,
  isNever
} from './core';

import * as dispatchers from './dispatchers';

import {after} from './after';
import {both} from './both';
import {cache} from './cache';
import {chainRec} from './chain-rec';
import {encase, encase2, encase3, attempt} from './encase';
import {first} from './race';
import {fromPromise, fromPromise2, fromPromise3} from './from-promise';
import {go} from './go';
import {hook} from './hook';
import {node} from './node';
import {Par, seq} from './par';
import {parallel} from './parallel';
import {rejectAfter} from './reject-after';

import {error} from './internal/throw';

if(typeof Object.create !== 'function') error('Please polyfill Object.create to use Fluture');
if(typeof Object.assign !== 'function') error('Please polyfill Object.assign to use Fluture');
if(typeof Array.isArray !== 'function') error('Please polyfill Array.isArray to use Fluture');

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
  fromPromise,
  fromPromise2,
  fromPromise3,
  hook,
  node,
  Par,
  seq,
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
