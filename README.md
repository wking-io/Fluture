# Fluture

A complete Fantasy Land compatible Future library.

> `npm install --save fluture` <sup>Requires node 5.0.0 or later</sup>

## Motivation

* A stand-alone Fantasy Future package.
* Async control utilities included.
* Easier debugging than `f(...).fork is not a function`.
* Still maintain decent speed.

## Road map

* [x] Implement Future Monad
* [x] Write tests
* [x] Write benchmarks
* [ ] Implement Traversable?
* [ ] Implement Future.cache
* [ ] Implement Future.mapRej
* [ ] Implement Future.chainRej
* [ ] Implement Future.swap
* [ ] Implement Future.and
* [ ] Implement Future.or
* [x] Implement Future.race
* [ ] Implement Future.parallel
* [ ] Create documentation
* [ ] Add test coverage
* [ ] A transpiled ES5 version if demand arises

## Benchmarks

Simply run `node ./bench/<file>` to see how a specific method compares to
implementations in `data.task`, `ramda-fantasy.Future` and `Promise`*.

* Promise is not included in all benchmarks because it tends to make the process
  run out of memory.

## The name

A conjunction of the acronym to Fantasy Land (FL) and Future. Also "fluture"
means butterfly in Romanian; A creature you might expect to see in Fantasy Land.
