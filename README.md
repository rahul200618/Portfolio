# 🚀 Rahul A. — Full-Stack Portfolio & API System

> A production-grade, full-stack engineering portfolio powered by **Node.js**, **Express**, **REST APIs**, **ACID-safe persistent storage**, and interactive **Three.js 3D canvas** graphics.

**Live Demo:** [rahul200618.github.io/Portfolio](https://rahul200618.github.io/Portfolio/) · **GitHub:** [github.com/rahul200618](https://github.com/rahul200618) · **LinkedIn:** [linkedin.com/in/rahul-a-200618-ln](https://www.linkedin.com/in/rahul-a-200618-ln)

---

## 🏗️ Architecture Overview

```
                      ┌──────────────────────────────────────────────┐
                      │              Browser / Client UI             │
                      │  Three.js 3D Canvas · Outfit / Bebas Fonts   │
                      │  Dynamic Projects Filter · Interactive Form  │
                      └──────────────┬───────────────────────────────┘
                                     │ HTTP / Fetch
                                     ▼
                      ┌──────────────────────────────────────────────┐
                      │             Express.js Server                │
                      │  Helmet CSP · CORS · IP Rate Limiting        │
                      │  OWASP Input Sanitization · Honeypot Guard   │
                      └───────┬──────────────────────────────┬───────┘
                              │                              │
                     REST API │                     Static   │
                              ▼                              ▼
    ┌───────────────────────────────────┐    ┌───────────────────────────┐
    │          API Controllers          │    │      Public Assets        │
    │  • /api/contact                   │    │  • index.html & admin.html│
    │  • /api/projects                  │    │  • CSS / Three.js / JS    │
    │  • /api/stats & telemetry         │    │  • Tracked Resume PDF     │
    │  • /api/admin console             │    └───────────────────────────┘
    └─────────────────┬─────────────────┘
                      │
                      ▼
    ┌───────────────────────────────────┐
    │     Data Persistence Layer        │
    │  • messages.json (inquiries)      │
    │  • analytics.json (visits, logs)  │
    │  • projects.json (16 projects)    │
    │  • admin.json (scrypt hash)       │
    │  Atomic writes via temp-renaming  │
    └───────────────────────────────────┘
```

---

## ⚡ Quickstart

### 1. Prerequisites
- **Node.js** (v18.0.0 or higher; developed on Node v24)
- **npm** (v9.0.0 or higher)

### 2. Installation
```bash
cd Portfolio
npm install
```

### 3. Running Locally
Start in development mode with automatic file watching:
```bash
npm run dev
```

Or start the production server:
```bash
npm start
```

Open your browser at:
- **Portfolio:** [http://localhost:5000](http://localhost:5000)
- **Admin Console:** [http://localhost:5000/admin](http://localhost:5000/admin) *(Default dev password: `admin12345`)*
- **API Health:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

### 💡 Interactive Developer & Security Features
- **Cyber Terminal CLI:** Press `` ` `` (backtick) or click `[ >_ TERMINAL CLI ]` in the bottom-left corner:
  - `vapt --scan`: Interactive simulated OWASP & API penetration test against the portfolio backend.
  - `crypto --simulate`: Runs the 6-vector exploit suite from the Digital Cash protocol.
  - `curl <url>`: Probe live REST endpoints (`curl /api/health`, `curl /api/stats`, `curl /api/projects`).
  - `matrix`: Falling green digital rain animation.
- **"Rahul-Bot" AI Agent:** Click `[ 🤖 ASK RAHUL-BOT ]` in the bottom-right corner to query Rahul's master career record, 9 live production apps, ML architecture, and hiring details in real time. Powered by Google Gemini API or zero-latency local fallback.

### 4. Run Automated Test Suite
```bash
npm test
```
Runs built-in tests covering endpoints, input validation, rate limiting, and admin authentication.

---

## 📡 REST API Reference

| Endpoint | Method | Description | Security / Rate Limit |
|---|---|---|---|
| `/api/health` | `GET` | Server health, uptime, memory & Node runtime info | Public |
| `/api/stats` | `GET` | Dynamic statistics (project count, live visits, downloads) | Public |
| `/api/projects` | `GET` | Catalog of 16 projects with category & search queries (`?category=...&search=...`) | Public |
| `/api/projects/:id` | `GET` | Detailed project specification by ID | Public |
| `/api/skills` | `GET` | Grouped skill taxonomy across 4 domains | Public |
| `/api/contact` | `POST` | Submit contact inquiry (sanitized, honeypot protected) | 8 submissions / hr / IP |
| `/api/chat` | `POST` | Query Rahul-Bot AI Career Agent (Gemini API or local knowledge engine) | 40 queries / 15 min / IP |
| `/api/analytics/visit` | `POST` | Record page visit & visitor browser telemetry | Public |
| `/api/resume/download` | `GET` | Tracked resume download counter and streams PDF | Public |
| `/api/admin/login` | `POST` | Authenticate admin with password; returns 24h HMAC token | 10 attempts / 15 min |
| `/api/admin/messages` | `GET` | Fetch all received contact inquiries | Bearer Token Required |
| `/api/admin/messages/:id/read` | `PATCH` | Mark inquiry as read | Bearer Token Required |
| `/api/admin/messages/:id` | `DELETE` | Permanently delete inquiry from database | Bearer Token Required |
| `/api/admin/analytics` | `GET` | Detailed analytics breakdown and recent visitor sessions | Bearer Token Required |

---

## 🛡️ Security & Full-Stack Hardening

As a cybersecurity-focused engineer, this backend is built following **OWASP Top 10** standards:
1. **Strict Content Security Policy (CSP):** Configured via `helmet` to allow only vetted CDNs (Three.js, Google Fonts) and block arbitrary external injection.
2. **XSS Sanitization:** All incoming text strings are HTML entity-encoded (`&lt;`, `&gt;`, `&quot;`, `&#x27;`) prior to database storage.
3. **Anti-Spam Honeypot:** Form features hidden honeypot traps (`_gotcha`) that silently filter automated bots without exposing system internals.
4. **Rate Limiting:** Global rate limiting (300 req / 15 min), strict contact form throttling (8 submissions / hour), and brute-force protection on `/api/admin/login` (10 attempts / 15 min).
5. **Timing-Safe Crypto:** Admin password hashing uses Node's native `crypto.scryptSync` with unique salts, and verification utilizes `crypto.timingSafeEqual` to eliminate side-channel timing attacks.
6. **Atomic File Persistence:** Data layer writes to temporary files before atomic file renaming (`fs.renameSync`), eliminating risk of JSON corruption upon sudden process terminations.

---

## ⚙️ Environment Configuration (`.env`)

Copy `.env.example` to `.env` and customize:

```ini
PORT=5000
NODE_ENV=development

# Admin Authentication
ADMIN_SECRET_KEY=your_secret_hmac_key_here
ADMIN_PASSWORD=admin12345

# Optional SMTP Email Notifications
# If left unset, contact submissions are stored safely in data/messages.json
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
CONTACT_RECEIVER_EMAIL=rahuldheeraj.anil@gmail.com

ALLOWED_ORIGINS=http://localhost:5000,http://127.0.0.1:5000
```

---

## 🚢 Deployment Options

### Render / Railway / Docker
A production `Dockerfile` is included:
```bash
docker build -t rahul-portfolio .
docker run -p 5000:5000 rahul-portfolio
```

On **Render** or **Railway**:
1. Connect this GitHub repository.
2. Build command: `npm install`
3. Start command: `node server.js`
4. Set environment variable `NODE_ENV=production`.
