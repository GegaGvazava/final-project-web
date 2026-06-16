// redirect already-logged-in users straight to the main page
if (localStorage.getItem('user')) {
  window.location.href = 'index.html';
}

document.getElementById('login-form').addEventListener('submit', (e) => {
  e.preventDefault();

  const name = document.getElementById('name-input').value.trim();
  const password = document.getElementById('password-input').value.trim();
  const errorEl = document.getElementById('login-error');

  if (!name || !password) {
    errorEl.textContent = 'Please enter name and password.';
    errorEl.hidden = false;
    return;
  }

  // mock auth
  let usersStr = localStorage.getItem('mockUsers');
  let mockUsers = usersStr ? JSON.parse(usersStr) : {};

  if (mockUsers[name]) {
    if (mockUsers[name] !== password) {
      errorEl.textContent = 'Incorrect password.';
      errorEl.hidden = false;
      return;
    }
  } else {
    mockUsers[name] = password;
    localStorage.setItem('mockUsers', JSON.stringify(mockUsers));
  }

  errorEl.hidden = true;

  // save user identity to localStorage and set a session cookie
  localStorage.setItem('user', name);
  document.cookie = 'authorized=true; path=/';

  window.location.href = 'index.html';
});
