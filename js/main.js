import { fetchData, getSaved, setSaved } from './api.js';

// --- Auth guard: redirect to login if no user session ---
if (!localStorage.getItem('user')) {
  window.location.href = 'login.html';
}

// Display logged-in username in nav
document.getElementById('nav-user').textContent = '👤 ' + (localStorage.getItem('user') || '');

// Logout — clear localStorage and cookie, then redirect
document.getElementById('logout-btn').addEventListener('click', () => {
  localStorage.removeItem('user');
  document.cookie = 'authorized=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
  window.location.href = 'login.html';
});

// --- State ---
// Application state: mirrors what is currently rendered in the grid
let savedItems = getSaved();

// --- Type → card background colour map ---
const TYPE_BG = {
  normal:   '#5a5a40', fire:     '#8a3010', water:    '#1e508a',
  electric: '#806800', grass:    '#306018', ice:      '#2a7070',
  fighting: '#780e0a', poison:   '#601070', ground:   '#6a5000',
  flying:   '#3c3490', psychic:  '#8a1038', bug:      '#3c4c08',
  rock:     '#5a4412', ghost:    '#2c1e5a', dragon:   '#2e0ea8',
  dark:     '#241810', steel:    '#44445c', fairy:    '#782858'
};

// --- Range slider: update live display ---
const limitInput = document.getElementById('limit-input');
const limitValue = document.getElementById('limit-value');
limitInput.addEventListener('input', () => {
  limitValue.textContent = limitInput.value;
});

// --- UI helpers ---
function showLoading(visible) {
  document.getElementById('loading-msg').hidden = !visible;
}

function showError(message) {
  const el = document.getElementById('error-msg');
  if (message) {
    el.textContent = '⚠️ ' + message;
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

// --- Save / unsave helpers ---
function isSaved(id) {
  return getSaved().some(s => s.id === id);
}

function toggleSave(saveItem, btn) {
  const current = getSaved();
  if (isSaved(saveItem.id)) {
    setSaved(current.filter(s => s.id !== saveItem.id));
    btn.textContent = '♡';
    btn.classList.remove('saved');
    btn.setAttribute('aria-label', `Save ${saveItem.name}`);
  } else {
    setSaved([...current, saveItem]);
    btn.textContent = '♥';
    btn.classList.add('saved');
    btn.setAttribute('aria-label', `Unsave ${saveItem.name}`);
  }
}

// Build a lean save-item object from a full API response
function buildSaveItem(pokemon) {
  return {
    id:       pokemon.id,
    name:     pokemon.name,
    image:    pokemon.sprites.other?.['official-artwork']?.front_default
              || pokemon.sprites.front_default
              || '',
    types:    pokemon.types.map(t => t.type.name),
    hp:       pokemon.stats[0]?.base_stat ?? 0,
    attack:   pokemon.stats[1]?.base_stat ?? 0,
    defense:  pokemon.stats[2]?.base_stat ?? 0,
  };
}

// --- Card factory (uses a closure: each card captures its own pokemon + saveItem) ---
function createCard(pokemon, index) {
  // Closure: saveItem, image, stats are all captured in this scope
  // The save-button click handler closes over saveItem so it always references
  // the correct Pokémon, regardless of how many cards exist in the grid.
  const saveItem    = buildSaveItem(pokemon);
  const primaryType = pokemon.types[0]?.type.name || 'normal';
  const bgColor     = TYPE_BG[primaryType] || '#333';
  const image       = saveItem.image;
  const hp          = saveItem.hp;
  const attack      = saveItem.attack;
  const defense     = saveItem.defense;
  const saved       = isSaved(pokemon.id);

  const card = document.createElement('article');
  card.className = 'card';
  card.style.animationDelay = `${index * 55}ms`;

  const typeBadges = pokemon.types
    .map(t => `<span class="badge badge--${t.type.name}">${t.type.name}</span>`)
    .join('');

  card.innerHTML = `
    <div class="card__top-bar">
      <span class="card__id">#${String(pokemon.id).padStart(3, '0')}</span>
      <button
        class="card__save-btn ${saved ? 'saved' : ''}"
        id="save-btn-${pokemon.id}"
        type="button"
        aria-label="${saved ? 'Unsave' : 'Save'} ${pokemon.name}"
      >${saved ? '♥' : '♡'}</button>
    </div>
    <div class="card__img-wrap"
         style="background: linear-gradient(140deg, ${bgColor}60 0%, ${bgColor}1a 100%);">
      <img
        class="card__img"
        src="${image}"
        alt="${pokemon.name}"
        loading="lazy"
        width="100"
        height="100"
      >
    </div>
    <div class="card__body">
      <h3 class="card__name">${pokemon.name}</h3>
      <div class="card__types">${typeBadges}</div>
      <div class="card__stats">
        <div class="stat">
          <span class="stat__label">HP</span>
          <div class="stat__bar">
            <div class="stat__fill stat__fill--hp"
                 style="width: ${Math.min(hp / 255 * 100, 100).toFixed(1)}%"></div>
          </div>
          <span class="stat__val">${hp}</span>
        </div>
        <div class="stat">
          <span class="stat__label">ATK</span>
          <div class="stat__bar">
            <div class="stat__fill stat__fill--atk"
                 style="width: ${Math.min(attack / 255 * 100, 100).toFixed(1)}%"></div>
          </div>
          <span class="stat__val">${attack}</span>
        </div>
        <div class="stat">
          <span class="stat__label">DEF</span>
          <div class="stat__bar">
            <div class="stat__fill stat__fill--def"
                 style="width: ${Math.min(defense / 255 * 100, 100).toFixed(1)}%"></div>
          </div>
          <span class="stat__val">${defense}</span>
        </div>
      </div>
    </div>
  `;

  // Attach the save-toggle listener — closes over `saveItem` (the closure)
  card.querySelector('.card__save-btn').addEventListener('click', (e) => {
    toggleSave(saveItem, e.currentTarget);
  });

  return card;
}

// Render an array of full Pokémon API objects into the results grid
function renderResults(pokemons) {
  const grid = document.getElementById('results-grid');

  if (!pokemons.length) {
    showError('No Pokémon found. Try a different name or type!');
    return;
  }

  pokemons.forEach((pokemon, index) => {
    // createCard uses a closure, so each iteration captures its own pokemon
    const card = createCard(pokemon, index);
    grid.appendChild(card);
  });

  document.getElementById('results-count').textContent =
    `${pokemons.length} Pokémon found`;
}

// --- Search form submit ---
document.getElementById('search-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name  = document.getElementById('name-input').value.trim().toLowerCase();
  const type  = document.getElementById('type-select').value;
  const limit = parseInt(document.getElementById('limit-input').value, 10) || 12;

  showLoading(true);
  clearResults();

  try {
    let pokemons = [];

    if (name) {
      // Fetch a specific Pokémon by name
      const data = await fetchData(`/pokemon/${name}`);
      pokemons = [data];

    } else if (type) {
      // Fetch all Pokémon of a chosen type, then fetch each individually
      const typeData = await fetchData(`/type/${type}`);
      const slice    = typeData.pokemon.slice(0, limit);
      pokemons = await Promise.all(
        slice.map(p => fetchData(`/pokemon/${p.pokemon.name}`))
      );

    } else {
      // No filter: load from a random page for variety
      const offset   = Math.floor(Math.random() * 850);
      const listData = await fetchData(`/pokemon?limit=${limit}&offset=${offset}`);
      pokemons = await Promise.all(
        listData.results.map(p => fetchData(`/pokemon/${p.name}`))
      );
    }

    renderResults(pokemons);

  } catch (err) {
    if (err.message.includes('404')) {
      showError('Pokémon not found! Double-check the spelling and try again.');
    } else {
      showError(`Something went wrong: ${err.message}`);
    }

  } finally {
    showLoading(false);
  }
});

// --- Auto-load on page start ---
async function loadFeatured() {
  showLoading(true);
  try {
    const limit    = parseInt(limitInput.value, 10) || 12;
    const listData = await fetchData(`/pokemon?limit=${limit}&offset=0`);
    const pokemons = await Promise.all(
      listData.results.map(p => fetchData(`/pokemon/${p.name}`))
    );
    renderResults(pokemons);
  } catch (err) {
    showError('Could not load Pokémon. Please check your connection and refresh.');
  } finally {
    showLoading(false);
  }
}

loadFeatured();
