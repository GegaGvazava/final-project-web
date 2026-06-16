const BASE_URL = 'https://pokeapi.co/api/v2'; // replace with your API base URL

export async function fetchData(endpoint) {
  // fetch, check response.ok, return response.json()
  let url = endpoint;
  if (!endpoint.startsWith('http')) {
    url = BASE_URL + endpoint;
  }
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Could not fetch data');
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
