interface StaticFrom<TInstance = unknown> {
  from: (iterable: Iterable<unknown>) => TInstance;
}

interface IterableArgumentConstructor<TInstance = unknown> {
  new (iterable: Iterable<unknown>): TInstance;
}

type FirstTupleItem<T> = T extends [infer U, unknown] ? U : unknown;
type SecondTupleItem<T> = T extends [unknown, infer U] ? U : unknown;

interface LazyConstructor {
  new <T>(iterable?: Iterable<T> | null): Lazy<T>;
  readonly prototype: Lazy<any>;
}

// This is the same implementation as `FlatArray`
type FlatIterable<TIterable, TDepth extends number> = {
  done: TIterable;
  recur: TIterable extends Iterable<infer InnerItr>
    ? FlatIterable<
        InnerItr,
        // prettier-ignore
        [-1,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20][TDepth]
      >
    : TIterable;
}[TDepth extends -1 ? 'done' : 'recur'];

/**
 * A small, _useful_ set of methods for lazy iteration of iterables
 */
declare class Lazy<T> implements Iterable<T> {
  public iterable: Iterable<T>;

  /**
   * Takes in any iterable and returns it wrapped in a `Lazy` with chainable
   * `Lazy` methods
   */
  static from<T>(iterable: Iterable<T>): Lazy<T>;

  constructor(iterable?: Iterable<T> | null);

  /**
   * Takes in an iterable and returns an iterable generator that yields the
   * accepted elements of the given callback function.
   */
  static filter<T, R extends T>(
    iterable: Iterable<T>,
    accept: (t: T) => t is R,
  ): Iterable<R>;
  static filter<T>(
    iterable: Iterable<T>,
    accept: (t: T) => unknown,
  ): Iterable<T>;

  /**
   * Takes in an iterable and returns an iterable generator that yields the
   * result of the callback function on each item from the input iterable.
   */
  static map<T, R>(iterable: Iterable<T>, mapper: (t: T) => R): Iterable<R>;

  static flat<T, TDepth extends number = 1>(
    iterable: T,
    depth?: TDepth,
  ): FlatIterable<T, TDepth>;

  static flatMap<T, R>(
    iterable: T,
    mapper: (value: T) => R | Iterable<R>,
  ): Iterable<R>;

  /**
   * Yields the first `n` items of the given iterable and stops further
   * iteration.
   *
   * ```js
   * const result = Lazy.from([1, 2, 3, 4, 5]).take(3).to(Array);
   *
   * console.log(result); // [1, 2, 3]
   * ```
   */
  static take<T>(iterable: Iterable<T>, n: number): Iterable<T>;

  /**
   * Yields while the callback function accepts the current item from the given
   * iterable. Iteration finishes as soon as an item is rejected by the
   * callback.
   *
   * ```js
   * const result = Lazy.from([1, 2, 3, 4, 5, 0, 1])
   *   .takeWhile((n) => n <= 2)
   *   .to(Array);
   *
   * console.log(result); // [1, 2]
   * ```
   */
  static takeWhile<T, R extends T>(
    iterable: Iterable<T>,
    accept: (t: T) => t is R,
  ): Iterable<R>;
  static takeWhile<T>(
    iterable: Iterable<T>,
    accept: (t: T) => unknown,
  ): Iterable<T>;

  /**
   * Skips over the first `n` items of the given iterable then yields the rest.
   *
   * ```js
   * const result = Lazy.from([1, 2, 3, 4, 5]).skip(2).to(Array);
   *
   * console.log(result); // [3, 4, 5]
   * ```
   */
  static skip<T>(iterable: Iterable<T>, n: number): Iterable<T>;

  /**
   * Skips over the items while the given callback accepts the current item from
   * the given iterable, then yields the rest.
   *
   * ```js
   * const result = Lazy.from([1, 2, 3, 4, 5, 0, 1])
   *   .skipWhile((n) => n <= 2)
   *   .to(Array)
   *
   * console.log(result); // [3, 4, 5, 0, 1]
   * ```
   */
  static skipWhile<T>(
    iterable: Iterable<T>,
    accept: (t: T) => unknown,
  ): Iterable<T>;

  /**
   * Determines whether an iterable includes a certain value using `===`
   * comparison. Short-circuits iteration once the value is found.
   */
  static includes<T>(iterable: Iterable<T>, value: T): boolean;

  /**
   * Returns the first item of an iterable or `undefined` if the iterable is
   * done/exhausted.
   */
  static first<T>(iterable: Iterable<T>): T | undefined;

  /**
   * Returns the first item accepted by the given callback. Short-circuits
   * iteration once an item is found.
   */
  static find<T, R extends T>(
    iterable: Iterable<T>,
    accept: (t: T) => t is R,
  ): R | undefined;
  static find<T>(
    iterable: Iterable<T>,
    accept: (t: T) => unknown,
  ): T | undefined;

  /**
   * Returns `true` if at least one item accepted by the given callback.
   * Short-circuits iteration once an item is accepted.
   */
  static some<T>(iterable: Iterable<T>, accept: (t: T) => unknown): boolean;

  /**
   * Returns `true` only if all items are accepted by the given callback.
   * Short-circuits iteration once an item is rejected.
   */
  static every<T>(iterable: Iterable<T>, accept: (t: T) => unknown): boolean;

  /**
   * Writes the iterable into another data structure. Accepts an object with
   * a `from` method that accepts an iterable (e.g. `Array.from`) or a
   * constructor that accepts an iterable.
   *
   * The implementation is as follows:
   *
   * ```js
   * function to(iterable, constructorOrFromable) {
   *   if (typeof constructorOrFromable.from === 'function') {
   *     return constructorOrFromable.from(iterable);
   *   }
   *   return new constructorOrFromable(iterable);
   * }
   * ```
   */
  static to<T>(iterable: Iterable<T>, setConstructor: SetConstructor): Set<T>;
  static to<T>(
    iterable: Iterable<T>,
    mapConstructor: MapConstructor,
  ): Map<FirstTupleItem<T>, SecondTupleItem<T>>;
  static to<T>(
    iterable: Iterable<T>,
    lazyConstructor: LazyConstructor,
  ): Lazy<T>;
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

  // NOTE: ensure the JS doc comments match the ones exactly above
  /**
   * Takes in an iterable and returns an iterable generator that yields the
   * accepted elements of the given callback function.
   */
  filter<R extends T>(accept: (t: T) => t is R): Lazy<R>;
  filter(accept: (t: T) => unknown): Lazy<T>;

  /**
   * Takes in an iterable and returns an iterable generator that yields the
   * result of the callback function on each item from the input iterable.
   */
  map<R>(mapper: (t: T) => R): Lazy<R>;

  flat<TDepth extends number = 1>(
    depth?: TDepth,
  ): Lazy<FlatIterable<T, TDepth>>;

  flatMap<R>(mapper: (value: T) => R | Iterable<R>): Lazy<R>;

  /**
   * Yields the first `n` items of the given iterable and stops further
   * iteration.
   *
   * ```js
   * const result = Lazy.from([1, 2, 3, 4, 5]).take(3).to(Array);
   *
   * console.log(result); // [1, 2, 3]
   * ```
   */
  take(n: number): Lazy<T>;

  /**
   * Yields while the callback function accepts the current item from the given
   * iterable. Iteration finishes as soon as an item is rejected by the
   * callback.
   *
   * ```js
   * const result = Lazy.from([1, 2, 3, 4, 5, 0, 1])
   *   .takeWhile((n) => n <= 2)
   *   .to(Array);
   *
   * console.log(result); // [1, 2]
   * ```
   */
  takeWhile<R extends T>(accept: (t: T) => t is R): Lazy<R>;
  takeWhile(accept: (t: T) => unknown): Lazy<T>;

  /**
   * Skips over the first `n` items of the given iterable then yields the rest.
   *
   * ```js
   * const result = Lazy.from([1, 2, 3, 4, 5]).skip(2).to(Array);
   *
   * console.log(result); // [3, 4, 5]
   * ```
   */
  skip(n: number): Lazy<T>;

  /**
   * Skips over the items while the given callback accepts the current item from
   * the given iterable, then yields the rest.
   *
   * ```js
   * const result = Lazy.from([1, 2, 3, 4, 5, 0, 1])
   *   .skipWhile((n) => n <= 2)
   *   .to(Array)
   *
   * console.log(result); // [3, 4, 5, 0, 1]
   * ```
   */
  skipWhile(accept: (t: T) => unknown): Lazy<T>;

  /**
   * Determines whether an iterable includes a certain value using `===`
   * comparison. Short-circuits iteration once the value is found.
   */
  includes(t: T): boolean;

  /**
   * Returns the first item of an iterable or `undefined` if the iterable is
   * done/exhausted.
   */
  first(): T | undefined;

  /**
   * Returns the first item accepted by the given callback. Short-circuits
   * iteration once an item is found.
   */
  find<R extends T>(accept: (t: T) => t is R): R | undefined;
  find(accept: (t: T) => unknown): T | undefined;

  /**
   * Returns `true` if at least one item accepted by the given callback.
   * Short-circuits iteration once an item is accepted.
   */
  some(accept: (t: T) => unknown): boolean;

  /**
   * Returns `true` only if all items are accepted by the given callback.
   * Short-circuits iteration once an item is rejected.
   */
  every(accept: (t: T) => unknown): boolean;

  /**
   * Writes the iterable into another data structure. Accepts an object with
   * a `from` method that accepts an iterable (e.g. `Array.from`) or a
   * constructor that accepts an iterable.
   *
   * The implementation is as follows:
   *
   * ```js
   * function to(iterable, constructorOrFromable) {
   *   if (typeof constructorOrFromable.from === 'function') {
   *     return constructorOrFromable.from(iterable);
   *   }
   *   return new constructorOrFromable(iterable);
   * }
   * ```
   */
  to(setConstructor: SetConstructor): Set<T>;
  to(
    mapConstructor: MapConstructor,
  ): Map<FirstTupleItem<T>, SecondTupleItem<T>>;
  to(lazyConstructor: LazyConstructor): Lazy<T>;
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
