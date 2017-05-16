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
import {encaseN} from './encase-n';
import {encaseN2} from './encase-n2';
import {encaseN3} from './encase-n3';
import {encaseP} from './encase-p';
import {encaseP2} from './encase-p2';
import {encaseP3} from './encase-p3';
import {go} from './go';
import {hook} from './hook';
import {node} from './node';
import {Par, seq} from './par';
import {parallel} from './parallel';
import {tryP} from './try-p';

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
