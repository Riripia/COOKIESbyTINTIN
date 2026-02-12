async function postJson(url, body) {
  try {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const text = await res.text();
    console.log(`URL: ${url}\nStatus: ${res.status}\nResponse:\n${text}\n---\n`);
    return { status: res.status, text };
  } catch (err) {
    console.error('Fetch error', err);
  }
}

(async () => {
  await postJson('http://localhost:5000/api/auth/register', { username: 'testuser', email: 'testuser@example.com', password: 'Test@123' });
  await postJson('http://localhost:5000/api/auth/login', { email: 'testuser@example.com', password: 'Test@123' });
  await postJson('http://localhost:5000/api/admin/login', { email: 'admin@email.com', password: 'Admin@123' });
})();
