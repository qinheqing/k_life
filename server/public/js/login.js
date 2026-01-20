document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const password = document.getElementById('password').value;
  const errorDiv = document.getElementById('error');
  const form = e.target;

  try {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });

    const data = await response.json();

    if (data.success) {
      localStorage.setItem('adminToken', data.token);
      window.location.href = '/admin';
    } else {
      errorDiv.textContent = data.error || 'Login failed';
      errorDiv.classList.remove('hidden');
    }
  } catch (error) {
    console.error('Login error:', error);
    errorDiv.textContent = 'Network error. Please try again.';
    errorDiv.classList.remove('hidden');
  }
});

document.getElementById('password').addEventListener('input', () => {
  document.getElementById('error').classList.add('hidden');
});
