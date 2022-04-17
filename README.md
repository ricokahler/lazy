# @ricokahler/lazy · [![bundlephobia](https://badgen.net/bundlephobia/minzip/@ricokahler/lazy)](https://bundlephobia.com/result?p=@ricokahler/lazy)

A small, **useful** set of methods for lazy iteration of iterables.

---

## Why this lazy lib?

1. Small size (~600b gzipped)
2. Simple, modern `for...of`-only implementations. (Read the source [here](https://github.com/ricokahler/lazy/blob/main/index.js))
3. Only ships _useful_\* methods

\***Useful** is a keyword here because this library only ships with iterable methods that can take advantage of chained lazy iteration.

What that boils down to is shipping methods that **never have to exhaust the iterable** in order to yield the next item.

An example of this would be a `reverse()` method. If this lib implemented a `reverse()` method, it would have to buffer the items received from the iterable into an array to be able to yield the items in reverse.

Since we have to buffer the items into an array anyway, there's not all that much difference between:

```js
Lazy.from(iterable).reverse(); // not implemented!
```

and

```js
Lazy.from(iterable).to(Array).reverse();
```

This constraint has some mental model benefits too. If you find yourself frequently needing to convert your iterable to an array, then there's a good chance lazy evaluation is not giving you much benefit.

## Do I even need a lazy lib?

In order to take full advantage of the short-circuiting nature of call-by-need/lazy-evaluation, your Lazy expression should either:

1.  terminate in short-circuiting method
2.  take (via `take` or `takeWhile`) a subset of the iterable

## Installation

```
npm i @ricokahler/lazy
```

## Usage

Both ESM and CJS are supported in this package.

```js
// esm
import Lazy from '@ricokahler/lazy';
```

```js
// common-js
const Lazy = require('@ricokahler/lazy');
```

You can then either chain the methods like arrays:

```js
const result = Lazy.from([1, 2, 3])
  .map((x) => x + 1)
  .filter((x) => x >= 3)
  .first();

console.log(result); // 3
```

Or use the static method counterparts:

```js
let iterable = Lazy.from([1, 2, 3]);
iterable = Lazy.map(iterable, (x) => x + 1);
iterable = Lazy.filter(iterable, (x) => x >= 3);
const result = Lazy.first(iterable);

console.log(result); // 3
```

## Methods

[**Conversion methods**](#conversion-methods)

- [`from`](#lazyfrom--)
- [`to`](#to--)

[**Chainable methods**](#chainable-methods)

- [`map`](#map--)
- [`filter`](#filter--)
- [`flat`](#flat--)
- [`flatMap`](#flatmap--)
- [`take`](#take--)
- [`takeWhile`](#takewhile--)
- [`skip`](#skip--)
- [`skipWhile`](#skipwhile--)

[**Short-circuiting, terminating methods**](#short-circuiting-terminating-methods)

- [`first`](#first--)
- [`find`](#find--)
- [`includes`](#includes--)
- [`some`](#some--)
- [`every`](#every--)

### Conversion methods

#### `Lazy.from` | [🔝](#methods)

Takes in any iterable and returns it wrapped in a `Lazy` with chainable `Lazy` methods.

```ts
// static method only
Lazy.from<T>(iterable: Iterable<T>): Lazy<T>
```

Note: this is equivalent to calling `new Lazy(iterable)`

#### `to` | [🔝](#methods)

Writes the iterable into another data structure. Accepts an object with a `from` method that accepts an iterable (e.g. `Array.from`) or a constructor that accepts an iterable.

The implementation is as follows:

```js
function to(iterable, constructorOrFromable) {
  if (typeof constructorOrFromable.from === 'function') {
    return constructorOrFromable.from(iterable);
  }
  return new constructorOrFromable(iterable);
}
```

```ts
Lazy<T>.to<TInstance>(fromable: {from: (iterable: Iterable<T>) => TInstance}): TInstance
Lazy<T>.to<TInstance>(constructor: {new (iterable: Iterable<T>) => TInstance}): TInstance
```

### Chainable methods

#### `map` | [🔝](#methods)

Takes in an iterable and returns an iterable generator that yields the result of the callback function on each item from the input iterable.

```ts
Lazy<T>.map<R>(mapper: (t: T) => R): Lazy<R>
```

#### `filter` | [🔝](#methods)

Takes in an iterable and returns an iterable generator that yields the accepted elements of the given callback function.

```ts
Lazy<T>.filter<R extends T>(accept: (t: T) => t is R): Lazy<R>
Lazy<T>.filter<R extends T>(accept: (t: T) => t is R): Lazy<R>
```

#### `flat` | [🔝](#methods)

Returns a new iterable with all sub-iterable items yielded into it recursively up to the specified depth.

```ts
Lazy<T>.flat<TDepth extends number>(depth?: TDepth): Lazy<Flattened<T, TDepth>>
```

#### `flatMap` | [🔝](#methods)

Calls the result of the given callback function on each item of the parent iterable. Then, yields the result of each into a flatted iterable. This is identical to a map followed by flat with depth 1.

```ts
Lazy<T>.flatMap<R>(mapper: (value: T) => R | Iterable<R>): Lazy<R>
```

#### `take` | [🔝](#methods)

Yields the first `n` items of the given iterable and stops further iteration.

```js
const result = Lazy.from([1, 2, 3, 4, 5]).take(3).to(Array);

console.log(result); // [1, 2, 3]
```

```ts
Lazy<T>.take(n: number): Lazy<T>
```

#### `takeWhile` | [🔝](#methods)

Yields while the callback function accepts the current item from the given iterable. Iteration finishes as soon as an item is rejected by the callback.

```js
const result = Lazy.from([1, 2, 3, 4, 5, 0, 1])
  .takeWhile((n) => n <= 2)
  .to(Array);
console.log(result); // [1, 2]
```

```ts
Lazy<T>.takeWhile<R extends T>(accept: (t: T) => t is R): Lazy<R>
Lazy<T>.takeWhile(accept: (t: T) => unknown): Lazy<T>
```

#### `skip` | [🔝](#methods)

Skips over the first `n` items of the given iterable then yields the rest.

```js
const result = Lazy.from([1, 2, 3, 4, 5]).skip(2).to(Array);
console.log(result); // [3, 4, 5]
```

```ts
Lazy<T>.skip(n: number): Lazy<T>
```

#### `skipWhile` | [🔝](#methods)

Skips over the items while the given callback accepts the current item from the given iterable, then yields the rest.

```js
const result = Lazy.from([1, 2, 3, 4, 5, 0, 1])
  .skipWhile((n) => n <= 2)
  .to(Array);

console.log(result); // [3, 4, 5, 0, 1]
```

```ts
Lazy<T>.skip(n: number): Lazy<T>
```

### Short-circuiting, terminating methods

#### `includes` | [🔝](#methods)

Determines whether an iterable includes a certain value using `===` comparison. Short-circuits iteration once the value is found.

```ts
Lazy<T>.includes(t: T): boolean
```

#### `first` | [🔝](#methods)

Returns the first item of an iterable or `undefined` if the iterable is done/exhausted.

```ts
Lazy<T>.first(): T | undefined
```

#### `find` | [🔝](#methods)

Returns the first item accepted by the given callback. Short-circuits iteration once an item is found.

```ts
Lazy<T>.find<R extends T>(accept: (t: T) => t is R): R | undefined
Lazy<T>.find(accept: (t: T) => unknown): T | undefined
```

#### `some` | [🔝](#methods)

Returns `true` if at least one item accepted by the given callback. Short-circuits iteration once an item is accepted.

```ts
Lazy<T>.some(accept: (t: T) => unknown): boolean
```

#### `every` | [🔝](#methods)

Returns `true` only if all items are accepted by the given callback. Short-circuits iteration once an item is rejected.

```ts
Lazy<T>.every(accept: (t: T) => unknown): boolean
```
