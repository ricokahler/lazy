import Lazy from './index';

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
  it.todo('general lazy-like tests');
  it.todo('binds methods to the `this` instance');
  it.todo('regenerator runtime');
});

describe('take', () => {
  it('pulls the first `n` elements from the given iterable', () => {
    expect(Lazy.from([1, 2, 3, 4, 5]).take(3).to(Array)).toEqual([1, 2, 3]);
  });
  it.todo('bounds test');
});

describe('skip', () => {
  it('yields the given iterable after skipping the first `n` items', () => {
    expect(Lazy.from([1, 2, 3, 4, 5]).skip(2).to(Array)).toEqual([3, 4, 5]);
  });
  it.todo('bounds test');
});

describe('skipWhile', () => {
  it('yields the given iterable after skipping the items the predicate accepts', () => {
    expect(
      Lazy.from([1, 2, 3, 4, 5, 0, 1])
        .skipWhile((n) => n <= 2)
        .to(Array),
    ).toEqual([3, 4, 5, 0, 1]);
  });
  it.todo('bounds test');
  it.todo('edge test');
});

describe('takeWhile', () => {
  it('yields the given iterable until the predicate no longer accepts an item', () => {
    expect(
      Lazy.from([1, 2, 3, 4, 5, 0, 1])
        .takeWhile((n) => n <= 2)
        .to(Array),
    ).toEqual([1, 2]);
  });
  it.todo('bounds test');
  it.todo('edge test');
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

describe('first', () => {
  it('returns the first yielded item', () => {
    expect(Lazy.from([1, 2, 3]).first()).toBe(1);
  });

  it.todo('returns undefined if the iterator is done');
  it.todo('lazy pull test');
});

describe('find', () => {
  it('returns the first item the predicate accepts', () => {
    expect(Lazy.from([1, 2, 3]).find((n) => n >= 2)).toEqual(2);
  });

  it.todo('returns undefined if no item is accepted by the predicate');
  it.todo('lazy pull test');
});

describe('includes', () => {
  it.todo('returns true if the given value `===` any item');
  it.todo('returns false if the given value never `===` an item');
  it.todo('short circuit test');
});

describe('some', () => {
  it.todo('returns true if any item is accepted by the predicate');
  it.todo('returns false if no items are accepted by the predicate');
  it.todo('short circuit test');
});

describe('every', () => {
  it.todo('returns true if all items are accepted by the predicate');
  it.todo('returns false if any item is rejected by the predicate');
  it.todo('short circuit test');
});

describe('to', () => {
  it.todo("if present, passes the iterable through object's `from` method");
  it.todo(
    'otherwise, constructs an instance passing the iterable as the argument',
  );
  it.todo('works with Map entries?'); // this is a TODO to think about this item
});
