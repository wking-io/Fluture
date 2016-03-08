# Fluture

A complete Fantasy Land compatible Future library.

> `npm install --save fluture` <sup>Requires node 5.0.0 or later</sup>


## Usage

```js
Future.node(node => fs.readFile('package.json', 'utf8', done))
.chain(x => Future.try(() => JSON.parse(x)))
.map(x => x.name)
.fork(console.error, console.log)
//> "fluture"
```

## Motivation

* A stand-alone Fantasy Future package.
* Async control utilities included.
* Easier debugging than `f(...).fork is not a function`.
* Still maintain decent speed.

## Documentation

### Future

A (monadic) container which represents an eventual value. A lot like Promise but
more principled in that it follows the Fantasy Land algebraic JavaScript
specification.

```js
const eventualThing = Future((reject, resolve) => {
  setTimeout(resolve, 500, 'world');
});

eventualThing.fork(console.error, thing => console.log(`Hello ${thing}!`));
//> "Hello world!"
```

----

#### `of :: b -> Future a b`

A constructor that creates a Future containing the given value.

```js
const eventualThing = Future.of('world');
eventualThing.fork(console.error, thing => console.log(`Hello ${thing}!`));
//> "Hello world!"
```

#### `after :: Number -> b -> Future a b`

A constructor that creates a Future containing the given value after n milliseconds.

```js
const eventualThing = Future.after(500, 'world');
eventualThing.fork(console.error, thing => console.log(`Hello ${thing}!`));
//> "Hello world!"
```

#### `try :: (Void -> !a | b) -> Future a b`

A constructor that creates a Future which resolves with the result of calling
the given function, or rejects with the error thrown by the given function.

```js
const data = {foo: 'bar'}
Future.try(() => data.foo.bar.baz).fork(console.error, console.log)
//> [TypeError: Cannot read property 'baz' of undefined]
```

#### `node :: ((a, b -> Void) -> Void) -> Future a b`

A constructor that creates a Future which rejects with the first argument given
to the function, or resolves with the second if the first is not present.

This is a convenience for NodeJS users who wish to easily obtain a Future from
a node style callback API.

```js
Future.node(node => fs.readFile('package.json', 'utf8', done))
.fork(console.error, console.log)
//> "{...}"
```

----

#### `map :: Future a b ~> (b -> c) -> Future a c`

Map over the value inside the Future. If the Future is rejected, mapping is not
performed.

```js
Future.of(1).map(x => x + 1).fork(console.error, console.log);
//> 2
```

#### `chain :: Future a b ~> (b -> Future a c) -> Future a c`

FlatMap over the value inside the Future. If the Future is rejected, chaining is
not performed.

```js
Future.of(1).chain(x => Future.of(x + 1)).fork(console.error, console.log);
//> 2
```

#### `ap :: Future a (b -> c) ~> Future a b -> Future a c`

Apply the value in the Future to the value in the given Future. If the Future is
rejected, applying is not performed.

```js
Future.of(x => x + 1).ap(Future.of(1)).fork(console.error, console.log);
//> 2
```

----

#### `race :: Future a b -> Future a b -> Future a b`

Race two Futures against eachother. Creates a new Future which resolves or
rejects with the resolution or rejection value of the first Future to settle.

```js
Future.race(Future.after(100, 'hello'), Future.after(50, 'bye'))
.fork(console.error, console.log)
//> "bye"

const first = futures => futures.reduce(Future.race);
first([
  Future.after(100, 'hello'),
  Future.after(50, 'bye'),
  Future(rej => setTimeout(rej, 25, 'nope'))
])
.fork(console.error, console.log)
//> [Error nope]
```

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
* [x] Create documentation
* [ ] Wiki: Comparison between Future libs
* [ ] Wiki: Comparison Future and Promise
* [ ] Add test coverage
* [ ] A transpiled ES5 version if demand arises

## Benchmarks

Simply run `node ./bench/<file>` to see how a specific method compares to
implementations in `data.task`, `ramda-fantasy.Future` and `Promise`*.

\* Promise is not included in all benchmarks because it tends to make the
  process run out of memory.

## The name

A conjunction of the acronym to Fantasy Land (FL) and Future. Also "fluture"
means butterfly in Romanian; A creature you might expect to see in Fantasy Land.
