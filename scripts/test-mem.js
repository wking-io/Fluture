/*global process*/
/*eslint no-console:0, no-sync:0*/

'use strict';

const {after, of, race} = require('..');
const log = require('util').log;
const sync = process.argv[2] === 'sync';
const id = x => x;
const spawn = (sync ? x => of(x).map(id) : x => after(1, x).map(id));

log('PID', process.pid);

const start = Date.now();
let batch = 0;
let stamp = Date.now();

const recursive = () => {
  const memMB = process.memoryUsage().rss / 1048576;
  const now = Date.now();
  const passed = now - stamp;
  batch = batch + 1;
  if(passed >= 5000){
    log(
      '-BATCH:', batch,
      '-OPS:', Math.round(batch / ((now - start) / passed) / (passed / 1000)),
      '-MEM:', memMB, 'MB'
    );
    stamp = now;
  }
  return spawn('l').chain(recursive).race(spawn('r')); //Runs out of memory in "sync" mode
  // return spawn('l').race(spawn('r').chain(recursive)); //Immediately exits with "l"
  // return spawn('l').race(spawn('r')).chain(recursive); //Infinite recursion
};

const cancel = recursive().fork(
  e => {console.error(e.stack); process.exit(1)},
  v => {log('resolved', v); process.exit(2)}
);

process.on('SIGINT', () => {
  log('SIGINT caught. Cancelling...');
  cancel();
});
