/**
 * Core business logic: Filter -> Sort pipeline.
 *
 * Step 1 (filter): one pass over the master inventory. A product is kept only
 *                  if it satisfies ALL active criteria (intersection / AND).
 * Step 2 (sort):   the filtered result is copied and ordered by the sort key.
 *
 * Null handling: any criterion that is null / empty is skipped, so with no
 * filters the full base inventory is returned unchanged.
 */

const SORT_OPTIONS = Object.freeze({
  relevance: null, // keep original inventory order
  'price-asc': (a, b) => a.price - b.price || a.id - b.id,
  'price-desc': (a, b) => b.price - a.price || a.id - b.id,
  'rating-desc': (a, b) => b.rating - a.rating || a.price - b.price,
  'name-asc': (a, b) => a.name.localeCompare(b.name),
});

/**
 * @param {Array}  inventory  master product list
 * @param {Object} criteria   { categories: string[]|null, minPrice: number|null,
 *                              maxPrice: number|null, minRating: number|null }
 * @returns {Array} products matching every active criterion
 */
function filterProducts(inventory, criteria = {}) {
  const { categories = null, minPrice = null, maxPrice = null, minRating = null } = criteria || {};

  const hasCategory = Array.isArray(categories) && categories.length > 0;
  const hasMin = typeof minPrice === 'number' && Number.isFinite(minPrice);
  const hasMax = typeof maxPrice === 'number' && Number.isFinite(maxPrice);
  const hasRating = typeof minRating === 'number' && Number.isFinite(minRating);

  // Graceful null handling: nothing selected -> return the full base set
  if (!hasCategory && !hasMin && !hasMax && !hasRating) {
    return inventory.slice();
  }

  const categorySet = hasCategory ? new Set(categories) : null;
  const result = [];

  for (const product of inventory) {
    if (hasCategory && !categorySet.has(product.category)) continue;
    if (hasMin && product.price < minPrice) continue;
    if (hasMax && product.price > maxPrice) continue;
    if (hasRating && product.rating < minRating) continue;
    result.push(product);
  }
  return result;
}

/**
 * Sorts a COPY of the list (never mutates the input / master data).
 */
function sortProducts(products, sortKey = 'relevance') {
  const comparator = SORT_OPTIONS[sortKey];
  if (!comparator) return products.slice();
  return products.slice().sort(comparator);
}

/**
 * Full pipeline: filter the original dataset first, then sort what remains.
 */
function queryProducts(inventory, criteria = {}, sortKey = 'relevance') {
  const filtered = filterProducts(inventory, criteria);
  const items = sortProducts(filtered, sortKey);
  return { total: inventory.length, count: items.length, items };
}

/**
 * Metadata the UI needs to build the sidebar (computed on the server).
 */
function getFilterMeta(inventory, categories) {
  const prices = inventory.map((p) => p.price);
  return {
    categories: categories.map((name) => ({
      name,
      count: inventory.filter((p) => p.category === name).length,
    })),
    price: { min: Math.min(...prices), max: Math.max(...prices) },
    ratings: [1, 2, 3, 4, 5],
    sortOptions: [
      { value: 'relevance', label: 'Relevance' },
      { value: 'price-asc', label: 'Price: Low to High' },
      { value: 'price-desc', label: 'Price: High to Low' },
      { value: 'rating-desc', label: 'Top Rated First' },
      { value: 'name-asc', label: 'Name: A to Z' },
    ],
  };
}

module.exports = { filterProducts, sortProducts, queryProducts, getFilterMeta, SORT_OPTIONS };
