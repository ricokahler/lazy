/**
 * @param {Iterable<unknown>} iterable
 * @param {(item: unknown) => unknown} accept
 */
function* map(iterable, mapper) {
  for (const item of iterable) {
    yield mapper(item);
  }
}

/**
 * @param {Iterable<unknown>} iterable
 * @param {(item: unknown) => unknown} accept
 */
function* filter(iterable, accept) {
  for (const item of iterable) {
    if (accept(item)) yield item;
  }
}

/**
 * @param {Iterable<unknown>} iterable
 * @param {number} n
 */
function* take(iterable, n) {
  let i = n;
  for (const item of iterable) {
    if (i <= 0) return;
    i--;
    yield item;
  }
}

/**
 * @param {Iterable<unknown>} iterable
 * @param {number} n
 */
function* skip(iterable, n) {
  let i = n;
  for (const item of iterable) {
    if (i <= 0) yield item;
    else i--;
  }
}

/**
 * @param {Iterable<unknown>} iterable
 * @param {(item: unknown) => unknown} accept
 */
function* takeWhile(iterable, accept) {
  for (const item of iterable) {
    if (accept(item)) yield item;
    else return;
  }
}

function* flat(iterable, depth = 1) {
  for (const item of iterable) {
    if (typeof item[Symbol.iterator] !== 'function') {
      yield item;
      continue;
    }

    if (depth > 1) {
      yield* flat(item, depth - 1);
      continue;
    }

    for (const subitem of item) {
      yield subitem;
    }
  }
}

function flatMap(iterable, mapper) {
  return flat(map(iterable, mapper));
}

/**
 * @param {Iterable<unknown>} iterable
 * @param {(item: unknown) => unknown} accept
 */
function* skipWhile(iterable, accept) {
  let yielding = false;
  for (const item of iterable) {
    if (yielding) {
      yield item;
    } else {
      if (accept(item)) continue;

      yielding = true;
      yield item;
    }
  }
}

const chainableMethods = {
  map,
  flat,
  flatMap,
  filter,
  take,
  skip,
  takeWhile,
  skipWhile,
};

/**
 * @param {Iterable<unknown>} iterable
 */
function first(iterable) {
  return take(iterable, 1).next().value;
}

/**
 * @param {Iterable<unknown>} iterable
 * @param {(item: unknown) => unknown} accept
 */
function find(iterable, accept) {
  for (const item of iterable) {
    if (accept(item)) return item;
  }
}

/**
 * @param {Iterable<unknown>} iterable
 * @param {(item: unknown) => unknown} accept
 */
function some(iterable, accept) {
  for (const item of iterable) {
    if (accept(item)) return true;
  }
  return false;
}

/**
 * @param {Iterable<unknown>} iterable
 * @param {(item: unknown) => unknown} accept
 */
function every(iterable, accept) {
  for (const item of iterable) {
    if (!accept(item)) return false;
  }
  return true;
}

function includes(iterable, value) {
  for (const item of iterable) {
    if (item === value) return true;
  }
  return false;
}

/**
 * @param {Iterable<unknown>} iterable
 * @param {any} constructorOrFromable
 */
function to(iterable, constructorOrFromable) {
  if (typeof constructorOrFromable.from === 'function') {
    return constructorOrFromable.from(iterable);
  }
  return new constructorOrFromable(iterable);
}

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
  constructor(iterable) {
    this.iterable = iterable || [];
    for (const methodName of Object.keys(allMethods)) {
      this[methodName] = this[methodName].bind(this);
    }
  }

  static from(iterable) {
    return new Lazy(iterable);
  }
}

for (const [methodName, methodFunction] of Object.entries(chainableMethods)) {
  Lazy[methodName] = methodFunction;
  Lazy.prototype[methodName] = function (...args) {
    return Lazy.from(methodFunction(this.iterable, ...args));
  };
}

for (const [methodName, methodFunction] of Object.entries(otherMethods)) {
  Lazy[methodName] = methodFunction;
  Lazy.prototype[methodName] = function (...args) {
    return methodFunction(this.iterable, ...args);
  };
}

export default Lazy;
