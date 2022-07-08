const identity = (i) => i;

function* mapSync(iterable, mapper) {
  for (const item of iterable) {
    yield mapper(item);
  }
}

async function* mapAsync(iterable, mapper) {
  for await (const item of iterable) {
    yield mapper(item);
  }
}

function* filterSync(iterable, accept) {
  for (const item of iterable) {
    if (accept(item)) yield item;
  }
}

async function* filterAsync(iterable, accept) {
  for await (const item of iterable) {
    if (accept(item)) yield item;
  }
}

function* scanSync(iterable, reducer, initialAcc) {
  let acc = initialAcc;

  for (const item of iterable) {
    acc = reducer(acc, item);
    yield acc;
  }
}

async function* scanAsync(iterable, reducer, initialAcc) {
  let acc = initialAcc;

  for await (const item of iterable) {
    acc = reducer(acc, item);
    yield acc;
  }
}

function* flatSync(iterable, depth = 1) {
  for (const item of iterable) {
    if (typeof item[Symbol.iterator] !== 'function') {
      yield item;
      continue;
    }

    if (depth > 1) {
      yield* flatSync(item, depth - 1);
      continue;
    }

    for (const subitem of item) {
      yield subitem;
    }
  }
}

async function* flatAsync(iterable, depth = 1) {
  for await (const item of iterable) {
    if (typeof item[Symbol.asyncIterator] !== 'function') {
      yield item;
      continue;
    }

    if (depth > 1) {
      yield* flatAsync(item, depth - 1);
      continue;
    }

    for await (const subitem of item) {
      yield subitem;
    }
  }
}

function take(iterable, n) {
  return map(
    takeWhile(
      scan(iterable, ([i], item) => [i - 1, item], [n]),
      ([i]) => i >= 0,
    ),
    ([, item]) => item,
  );
}

function skip(iterable, n) {
  return map(
    skipWhile(
      scan(iterable, ([i], item) => [i - 1, item], [n]),
      ([i]) => i >= 0,
    ),
    ([, item]) => item,
  );
}

function* takeWhileSync(iterable, accept) {
  for (const item of iterable) {
    if (accept(item)) yield item;
    else return;
  }
}

async function* takeWhileAsync(iterable, accept) {
  for await (const item of iterable) {
    if (accept(item)) yield item;
    else return;
  }
}

function flatMap(iterable, mapper) {
  return flat(map(iterable, mapper));
}

function* skipWhileSync(iterable, accept) {
  let yielding = false;

  for (const item of iterable) {
    if (yielding) {
      yield item;
    } else if (!accept(item)) {
      yield item;
      yielding = true;
    }
  }
}

async function* skipWhileAsync(iterable, accept) {
  let yielding = false;

  for await (const item of iterable) {
    if (yielding) {
      yield item;
    } else if (!accept(item)) {
      yield item;
      yielding = true;
    }
  }
}

function firstSync(iterable) {
  return take(iterable, 1).next().value;
}

function firstAsync(iterable) {
  return take(iterable, 1)
    .next()
    .then((result) => result.value);
}

function find(iterable, accept) {
  return first(filter(iterable, accept));
}

function booleanify(result, negate) {
  if (result?.then) return result.then((i) => (negate ? !i : !!i));
  return negate ? !result : !!result;
}

function some(iterable, accept) {
  return booleanify(
    first(
      filter(
        map(iterable, (item) => !!accept(item)),
        identity,
      ),
    ),
  );
}

function every(iterable, accept) {
  return booleanify(
    first(
      filter(
        scan(
          iterable,
          (rejected, item) => (rejected ? true : !accept(item)),
          false,
        ),
        identity,
      ),
    ),
    true,
  );
}

function includes(iterable, value) {
  return booleanify(
    first(
      filter(
        map(iterable, (item) => item === value),
        identity,
      ),
    ),
  );
}

async function toAsync(iterable, constructorOrFromable) {
  const items = [];
  for await (const item of iterable) {
    items.push(item);
  }

  return toSync(items, constructorOrFromable);
}

function toSync(iterable, constructorOrFromable) {
  if (typeof constructorOrFromable.from === 'function') {
    return constructorOrFromable.from(iterable);
  }
  return new constructorOrFromable(iterable);
}

function pick(syncMethod, asyncMethod) {
  return (iterable, ...args) => {
    if (typeof iterable[Symbol.asyncIterator] === 'function') {
      return asyncMethod(iterable, ...args);
    }
    return syncMethod(iterable, ...args);
  };
}

const map = pick(mapSync, mapAsync);
const filter = pick(filterSync, filterAsync);
const scan = pick(scanSync, scanAsync);
const takeWhile = pick(takeWhileSync, takeWhileAsync);
const skipWhile = pick(skipWhileSync, skipWhileAsync);
const flat = pick(flatSync, flatAsync);
const first = pick(firstSync, firstAsync);
const to = pick(toSync, toAsync);

const chainableMethods = {
  map,
  flat,
  flatMap,
  filter,
  take,
  skip,
  takeWhile,
  skipWhile,
  scan,
};

const otherMethods = {
  first,
  find,
  includes,
  some,
  every,
  to,
};

const allMethods = { ...chainableMethods, ...otherMethods };

class Lazy {
  constructor(iterableOrAsyncIterable = []) {
    if (typeof iterableOrAsyncIterable[Symbol.asyncIterator] === 'function') {
      this.asyncIterable = iterableOrAsyncIterable;

      // implement async iterator protocol
      this[Symbol.asyncIterator] = function () {
        return this.asyncIterable[Symbol.asyncIterator]();
      };
    } else {
      this.iterable = iterableOrAsyncIterable;

      // implement iterator protocol
      this[Symbol.iterator] = function () {
        return this.iterable[Symbol.iterator]();
      };
    }

    // bind all methods for convenience
    for (const methodName of Object.keys(allMethods)) {
      this[methodName] = this[methodName].bind(this);
    }
  }

  static from(iterable) {
    return new Lazy(iterable);
  }
}

for (const [methodName, methodFunction] of Object.entries(chainableMethods)) {
  // static version
  Lazy[methodName] = methodFunction;

  // chainable version
  Lazy.prototype[methodName] = function (...args) {
    return Lazy.from(
      methodFunction(this.asyncIterable || this.iterable, ...args),
    );
  };
}

for (const [methodName, methodFunction] of Object.entries(otherMethods)) {
  // static version
  Lazy[methodName] = methodFunction;

  // chainable version
  Lazy.prototype[methodName] = function (...args) {
    return methodFunction(this.asyncIterable || this.iterable, ...args);
  };
}

export default Lazy;
