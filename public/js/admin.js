/**
 * Rahul A. — Admin Control Console Logic
 */

(function () {
  'use strict';

  const API_BASE = window.location.origin;
  const TOKEN_KEY = 'rahul_portfolio_admin_token';

  const overlay = document.getElementById('login-overlay');
  const loginForm = document.getElementById('admin-login-form');
  const loginError = document.getElementById('login-error');
  const btnLogout = document.getElementById('btn-logout');

  let adminToken = sessionStorage.getItem(TOKEN_KEY);

  // Check initial login state
  if (adminToken) {
    verifyAndInit();
  } else {
    overlay.style.display = 'flex';
  }

  // Handle Login Submission
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = document.getElementById('admin-password').value;
    loginError.style.display = 'none';

    try {
      const res = await fetch(`${API_BASE}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await res.json();
      if (res.ok && data.success && data.token) {
        adminToken = data.token;
        sessionStorage.setItem(TOKEN_KEY, adminToken);
        overlay.style.display = 'none';
        loadDashboard();
      } else {
        loginError.textContent = data.error || 'Authentication rejected.';
        loginError.style.display = 'flex';
      }
    } catch (err) {
      loginError.textContent = 'Failed to connect to backend server.';
      loginError.style.display = 'flex';
    }
  });

  // Logout
  btnLogout.addEventListener('click', () => {
    sessionStorage.removeItem(TOKEN_KEY);
    adminToken = null;
    overlay.style.display = 'flex';
    document.getElementById('admin-password').value = '';
  });

  async function verifyAndInit() {
    try {
      const res = await fetch(`${API_BASE}/api/admin/messages`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (res.ok) {
        overlay.style.display = 'none';
        loadDashboard();
      } else {
        sessionStorage.removeItem(TOKEN_KEY);
        adminToken = null;
        overlay.style.display = 'flex';
      }
    } catch (_) {
      overlay.style.display = 'flex';
    }
  }

  async function loadDashboard() {
    await Promise.all([
      loadMetricsAndAnalytics(),
      loadMessages(),
      loadSystemTelemetry()
    ]);
  }

  async function loadMetricsAndAnalytics() {
    try {
      const res = await fetch(`${API_BASE}/api/admin/analytics`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (!res.ok) return;

      const { data } = await res.json();
      document.getElementById('stat-inquiries').textContent = data.totalInquiries;
      document.getElementById('stat-unread').textContent = data.unreadInquiries;
      document.getElementById('stat-visits').textContent = data.totalVisits.toLocaleString();
      document.getElementById('stat-downloads').textContent = data.resumeDownloads;
      document.getElementById('inbox-count').textContent = data.totalInquiries;

      // Render recent visits
      const visitsContainer = document.getElementById('recent-visits-list');
      if (data.recentVisits && data.recentVisits.length > 0) {
        visitsContainer.innerHTML = data.recentVisits.map(v => `
          <div style="padding:8px 0; border-bottom:1px solid rgba(255,255,255,0.05); display:flex; justify-content:space-between;">
            <span>${escapeHtml(v.path)} · Browser: ${escapeHtml(v.browser)}</span>
            <span style="color:#00d4ff;">${new Date(v.timestamp).toLocaleTimeString()}</span>
          </div>
        `).join('');
      } else {
        visitsContainer.innerHTML = '<div>No visitor activity recorded yet.</div>';
      }
    } catch (err) {
      console.error('Error loading analytics:', err);
    }
  }

  async function loadMessages() {
    const container = document.getElementById('messages-container');
    try {
      const res = await fetch(`${API_BASE}/api/admin/messages`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const { data } = await res.json();

      if (!data || data.length === 0) {
        container.innerHTML = '<div class="empty-state">// No transmissions received yet. All clear!</div>';
        return;
      }

      container.innerHTML = data.map(msg => `
        <div class="message-card ${msg.read ? '' : 'unread'}" id="card-${msg.id}">
          <div class="msg-header">
            <div>
              <div class="msg-sender">
                ${escapeHtml(msg.name)}
                ${!msg.read ? '<span class="msg-badge">NEW</span>' : ''}
              </div>
              <div class="msg-email">${escapeHtml(msg.email)}</div>
            </div>
            <div class="msg-date">${new Date(msg.createdAt).toLocaleString()}</div>
          </div>
          <div class="msg-subject">CATEGORY: ${escapeHtml(msg.subject)}</div>
          <div class="msg-body">${escapeHtml(msg.message)}</div>
          <div class="msg-actions">
            <a class="btn-msg" href="mailto:${encodeURIComponent(msg.email)}?subject=Re: ${encodeURIComponent(msg.subject)}">✉ Reply via Email</a>
            ${!msg.read ? `<button class="btn-msg" onclick="window.markRead('${msg.id}')">✓ Mark Read</button>` : ''}
            <button class="btn-msg btn-msg-danger" onclick="window.deleteMsg('${msg.id}')">✕ Delete</button>
          </div>
        </div>
      `).join('');
    } catch (err) {
      container.innerHTML = '<div class="empty-state">Error fetching inquiries.</div>';
    }
  }

  window.markRead = async function (id) {
    try {
      const res = await fetch(`${API_BASE}/api/admin/messages/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (res.ok) {
        loadDashboard();
      }
    } catch (err) {
      alert('Failed to update message.');
    }
  };

  window.deleteMsg = async function (id) {
    if (!confirm('Permanently delete this inquiry from the database?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/messages/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (res.ok) {
        loadDashboard();
      }
    } catch (err) {
      alert('Failed to delete message.');
    }
  };

  async function loadSystemTelemetry() {
    const pre = document.getElementById('system-telemetry-pre');
    try {
      const res = await fetch(`${API_BASE}/api/health`);
      const data = await res.json();
      pre.textContent = JSON.stringify(data, null, 2);
    } catch (err) {
      pre.textContent = 'Telemetry unreachable.';
    }
  }

  // Tabs Switching
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const target = tab.getAttribute('data-tab');
      document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
      const targetEl = document.getElementById(`tab-${target}`);
      if (targetEl) targetEl.style.display = 'block';
    });
  });

  // Export Inquiries to CSV
  const btnExport = document.getElementById('btn-export-csv');
  if (btnExport) {
    btnExport.addEventListener('click', async () => {
      try {
        const res = await fetch(`${API_BASE}/api/admin/messages`, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        const { data } = await res.json();
        if (!data || data.length === 0) {
          alert('No inquiries found to export.');
          return;
        }

        const headers = ['ID', 'Date', 'Name', 'Email', 'Subject', 'Message', 'Read'];
        const rows = data.map(m => [
          `"${m.id}"`,
          `"${new Date(m.createdAt).toLocaleString()}"`,
          `"${(m.name || '').replace(/"/g, '""')}"`,
          `"${(m.email || '').replace(/"/g, '""')}"`,
          `"${(m.subject || '').replace(/"/g, '""')}"`,
          `"${(m.message || '').replace(/"/g, '""')}"`,
          `"${m.read ? 'Yes' : 'No'}"`
        ]);

        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rahul_portfolio_inquiries_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (err) {
        alert('Failed to export CSV: ' + err.message);
      }
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
})();

