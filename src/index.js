import {
  Future,
  isFuture,
  reject,
  of,
  never,
  isNever
} from './core';

import * as dispatchers from './dispatchers';

import {after, rejectAfter} from './after';
import {attempt} from './attempt';
import {cache} from './cache';
import {chainRec} from './chain-rec';
import {encase} from './encase';
import {encase2} from './encase2';
import {encase3} from './encase3';
import {encaseN, encaseN2, encaseN3, node} from './encase-n';
import {encaseP, encaseP2, encaseP3, tryP} from './encase-p';
import {go} from './go';
import {hook} from './hook';
import {Par, seq} from './par';
import {parallel} from './parallel';

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
  cache,
  encaseP,
  encaseP2,
  encaseP3,
  tryP,
  hook,
  encaseN,
  encaseN2,
  encaseN3,
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
