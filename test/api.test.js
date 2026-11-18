import assert from 'node:assert';
import test from 'node:test';
import app from '../server.js';

let server;
let baseUrl;

test.before(async () => {
  await new Promise((resolve) => {
    // Pick an ephemeral or alternate port for tests
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

test('GET /api/health returns 200 with HEALTHY status', async () => {
  const res = await fetch(`${baseUrl}/api/health`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.status, 'HEALTHY');
  assert.strictEqual(data.service, 'Rahul-Portfolio-Backend');
});

test('GET /api/stats returns portfolio metrics', async () => {
  const res = await fetch(`${baseUrl}/api/stats`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.success, true);
  assert.ok(data.data.totalProjects >= 16);
  assert.strictEqual(data.data.productionAppsShipped, 9);
});

test('GET /api/projects returns seeded project catalog', async () => {
  const res = await fetch(`${baseUrl}/api/projects`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.success, true);
  assert.ok(Array.isArray(data.data));
  assert.ok(data.count >= 16);

  // Test category filtering
  const prodRes = await fetch(`${baseUrl}/api/projects?category=production`);
  const prodData = await prodRes.json();
  assert.strictEqual(prodData.success, true);
  assert.ok(prodData.count >= 9);
});

test('GET /api/skills returns structured domain taxonomy', async () => {
  const res = await fetch(`${baseUrl}/api/skills`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.success, true);
  assert.ok(data.data.cybersecurity);
  assert.ok(data.data.fullstack);
  assert.ok(data.data.aiml);
});

test('POST /api/contact validates and stores message', async () => {
  const payload = {
    name: 'Jane Recruiter',
    email: 'jane@enterprise.tech',
    subject: 'AI & Cybersecurity Role',
    message: 'Hello Rahul, loved your 9 production apps shipped at OpenAlgon and your VAPT exploit suite. We would love to chat!'
  };

  const res = await fetch(`${baseUrl}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  assert.strictEqual(res.status, 201);
  const data = await res.json();
  assert.strictEqual(data.success, true);
  assert.ok(data.data.id);
});

test('POST /api/contact rejects invalid payloads', async () => {
  const res = await fetch(`${baseUrl}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'A', email: 'not-an-email', message: 'Hi' })
  });
  assert.strictEqual(res.status, 400);
  const data = await res.json();
  assert.strictEqual(data.success, false);
});

test('Admin Auth: POST /api/admin/login and retrieve messages', async () => {
  // Test invalid login
  const badLogin = await fetch(`${baseUrl}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: 'wrongpassword' })
  });
  assert.strictEqual(badLogin.status, 401);

  // Test valid login with default dev password
  const goodLogin = await fetch(`${baseUrl}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: 'admin12345' })
  });
  assert.strictEqual(goodLogin.status, 200);
  const loginData = await goodLogin.json();
  assert.strictEqual(loginData.success, true);
  assert.ok(loginData.token);

  // Access protected messages
  const messagesRes = await fetch(`${baseUrl}/api/admin/messages`, {
    headers: { Authorization: `Bearer ${loginData.token}` }
  });
  assert.strictEqual(messagesRes.status, 200);
  const messagesData = await messagesRes.json();
  assert.strictEqual(messagesData.success, true);
  assert.ok(messagesData.count >= 1);
});


test('POST /api/chat responds to career and technical queries', async () => {
  const query = { message: 'Tell me about the 9 production apps Rahul built at OpenAlgon' };
  const res = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(query)
  });

  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.success, true);
  assert.ok(data.reply && data.reply.length > 50);
  assert.ok(data.reply.includes('OpenAlgon') || data.reply.includes('RankPrediction'));
});

test('POST /api/chat rejects empty query', async () => {
  const res = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: '   ' })
  });

  assert.strictEqual(res.status, 400);
  const data = await res.json();
  assert.strictEqual(data.success, false);
});

test('GET /api/chat/suggestions returns rotating prompt recommendations', async () => {
  const res = await fetch(`${baseUrl}/api/chat/suggestions`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.success, true);
  assert.ok(Array.isArray(data.suggestions));
  assert.ok(data.suggestions.length >= 3);
});

test('GET /api/chat/status returns dynamic knowledge telemetry', async () => {
  const res = await fetch(`${baseUrl}/api/chat/status`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.status.status, 'active');
  assert.ok(data.status.projectsCount >= 16);
  assert.ok(data.status.trackedResumes.length >= 1);
  assert.ok(data.status.websiteSectionsIndexed.includes('about'));
  assert.ok(data.status.websiteSectionsIndexed.includes('hero'));
});

test('Dynamic Auto-Update: Bot instantly recognizes newly added project without restart', async () => {
  const { db } = await import('../src/db/database.js');
  
  // 1. Create a brand new project dynamically in data/projects.json
  const testProject = {
    id: 'quantum-shield-vapt-test',
    title: 'Quantum Shield VAPT',
    tagline: 'QUANTUM POST-EXPLOIT DEFENSE MATRIX',
    category: 'flagship',
    subCategory: 'cybersecurity',
    description: 'Autonomous post-quantum vulnerability scanner and simulated penetration testing engine.',
    highlights: ['NIST post-quantum cryptographic validation', 'Sub-second lattice attack vector mitigation'],
    techStack: ['Rust', 'Python', 'Kyber-512', 'VAPT'],
    links: { live: 'https://quantum-shield.tech', github: 'https://github.com/rahul200618/quantum-shield' },
    status: 'Test Research'
  };

  db.projects.create(testProject);

  try {
    // 2. Query Rahul-Bot about the newly added project
    const res = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Tell me about Quantum Shield VAPT' })
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    
    // Verify the response contains the new project's title, description, and highlights
    assert.ok(data.reply.includes('Quantum Shield VAPT'), 'Should include new project title');
    assert.ok(data.reply.includes('lattice attack vector') || data.reply.includes('post-quantum'), 'Should include dynamic highlights');
    assert.ok(data.reply.includes('github.com/rahul200618/quantum-shield'), 'Should include new project link');

    // 3. Verify suggestions include the new project
    const sugRes = await fetch(`${baseUrl}/api/chat/suggestions`);
    const sugData = await sugRes.json();
    assert.strictEqual(sugData.success, true);
  } finally {
    // Clean up test project so state remains pristine
    db.projects.delete(testProject.id);
  }
});
