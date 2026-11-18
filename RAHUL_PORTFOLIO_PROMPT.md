# RAHUL A. — COMPLETE PORTFOLIO DATA DOCUMENT
> Use this file as a prompt/source-of-truth for AI tools, PDF generators, or future portfolio rebuilds.

---

## 👤 IDENTITY & CONTACT

| Field | Value |
|---|---|
| **Full Name** | Rahul A. |
| **Email** | rahuldheeraj.anil@gmail.com |
| **GitHub** | https://github.com/rahul200618 |
| **LinkedIn** | https://www.linkedin.com/in/rahul-a-200618-ln |
| **Portfolio** | *(this repo / deployed URL)* |

---

## 🎓 EDUCATION

**B.Tech — Digital Transformation**
Atria University, Bengaluru
2024 – 2028 (Expected)

---

## 💼 PROFESSIONAL EXPERIENCE

### 1. AI & Full-Stack Systems Intern — OpenAlgon Technologies
**Duration:** 2024 – Present
**Company URL:** https://openalgon.com
**Role summary:** Design, develop and ship full-stack AI-integrated production applications serving real commercial clients. Independently own features end-to-end — from DB schema to frontend deployment.

---

### 2. Powertrain & Electrical Systems Engineer — RevX Atria (Formula Student)
**Duration:** 2024 – Present
**Event:** Formula Bharat 2026 | Car: **E17 (Electric Vehicle)**

**Technical contributions:**
- CAN Bus telemetry architecture design
- Battery Management System (BMS) design and integration
- High-voltage isolation loop implementation
- Motor controller synchronisation
- Cell thermal monitoring system
- High-voltage safety interlock circuits

---

## 🚀 LIVE COMMERCIAL PRODUCTION APPS (9 Apps — OpenAlgon Internship)

> All apps are live, production-grade, and were independently built during internship.

---

### App 1 — RankPrediction
- **Live URL:** https://rankprediction.com
- **GitHub:** https://github.com/rahul200618/Rankpredictor
- **Tech Stack:** Next.js, Node.js, PostgreSQL, TailwindCSS
- **Description:** AI-powered academic rank estimation platform for competitive exam aspirants. Processes thousands of exam scores to deliver sub-100ms rank predictions.
- **Key Achievement:** Sub-100ms rank estimation at scale; real-time percentile calculation engine.

---

### App 2 — AgriArchives
- **Live URL:** https://agriarchives.in
- **GitHub:** *(private)*
- **Tech Stack:** Django, Python, PostgreSQL, AWS S3
- **Description:** A research publication and archival repository for the agriculture sector. Supports document uploads, metadata tagging, and advanced full-text search.

---

### App 3 — AgriCatalogues
- **Live URL:** https://www.agricatalogues.in/
- **GitHub:** *(private)*
- **Tech Stack:** React, Node.js, MongoDB
- **Description:** A comprehensive farm equipment and agricultural product directory. Enables vendors to list products and buyers to discover and compare agricultural equipment.

---

### App 4 — Krishikuta
- **Live URL:** https://krishikuta.com/
- **GitHub:** https://github.com/rahul200618/krushikuta
- **Tech Stack:** React, Node.js, PostgreSQL, Redis
- **Description:** Farmer community marketplace with live APMC mandi (wholesale market) commodity rates. Connects farmers directly with buyers and provides real-time pricing data.
- **Key Feature:** Live APMC mandi rate integration with Redis caching for performance.

---

### App 5 — Agro ERP (Field Flow)
- **Live URL:** https://agro.openalgon.com/
- **GitHub:** *(private)*
- **Tech Stack:** React, Node.js, PostgreSQL, Docker
- **Description:** Enterprise farm operations management portal. Features field geofencing, crop lifecycle tracking, workforce scheduling, and harvest analytics for large agri-businesses.
- **Key Feature:** GPS-based geofencing for field boundary management.

---

### App 6 — Bluedot Immigrations
- **Live URL:** https://bluedotimmigrations.com
- **GitHub:** *(private)*
- **Tech Stack:** Next.js, TailwindCSS, Node.js, MongoDB
- **Description:** Immigration consultancy platform with visa eligibility calculators, document checklist generators, and appointment booking for global immigration services.

---

### App 7 — Shree Udupi Aramane
- **Live URL:** https://shreeudupiaramane.com/
- **GitHub:** *(private)*
- **Tech Stack:** React, Node.js, PostgreSQL, WhatsApp API
- **Description:** Heritage resort reservation platform with real-time room occupancy tracking, online booking, and WhatsApp API integration for instant reservation confirmations.
- **Key Feature:** Real-time occupancy dashboard + WhatsApp booking confirmations.

---

### App 8 — Abhyas Nepal
- **Live URL:** https://abhyas.pro/
- **GitHub:** *(private)*
- **Tech Stack:** React, Node.js, MongoDB, TailwindCSS
- **Description:** National exam simulation platform for Nepali students preparing for engineering and medical entrance exams. Features mock test series, timed assessments, and performance analytics.

---

### App 9 — Nepal CEE College Predictor
- **Live URL:** https://nepal-college-predictor.pages.dev/
- **GitHub:** *(private)*
- **Tech Stack:** Cloudflare Pages, JavaScript, HTML5
- **Description:** Medical and engineering seat allotment predictor for Nepal's Common Entrance Exam (CEE). Students input their rank to predict which colleges and programs they qualify for.

---

## 🔬 PROOF-OF-WORK CAPSTONES (Personal Projects)

---

### Capstone 1 — Minimal Digital Cash System & Cryptographic Ledger
- **GitHub:** https://github.com/rahul200618/Minimal-Digital-Cash-System-Cryptography
- **Tech Stack:** Python 3.12, ECDSA secp256k1, SHA-256
- **Description:** A from-scratch implementation of a cryptographic digital cash system with no external blockchain libraries. Implements wallet key generation, transaction signing, Merkle tree construction, and a UTXO-based ledger.
- **Key Achievement:** `attack_simulation.py` — a 6-vector adversarial test suite covering:
  1. Double-spend attack — BLOCKED
  2. Signature forgery — BLOCKED
  3. Replay attack — BLOCKED
  4. Nonce rejection — BLOCKED
  5. Balance underflow — BLOCKED
  6. Merkle hash tampering — BLOCKED
  - **All 6 attacks pass (i.e., all were correctly rejected by the system).**
- **Highlight:** Zero use of external blockchain libraries; pure Python elliptic curve arithmetic on secp256k1.

---

### Capstone 2 — Wine Quality Supervised ML Pipeline
- **GitHub:** https://github.com/rahul200618/wine-quality-ml
- **Tech Stack:** Scikit-Learn, XGBoost, RandomForest, Logistic Regression, Pandas, NumPy, Matplotlib, Seaborn
- **Description:** End-to-end ML pipeline for wine quality binary classification. Benchmarks three models with strict zero-leakage preprocessing methodology.
- **Key Achievement:**
  - **AUC-ROC: 0.816** (XGBoost, best model)
  - **F1 Score: 0.78** (XGBoost)
  - Zero data leakage: StandardScaler fitted only on train partition
  - Stratified 60/20/20 train/validation/test split
  - 3 models benchmarked with full ROC curve analysis

---

### Capstone 3 — Symbio Insight (Bioinformatics + Gemini AI)
- **Live:** https://symbio-insight-app-1.onrender.com
- **GitHub:** https://github.com/rahul200618/symbio-insight-app
- **Tech Stack:** BioPython, Google Gemini API, React, FastAPI
- **Description:** A bioinformatics web application for DNA and RNA sequence analysis. Users upload or paste sequences to receive AI-powered mutation impact summaries, GC content analysis, and reading frame predictions.
- **Key Feature:** Gemini AI integration for natural-language mutation impact explanations from raw genomic data.

---

### Capstone 4 — Curated Cinema (Indie Streaming Platform)
- **Live:** https://curated-cinema-indie-stream-hub.lovable.app
- **Tech Stack:** React, Video.js, TMDB API, TailwindCSS
- **Description:** An independent film discovery and streaming hub. Curates indie and arthouse content using TMDB API with custom curation logic and a clean, cinema-inspired UI.

---

## 🛠️ TECHNICAL SKILLS

### Cybersecurity
- VAPT (Vulnerability Assessment & Penetration Testing)
- OWASP Top 10
- Burp Suite Pro
- Nmap, Wireshark, Metasploit
- ECDSA secp256k1, SHA-256
- Linux Kernel Hardening
- Zero-Trust Network Access (ZTNA)
- Adversarial Testing & Attack Simulation

### Full-Stack Development
- **Frontend:** React, Next.js, TailwindCSS, HTML5, JavaScript
- **Backend:** Node.js, Express, Python, Django, FastAPI
- **Databases:** PostgreSQL, MongoDB, Redis
- **Infrastructure:** Docker, AWS (S3, EC2), Cloudflare Pages & Workers
- **APIs:** REST, WebSocket, WhatsApp Business API

### Machine Learning & AI
- Scikit-Learn, XGBoost, RandomForest, Logistic Regression
- Zero-Leakage Preprocessing pipelines
- Google Gemini API
- BioPython (DNA/RNA sequence analysis)
- Pandas, NumPy, Matplotlib, Seaborn
- Stratified K-Fold cross-validation
- ROC-AUC, F1, Precision-Recall evaluation

### Embedded Systems & EV
- CAN Bus Protocol
- Battery Management Systems (BMS)
- Formula Student EV Telemetry
- C / Embedded C
- High-Voltage Safety Interlocks
- Motor Controller Integration

---

## 📊 KEY METRICS & ACHIEVEMENTS

| Metric | Value |
|---|---|
| Live production apps shipped | **9** |
| Adversarial attack vectors blocked | **6/6** |
| ML model AUC-ROC (XGBoost) | **0.816** |
| Rank prediction latency | **< 100ms** |
| Formula Student EV car | **E17 (2026)** |
| GitHub (personal projects) | **rahul200618** |
| Internship duration | **2024 – Present** |

---

## 📁 RESUME

**File:** `Rahul_Resume4.3.pdf` *(located in Portfolio/ directory)*

---

## 🤖 AI GENERATION PROMPT

> Use the following prompt with any AI (Claude, Gemini, ChatGPT) to generate a portfolio, resume, or cover letter from this data:

```
You are a senior technical portfolio designer. Using the data below, generate a [portfolio website / PDF resume / cover letter] for Rahul A., a B.Tech Digital Transformation student at Atria University Bengaluru (2024–2028) who is simultaneously:

1. An AI & Full-Stack Systems Intern at OpenAlgon Technologies who has independently shipped 9 live commercial production applications
2. A Powertrain & Electrical Systems Engineer on the Formula Bharat 2026 electric vehicle team (Car E17)
3. A self-driven developer with 4 proof-of-work capstone projects spanning cryptography, ML, bioinformatics, and streaming

Key data file: [paste the contents of this RAHUL_PORTFOLIO_PROMPT.md file here]

Design requirements:
- Tone: Confident, technical, builder-first. Not generic.
- Show real URLs, real GitHub links, real metrics.
- Emphasize: shipping real commercial products at scale while still in first year of college.
- Contact: rahuldheeraj.anil@gmail.com | GitHub: https://github.com/rahul200618 | LinkedIn: https://www.linkedin.com/in/rahul-a-200618-ln
```

---

*Last updated: October 2026*
*Document version: 1.0*
