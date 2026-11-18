/**
 * Rahul A. — Full-Stack Portfolio Client Engine
 * Integrates Frontend with Express REST API & Database Services
 */

(function () {
  'use strict';

  const API_BASE = window.location.origin.includes('http') ? window.location.origin : 'http://localhost:5000';
  let cachedProjects = [];

  // Helper: map category to CSS top-bar class
  function getTopBarClass(p) {
    if (p.category === 'flagship') {
      if (p.subCategory === 'cybersecurity') return 'bar-cyber';
      if (p.subCategory === 'ai_ml') return 'bar-data';
      if (p.id === 'curated-cinema') return 'bar-cinema';
      return 'bar-web';
    }
    if (p.category === 'production') return 'bar-intern';
    if (p.category === 'ai_ml') return 'bar-ai';
    if (p.category === 'cybersecurity') return 'bar-cyber';
    return 'bar-eng';
  }

  // Helper: category badge
  function getCategoryBadge(p) {
    if (p.category === 'production') return '<span class="cat-badge cat-badge-prod">OPENALGON PRODUCTION</span>';
    if (p.category === 'flagship') return '<span class="cat-badge cat-badge-flagship">FLAGSHIP CAPSTONE</span>';
    if (p.subCategory === 'cybersecurity' || p.category === 'cybersecurity') return '<span class="cat-badge cat-badge-cyber">CYBERSECURITY</span>';
    if (p.subCategory === 'ai_ml' || p.category === 'ai_ml') return '<span class="cat-badge cat-badge-ai">AI / ML</span>';
    return '<span class="cat-badge cat-badge-prod">ENGINEERING</span>';
  }

  // 1. Record Page Visit Telemetry
  async function recordVisit() {
    try {
      await fetch(`${API_BASE}/api/analytics/visit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: window.location.pathname || '/' })
      });
    } catch (_) {
      // Graceful offline fallback
    }
  }

  // 2. Fetch Live Stats & Telemetry
  async function loadTelemetry() {
    const statusDot = document.getElementById('api-status-dot');
    const statusText = document.getElementById('api-status-text');
    const latencyEl = document.getElementById('api-latency-val');
    const metricVisits = document.getElementById('t-metric-visits');
    const metricApps = document.getElementById('t-metric-apps');
    const metricDownloads = document.getElementById('t-metric-downloads');

    const start = performance.now();
    try {
      const res = await fetch(`${API_BASE}/api/stats`);
      const latency = Math.round(performance.now() - start);

      if (res.ok) {
        const json = await res.json();
        const data = json.data || {};

        if (statusDot) statusDot.style.background = '#10b981';
        if (statusText) statusText.textContent = 'API ONLINE';
        if (latencyEl) latencyEl.textContent = `${latency}ms`;

        if (metricVisits && data.liveVisitorCount) metricVisits.textContent = data.liveVisitorCount.toLocaleString();
        if (metricApps && data.productionAppsShipped) metricApps.textContent = data.productionAppsShipped;
        if (metricDownloads && data.resumeDownloads) metricDownloads.textContent = data.resumeDownloads;
      }
    } catch (_) {
      if (statusDot) statusDot.style.background = '#f59e0b';
      if (statusText) statusText.textContent = 'STANDALONE';
      if (latencyEl) latencyEl.textContent = 'LOCAL';
    }
  }

  // 3. Dynamic Projects Rendering & Interactive Filtering
  async function initProjectsCatalog() {
    const grid = document.querySelector('#projects .projects-grid');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const searchInput = document.getElementById('project-search-input');

    let currentFilter = 'all';
    let searchQuery = '';

    // Fetch projects from backend API
    try {
      const res = await fetch(`${API_BASE}/api/projects`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          cachedProjects = json.data;
          renderProjectCards(cachedProjects);
        }
      }
    } catch (e) {
      console.log('Running with static fallback projects.');
    }

    function renderProjectCards(projects) {
      if (!grid) return;
      grid.innerHTML = '';

      projects.forEach((p, idx) => {
        const card = document.createElement('div');
        const numStr = String(idx + 1).padStart(2, '0');
        const topBarClass = getTopBarClass(p);
        const catBadge = getCategoryBadge(p);
        const categories = `${p.category || ''} ${p.subCategory || ''}`.trim();

        card.className = `project-card ${p.featured ? 'featured' : ''} reveal visible`;
        card.setAttribute('data-category', categories);
        card.setAttribute('data-id', p.id);

        let previewHtml = '';
        if (p.image) {
          previewHtml = `
            <div style="background:rgba(0,212,255,0.03);border:1px solid rgba(0,212,255,0.1);border-radius:12px;padding:16px;margin:16px 0;text-align:center;">
              <img src="${p.image}" alt="${p.title}" style="max-height:160px;width:100%;object-fit:cover;border-radius:8px;" onerror="this.style.display='none';">
            </div>
          `;
        }

        const bulletsHtml = (p.highlights || []).slice(0, 3).map(b => `<li>${b}</li>`).join('');
        const tagsHtml = (p.techStack || []).slice(0, 6).map(t => `<span class="tech-tag">${t}</span>`).join('');

        let linksHtml = '';
        if (p.links?.live) {
          linksHtml += `<a class="project-link" href="${p.links.live}" target="_blank" onclick="event.stopPropagation();">↗ Live</a>`;
        }
        if (p.links?.github) {
          linksHtml += `<a class="project-link" href="${p.links.github}" target="_blank" onclick="event.stopPropagation();">↗ GitHub</a>`;
        }
        linksHtml += `<button class="btn-quick-view" onclick="event.stopPropagation(); window.openProjectModal('${p.id}');">⚙ Details</button>`;

        card.innerHTML = `
          <div class="card-top-bar ${topBarClass}"></div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <div class="project-no">PROJECT ${numStr}</div>
            ${catBadge}
          </div>
          <div class="project-title">${p.title}</div>
          <div class="project-type">// ${p.tagline}</div>
          <p class="project-desc">${p.description}</p>
          ${previewHtml}
          ${bulletsHtml ? `<ul class="project-bullets">${bulletsHtml}</ul>` : ''}
          <div class="project-footer">
            <div class="tech-stack">${tagsHtml}</div>
            <div style="display:flex;gap:8px;align-items:center;">${linksHtml}</div>
          </div>
        `;

        // Card mousemove spotlight effect
        card.addEventListener('mousemove', e => {
          const r = card.getBoundingClientRect();
          card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
          card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
        });

        // Click opens modal
        card.addEventListener('click', () => {
          window.openProjectModal(p.id);
        });

        grid.appendChild(card);
      });

      applyFiltering();
    }

    function applyFiltering() {
      const cards = document.querySelectorAll('#projects .project-card');
      cards.forEach(card => {
        const cat = (card.getAttribute('data-category') || '').toLowerCase();
        const text = card.innerText.toLowerCase();

        const matchCat = (currentFilter === 'all') || cat.includes(currentFilter);
        const matchSearch = !searchQuery || text.includes(searchQuery);

        if (matchCat && matchSearch) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    }

    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = (btn.getAttribute('data-filter') || 'all').toLowerCase();
        applyFiltering();
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', e => {
        searchQuery = e.target.value.trim().toLowerCase();
        applyFiltering();
      });
    }
  }

  // 4. Project Modal Handler
  window.openProjectModal = function (projectId) {
    const modal = document.getElementById('project-modal');
    if (!modal) return;

    const project = cachedProjects.find(p => p.id === projectId);
    if (!project) return;

    document.getElementById('pm-tag').textContent = `// ${project.tagline}`;
    document.getElementById('pm-title').textContent = project.title;
    document.getElementById('pm-desc').textContent = project.description;

    const bulletsContainer = document.getElementById('pm-bullets');
    if (bulletsContainer) {
      bulletsContainer.innerHTML = (project.highlights || []).map(h => `<li>${h}</li>`).join('');
    }

    const techContainer = document.getElementById('pm-tech');
    if (techContainer) {
      techContainer.innerHTML = (project.techStack || []).map(t => `<span class="tech-tag" style="color:var(--c1);border-color:rgba(0,212,255,0.3);">${t}</span>`).join('');
    }

    const liveBtn = document.getElementById('pm-btn-live');
    if (liveBtn) {
      if (project.links?.live) {
        liveBtn.href = project.links.live;
        liveBtn.style.display = 'inline-block';
      } else {
        liveBtn.style.display = 'none';
      }
    }

    const githubBtn = document.getElementById('pm-btn-github');
    if (githubBtn) {
      if (project.links?.github) {
        githubBtn.href = project.links.github;
        githubBtn.style.display = 'inline-block';
      } else {
        githubBtn.style.display = 'none';
      }
    }

    modal.classList.add('open');
  };

  // 5. Telemetry Architecture Modal Handler
  window.openTelemetryModal = async function () {
    const modal = document.getElementById('telemetry-modal');
    if (!modal) return;

    modal.classList.add('open');
    const runtimeEl = document.getElementById('tm-runtime');
    const memoryEl = document.getElementById('tm-memory');
    const uptimeEl = document.getElementById('tm-uptime');

    try {
      const res = await fetch(`${API_BASE}/api/health`);
      if (res.ok) {
        const data = await res.json();
        if (runtimeEl) runtimeEl.textContent = `Node ${data.runtime?.node} (${data.runtime?.platform})`;
        if (memoryEl) memoryEl.textContent = `${data.memory?.rss} RSS / ${data.memory?.heapUsed} Heap`;
        if (uptimeEl) uptimeEl.textContent = data.uptime;
      }
    } catch (_) {
      if (runtimeEl) runtimeEl.textContent = 'Offline / Standalone';
    }
  };

  window.closeModal = function (modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('open');
  };

  // 6. Contact Form Submission
  function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const submitBtn = document.getElementById('btn-submit-contact');
    const btnText = document.getElementById('btn-submit-text');
    const btnSpinner = document.getElementById('btn-submit-spinner');
    const feedbackBox = document.getElementById('contact-feedback');
    const charCounter = document.getElementById('message-char-count');
    const messageInput = document.getElementById('contact-message');

    if (messageInput && charCounter) {
      messageInput.addEventListener('input', () => {
        charCounter.textContent = `${messageInput.value.length} / 3000`;
      });
    }

    form.addEventListener('submit', async e => {
      e.preventDefault();

      const name = document.getElementById('contact-name').value.trim();
      const email = document.getElementById('contact-email').value.trim();
      const subject = document.getElementById('contact-subject').value;
      const message = messageInput.value.trim();
      const gotcha = document.getElementById('contact-gotcha').value;

      feedbackBox.className = 'form-feedback';
      feedbackBox.style.display = 'none';

      if (name.length < 2) {
        showFeedback('Please enter your full name (at least 2 characters).', 'error');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showFeedback('Please enter a valid email address.', 'error');
        return;
      }
      if (message.length < 10) {
        showFeedback('Please write a message with at least 10 characters.', 'error');
        return;
      }

      submitBtn.disabled = true;
      btnSpinner.style.display = 'inline-block';
      btnText.textContent = 'TRANSMITTING...';

      try {
        const response = await fetch(`${API_BASE}/api/contact`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, subject, message, _gotcha: gotcha })
        });

        const result = await response.json();

        if (response.ok && result.success) {
          showFeedback(`✓ ${result.message}`, 'success');
          form.reset();
          if (charCounter) charCounter.textContent = '0 / 3000';
        } else {
          showFeedback(result.error || 'Unable to deliver message.', 'error');
        }
      } catch (err) {
        showFeedback('Network connection failed. Reach out directly at rahuldheeraj.anil@gmail.com', 'error');
      } finally {
        submitBtn.disabled = false;
        btnSpinner.style.display = 'none';
        btnText.textContent = 'SEND TRANSMISSION ➔';
      }
    });

    function showFeedback(msg, type) {
      feedbackBox.textContent = msg;
      feedbackBox.className = `form-feedback ${type}`;
      feedbackBox.style.display = 'flex';
      feedbackBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  // 7. Global Keyboard Shortcuts & Backdrop Closes
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
      e.preventDefault();
      window.location.href = '/admin';
    }
    if (e.key === 'Escape') {
      document.querySelectorAll('.fs-modal-backdrop.open').forEach(m => m.classList.remove('open'));
    }
  });

  document.querySelectorAll('.fs-modal-backdrop').forEach(modal => {
    modal.addEventListener('click', e => {
      if (e.target === modal) modal.classList.remove('open');
    });
  });

  // Bind Telemetry Pill to Open Architecture Modal
  const telemetryPill = document.querySelector('.telemetry-pill');
  if (telemetryPill) {
    telemetryPill.addEventListener('click', e => {
      e.preventDefault();
      window.openTelemetryModal();
    });
  }

  // Init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      recordVisit();
      loadTelemetry();
      initProjectsCatalog();
      initContactForm();
    });
  } else {
    recordVisit();
    loadTelemetry();
    initProjectsCatalog();
    initContactForm();
  }
})();
