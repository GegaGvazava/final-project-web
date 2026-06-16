if (localStorage.getItem('user')) {
  window.location.href = 'index.html';
}

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');
const subtitle = document.getElementById('auth-subtitle');

tabLogin.addEventListener('click', () => {
  loginForm.hidden = false;
  registerForm.hidden = true;
  tabLogin.classList.add('active');
  tabRegister.classList.remove('active');
  subtitle.textContent = 'Login to your account';
});

tabRegister.addEventListener('click', () => {
  loginForm.hidden = true;
  registerForm.hidden = false;
  tabRegister.classList.add('active');
  tabLogin.classList.remove('active');
  subtitle.textContent = 'Create a new account';
});

function loginUser(name) {
  localStorage.setItem('user', name);
  document.cookie = 'authorized=true; path=/';
  window.location.href = 'index.html';
}

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('login-name').value.trim();
  const password = document.getElementById('login-password').value.trim();
  const errorEl = document.getElementById('login-error');

  if (!name || !password) {
    errorEl.textContent = 'Please enter name and password.';
    errorEl.hidden = false;
    return;
  }

  let usersStr = localStorage.getItem('mockUsers');
  let mockUsers = usersStr ? JSON.parse(usersStr) : {};

  if (!mockUsers[name]) {
    errorEl.textContent = 'User not found. Please sign up first.';
    errorEl.hidden = false;
    return;
  }

  if (mockUsers[name] !== password) {
    errorEl.textContent = 'Incorrect password.';
    errorEl.hidden = false;
    return;
  }

  errorEl.hidden = true;
  loginUser(name);
});

registerForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('reg-name').value.trim();
  const password = document.getElementById('reg-password').value.trim();
  const errorEl = document.getElementById('reg-error');

  if (!name || !password) {
    errorEl.textContent = 'Please enter name and password.';
    errorEl.hidden = false;
    return;
  }

  let usersStr = localStorage.getItem('mockUsers');
  let mockUsers = usersStr ? JSON.parse(usersStr) : {};

  if (mockUsers[name]) {
    errorEl.textContent = 'Username already taken. Please login.';
    errorEl.hidden = false;
    return;
  }

  mockUsers[name] = password;
  localStorage.setItem('mockUsers', JSON.stringify(mockUsers));
  
  errorEl.hidden = true;
  loginUser(name);
});
