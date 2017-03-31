import {
  Future,
  isFuture,
  ap,
  map,
  bimap,
  chain,
  mapRej,
  race,
  or,
  fork,
  value,
  promise,
  reject,
  isRejected,
  of,
  isResolved,
  never,
  isNever,
  chainRec
} from './core';

import {after} from './after';
import {both} from './both';
import {first} from './race';
import {go} from './go';
import {parallel} from './parallel';
import {rejectAfter} from './reject-after';

export default Object.assign(Future, {
  Future,
  isFuture,
  ap,
  map,
  bimap,
  chain,
  mapRej,
  race,
  or,
  fork,
  value,
  promise,
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
