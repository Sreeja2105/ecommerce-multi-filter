// Single source of truth for the UI's filter state.
// null / [] means "filter not applied" -> server returns full inventory.

export function createInitialState() {
  return {
    categories: [],
    minPrice: null,
    maxPrice: null,
    minRating: null,
    sort: 'relevance',
  };
}

export function createStore(onChange) {
  let state = createInitialState();
  return {
    get: () => state,
    update(patch) {
      state = { ...state, ...patch };
      onChange(state);
    },
    reset() {
      state = createInitialState();
      onChange(state);
    },
  };
}
