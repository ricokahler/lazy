import Lazy from './index';

describe('Lazy', () => {
  it('has static methods and instance methods variants', () => {
    const methods = [
      'every',
      'filter',
      'find',
      'first',
      'flat',
      'flatMap',
      'includes',
      'map',
      'skip',
      'skipWhile',
      'some',
      'take',
      'takeWhile',
      'to',
    ];

    expect(methods.every((method) => typeof Lazy[method] === 'function')).toBe(
      true,
    );

    expect(
      methods.every((method) => typeof Lazy.prototype[method] === 'function'),
    ).toBe(true);
  });

  it('binds methods to the `this` instance', () => {
    const lazy = Lazy.from([1, 2, 3]);

    const lazyMap = lazy.map;
    const lazyTo = lazyMap((x) => x + 1).to;
    expect(lazyTo(Array)).toEqual([2, 3, 4]);
  });
});

describe('Lazy.from', () => {
  it('takes in iterables and returns a wrapper with chainable methods', () => {
    const getter1 = jest.fn(() => 1);
    const getter2 = jest.fn(() => 2);
    const getter3 = jest.fn(() => 3);
    const getter4 = jest.fn(() => 4);
    const getter5 = jest.fn(() => 5);

    expect(
      Lazy.from([getter1, getter2, getter3, getter4, getter5])
        .filter((getter) => getter() >= 3)
        .first()?.(),
    ).toBe(3);

    expect(getter1).toHaveBeenCalled();
    expect(getter2).toHaveBeenCalled();
    expect(getter3).toHaveBeenCalled();
    expect(getter4).not.toHaveBeenCalled();
    expect(getter5).not.toHaveBeenCalled();
  });

  it('defaults an empty array for the iterable if nothing is provided', () => {
    const lazy = new Lazy();

    expect(lazy.iterable).toEqual([]);
  });
});

describe('take', () => {
  it('pulls the first `n` elements from the given iterable', () => {
    expect(Lazy.from([1, 2, 3, 4, 5]).take(3).to(Array)).toEqual([1, 2, 3]);
  });

  it('finishes iteration if the parent iterable has no more items left', () => {
    expect(Lazy.from([1, 2, 3]).take(5).to(Array)).toEqual([1, 2, 3]);
  });
});

describe('skip', () => {
  it('yields the given iterable after skipping the first `n` items', () => {
    expect(Lazy.from([1, 2, 3, 4, 5]).skip(2).to(Array)).toEqual([3, 4, 5]);
  });

  it('finishes iteration if the parent iterable has no more items left', () => {
    expect(Lazy.from([1, 2, 3]).skip(5).to(Array)).toEqual([]);
  });
});

describe('skipWhile', () => {
  it('yields the given iterable after skipping the items the predicate accepts', () => {
    expect(
      Lazy.from([1, 2, 3, 4, 5, 0, 1])
        .skipWhile((n) => n <= 2)
        .to(Array),
    ).toEqual([3, 4, 5, 0, 1]);
  });

  it('finishes iteration if the parent iterable has no more items left', () => {
    expect(
      Lazy.from([1, 2, 3])
        .skipWhile((n) => n <= 5)
        .to(Array),
    ).toEqual([]);
  });
});

describe('takeWhile', () => {
  it('yields the given iterable until the predicate no longer accepts an item', () => {
    expect(
      Lazy.from([1, 2, 3, 4, 5, 0, 1])
        .takeWhile((n) => n <= 2)
        .to(Array),
    ).toEqual([1, 2]);
  });

  it('finishes iteration if the parent iterable has no more items left', () => {
    expect(
      Lazy.from([1, 2, 3])
        .takeWhile((n) => n <= 5)
        .to(Array),
    ).toEqual([1, 2, 3]);
  });
});

describe('map', () => {
  it('yields the result of the functor over each item', () => {
    expect(
      Lazy.from([1, 2, 3])
        .map((n) => n + 1)
        .to(Array),
    ).toEqual([2, 3, 4]);
  });
});

describe('flat', () => {
  it('yields the inner subitems of nested iterables, flattening the iterable', () => {
    expect(
      Lazy.from([[1], 2, [[3]]])
        .flat(2)
        .map((n) => n + 1)
        .to(Array),
    ).toEqual([2, 3, 4]);
  });
});

describe('flatMap', () => {
  it('is convenience for flat(map(iterable, mapper))', () => {
    function* range(n: number) {
      for (let i = 0; i < n; i++) {
        yield i;
      }
    }

    expect(
      Lazy.from([1, 2, 3])
        .flatMap((n) => range(n))
        .map((i) => i + 1)
        .to(Array),
    ).toEqual([1, 1, 2, 1, 2, 3]);
  });
});

describe('first', () => {
  it('returns the first yielded item', () => {
    expect(Lazy.from([1, 2, 3]).first()).toBe(1);
  });

  it('returns undefined if the iterator is done', () => {
    expect(
      Lazy.from([1, 2, 3])
        .filter((n) => n > 5)
        .first(),
    ).toBe(undefined);
  });

  it('stops parent iteration', () => {
    const toNumber = jest.fn((s: string) => parseInt(s, 10));
    const greatThanOrEqualTo3 = jest.fn((n: number) => n >= 3);
    expect(
      Lazy.from(['1', '2', '3', '4', '5'])
        .map(toNumber)
        .filter(greatThanOrEqualTo3)
        .first(),
    ).toBe(3);

    // notice that eager evaluation would've made this have been called 5 times
    expect(toNumber).toHaveBeenCalledTimes(3);
    expect(greatThanOrEqualTo3).toHaveBeenCalledTimes(3);
  });
});

describe('find', () => {
  it('returns the first item the predicate accepts', () => {
    expect(Lazy.from([1, 2, 3]).find((n) => n >= 2)).toEqual(2);
  });

  it('returns undefined if no item is accepted by the predicate', () => {
    expect(Lazy.from([1, 2, 3]).find((n) => n >= 5)).toEqual(undefined);
  });

  it('stops parent iteration when the predicate accepts the first value', () => {
    const toValueWrapper = jest.fn((n: number) => ({ value: n }));
    const valueGreaterThanOrEqualTo2 = jest.fn((obj) => obj.value >= 2);

    expect(
      Lazy.from([1, 2, 3, 4, 5])
        .map(toValueWrapper)
        .find(valueGreaterThanOrEqualTo2),
    ).toEqual({ value: 2 });

    // notice that eager evaluation would've made this have been called 5 times
    expect(toValueWrapper).toHaveBeenCalledTimes(2);
    expect(valueGreaterThanOrEqualTo2).toHaveBeenCalledTimes(2);
  });
});

describe('includes', () => {
  it('returns true if the given value `===` any item', () => {
    expect(Lazy.from([1, 2, 3, 4, 5]).includes(3)).toBe(true);
  });

  it('returns false if the given value never `===` an item', () => {
    expect(
      Lazy.from([1, 2, 3, 4, 5])
        .map((n) => ({ value: n }))
        // should never return true since the instance values are never `===`
        .includes({ value: 3 }),
    ).toBe(false);
  });

  it('stops parent iteration when the first match is found', () => {
    const identity = jest.fn((n: number) => n);

    expect(Lazy.from([1, 2, 3, 4, 5]).map(identity).includes(3)).toBe(true);

    // notice that eager evaluation would've made this have been called 5 times
    expect(identity).toHaveBeenCalledTimes(3);
  });
});

describe('some', () => {
  it('returns true if any item is accepted by the predicate', () => {
    expect(Lazy.from([1, 2, 3, 4, 5]).some((n) => n >= 5)).toBe(true);
  });

  it('returns false if no items are accepted by the predicate', () => {
    expect(Lazy.from([1, 2, 3, 4, 5]).some((n) => n > 5)).toBe(false);
  });

  it('stops parent iteration when the first value is accepted', () => {
    const identity = jest.fn((n: number) => n);

    expect(
      Lazy.from([1, 2, 3, 4, 5])
        .map(identity)
        .some((n) => n >= 3),
    ).toBe(true);

    // notice that eager evaluation would've made this have been called 5 times
    expect(identity).toHaveBeenCalledTimes(3);
  });
});

describe('every', () => {
  it('returns true if all items are accepted by the predicate', () => {
    expect(Lazy.from([1, 2, 3, 4, 5]).every((n) => n <= 5)).toBe(true);
  });
  it('returns false if any item is rejected by the predicate', () => {
    expect(Lazy.from([1, 2, 3, 4, 5]).every((n) => n < 5)).toBe(false);
  });

  it('stops parent iteration when the first value is rejected', () => {
    const identity = jest.fn((n: number) => n);

    expect(
      Lazy.from([1, 2, 3, 4, 5])
        .map(identity)
        .every((n) => n < 3),
    ).toBe(false);

    // notice that eager evaluation would've made this have been called 5 times
    expect(identity).toHaveBeenCalledTimes(3);
  });
});

describe('to', () => {
  it("if present, passes the iterable through object's `from` method", () => {
    class ExampleFromable {
      static from = jest.fn(
        Array.from.bind(Array) as (
          iterable: Iterable<unknown>,
        ) => Array<unknown>,
      );

      constructor() {
        throw new Error("don't call this");
      }
    }

    expect(Lazy.from([1, 2, 3]).to(ExampleFromable)).toEqual([1, 2, 3]);
    expect(ExampleFromable.from).toHaveBeenCalled();
  });

  it('works with itself', () => {
    expect(Lazy.from([1, 2, 3]).to(Lazy).to(Array)).toEqual([1, 2, 3]);
  });

  it('otherwise, constructs an instance passing the iterable as the argument', () => {
    class ExampleConstructable {
      constructor(public iterable: Iterable<unknown>) {}

      toArray() {
        return Array.from(this.iterable);
      }
    }

    const exampleConstructable = Lazy.from([1, 2, 3]).to(ExampleConstructable);

    expect(exampleConstructable).toBeInstanceOf(ExampleConstructable);
    expect(exampleConstructable.toArray()).toEqual([1, 2, 3]);
  });
});
