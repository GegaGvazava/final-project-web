import { fetchData, getSaved, setSaved } from './api.js';

// redirect to login if no user session
if (!localStorage.getItem('user')) {
  window.location.href = 'login.html';
}

document.getElementById('nav-user').textContent = localStorage.getItem('user') || '';

document.getElementById('logout-btn').addEventListener('click', () => {
  localStorage.removeItem('user');
  document.cookie = 'authorized=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
  window.location.href = 'login.html';
});

// keep your application state as an array of objects
let savedItems = getSaved();

// colors for pokemon types
const typeColors = {
  normal: '#A8A77A', fire: '#EE8130', water: '#6390F0',
  electric: '#F7D02C', grass: '#7AC74C', ice: '#96D9D6',
  fighting: '#C22E28', poison: '#A33EA1', ground: '#E2BF65',
  flying: '#A98FF3', psychic: '#F95587', bug: '#A6B91A',
  rock: '#B6A136', ghost: '#735797', dragon: '#6F35FC',
  dark: '#705848', steel: '#B7B7CE', fairy: '#D685AD'
};

const limitInput = document.getElementById('limit-input');
const limitValue = document.getElementById('limit-value');
limitInput.addEventListener('input', () => {
  limitValue.textContent = limitInput.value;
});

function showLoading(visible) {
  document.getElementById('loading-msg').hidden = !visible;
}

function showError(message) {
  const el = document.getElementById('error-msg');
  if (message) {
    el.textContent = message;
    el.hidden = false;
  } else {
    el.hidden = true;
  }
}

function clearResults() {
  document.getElementById('results-grid').innerHTML = '';
  showError(null);
  document.getElementById('results-count').textContent = '';
}

function isSaved(id) {
  return getSaved().some(s => s.id === id);
}

function renderResults(items) {
  const grid = document.getElementById('results-grid');
  
  if (items.length === 0) {
    showError("No pokemon found");
    return;
  }

  // create a card element for each item
  // the click handler inside forEach closes over the item — this is your closure
  items.forEach(item => {
    const card = document.createElement('article');
    card.className = 'card';
    
    // make a simpler object to save
    const saveObj = {
      id: item.id,
      name: item.name,
      image: item.sprites.front_default,
      types: item.types.map(t => t.type.name),
      hp: item.stats[0].base_stat
    };

    const primaryType = item.types[0].type.name;
    const color = typeColors[primaryType] || '#ccc';
    const saved = isSaved(item.id);

    // build and append card content here
    card.innerHTML = `
      <div style="background-color: ${color}; padding: 10px; border-radius: 8px;">
        <h3>${item.name}</h3>
        <p>#${item.id}</p>
        <img src="${item.sprites.front_default}" alt="${item.name}">
        <p>HP: ${item.stats[0].base_stat}</p>
        <button type="button" class="save-btn">${saved ? 'Remove' : 'Save'}</button>
      </div>
    `;

    // closure
    card.querySelector('.save-btn').addEventListener('click', function(e) {
      const currentSaved = getSaved();
      if (isSaved(item.id)) {
        setSaved(currentSaved.filter(s => s.id !== item.id));
        e.target.textContent = 'Save';
      } else {
        setSaved([...currentSaved, saveObj]);
        e.target.textContent = 'Remove';
      }
    });

    grid.appendChild(card);
  });

  document.getElementById('results-count').textContent = `${items.length} results`;
}

document.getElementById('search-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  // validate, call fetchData, call showLoading/showError, call renderResults
  
  const name = document.getElementById('name-input').value.trim().toLowerCase();
  const type = document.getElementById('type-select').value;
  const limit = document.getElementById('limit-input').value;

  showLoading(true);
  clearResults();

  try {
    let pokemons = [];

    if (name) {
      const data = await fetchData(`/pokemon/${name}`);
      pokemons = [data];
    } else if (type) {
      const typeData = await fetchData(`/type/${type}`);
      const slice = typeData.pokemon.slice(0, limit);
      pokemons = await Promise.all(
        slice.map(p => fetchData(`/pokemon/${p.pokemon.name}`))
      );
    } else {
      const listData = await fetchData(`/pokemon?limit=${limit}`);
      pokemons = await Promise.all(
        listData.results.map(p => fetchData(`/pokemon/${p.name}`))
      );
    }

    renderResults(pokemons);

  } catch (err) {
    showError("Error finding pokemon");
  }

  showLoading(false);
});

// load some on start
async function init() {
  showLoading(true);
  try {
    const listData = await fetchData(`/pokemon?limit=12`);
    const pokemons = await Promise.all(
      listData.results.map(p => fetchData(`/pokemon/${p.name}`))
    );
    renderResults(pokemons);
  } catch(e) {
    showError("error loading initial data");
  }
  showLoading(false);
}

init();
