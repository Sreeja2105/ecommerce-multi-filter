# E-Commerce Product Multi-Filter Sidebar

A marketplace browsing interface with a sticky filter sidebar (category checklist, dual-point price slider, minimum star rating) and a product grid that updates instantly. A **Sort By** dropdown reorders the results.

**All filtering, sorting, validation and computation runs on the server.** The frontend only collects user input, calls the API and renders the response.

## Tech Stack
- **Backend:** Node.js, Express
- **Frontend:** HTML, CSS, vanilla JavaScript (ES modules), served by Express
- **Tests:** Node built-in test runner (`node:test`)

## Run Locally
```bash
cd backend
npm install
npm start          # http://localhost:5000
npm test           # unit tests for filter/sort pipeline + validator
```

## Project Structure
```
backend/
  src/
    server.js                     # starts the HTTP server
    app.js                        # express app, middleware, static frontend
    routes/products.routes.js     # route definitions
    controllers/products.controller.js  # request -> service -> response
    services/filter.service.js    # CORE LOGIC: filter -> sort pipeline
    validators/query.validator.js # query param parsing & validation
    data/products.js              # master inventory (60 products)
    utils/errorHandler.js         # central JSON error handling
  tests/filter.service.test.js
frontend/
  index.html
  css/styles.css
  js/api.js     # API calls
  js/state.js   # UI filter state store
  js/ui.js      # rendering functions
  js/main.js    # event wiring / controller
```

## API
### `GET /api/products/meta`
Returns sidebar options computed from inventory: categories (with counts), price min/max, ratings, sort options.

### `GET /api/products`
| Param | Example | Meaning |
|---|---|---|
| `categories` | `Electronics,Footwear` | product category must be one of these |
| `minPrice` | `500` | price ≥ minPrice |
| `maxPrice` | `5000` | price ≤ maxPrice |
| `minRating` | `4` | rating ≥ minRating (1–5) |
| `sort` | `price-asc` | `relevance`, `price-asc`, `price-desc`, `rating-desc`, `name-asc` |

Response: `{ total, count, items, applied }`. Invalid input → `400` with `details`.

## Core Logic (`filter.service.js`)
1. **Filter (intersection):** single loop over the master inventory; a product is kept only if it passes **all** active checks: category ∈ selected, `minPrice ≤ price ≤ maxPrice`, `rating ≥ minRating`. Multiple categories are OR'ed with each other and AND'ed with the other filters.
2. **Graceful null handling:** a filter that is `null`/empty is skipped. If no filter is active, the full base inventory is returned.
3. **Sort (after filtering):** the filtered list is copied and sorted with the selected comparator. The master data is never mutated.

## Frontend Behaviour
- Every checkbox, radio, slider move or sort change updates state and re-queries the API (120 ms debounce, no Submit button).
- Stale requests are cancelled with `AbortController`, so a slow old response can't overwrite a newer one.
- Slider at full range sends no price filter.
- Zero matches → grid hidden, "No items match your criteria." + **Reset filters** button.
