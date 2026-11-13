const { PRODUCTS, CATEGORIES } = require('../data/products');
const { queryProducts, getFilterMeta } = require('../services/filter.service');
const { validateProductQuery } = require('../validators/query.validator');

// GET /api/products?categories=A,B&minPrice=0&maxPrice=5000&minRating=4&sort=price-asc
function listProducts(req, res, next) {
  try {
    const { criteria, sort } = validateProductQuery(req.query, CATEGORIES);
    const result = queryProducts(PRODUCTS, criteria, sort);
    res.json({ ...result, applied: { ...criteria, sort } });
  } catch (err) {
    next(err);
  }
}

// GET /api/products/meta  -> data needed to render the sidebar
function getMeta(req, res) {
  res.json(getFilterMeta(PRODUCTS, CATEGORIES));
}

module.exports = { listProducts, getMeta };
