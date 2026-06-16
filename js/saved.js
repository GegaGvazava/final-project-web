import { getSaved, setSaved } from './api.js';

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

const typeColors = {
  normal: '#A8A77A', fire: '#EE8130', water: '#6390F0',
  electric: '#F7D02C', grass: '#7AC74C', ice: '#96D9D6',
  fighting: '#C22E28', poison: '#A33EA1', ground: '#E2BF65',
  flying: '#A98FF3', psychic: '#F95587', bug: '#A6B91A',
  rock: '#B6A136', ghost: '#735797', dragon: '#6F35FC',
  dark: '#705848', steel: '#B7B7CE', fairy: '#D685AD'
};

function renderSaved() {
  const items = getSaved();
  const grid = document.getElementById('saved-grid');
  const empty = document.getElementById('saved-empty');
  const count = document.getElementById('saved-count');

  grid.innerHTML = '';

  if (items.length === 0) {
    empty.hidden = false;
    count.hidden = true;
    return;
  }

  empty.hidden = true;
  count.hidden = false;
  count.textContent = `You have ${items.length} saved`;

  items.forEach(item => {
    const card = document.createElement('article');
    card.className = 'card';
    
    const primaryType = item.types[0] || 'normal';
    const color = typeColors[primaryType] || '#ccc';

    // build card content here
    card.innerHTML = `
      <div style="background-color: ${color}; padding: 10px; border-radius: 8px;">
        <h3>${item.name}</h3>
        <img src="${item.image}" alt="${item.name}">
        <p>HP: ${item.hp}</p>
      </div>
    `;

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', () => {
      const updated = getSaved().filter(saved => saved.id !== item.id);
      setSaved(updated);
      renderSaved();
    });

    card.querySelector('div').appendChild(removeBtn);
    grid.appendChild(card);
  });
}

renderSaved();
