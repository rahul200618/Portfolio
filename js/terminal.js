/**
 * Rahul A. — Cyber Security Interactive Terminal Engine (CLI)
 * Implements interactive VAPT scans, cryptographic attack simulations, and REST API probing
 */

(function () {
  'use strict';

  const API_BASE = window.location.origin.includes('http') ? window.location.origin : 'http://localhost:5000';
  let history = [];
  let historyIndex = -1;
  let isMatrixRunning = false;
  let matrixInterval = null;

  const COMMANDS = {
    help: 'List all available terminal commands and syntax',
    whoami: 'Display Rahul\'s professional identity, domains & education',
    projects: 'Inspect project catalog (flags: --prod, --flagship, --all)',
    skills: 'Display categorized technical skill proficiency',
    certs: 'List verified industry certifications and credentials',
    'vapt --scan': 'Run simulated OWASP & API penetration test against portfolio',
    'crypto --simulate': 'Execute 6-vector adversarial exploit simulation (Digital Cash)',
    curl: 'Probe API endpoints (e.g. curl /api/health, curl /api/stats)',
    matrix: 'Toggle green matrix digital rain visualization',
    resume: 'Display career master record & download resume PDF',
    contact: 'Direct contact info and transmission dispatch',
    clear: 'Clear the terminal output window',
    exit: 'Close the interactive terminal console'
  };

  function initTerminal() {
    const termModal = document.getElementById('cyber-terminal-modal');
    const termInput = document.getElementById('term-input');
    const termOutput = document.getElementById('term-output');
    const termTrigger = document.getElementById('btn-term-trigger');
    const termClose = document.getElementById('term-close');

    if (!termModal || !termInput) return;

    // Open/Close handlers
    function openTerm() {
      termModal.classList.add('open');
      termInput.focus();
    }
    function closeTerm() {
      termModal.classList.remove('open');
      stopMatrix();
    }

    if (termTrigger) termTrigger.addEventListener('click', openTerm);
    if (termClose) termClose.addEventListener('click', closeTerm);

    // Global shortcut: Backtick / Tilde or Ctrl+Shift+T
    document.addEventListener('keydown', e => {
      if ((e.key === '`' || e.key === '~') && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        termModal.classList.contains('open') ? closeTerm() : openTerm();
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'T' || e.key === 't')) {
        e.preventDefault();
        termModal.classList.contains('open') ? closeTerm() : openTerm();
      }
      if (e.key === 'Escape' && termModal.classList.contains('open')) {
        closeTerm();
      }
    });

    // Enter Command
    termInput.addEventListener('keydown', async e => {
      if (e.key === 'Enter') {
        const rawCmd = termInput.value.trim();
        if (rawCmd) {
          history.push(rawCmd);
          historyIndex = history.length;
          printLine(`<span class="term-prompt">rahul@cyber-node:~$</span> <span class="term-user-cmd">${escapeHtml(rawCmd)}</span>`);
          termInput.value = '';
          await executeCommand(rawCmd);
        } else {
          printLine(`<span class="term-prompt">rahul@cyber-node:~$</span>`);
        }
        scrollBottom();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (historyIndex > 0) {
          historyIndex--;
          termInput.value = history[historyIndex];
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex < history.length - 1) {
          historyIndex++;
          termInput.value = history[historyIndex];
        } else {
          historyIndex = history.length;
          termInput.value = '';
        }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        const current = termInput.value.trim();
        const matches = Object.keys(COMMANDS).filter(c => c.startsWith(current));
        if (matches.length === 1) {
          termInput.value = matches[0];
        } else if (matches.length > 1) {
          printLine(`<div class="term-dim">Suggestions: ${matches.join('   ')}</div>`);
          scrollBottom();
        }
      }
    });

    // Initial Welcome Message
    printLine(`
<div style="color:var(--c1);font-weight:600;margin-bottom:8px;">
██████╗  █████╗ ██╗  ██╗██╗   ██╗██╗         █████╗ 
██╔══██╗██╔══██╗██║  ██║██║   ██║██║        ██╔══██╗
██████╔╝███████║███████║██║   ██║██║  █████╗███████║
██╔══██╗██╔══██║██╔══██║██║   ██║██║  ╚════╝██╔══██║
██║  ██║██║  ██║██║  ██║╚██████╔╝███████╗   ██║  ██║
╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝   ╚═╝  ╚═╝
</div>
<div style="color:var(--c3);font-size:12px;margin-bottom:6px;">[✓] Node.js / Express Security Console Active</div>
<div class="term-dim" style="margin-bottom:12px;">Type <span style="color:var(--c4);font-weight:600;">help</span> to inspect security audit tools, VAPT scans, and full-stack commands. Press <span style="color:var(--c1);">[~]</span> to toggle.</div>
    `);
  }

  function printLine(html) {
    const termOutput = document.getElementById('term-output');
    if (!termOutput) return;
    const div = document.createElement('div');
    div.className = 'term-line';
    div.innerHTML = html;
    termOutput.appendChild(div);
  }

  function scrollBottom() {
    const termBody = document.getElementById('term-body');
    if (termBody) termBody.scrollTop = termBody.scrollHeight;
  }

  async function executeCommand(cmdStr) {
    const cmd = cmdStr.toLowerCase().trim();
    const parts = cmd.split(' ');
    const base = parts[0];

    switch (base) {
      case 'help':
        printHelp();
        break;

      case 'whoami':
      case 'bio':
        printWhoami();
        break;

      case 'projects':
        await printProjects(parts[1]);
        break;

      case 'skills':
        printSkills();
        break;

      case 'certs':
        printCerts();
        break;

      case 'vapt':
        if (parts[1] === '--scan' || parts[1] === 'scan') {
          await runVaptScan();
        } else {
          printLine('<div class="term-err">Usage: vapt --scan (Runs simulated OWASP & API penetration test)</div>');
        }
        break;

      case 'crypto':
        if (parts[1] === '--simulate' || parts[1] === 'simulate') {
          await runCryptoSimulation();
        } else {
          printLine('<div class="term-err">Usage: crypto --simulate (Runs 6-vector exploit suite on Digital Cash protocol)</div>');
        }
        break;

      case 'curl':
        await runCurl(parts[1] || '/api/health');
        break;

      case 'matrix':
        toggleMatrix();
        break;

      case 'resume':
        printResume();
        break;

      case 'contact':
        printContact();
        break;

      case 'clear':
        const termOutput = document.getElementById('term-output');
        if (termOutput) termOutput.innerHTML = '';
        break;

      case 'exit':
        const modal = document.getElementById('cyber-terminal-modal');
        if (modal) modal.classList.remove('open');
        stopMatrix();
        break;

      default:
        printLine(`<div class="term-err">Command not found: '${escapeHtml(cmdStr)}'. Type <span style="color:var(--c1);">help</span> for available commands.</div>`);
        break;
    }
  }

  function printHelp() {
    let out = '<div style="margin:8px 0; color:var(--c1); font-weight:600;">AVAILABLE TERMINAL COMMANDS:</div><table style="width:100%;font-size:12px;border-collapse:collapse;">';
    for (const [cmd, desc] of Object.entries(COMMANDS)) {
      out += `<tr><td style="color:var(--c3);padding:3px 14px 3px 0;white-space:nowrap;font-weight:600;">${cmd}</td><td style="color:var(--muted);">${desc}</td></tr>`;
    }
    out += '</table>';
    printLine(out);
  }

  function printWhoami() {
    printLine(`
<div style="margin:8px 0; line-height:1.6;">
  <div><span style="color:var(--c1);font-weight:600;">NAME:</span> Rahul A</div>
  <div><span style="color:var(--c1);font-weight:600;">ROLE:</span> Software &amp; AI Engineering Intern · Cybersecurity Specialist</div>
  <div><span style="color:var(--c1);font-weight:600;">LOCATION:</span> Bengaluru, Karnataka, India (560079)</div>
  <div><span style="color:var(--c1);font-weight:600;">EDUCATION:</span> B.Tech in Digital Transformation, Atria University (2024–2028)</div>
  <div><span style="color:var(--c1);font-weight:600;">PRIMARY DOMAIN:</span> <span style="color:var(--c5);">Cybersecurity</span> (VAPT, Ethical Hacking, OWASP Top 10, ECDSA Cryptography)</div>
  <div><span style="color:var(--c1);font-weight:600;">SECONDARY:</span> Full-Stack Systems, High-Concurrency WebSockets/Queues, Supervised ML</div>
  <div><span style="color:var(--c1);font-weight:600;">TRACK RECORD:</span> 9 Live Commercial Production Apps Shipped at OpenAlgon / Decembay</div>
</div>
    `);
  }

  async function printProjects(flag) {
    try {
      const res = await fetch(`${API_BASE}/api/projects`);
      const { data } = await res.json();
      let list = data || [];

      if (flag === '--prod') list = list.filter(p => p.category === 'production');
      if (flag === '--flagship') list = list.filter(p => p.category === 'flagship');

      let out = `<div style="margin:8px 0;color:var(--c1);font-weight:600;">CATALOG (${list.length} PROJECTS LOADED):</div>`;
      list.forEach((p, i) => {
        const num = String(i + 1).padStart(2, '0');
        const url = p.links?.live || p.links?.github || 'Internal';
        out += `<div style="padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.04);display:flex;justify-content:space-between;gap:12px;">
          <span><span style="color:var(--c4);">[${num}]</span> <strong style="color:#fff;">${p.title}</strong> <span style="color:var(--muted);">// ${p.tagline}</span></span>
          <span style="color:var(--c1);white-space:nowrap;">${url}</span>
        </div>`;
      });
      printLine(out);
    } catch (_) {
      printLine('<div class="term-err">Error querying /api/projects.</div>');
    }
  }

  function printSkills() {
    printLine(`
<div style="margin:8px 0;">
  <div style="color:var(--c5);font-weight:600;margin-top:6px;">[1] CYBERSECURITY &amp; DEFENSE</div>
  <div style="color:var(--muted);">VAPT ████████████ 95% | OWASP Top 10 ████████████ 95% | Burp/Nmap ██████████ 85% | ECDSA/SHA-256 ██████████ 90%</div>
  
  <div style="color:var(--c4);font-weight:600;margin-top:6px;">[2] FULL-STACK SYSTEMS</div>
  <div style="color:var(--muted);">React/Next.js/TypeScript ████████████ 95% | Node.js/Express ████████████ 95% | PostgreSQL/Supabase ██████████ 90% | WebSockets/BullMQ ████████ 80%</div>

  <div style="color:var(--c3);font-weight:600;margin-top:6px;">[3] DATA SCIENCE &amp; ML</div>
  <div style="color:var(--muted);">Python (Scikit-learn, Pandas) ██████████ 90% | Zero-Leakage ML Pipelines (AUC 0.816) ██████████ 90% | Gemini AI ██████████ 90%</div>
</div>
    `);
  }

  function printCerts() {
    printLine(`
<div style="margin:8px 0;">
  <div style="color:var(--c1);font-weight:600;">VERIFIED CREDENTIALS &amp; CERTIFICATIONS:</div>
  <div>▸ <strong style="color:#fff;">Cybersecurity Analyst Job Simulation</strong> — Tata &amp; Forage</div>
  <div>▸ <strong style="color:#fff;">Data Visualisation: Empowering Business with Insights</strong> — Tata &amp; Forage</div>
  <div>▸ <strong style="color:#fff;">India Sustainability Startathon</strong> — The Future Founders Co.</div>
  <div>▸ <strong style="color:#fff;">STEM University Courses</strong> — Atria University, Bengaluru</div>
</div>
    `);
  }

  // Interactive Live VAPT Penetration Test Simulation
  async function runVaptScan() {
    printLine('<div style="color:var(--c1);margin:8px 0;">[*] INITIATING AUTOMATED VAPT PENETRATION AUDIT AGAINST PORTFOLIO ENGINE...</div>');
    const steps = [
      { text: '[+] Testing HTTP Security Headers (Helmet CSP, HSTS, X-Frame-Options)...', res: 'PASS (HARDENED)', color: 'var(--c3)' },
      { text: '[+] Probing Stored XSS injection on /api/contact...', res: 'SANITIZED (HTML ENTITY ESCAPED)', color: 'var(--c3)' },
      { text: '[+] Probing SQL Injection & JSON Query Tampering on /api/projects...', res: 'IMMUNE (TYPE-SAFE SCHEMA)', color: 'var(--c3)' },
      { text: '[+] Triggering Anti-Bot Honeypot Trapping (_gotcha field)...', res: 'TRAPPED (SILENT BOT QUARANTINE)', color: 'var(--c3)' },
      { text: '[+] Flood Testing Rate Limiter (Simulating 50 Rapid Submissions)...', res: '429 THROTTLED (IP RATE-LIMITED)', color: 'var(--c3)' },
      { text: '[+] Auditing Timing Attack Vulnerability on Admin Password Verifier...', res: 'CRYPTO.TIMINGSAFE EQUAL (PASS)', color: 'var(--c3)' }
    ];

    for (const s of steps) {
      await new Promise(r => setTimeout(r, 260));
      printLine(`<div>${s.text} <span style="color:${s.color};font-weight:600;">${s.res}</span></div>`);
      scrollBottom();
    }

    await new Promise(r => setTimeout(r, 200));
    printLine(`
<div style="background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.4);padding:10px;border-radius:6px;margin-top:10px;color:var(--c3);">
  ✔ VAPT AUDIT COMPLETE: 6/6 SECURITY CONTROLS VERIFIED. ZERO HIGH/CRITICAL VULNERABILITIES FOUND.
</div>
    `);
  }

  // Interactive 6-Vector Cryptographic Exploit Suite Simulation
  async function runCryptoSimulation() {
    printLine('<div style="color:var(--c5);margin:8px 0;">[*] RUNNING 6-VECTOR EXPLOIT SUITE: Minimal Digital Cash Ledger (Python / secp256k1)...</div>');
    const attacks = [
      { name: 'Double-Spend Attack', desc: 'Attempting to spend already committed UTXO output #4a2f', status: 'BLOCKED (Double-spend detected)' },
      { name: 'Signature Forgery', desc: 'Crafting counterfeit secp256k1 signature without private key', status: 'BLOCKED (ECDSA verify failed)' },
      { name: 'Replay Attack', desc: 'Re-broadcasting previously signed transaction payload', status: 'BLOCKED (Nonce expired)' },
      { name: 'Nonce Rejection', desc: 'Injecting out-of-order counter nonces to bypass sequence', status: 'BLOCKED (Sequence invalidated)' },
      { name: 'Balance Underflow', desc: 'Submitting transaction debiting balance below zero', status: 'BLOCKED (Insufficient balance)' },
      { name: 'Merkle Hash Tampering', desc: 'Silently modifying single byte in historic transaction ledger', status: 'BLOCKED (SHA-256 chain mismatch)' }
    ];

    for (let i = 0; i < attacks.length; i++) {
      const a = attacks[i];
      await new Promise(r => setTimeout(r, 280));
      printLine(`<div><span style="color:var(--c4);">[VECTOR ${i + 1}/6] ${a.name}:</span> ${a.desc} ➔ <strong style="color:var(--c3);">${a.status}</strong></div>`);
      scrollBottom();
    }

    await new Promise(r => setTimeout(r, 200));
    printLine(`
<div style="background:rgba(0,212,255,0.1);border:1px solid rgba(0,212,255,0.4);padding:10px;border-radius:6px;margin-top:10px;color:var(--c1);">
  ✔ CRYPTO SIMULATION PASSED: 100% OF ADVERSARIAL VECTORS MITIGATED MATHEMATICALLY.
</div>
    `);
  }

  async function runCurl(path) {
    const url = path.startsWith('http') ? path : `${API_BASE}${path.startsWith('/') ? path : '/' + path}`;
    printLine(`<div class="term-dim">[*] Probing HTTP GET ${escapeHtml(url)} ...</div>`);
    try {
      const start = performance.now();
      const res = await fetch(url);
      const time = Math.round(performance.now() - start);
      const data = await res.json();
      printLine(`<div style="color:var(--c3);">HTTP ${res.status} OK (${time}ms)</div>`);
      printLine(`<pre style="color:#dde6f5;background:#050810;padding:10px;border-radius:6px;max-height:180px;overflow-y:auto;">${escapeHtml(JSON.stringify(data, null, 2))}</pre>`);
    } catch (err) {
      printLine(`<div class="term-err">Curl failed: ${escapeHtml(err.message)}</div>`);
    }
  }

  function toggleMatrix() {
    if (isMatrixRunning) {
      stopMatrix();
      printLine('<div class="term-dim">Matrix rain terminated.</div>');
    } else {
      startMatrix();
      printLine('<div style="color:var(--c3);">Matrix rain initiated. Type \'matrix\' again or press Escape to stop.</div>');
    }
  }

  function startMatrix() {
    const canvas = document.getElementById('term-matrix-canvas');
    if (!canvas) return;
    canvas.style.display = 'block';
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;

    const chars = '0123456789ABCDEFRAHULCYBERVAPT';
    const fontSize = 12;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array(columns).fill(1);

    isMatrixRunning = true;
    matrixInterval = setInterval(() => {
      ctx.fillStyle = 'rgba(5, 8, 16, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#00d4ff';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }, 40);
  }

  function stopMatrix() {
    isMatrixRunning = false;
    if (matrixInterval) clearInterval(matrixInterval);
    const canvas = document.getElementById('term-matrix-canvas');
    if (canvas) canvas.style.display = 'none';
  }

  function printResume() {
    printLine(`
<div style="margin:8px 0;">
  <div style="color:var(--c1);font-weight:600;">RESUME SUMMARY:</div>
  <div>Rahul A — B.Tech Digital Transformation (Atria University) · AI &amp; Full Stack Intern (OpenAlgon)</div>
  <div style="margin-top:6px;"><a href="/api/resume/download" target="_blank" style="color:var(--c3);text-decoration:underline;">[Download Official Resume PDF]</a></div>
</div>
    `);
  }

  function printContact() {
    printLine(`
<div style="margin:8px 0;">
  <div><span style="color:var(--c1);">EMAIL:</span> <a href="mailto:rahuldheeraj.anil@gmail.com" style="color:#fff;">rahuldheeraj.anil@gmail.com</a></div>
  <div><span style="color:var(--c1);">LINKEDIN:</span> <a href="https://linkedin.com/in/rahul-a-200618-ln" target="_blank" style="color:#fff;">linkedin.com/in/rahul-a-200618-ln</a></div>
  <div><span style="color:var(--c1);">GITHUB:</span> <a href="https://github.com/rahul200618" target="_blank" style="color:#fff;">github.com/rahul200618</a></div>
</div>
    `);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTerminal);
  } else {
    initTerminal();
  }
})();
