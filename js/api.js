const BASE_URL = 'https://pokeapi.co/api/v2'; // PokéAPI base URL

/**
 * Fetches data from the PokéAPI.
 * Accepts either a path (e.g. '/pokemon/pikachu') or a full URL.
 * Checks response.ok and throws a descriptive error on failure.
 */
export async function fetchData(endpoint) {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} — ${response.statusText}`);
  }
  return response.json();
}

// localStorage helpers — import these wherever you need saved state
export function getSaved() {
  const raw = localStorage.getItem('savedItems');
  return raw ? JSON.parse(raw) : [];
}

export function setSaved(items) {
  localStorage.setItem('savedItems', JSON.stringify(items));
}
