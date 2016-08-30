'use strict';

/*eslint no-console:0, no-sync:0*/

const Future = require('..');
const fs = require('fs');
const log = require('util').log;

const fileHandler = x => Future((rej, res) => {
  let fd;
  fs.open(x, 'r', (e, x) => (e ? rej(e) : res(fd = x)))
  return () => {
    fs.closeSync(fd);
    console.log('file handler closed');
  };
});

let nextMBThreshold = 0;
let batch = 0;
let stamp = Date.now();

const recursive = fd => {
  const memMB = process.memoryUsage().rss / 1048576
  batch += 1;
  if(batch % 5000 === 0){
    log(
      '-BATCH:', batch,
      '-OPS:', 5000 / ((Date.now() - stamp) / 1000),
      '-MEM:', memMB, 'MB'
    );
    stamp = Date.now();
  }
  if(memMB > nextMBThreshold){
    log('Memory increased.');
    nextMBThreshold += 100
  }
  return Future.after(1, fd).chain(recursive);
}

const cancel = fileHandler(__filename).chain(recursive).fork(
  e => (console.error(e.stack), process.exit(1)),
  v => (console.log(v), process.exit(2))
);

process.on('SIGINT', () => {
  log('SIGINT caught. Cancelling...');
  cancel();
  setTimeout(process.exit, 2000, 1);
});

log('PID', process.pid);
