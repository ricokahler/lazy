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
Lazy.from(iterable).reverse(); // not implemented
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

<!-- TODO: add examples -->

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

More docs soon.

1. Conversion
   1. `from`
   2. `to`
2. Chaining
   1. `map`
   1. `filter`
   1. `flat`
   1. `flatMap`
   1. `take`
   1. `takeWhile`
   1. `skip`
   1. `skipWhile`
3. Short-circuiting terminators
   1. `first`
   2. `find`
   3. `includes`
   4. `some`
   5. `every`
