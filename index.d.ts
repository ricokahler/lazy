interface StaticFrom<TInstance = unknown> {
  from: (iterable: Iterable<unknown>) => TInstance;
}

interface IterableArgumentConstructor<TInstance = unknown> {
  new (iterable: Iterable<unknown>): TInstance;
}

declare class Lazy<T> implements Iterable<T> {
  static from<T>(iterable: Iterable<T>): Lazy<T>;

  static filter<T, R extends T>(
    iterable: Iterable<T>,
    accept: (t: T) => t is R,
  ): Lazy<R>;
  static filter<T>(iterable: Iterable<T>, accept: (t: T) => unknown): Lazy<T>;

  static map<T, R>(iterable: Iterable<T>, mapper: (t: T) => R): Lazy<R>;

  static take<T>(iterable: Iterable<T>, n: number): Lazy<T>;

  static takeWhile<T, R extends T>(
    iterable: Iterable<T>,
    accept: (t: T) => t is R,
  ): Lazy<R>;
  static takeWhile<T>(
    iterable: Iterable<T>,
    accept: (t: T) => unknown,
  ): Lazy<T>;

  static skip<T>(iterable: Iterable<T>, n: number): Lazy<T>;

  static skipWhile<T>(
    iterable: Iterable<T>,
    accept: (t: T) => unknown,
  ): Lazy<T>;

  static includes<T>(iterable: Iterable<T>, value: T): boolean;

  static first<T>(iterable: Iterable<T>): T | undefined;

  static find<T, R extends T>(
    iterable: Iterable<T>,
    accept: (t: T) => t is R,
  ): R | undefined;
  static find<T>(
    iterable: Iterable<T>,
    accept: (t: T) => unknown,
  ): T | undefined;

  static some<T>(iterable: Iterable<T>, accept: (t: T) => unknown): boolean;

  static every<T>(iterable: Iterable<T>, accept: (t: T) => unknown): boolean;

  static to<T>(iterable: Iterable<T>, setConstructor: SetConstructor): Set<T>;
  static to<T>(iterable: Iterable<T>, arrayConstructor: ArrayConstructor): T[];
  // TODO: these overloads don't generically initialize a parameterized instance
  static to<T, TStaticFrom extends StaticFrom>(
    iterable: Iterable<T>,
    staticFrom: TStaticFrom,
  ): TStaticFrom extends StaticFrom<infer TInstance> ? TInstance : never;
  static to<T, TConstructor extends IterableArgumentConstructor>(
    iterable: Iterable<T>,
    constructor: TConstructor,
  ): TConstructor extends IterableArgumentConstructor<infer TInstance>
    ? TInstance
    : never;

  filter<R extends T>(accept: (t: T) => t is R): Lazy<R>;
  filter(accept: (t: T) => unknown): Lazy<T>;

  map<R>(mapper: (t: T) => R): Lazy<R>;

  take(n: number): Lazy<T>;

  takeWhile<R extends T>(accept: (t: T) => t is R): Lazy<R>;
  takeWhile(accept: (t: T) => unknown): Lazy<T>;

  skip(n: number): Lazy<T>;

  skipWhile(accept: (t: T) => unknown): Lazy<T>;

  includes(t: T): boolean;

  first(): T | undefined;

  find<R extends T>(accept: (t: T) => t is R): R | undefined;
  find(accept: (t: T) => unknown): T | undefined;

  some(accept: (t: T) => unknown): boolean;

  every(accept: (t: T) => unknown): boolean;

  to(setConstructor: SetConstructor): Set<T>;
  to(arrayConstructor: ArrayConstructor): T[];
  // TODO: these overloads don't generically initialize a parameterized instance
  to<TStaticFrom extends StaticFrom>(
    staticFrom: TStaticFrom,
  ): TStaticFrom extends StaticFrom<infer TInstance> ? TInstance : never;
  to<TConstructor extends IterableArgumentConstructor>(
    constructor: TConstructor,
  ): TConstructor extends IterableArgumentConstructor<infer TInstance>
    ? TInstance
    : never;

  [Symbol.iterator](): Iterator<T>;
}

export = Lazy;
