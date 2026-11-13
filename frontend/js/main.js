// Controller: wires user interactions -> state -> API -> render.
import { fetchMeta, fetchProducts } from './api.js';
import { createStore } from './state.js';
import * as ui from './ui.js';

const $ = (id) => document.getElementById(id);
let meta = null;
let inFlight = null; // AbortController for the latest request
let debounceTimer = null;

// Every state change triggers a fresh server query (no Submit button).
const store = createStore((state) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => loadProducts(state), 120);
});

async function loadProducts(state) {
  if (inFlight) inFlight.abort(); // drop stale responses (race-condition safe)
  inFlight = new AbortController();
  ui.setLoading(true);
  try {
    const data = await fetchProducts(state, inFlight.signal);
    ui.renderProducts(data);
  } catch (err) {
    if (err.name !== 'AbortError') ui.renderError(err.message);
  } finally {
    ui.setLoading(false);
  }
}

function bindEvents() {
  // Category checklist
  $('category-list').addEventListener('change', () => {
    const categories = [...document.querySelectorAll('input[name="category"]:checked')].map((c) => c.value);
    store.update({ categories });
  });

  // Dual price slider
  const minEl = $('price-min');
  const maxEl = $('price-max');
  const onSlide = (e) => {
    let lo = Number(minEl.value);
    let hi = Number(maxEl.value);
    // keep handles from crossing
    if (lo > hi) {
      if (e.target === minEl) { lo = hi; minEl.value = lo; } else { hi = lo; maxEl.value = hi; }
    }
    ui.updatePriceLabels(lo, hi, meta.price.min, meta.price.max);
    // full range = no price filter (graceful null)
    store.update({
      minPrice: lo === meta.price.min ? null : lo,
      maxPrice: hi === meta.price.max ? null : hi,
    });
  };
  minEl.addEventListener('input', onSlide);
  maxEl.addEventListener('input', onSlide);

  // Rating radios
  $('rating-list').addEventListener('change', (e) => {
    if (e.target.name === 'rating') {
      store.update({ minRating: e.target.value === '' ? null : Number(e.target.value) });
    }
  });

  // Sort dropdown
  $('sort-select').addEventListener('change', (e) => store.update({ sort: e.target.value }));

  // Reset buttons
  $('reset-btn').addEventListener('click', resetFilters);
  $('clear-btn').addEventListener('click', resetFilters);
}

function resetFilters() {
  document.querySelectorAll('input[name="category"]').forEach((c) => { c.checked = false; });
  document.querySelector('input[name="rating"][value=""]').checked = true;
  $('sort-select').value = 'relevance';
  ui.setupPriceSlider(meta.price);
  store.reset();
}

async function init() {
  try {
    meta = await fetchMeta();
    ui.renderCategories(meta.categories);
    ui.renderRatings(meta.ratings);
    ui.renderSortOptions(meta.sortOptions);
    ui.setupPriceSlider(meta.price);
    bindEvents();
    loadProducts(store.get());
  } catch (err) {
    ui.renderError(err.message);
  }
}

init();
