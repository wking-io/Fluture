'use strict';

const Future = require('..');

function printStatus(fn) {
  switch(%GetOptimizationStatus(fn)) {
    case 1: console.log('Function is optimized'); break;
    case 2: console.log('Function is not optimized'); break;
    case 3: console.log('Function is always optimized'); break;
    case 4: console.log('Function is never optimized'); break;
    case 6: console.log('Function is maybe deoptimized'); break;
    case 7: console.log('Function is optimized by TurboFan'); break;
    default: console.log('Unknown optimization status'); break;
  }
}

const noop = () => {};
const m = Future.of(1);


console.log('--- map chain ap fork ---');

Future.of(1)
.map(x => x + 1)
.chain(x => Future.of(f => f(x + 1)))
.ap(Future.of(x => x + 1))
.fork(noop, noop);

%OptimizeFunctionOnNextCall(Future.of);
%OptimizeFunctionOnNextCall(m.map);
%OptimizeFunctionOnNextCall(m.chain);
%OptimizeFunctionOnNextCall(m.ap);
%OptimizeFunctionOnNextCall(m.fork);

printStatus(Future.of);
printStatus(m.map);
printStatus(m.chain);
printStatus(m.ap);
printStatus(m.fork);

Future.of(1)
.map(x => x + 1)
.chain(x => Future.of(f => f(x + 1)))
.ap(Future.of(x => x + 1))
.fork(noop, noop);

printStatus(Future.of);
printStatus(m.map);
printStatus(m.chain);
printStatus(m.ap);
printStatus(m.fork);


console.log('--- cache fork ---');

Future.of(1).cache().fork(noop, noop);

%OptimizeFunctionOnNextCall(Future.prototype.cache);
%OptimizeFunctionOnNextCall(Future.prototype.fork);

printStatus(Future.prototype.cache);
printStatus(Future.prototype.fork);

Future.of(1).cache().fork(noop, noop);

printStatus(Future.prototype.cache);
printStatus(Future.prototype.fork);


console.log('--- parallel fork ---');

Future.parallel(2, [Future.of(1), Future.of(2)]).fork(noop, noop);

%OptimizeFunctionOnNextCall(Future.parallel);
%OptimizeFunctionOnNextCall(Future.prototype.fork);

printStatus(Future.parallel);
printStatus(Future.prototype.fork);

Future.parallel(2, [Future.of(1), Future.of(2)]).fork(noop, noop);

printStatus(Future.parallel);
printStatus(Future.prototype.fork);
