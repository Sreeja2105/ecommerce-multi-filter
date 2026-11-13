// Presentation layer: rendering only, no business logic.

const $ = (id) => document.getElementById(id);
const formatPrice = (n) => n.toLocaleString('en-IN');

function stars(rating) {
  const full = Math.round(rating);
  return '★'.repeat(full) + '☆'.repeat(5 - full);
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

export function renderCategories(categories) {
  $('category-list').innerHTML = categories
    .map(
      (c) => `
      <label>
        <input type="checkbox" name="category" value="${escapeHtml(c.name)}" />
        ${escapeHtml(c.name)}
        <span class="count">${c.count}</span>
      </label>`
    )
    .join('');
}

export function renderRatings(ratings) {
  const options = [...ratings].reverse(); // 5★ first
  $('rating-list').innerHTML =
    `<label><input type="radio" name="rating" value="" checked /> Any rating</label>` +
    options
      .map(
        (r) => `
      <label>
        <input type="radio" name="rating" value="${r}" />
        <span class="stars">${stars(r)}</span> ${r === 5 ? '5 only' : `${r} &amp; up`}
      </label>`
      )
      .join('');
}

export function renderSortOptions(options) {
  $('sort-select').innerHTML = options
    .map((o) => `<option value="${o.value}">${escapeHtml(o.label)}</option>`)
    .join('');
}

export function setupPriceSlider({ min, max }) {
  for (const el of [$('price-min'), $('price-max')]) {
    el.min = min;
    el.max = max;
    el.step = 1;
  }
  $('price-min').value = min;
  $('price-max').value = max;
  updatePriceLabels(min, max, min, max);
}

export function updatePriceLabels(lo, hi, min, max) {
  $('price-min-label').textContent = formatPrice(lo);
  $('price-max-label').textContent = formatPrice(hi);
  const span = max - min || 1;
  const fill = $('range-fill');
  fill.style.left = `${((lo - min) / span) * 100}%`;
  fill.style.right = `${100 - ((hi - min) / span) * 100}%`;
}

export function renderProducts({ items, count, total }) {
  const grid = $('product-grid');
  const empty = $('empty-state');
  $('error-state').classList.add('hidden');
  $('result-count').textContent = `Showing ${count} of ${total} products`;

  if (count === 0) {
    grid.classList.add('hidden');
    empty.classList.remove('hidden');
    grid.innerHTML = '';
    return;
  }

  empty.classList.add('hidden');
  grid.classList.remove('hidden');
  grid.innerHTML = items
    .map(
      (p) => `
      <article class="card">
        <img src="${p.image}" alt="${escapeHtml(p.name)}" loading="lazy" />
        <div class="card-body">
          <span class="card-category">${escapeHtml(p.category)}</span>
          <h4 class="card-name">${escapeHtml(p.name)}</h4>
          <div class="card-rating">${stars(p.rating)}<span>${p.rating.toFixed(1)}</span></div>
          <div class="card-price">₹${formatPrice(p.price)}</div>
        </div>
      </article>`
    )
    .join('');
}

export function renderError(message) {
  $('product-grid').classList.add('hidden');
  $('empty-state').classList.add('hidden');
  $('error-state').classList.remove('hidden');
  $('error-msg').textContent = message;
}

export function setLoading(isLoading) {
  $('product-grid').classList.toggle('loading', isLoading);
}
