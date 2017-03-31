export {
  Future,
  Future as default,
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
} from './src/core';

export {after} from './src/after';
export {both} from './src/both';
export {first} from './src/race';
export {go, go as do} from './src/go';
export {parallel} from './src/parallel';
export {rejectAfter} from './src/reject-after';
