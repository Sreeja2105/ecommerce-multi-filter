const test = require('node:test');
const assert = require('node:assert');
const { filterProducts, sortProducts, queryProducts } = require('../src/services/filter.service');
const { validateProductQuery } = require('../src/validators/query.validator');

const DATA = [
  { id: 1, name: 'A', category: 'Electronics', price: 1000, rating: 4.5 },
  { id: 2, name: 'B', category: 'Apparel', price: 500, rating: 3.2 },
  { id: 3, name: 'C', category: 'Footwear', price: 2500, rating: 4.9 },
  { id: 4, name: 'D', category: 'Electronics', price: 300, rating: 2.1 },
];

test('no filters returns full inventory', () => {
  assert.strictEqual(filterProducts(DATA, {}).length, 4);
  assert.strictEqual(filterProducts(DATA, null).length, 4);
  assert.strictEqual(filterProducts(DATA, { categories: [] }).length, 4);
});

test('category filter (OR within categories)', () => {
  const r = filterProducts(DATA, { categories: ['Electronics', 'Footwear'] });
  assert.deepStrictEqual(r.map((p) => p.id), [1, 3, 4]);
});

test('price range is inclusive', () => {
  const r = filterProducts(DATA, { minPrice: 500, maxPrice: 1000 });
  assert.deepStrictEqual(r.map((p) => p.id), [1, 2]);
});

test('minimum rating is "meets or exceeds"', () => {
  const r = filterProducts(DATA, { minRating: 4 });
  assert.deepStrictEqual(r.map((p) => p.id), [1, 3]);
});

test('all filters intersect (AND)', () => {
  const r = filterProducts(DATA, { categories: ['Electronics'], minPrice: 200, maxPrice: 2000, minRating: 4 });
  assert.deepStrictEqual(r.map((p) => p.id), [1]);
});

test('zero matches returns empty array', () => {
  assert.strictEqual(filterProducts(DATA, { minRating: 5 }).length, 0);
});

test('sorting does not mutate input and orders correctly', () => {
  const copy = DATA.slice();
  assert.deepStrictEqual(sortProducts(DATA, 'price-asc').map((p) => p.id), [4, 2, 1, 3]);
  assert.deepStrictEqual(sortProducts(DATA, 'rating-desc').map((p) => p.id), [3, 1, 2, 4]);
  assert.deepStrictEqual(DATA, copy);
});

test('pipeline filters first, then sorts', () => {
  const r = queryProducts(DATA, { categories: ['Electronics'] }, 'price-asc');
  assert.deepStrictEqual(r.items.map((p) => p.id), [4, 1]);
  assert.strictEqual(r.count, 2);
  assert.strictEqual(r.total, 4);
});

test('validator rejects bad input and swaps crossed prices', () => {
  const allowed = ['Electronics', 'Apparel'];
  assert.throws(() => validateProductQuery({ minRating: '9' }, allowed));
  assert.throws(() => validateProductQuery({ categories: 'Toys' }, allowed));
  assert.throws(() => validateProductQuery({ sort: 'random' }, allowed));
  assert.throws(() => validateProductQuery({ minPrice: 'abc' }, allowed));
  const { criteria } = validateProductQuery({ minPrice: '900', maxPrice: '100' }, allowed);
  assert.strictEqual(criteria.minPrice, 100);
  assert.strictEqual(criteria.maxPrice, 900);
  const empty = validateProductQuery({}, allowed);
  assert.deepStrictEqual(empty.criteria, { categories: null, minPrice: null, maxPrice: null, minRating: null });
});
