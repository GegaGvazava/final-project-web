import { getSaved, setSaved } from './api.js';

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

// --- Type → card background colour map ---
const TYPE_BG = {
  normal:   '#5a5a40', fire:     '#8a3010', water:    '#1e508a',
  electric: '#806800', grass:    '#306018', ice:      '#2a7070',
  fighting: '#780e0a', poison:   '#601070', ground:   '#6a5000',
  flying:   '#3c3490', psychic:  '#8a1038', bug:      '#3c4c08',
  rock:     '#5a4412', ghost:    '#2c1e5a', dragon:   '#2e0ea8',
  dark:     '#241810', steel:    '#44445c', fairy:    '#782858'
};

function renderSaved() {
  const items = getSaved();
  const grid = document.getElementById('saved-grid');
  const empty = document.getElementById('saved-empty');
  const countDisplay = document.getElementById('saved-count');

  grid.innerHTML = '';

  if (!items.length) {
    empty.hidden = false;
    countDisplay.hidden = true;
    return;
  }

  empty.hidden = true;
  countDisplay.hidden = false;
  countDisplay.textContent = `You have ${items.length} saved Pokémon.`;

  items.forEach((item, index) => {
    const card = document.createElement('article');
    card.className = 'card';
    card.style.animationDelay = `${index * 55}ms`;

    const primaryType = item.types[0] || 'normal';
    const bgColor = TYPE_BG[primaryType] || '#333';

    const typeBadges = item.types
      .map(t => `<span class="badge badge--${t}">${t}</span>`)
      .join('');

    card.innerHTML = `
      <div class="card__top-bar">
        <span class="card__id">#${String(item.id).padStart(3, '0')}</span>
      </div>
      <div class="card__img-wrap"
           style="background: linear-gradient(140deg, ${bgColor}60 0%, ${bgColor}1a 100%);">
        <img
          class="card__img"
          src="${item.image}"
          alt="${item.name}"
          loading="lazy"
          width="100"
          height="100"
        >
      </div>
      <div class="card__body">
        <h3 class="card__name">${item.name}</h3>
        <div class="card__types">${typeBadges}</div>
        <div class="card__stats">
          <div class="stat">
            <span class="stat__label">HP</span>
            <div class="stat__bar">
              <div class="stat__fill stat__fill--hp"
                   style="width: ${Math.min(item.hp / 255 * 100, 100).toFixed(1)}%"></div>
            </div>
            <span class="stat__val">${item.hp}</span>
          </div>
          <div class="stat">
            <span class="stat__label">ATK</span>
            <div class="stat__bar">
              <div class="stat__fill stat__fill--atk"
                   style="width: ${Math.min(item.attack / 255 * 100, 100).toFixed(1)}%"></div>
            </div>
            <span class="stat__val">${item.attack}</span>
          </div>
          <div class="stat">
            <span class="stat__label">DEF</span>
            <div class="stat__bar">
              <div class="stat__fill stat__fill--def"
                   style="width: ${Math.min(item.defense / 255 * 100, 100).toFixed(1)}%"></div>
            </div>
            <span class="stat__val">${item.defense}</span>
          </div>
        </div>
      </div>
    `;

    // Remove button implementation (closure over 'item')
    const removeBtn = document.createElement('button');
    removeBtn.className = 'card__remove-btn';
    removeBtn.type = 'button';
    removeBtn.textContent = 'Remove from Pokédex';
    removeBtn.addEventListener('click', () => {
      // Filter out the item and update localStorage
      const updated = getSaved().filter(saved => saved.id !== item.id);
      setSaved(updated);
      
      // Animate out before re-rendering
      card.style.transform = 'scale(0.9)';
      card.style.opacity = '0';
      setTimeout(() => {
        renderSaved();
      }, 200);
    });

    card.querySelector('.card__body').appendChild(removeBtn);
    grid.appendChild(card);
  });
}

// Initial render
renderSaved();
