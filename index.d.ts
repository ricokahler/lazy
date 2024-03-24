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
    : TIterable extends AsyncIterable<infer InnerItr>
      ? FlatIterable<
          InnerItr,
          // prettier-ignore
          [-1,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20][TDepth]
        >
      : TIterable;
}[TDepth extends -1 ? 'done' : 'recur'];

interface AsyncLazy<T> extends Lazy<T>, AsyncIterable<T> {
  iterable: undefined;
  asyncIterable: AsyncIterable<T>;
}

interface SyncLazy<T> extends Lazy<T>, Iterable<T> {
  iterable: Iterable<T>;
  asyncIterable: undefined;
}

type InferLazyKind<TClass extends Lazy<any>, TValue> =
  TClass extends AsyncLazy<any>
    ? AsyncLazy<Awaited<TValue>>
    : TClass extends SyncLazy<TValue>
      ? SyncLazy<TValue>
      : Lazy<TValue>;

type ConditionalPromise<TClass extends Lazy<any>, TValue> =
  TClass extends AsyncLazy<any> ? Promise<TValue> : TValue;

/**
 * A small, _useful_ set of methods for lazy iteration of iterables
 */
declare class Lazy<T> {
  public iterable?: Iterable<T>;
  public asyncIterable?: AsyncIterable<T>;

  /**
   * Takes in any iterable and returns it wrapped in a `Lazy` with chainable
   * `Lazy` methods
   */
  static from<T>(iterable: Iterable<T>): SyncLazy<T>;
  static from<T>(asyncIterable: AsyncIterable<T>): AsyncLazy<T>;

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
  static filter<T, R extends T>(
    asyncIterable: AsyncIterable<T>,
    accept: (t: T) => t is R,
  ): AsyncIterable<R>;
  static filter<T>(
    asyncIterable: AsyncIterable<T>,
    accept: (t: T) => unknown,
  ): AsyncIterable<T>;

  /**
   * Takes in an iterable and returns an iterable generator that yields the
   * result of the callback function on each item from the input iterable.
   */
  static map<T, R>(iterable: Iterable<T>, mapper: (t: T) => R): Iterable<R>;
  static map<T, R>(
    asyncIterable: AsyncIterable<T>,
    mapper: (t: T) => R,
  ): AsyncIterable<R>;

  /**
   * Takes in an iterable, a reducer, and an initial accumulator value and
   * returns another iterable that yields every intermediate accumulator created
   * in the reducer for each item in the input iterable.
   *
   * Useful for encapsulating state over time.
   *
   * **Note:** the initial accumulator value is required.
   */
  static scan<T, TAccumulator>(
    iterable: Iterable<T>,
    reducer: (acc: TAccumulator, item: T) => TAccumulator,
    initialAccumulator: TAccumulator,
  ): Iterable<TAccumulator>;
  static scan<T, TAccumulator>(
    asyncIterable: AsyncIterable<T>,
    reducer: (acc: TAccumulator, item: T) => TAccumulator,
    initialAccumulator: TAccumulator,
  ): AsyncIterable<TAccumulator>;

  /**
   * Returns a new iterable with all sub-iterable items yielded into it
   * recursively up to the specified depth.
   */
  static flat<T, TDepth extends number = 1>(
    iterable: T,
    depth?: TDepth,
  ): FlatIterable<T, TDepth>;

  /**
   * Calls the result of the given callback function on each item of the parent
   * iterable. Then, yields the result of each into a flatted iterable. This is
   * identical to a map followed by flat with depth 1.
   */
  static flatMap<T, R>(
    iterable: T,
    mapper: (value: T) => R | Iterable<R>,
  ): Iterable<R>;
  static flatMap<T, R>(
    asyncIterable: T,
    mapper: (value: T) => R | AsyncIterable<R>,
  ): AsyncIterable<R>;

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
  static take<T>(asyncIterable: AsyncIterable<T>, n: number): AsyncIterable<T>;

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
  static takeWhile<T, R extends T>(
    asyncIterable: AsyncIterable<T>,
    accept: (t: T) => t is R,
  ): AsyncIterable<R>;
  static takeWhile<T>(
    asyncIterable: AsyncIterable<T>,
    accept: (t: T) => unknown,
  ): AsyncIterable<T>;

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
  static skip<T>(iterable: AsyncIterable<T>, n: number): AsyncIterable<T>;

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
  static skipWhile<T>(
    iterable: AsyncIterable<T>,
    accept: (t: T) => unknown,
  ): AsyncIterable<T>;

  /**
   * Determines whether an iterable includes a certain value using `===`
   * comparison. Short-circuits iteration once the value is found.
   */
  static includes<T>(iterable: Iterable<T>, value: T): boolean;
  static includes<T>(iterable: AsyncIterable<T>, value: T): Promise<boolean>;

  /**
   * Returns the first item of an iterable or `undefined` if the iterable is
   * done/exhausted.
   */
  static first<T>(iterable: Iterable<T>): T | undefined;
  static first<T>(iterable: AsyncIterable<T>): Promise<T | undefined>;

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
  static find<T, R extends T>(
    iterable: AsyncIterable<T>,
    accept: (t: T) => t is R,
  ): Promise<R | undefined>;
  static find<T>(
    iterable: AsyncIterable<T>,
    accept: (t: T) => unknown,
  ): Promise<T | undefined>;

  /**
   * Returns `true` if at least one item accepted by the given callback.
   * Short-circuits iteration once an item is accepted.
   */
  static some<T>(iterable: Iterable<T>, accept: (t: T) => unknown): boolean;
  static some<T>(
    iterable: AsyncIterable<T>,
    accept: (t: T) => unknown,
  ): Promise<boolean>;

  /**
   * Returns `true` only if all items are accepted by the given callback.
   * Short-circuits iteration once an item is rejected.
   */
  static every<T>(iterable: Iterable<T>, accept: (t: T) => unknown): boolean;
  static every<T>(
    iterable: AsyncIterable<T>,
    accept: (t: T) => unknown,
  ): Promise<boolean>;

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
   *
   * Note: if used with an async iterable, it will await and buffer all items
   * into an array first.
   */

  // SETS
  // prettier-ignore
  static to<T>(iterable: Iterable<T>, setConstructor: SetConstructor): Set<T>;
  // prettier-ignore
  static to<T>(iterable: AsyncIterable<T>, setConstructor: SetConstructor): Promise<Set<T>>;

  // MAPS
  // prettier-ignore
  static to<T>(iterable: Iterable<T>, mapConstructor: MapConstructor): Map<FirstTupleItem<T>, SecondTupleItem<T>>;
  // prettier-ignore
  static to<T>(iterable: AsyncIterable<T>, mapConstructor: MapConstructor): Promise<Map<FirstTupleItem<T>, SecondTupleItem<T>>>;

  // ARRAYS
  // prettier-ignore
  static to<T>(iterable: Iterable<T>, arrayConstructor: ArrayConstructor): T[];
  // prettier-ignore
  static to<T>(iterable: AsyncIterable<T>, arrayConstructor: ArrayConstructor): Promise<T[]>;

  // LAZY
  // prettier-ignore
  static to<T>(iterable: Iterable<T>, lazyConstructor: LazyConstructor): Lazy<T>;
  // prettier-ignore
  static to<T>(iterable: AsyncIterable<T>, lazyConstructor: LazyConstructor): Promise<Lazy<T>>;

  // TODO: these overloads don't generically initialize a parameterized instance
  // STATIC FROM
  // prettier-ignore
  static to<T, TStaticFrom extends StaticFrom>(iterable: Iterable<T>, staticFrom: TStaticFrom): TStaticFrom extends StaticFrom<infer TInstance> ? TInstance : never;
  // prettier-ignore
  static to<T, TStaticFrom extends StaticFrom>(iterable: AsyncIterable<T>, staticFrom: TStaticFrom): TStaticFrom extends StaticFrom<infer TInstance> ? Promise<TInstance> : never;

  // CONSTRUCTOR
  // prettier-ignore
  static to<T, TConstructor extends IterableArgumentConstructor>(iterable: Iterable<T>, constructor: TConstructor): TConstructor extends IterableArgumentConstructor<infer TInstance> ? TInstance : never;
  // prettier-ignore
  static to<T, TConstructor extends IterableArgumentConstructor>(iterable: AsyncIterable<T>, constructor: TConstructor): TConstructor extends IterableArgumentConstructor<infer TInstance> ? Promise<TInstance> : never;

  // NOTE: ensure the JS doc comments match the ones exactly above
  /**
   * Takes in an iterable and returns an iterable generator that yields the
   * accepted elements of the given callback function.
   */
  filter<R extends T>(accept: (t: T) => t is R): InferLazyKind<this, R>;
  filter(accept: (t: T) => unknown): InferLazyKind<this, T>;

  /**
   * Takes in an iterable and returns an iterable generator that yields the
   * result of the callback function on each item from the input iterable.
   */
  map<R>(mapper: (t: T) => R): InferLazyKind<this, R>;

  /**
   * Takes in an iterable, a reducer, and an initial accumulator value and
   * returns another iterable that yields every intermediate accumulator created
   * in the reducer for each item in the input iterable.
   *
   * Useful for encapsulating state over time.
   *
   * **Note:** the initial accumulator value is required.
   */
  scan<TAccumulator>(
    reducer: (acc: TAccumulator, t: T) => TAccumulator,
    initialAccumulator: TAccumulator,
  ): InferLazyKind<this, TAccumulator>;

  /**
   * Returns a new iterable with all sub-iterable items yielded into it
   * recursively up to the specified depth.
   */
  flat<TDepth extends number = 1>(
    depth?: TDepth,
  ): InferLazyKind<this, FlatIterable<T, TDepth>>;

  /**
   * Calls the result of the given callback function on each item of the parent
   * iterable. Then, yields the result of each into a flatted iterable. This is
   * identical to a map followed by flat with depth 1.
   */
  flatMap<R>(mapper: (value: T) => R | Iterable<R>): InferLazyKind<this, R>;

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
  take(n: number): InferLazyKind<this, T>;

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
  takeWhile<R extends T>(accept: (t: T) => t is R): InferLazyKind<this, R>;
  takeWhile(accept: (t: T) => unknown): InferLazyKind<this, T>;

  /**
   * Skips over the first `n` items of the given iterable then yields the rest.
   *
   * ```js
   * const result = Lazy.from([1, 2, 3, 4, 5]).skip(2).to(Array);
   *
   * console.log(result); // [3, 4, 5]
   * ```
   */
  skip(n: number): InferLazyKind<this, T>;

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
  skipWhile(accept: (t: T) => unknown): InferLazyKind<this, T>;

  /**
   * Determines whether an iterable includes a certain value using `===`
   * comparison. Short-circuits iteration once the value is found.
   */
  includes(t: T): ConditionalPromise<this, boolean>;

  /**
   * Returns the first item of an iterable or `undefined` if the iterable is
   * done/exhausted.
   */
  first(): ConditionalPromise<this, T | undefined>;

  /**
   * Returns the first item accepted by the given callback. Short-circuits
   * iteration once an item is found.
   */
  find<R extends T>(
    accept: (t: T) => t is R,
  ): ConditionalPromise<this, R | undefined>;
  find(accept: (t: T) => unknown): ConditionalPromise<this, T | undefined>;

  /**
   * Returns `true` if at least one item accepted by the given callback.
   * Short-circuits iteration once an item is accepted.
   */
  some(accept: (t: T) => unknown): ConditionalPromise<this, boolean>;

  /**
   * Returns `true` only if all items are accepted by the given callback.
   * Short-circuits iteration once an item is rejected.
   */
  every(accept: (t: T) => unknown): ConditionalPromise<this, boolean>;

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
   *
   * Note: if used with an async iterable, it will await and buffer all items
   * into an array first.
   */
  // prettier-ignore
  to(setConstructor: SetConstructor): ConditionalPromise<this, Set<T>>;
  // prettier-ignore
  to(mapConstructor: MapConstructor): ConditionalPromise<this, Map<FirstTupleItem<T>, SecondTupleItem<T>>>;
  // prettier-ignore
  to(lazyConstructor: LazyConstructor): ConditionalPromise<this, Lazy<T>>;
  // prettier-ignore
  to(arrayConstructor: ArrayConstructor): ConditionalPromise<this, T[]>;
  // TODO: these overloads don't generically initialize a parameterized instance
  // prettier-ignore
  to<TStaticFrom extends StaticFrom>(staticFrom: TStaticFrom): TStaticFrom extends StaticFrom<infer TInstance> ? ConditionalPromise<this, TInstance> : never;
  // prettier-ignore
  to<TConstructor extends IterableArgumentConstructor>(constructor: TConstructor): TConstructor extends IterableArgumentConstructor<infer TInstance> ? ConditionalPromise<this, TInstance> : never;
}

export = Lazy;
