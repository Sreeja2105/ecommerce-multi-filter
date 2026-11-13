/**
 * Validates and normalises raw query-string params into a clean criteria object.
 * Empty / missing params become null (=> filter is bypassed).
 */
const { SORT_OPTIONS } = require('../services/filter.service');

class ValidationError extends Error {
  constructor(details) {
    super('Invalid query parameters');
    this.status = 400;
    this.details = details;
  }
}

function parseNumber(raw, field, errors) {
  if (raw === undefined || raw === null || String(raw).trim() === '') return null;
  const value = Number(raw);
  if (!Number.isFinite(value)) {
    errors.push(`${field} must be a number`);
    return null;
  }
  if (value < 0) {
    errors.push(`${field} cannot be negative`);
    return null;
  }
  return value;
}

function parseCategories(raw, allowed, errors) {
  if (raw === undefined || raw === null || raw === '') return null;
  const list = (Array.isArray(raw) ? raw : String(raw).split(','))
    .map((c) => c.trim())
    .filter(Boolean);
  if (list.length === 0) return null;

  const unknown = list.filter((c) => !allowed.includes(c));
  if (unknown.length) errors.push(`Unknown category: ${unknown.join(', ')}`);
  return [...new Set(list)];
}

function validateProductQuery(query, allowedCategories) {
  const errors = [];

  const categories = parseCategories(query.categories, allowedCategories, errors);
  let minPrice = parseNumber(query.minPrice, 'minPrice', errors);
  let maxPrice = parseNumber(query.maxPrice, 'maxPrice', errors);
  const minRating = parseNumber(query.minRating, 'minRating', errors);

  if (minRating !== null && (minRating < 1 || minRating > 5)) {
    errors.push('minRating must be between 1 and 5');
  }
  // If the slider handles cross, swap them instead of failing
  if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
    [minPrice, maxPrice] = [maxPrice, minPrice];
  }

  const sort = query.sort ? String(query.sort) : 'relevance';
  if (!Object.prototype.hasOwnProperty.call(SORT_OPTIONS, sort)) {
    errors.push(`sort must be one of: ${Object.keys(SORT_OPTIONS).join(', ')}`);
  }

  if (errors.length) throw new ValidationError(errors);

  return { criteria: { categories, minPrice, maxPrice, minRating }, sort };
}

module.exports = { validateProductQuery, ValidationError };
