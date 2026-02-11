async function adminLogin() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const res = await fetch('http://localhost:5000/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  if (data.token) {
    localStorage.setItem('adminToken', data.token);
    alert('Login successful!');
    // Redirect to admin dashboard
    window.location.href = '/admin/dashboard.html';
  } else {
    alert('Login failed: ' + (data.error || 'Unknown error'));
  }
}