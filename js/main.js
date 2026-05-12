import { fetchData } from './api.js';

function showLoading() {}

function showError(message) {}

function renderResults(items) {
  // create a card element for each item
  // attach a click handler that closes over the item — this is your closure
}

document.getElementById('search-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  // validate form values, call fetchData, pass results to renderResults
});
