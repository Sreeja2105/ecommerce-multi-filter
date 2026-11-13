// API layer: the only place the frontend talks to the server.
const BASE = '/api/products';

export async function fetchMeta() {
  const res = await fetch(`${BASE}/meta`);
  if (!res.ok) throw new Error('Failed to load filter options');
  return res.json();
}

// Converts UI state into query params. All filtering/sorting happens on the server.
export async function fetchProducts(state, signal) {
  const params = new URLSearchParams();
  if (state.categories.length) params.set('categories', state.categories.join(','));
  if (state.minPrice !== null) params.set('minPrice', state.minPrice);
  if (state.maxPrice !== null) params.set('maxPrice', state.maxPrice);
  if (state.minRating !== null) params.set('minRating', state.minRating);
  if (state.sort) params.set('sort', state.sort);

  const res = await fetch(`${BASE}?${params.toString()}`, { signal });
  const body = await res.json();
  if (!res.ok) throw new Error((body.details || [body.error]).join('; '));
  return body;
}
