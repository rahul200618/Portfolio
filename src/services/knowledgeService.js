import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { createRequire } from 'module';
import { config } from '../config/index.js';

const require = createRequire(import.meta.url);
let PDFParse;
try {
  const pdfModule = require('pdf-parse');
  PDFParse = pdfModule.PDFParse || pdfModule;
} catch (e) {
  console.warn('[KNOWLEDGE SERVICE] pdf-parse module warning:', e.message);
}

// Helper to strip HTML tags and normalize text
function stripHtml(htmlSnippet) {
  if (!htmlSnippet) return '';
  return htmlSnippet
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<svg[\s\S]*?<\/svg>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

// Extract human-readable text from sections in index.html
function extractHtmlSections(html) {
  const sections = {};
  const sectionRegex = /<section[^>]*id=["']([^"']+)["'][^>]*>([\s\S]*?)<\/section>/gi;
  let match;
  while ((match = sectionRegex.exec(html)) !== null) {
    const id = match[1].toLowerCase();
    sections[id] = stripHtml(match[2]);
  }
  return sections;
}

class KnowledgeService {
  constructor() {
    this.rootDir = config.paths.root;
    this.dataDir = config.paths.data;
    this.publicDir = config.paths.public;

    this.lastBuildTimestamp = 0;
    this.fileTimestamps = new Map(); // filePath -> mtimeMs
    this.watchers = [];
    this.pdfCache = new Map(); // filePath -> { mtimeMs, text }

    // Cached Ingested Data
    this.projects = [];
    this.skills = [];
    this.resumeData = {
      primaryFile: null,
      extractedText: '',
      allFiles: []
    };
    this.documentationText = '';
    this.websiteSections = {};
    this.masterContextPrompt = '';
    this.dynamicSuggestionsBank = {
      production: [],
      cybersecurity: [],
      machineLearning: [],
      engineering: [],
      hiring: [],
      projects: []
    };

    this.debounceTimer = null;
    this.isBuilding = false;
  }

  // Initialize service, build first context and start watchers
  async init() {
    console.log('[KNOWLEDGE SERVICE] Initializing dynamic portfolio knowledge engine...');
    await this.build();
    this.startWatchers();
  }

  // Watch key directories for changes (ignoring runtime analytics and ephemeral writes)
  startWatchers() {
    const watchTargets = [
      this.dataDir,
      this.rootDir,
      this.publicDir
    ];

    watchTargets.forEach(target => {
      if (fs.existsSync(target)) {
        try {
          const watcher = fs.watch(target, { recursive: false }, (eventType, filename) => {
            if (!filename) return;
            const lowerName = filename.toLowerCase();
            const ext = path.extname(lowerName);

            // Ignore dynamic runtime logs, analytics writes, messages, and temp files
            const ignoredFiles = ['analytics.json', 'messages.json', 'admin.json'];
            if (ignoredFiles.includes(lowerName) || lowerName.endsWith('.tmp') || lowerName.startsWith('.')) {
              return;
            }

            const relevantExtensions = ['.json', '.pdf', '.md', '.html'];
            if (relevantExtensions.includes(ext) || lowerName.includes('resume') || lowerName.includes('project') || lowerName.includes('skill')) {
              this.scheduleRebuild(`Detected ${eventType} in ${filename}`);
            }
          });
          this.watchers.push(watcher);
        } catch (err) {
          console.warn(`[KNOWLEDGE SERVICE] fs.watch warning on ${target}:`, err.message);
        }
      }
    });

    console.log('[KNOWLEDGE SERVICE] Active auto-sync watchers registered for data, root, and public directories.');
  }

  // Debounce rebuild to prevent thrashing on rapid file saves
  scheduleRebuild(reason = '') {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(async () => {
      console.log(`[KNOWLEDGE AUTO-SYNC] ${reason} — Rebuilding knowledge base...`);
      await this.build();
    }, 250);
  }

  // Get list of all monitored files and their current mtime
  getMonitoredFiles() {
    const monitored = [];

    // 1. Data JSON files
    const projectsFile = path.join(this.dataDir, 'projects.json');
    const skillsFile = path.join(this.dataDir, 'skills.json');
    if (fs.existsSync(projectsFile)) monitored.push(projectsFile);
    if (fs.existsSync(skillsFile)) monitored.push(skillsFile);

    // 2. HTML files
    const rootHtml = path.join(this.rootDir, 'index.html');
    const publicHtml = path.join(this.publicDir, 'index.html');
    if (fs.existsSync(rootHtml)) monitored.push(rootHtml);
    if (fs.existsSync(publicHtml) && publicHtml !== rootHtml) monitored.push(publicHtml);

    // 3. Markdown files
    ['PORTFOLIO_DOCUMENTATION.md', 'RAHUL_PORTFOLIO_PROMPT.md', 'README.md'].forEach(mdName => {
      const p = path.join(this.rootDir, mdName);
      if (fs.existsSync(p)) monitored.push(p);
    });

    // 4. PDFs in root and public
    [this.rootDir, this.publicDir].forEach(dir => {
      if (fs.existsSync(dir)) {
        try {
          const entries = fs.readdirSync(dir);
          entries.forEach(entry => {
            if (entry.toLowerCase().endsWith('.pdf')) {
              monitored.push(path.join(dir, entry));
            }
          });
        } catch (_) {}
      }
    });

    // Deduplicate
    return Array.from(new Set(monitored));
  }

  // Check if any tracked file has changed since last build
  hasChanges() {
    const currentFiles = this.getMonitoredFiles();
    
    // Check if tracked files count changed
    if (currentFiles.length !== this.fileTimestamps.size) {
      return true;
    }

    for (const filePath of currentFiles) {
      try {
        const stats = fs.statSync(filePath);
        const lastMtime = this.fileTimestamps.get(filePath);
        if (!lastMtime || stats.mtimeMs > lastMtime) {
          return true;
        }
      } catch (_) {
        return true;
      }
    }
    return false;
  }

  // Guarantee up-to-date knowledge context on every request
  async getOrRefreshContext() {
    if (this.hasChanges()) {
      console.log('[KNOWLEDGE SERVICE] Stale cache detected on inquiry. Performing immediate synchronization...');
      await this.build();
    }
    return {
      masterContextPrompt: this.masterContextPrompt,
      projects: this.projects,
      skills: this.skills,
      resumeData: this.resumeData,
      websiteSections: this.websiteSections,
      dynamicSuggestionsBank: this.dynamicSuggestionsBank,
      lastBuildTimestamp: this.lastBuildTimestamp
    };
  }

  // Main build method: ingests and compiles all dynamic sources
  async build() {
    if (this.isBuilding) return;
    this.isBuilding = true;

    try {
      const buildStart = Date.now();
      const monitored = this.getMonitoredFiles();

      // Update timestamps
      monitored.forEach(f => {
        try {
          const stat = fs.statSync(f);
          this.fileTimestamps.set(f, stat.mtimeMs);
        } catch (_) {}
      });

      // 1. Ingest Projects JSON
      const projectsPath = path.join(this.dataDir, 'projects.json');
      if (fs.existsSync(projectsPath)) {
        try {
          const raw = fs.readFileSync(projectsPath, 'utf8');
          this.projects = JSON.parse(raw);
        } catch (e) {
          console.error('[KNOWLEDGE SERVICE] Error loading projects.json:', e.message);
        }
      }

      // 2. Ingest Skills JSON
      const skillsPath = path.join(this.dataDir, 'skills.json');
      if (fs.existsSync(skillsPath)) {
        try {
          const raw = fs.readFileSync(skillsPath, 'utf8');
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            this.skills = parsed;
          } else if (typeof parsed === 'object' && parsed !== null) {
            this.skills = Object.entries(parsed).map(([key, cat]) => ({
              key,
              category: cat.title || key,
              title: cat.title || key,
              subtitle: cat.subtitle || '',
              icon: cat.icon || '',
              badgeColor: cat.badgeColor || '',
              skills: Array.isArray(cat.skills)
                ? cat.skills.map(s => (typeof s === 'string' ? { name: s, level: 90 } : s))
                : []
            }));
          } else {
            this.skills = [];
          }
        } catch (e) {
          console.error('[KNOWLEDGE SERVICE] Error loading skills.json:', e.message);
          this.skills = [];
        }
      }

      // 3. Ingest Resume PDFs via pdf-parse
      await this.ingestPdfs();

      // 4. Ingest Website HTML
      this.ingestWebsiteHtml();

      // 5. Ingest Documentation Markdown
      this.ingestDocumentation();

      // 6. Build Master Context System Prompt
      this.masterContextPrompt = this.compileMasterContext();

      // 7. Build Dynamic Suggestions Bank
      this.compileDynamicSuggestions();

      this.lastBuildTimestamp = Date.now();
      console.log(`[KNOWLEDGE SERVICE] Build completed in ${Date.now() - buildStart}ms. Projects: ${this.projects.length}, Resumes: ${this.resumeData.allFiles.length}, Resume Chars: ${this.resumeData.extractedText.length}`);
    } catch (err) {
      console.error('[KNOWLEDGE SERVICE] Critical error during knowledge build:', err);
    } finally {
      this.isBuilding = false;
    }
  }

  // Parse all PDF files with priority to Resumes
  async ingestPdfs() {
    const pdfFiles = [];
    const searchDirs = [this.rootDir, this.publicDir];

    searchDirs.forEach(dir => {
      if (fs.existsSync(dir)) {
        try {
          const items = fs.readdirSync(dir);
          items.forEach(item => {
            if (item.toLowerCase().endsWith('.pdf')) {
              const fullPath = path.join(dir, item);
              const stats = fs.statSync(fullPath);
              pdfFiles.push({
                name: item,
                path: fullPath,
                mtimeMs: stats.mtimeMs,
                size: stats.size
              });
            }
          });
        } catch (_) {}
      }
    });

    // Deduplicate by filename
    const uniqueMap = new Map();
    pdfFiles.forEach(pdf => {
      if (!uniqueMap.has(pdf.name) || uniqueMap.get(pdf.name).mtimeMs < pdf.mtimeMs) {
        uniqueMap.set(pdf.name, pdf);
      }
    });

    const uniquePdfs = Array.from(uniqueMap.values());
    this.resumeData.allFiles = [];

    // Identify primary resume (matching 'resume' in name, sorted by newest)
    const resumePdfs = uniquePdfs.filter(p => p.name.toLowerCase().includes('resume'));
    resumePdfs.sort((a, b) => b.mtimeMs - a.mtimeMs);
    const primaryResume = resumePdfs[0] || uniquePdfs[0] || null;

    let primaryExtractedText = '';

    for (const pdf of uniquePdfs) {
      let extracted = '';
      const cached = this.pdfCache.get(pdf.path);

      if (cached && cached.mtimeMs === pdf.mtimeMs) {
        // Instant in-memory cache hit
        extracted = cached.text;
      } else if (PDFParse) {
        try {
          const buf = fs.readFileSync(pdf.path);
          const parser = new PDFParse(new Uint8Array(buf));
          const parsed = await parser.getText();
          extracted = parsed && parsed.text ? parsed.text.trim() : '';
          this.pdfCache.set(pdf.path, { mtimeMs: pdf.mtimeMs, text: extracted });
        } catch (pdfErr) {
          console.warn(`[KNOWLEDGE SERVICE] Notice: could not parse PDF ${pdf.name}:`, pdfErr.message);
        }
      }

      this.resumeData.allFiles.push({
        filename: pdf.name,
        path: pdf.path,
        size: pdf.size,
        lastModified: new Date(pdf.mtimeMs).toISOString(),
        isPrimary: primaryResume && primaryResume.name === pdf.name,
        charCount: extracted.length,
        textPreview: extracted.slice(0, 200)
      });

      if (primaryResume && primaryResume.name === pdf.name) {
        primaryExtractedText = extracted;
      }
    }

    this.resumeData.primaryFile = primaryResume ? primaryResume.name : null;
    this.resumeData.extractedText = primaryExtractedText;
  }

  // Parse sections from index.html
  ingestWebsiteHtml() {
    const htmlPath = fs.existsSync(path.join(this.rootDir, 'index.html'))
      ? path.join(this.rootDir, 'index.html')
      : path.join(this.publicDir, 'index.html');

    if (fs.existsSync(htmlPath)) {
      try {
        const rawHtml = fs.readFileSync(htmlPath, 'utf8');
        this.websiteSections = extractHtmlSections(rawHtml);
      } catch (err) {
        console.error('[KNOWLEDGE SERVICE] Error reading index.html:', err.message);
      }
    }
  }

  // Read docs if present
  ingestDocumentation() {
    const docs = ['PORTFOLIO_DOCUMENTATION.md', 'RAHUL_PORTFOLIO_PROMPT.md'];
    const parts = [];

    docs.forEach(docName => {
      const p = path.join(this.rootDir, docName);
      if (fs.existsSync(p)) {
        try {
          const text = fs.readFileSync(p, 'utf8');
          parts.push(`=== DOCUMENTATION: ${docName} ===\n${text}`);
        } catch (_) {}
      }
    });

    this.documentationText = parts.join('\n\n');
  }

  // Compile Master System Context
  compileMasterContext() {
    const sections = [];
    const now = new Date();
    const liveTime = now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true });
    const liveDate = now.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    sections.push(`You are "Rahul's AI Copilot", the official AI technical and career representative for Rahul A.
You are articulate, technically rigorous, confident, professional, and friendly.
You represent Rahul A in interviews, portfolio evaluations, and technical recruiter screenings.`);

    sections.push(`============================================================
1. REAL-TIME SYSTEM CLOCK & CANDIDATE IDENTITY
============================================================
- Live System Time: ${liveTime} IST (UTC+5:30)
- Live System Date: ${liveDate}
- Current Year: 2026
- Full Name: Rahul A
- Location: Bengaluru, Karnataka, India (560079)
- Phone: +91 7026802690
- Email: rahuldheeraj.anil@gmail.com
- Live Portfolio: https://rahul200618.github.io/Portfolio/
- GitHub: https://github.com/rahul200618
- LinkedIn: https://www.linkedin.com/in/rahul-a-200618-ln
- Current Age: 19–20 years old (born June 2006)
- Academic Status: Currently in B.Tech in Digital Transformation (2024 — 2028) at Atria University, Bengaluru. Class 12 completed in 2024.
- Primary Career Focus: CYBERSECURITY (VAPT, Ethical Hacking, Secure API Design, OWASP Top 10, Cryptographic Protocols)
- Secondary Engineering Domains: Full-Stack Systems, High-Concurrency WebSockets/Queues, Generative AI & Supervised ML, Data Analytics
- Current Availability: Actively available for Software Engineering Internships, Full-Stack Developer positions, and Cybersecurity / VAPT engagements in 2026.`);

    // Latest Resume Extraction
    if (this.resumeData.extractedText) {
      sections.push(`============================================================
2. LATEST RESUME EXTRACTION (AUTOMATICALLY SYNCED FROM: ${this.resumeData.primaryFile || 'Resume PDF'})
============================================================
${this.resumeData.extractedText}`);
    }

    // Dynamic Projects Inventory
    sections.push(`============================================================
3. DYNAMIC PROJECTS INVENTORY (${this.projects.length} LIVE & CAPSTONE PROJECTS — AUTO-SYNCED)
============================================================`);
    
    this.projects.forEach((proj, idx) => {
      const lines = [
        `${idx + 1}. ${proj.title} [${proj.status || 'Active'}] (Category: ${proj.category || 'Engineering'})`,
        `   - Tagline: ${proj.tagline || ''}`,
        `   - Description: ${proj.description || ''}`,
        `   - Tech Stack: ${Array.isArray(proj.techStack) ? proj.techStack.join(', ') : (proj.techStack || 'N/A')}`,
        `   - Live Demo: ${proj.links?.live || 'N/A'}`,
        `   - GitHub Repository: ${proj.links?.github || 'N/A'}`
      ];
      if (Array.isArray(proj.highlights) && proj.highlights.length > 0) {
        lines.push('   - Key Highlights:');
        proj.highlights.forEach(h => lines.push(`     * ${h}`));
      }
      sections.push(lines.join('\n'));
    });

    // Dynamic Skills Taxonomy
    sections.push(`============================================================
4. TECHNICAL SKILLS TAXONOMY (AUTO-SYNCED)
============================================================`);
    if (Array.isArray(this.skills)) {
      this.skills.forEach(skillCat => {
        const items = Array.isArray(skillCat.skills) ? skillCat.skills.map(s => s.name || s).join(', ') : '';
        sections.push(`- ${skillCat.category || skillCat.name || 'Core Domain'}: ${items}`);
      });
    }

    // Dynamic Website Text Sections (index.html)
    if (Object.keys(this.websiteSections).length > 0) {
      sections.push(`============================================================
5. LIVE WEBSITE HIGHLIGHTS & DOM SECTIONS (AUTO-SYNCED FROM index.html)
============================================================`);
      for (const [secId, text] of Object.entries(this.websiteSections)) {
        if (text && text.length > 10) {
          sections.push(`[SECTION: #${secId}]\n${text.slice(0, 1000)}`);
        }
      }
    }

    // Master Guidelines
    sections.push(`============================================================
6. RESPONSE GUIDELINES
============================================================
- Speak in first-person as Rahul's AI technical representative ("Rahul has built...", "In his internship at OpenAlgon, Rahul...").
- Always be accurate, concise, technically sophisticated, and truthful to the ground truth above.
- Format answers with clean markdown (bullet points, bold text, clickable markdown links).
- When discussing projects, provide their live demo URLs and GitHub links whenever available.
- If asked about hiring or availability, give his direct email (rahuldheeraj.anil@gmail.com) and phone (+91 7026802690).`);

    return sections.join('\n\n');
  }

  // Compile Dynamic Suggestions Bank
  compileDynamicSuggestions() {
    const bank = {
      production: [
        "Tell me about the 9 production apps Rahul built at OpenAlgon",
        "How does RankPrediction achieve sub-100ms rank predictions?",
        "Explain the Shree Udupi Aramane restaurant operations monolith",
        "How was Agro ERP deployed to Web, Android & Desktop from one repo?",
        "How does Abhyas Nepal handle timed exams and anti-cheat?"
      ],
      cybersecurity: [
        "What is Rahul's cybersecurity & VAPT background?",
        "Explain the 6-vector exploit suite in his Digital Cash protocol",
        "How does Rahul implement OWASP Top 10 defenses in APIs?",
        "What offensive tools does Rahul use in Kali Linux?",
        "How does secp256k1 ECDSA and SHA-256 work in his ledger?"
      ],
      machineLearning: [
        "How did Rahul achieve AUC 0.816 on Wine Quality without data leakage?",
        "Explain how Symbio Insight analyzes DNA sequences with Gemini AI",
        "What ML preprocessing & stratified splitting methodology was used?",
        "How does Rahul integrate Gemini AI into web applications?"
      ],
      engineering: [
        "What were Rahul's contributions to Formula Bharat 2026 (E17)?",
        "How does the CAN bus telemetry & BMS isolation loop work?",
        "Explain the AgriLoop circular-economy platform"
      ],
      hiring: [
        "What roles & internships is Rahul currently seeking in 2026?",
        "What is Rahul's academic background at Atria University?",
        "How can I interview, contact, or hire Rahul A?"
      ],
      projects: []
    };

    // Dynamically generate suggestions for all loaded projects
    if (Array.isArray(this.projects)) {
      this.projects.forEach(p => {
        bank.projects.push(`Tell me about ${p.title}`);
        if (p.techStack && p.techStack.length > 0) {
          bank.projects.push(`How did Rahul build ${p.title} with ${p.techStack[0]}?`);
        }
      });
    }

    this.dynamicSuggestionsBank = bank;
  }

  // Get dynamic suggestions pool for UI
  getRandomSuggestions() {
    const selected = [];
    const coreCats = ['production', 'cybersecurity', 'machineLearning', 'engineering', 'hiring'];

    // Pick 1 from core categories
    coreCats.forEach(cat => {
      const list = this.dynamicSuggestionsBank[cat] || [];
      if (list.length > 0) {
        const item = list[Math.floor(Math.random() * list.length)];
        if (!selected.includes(item)) selected.push(item);
      }
    });

    // Add 1-2 random dynamic project questions
    const projectList = this.dynamicSuggestionsBank.projects || [];
    if (projectList.length > 0) {
      const randProj = projectList[Math.floor(Math.random() * projectList.length)];
      if (!selected.includes(randProj)) {
        selected.splice(1, 0, randProj); // Insert near the top
      }
    }

    return selected.slice(0, 5);
  }

  // Dynamic Knowledge Fallback Search Engine (zero-dependency local responder)
  generateDynamicKnowledgeResponse(query) {
    const q = (query || '').toLowerCase().trim();

    // 0. Live Real-Time Clock / Date / Timezone Query
    if (q.includes('time') || q.includes('clock') || q.includes('date') || q.includes('day') || q.includes('today')) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
      const dateStr = now.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      return `### ⏱️ Live System Clock (Bengaluru, IST)
- **Current Time:** **${timeStr} IST** (UTC+5:30)
- **Current Date:** **${dateStr}**
- **Location:** Bengaluru, Karnataka, India (560079)

I am Rahul's AI Copilot, synchronized in real time with his 16 projects, master resume, and full-stack architecture. What would you like to know about Rahul's work or availability?`;
    }

    // 0.5. Temporal / Current Year / Age / Date Query
    if (q.includes('2026') || q.includes('year') || q.includes('age') || q.includes('old') || q.includes('born') || q.includes('timeline') || q.includes('now') || q.includes('current')) {
      return `### 📅 Current Timeline & Status (2026)
- **Current Year:** 2026
- **Current Status:** Rahul is **19–20 years old** (born June 2006), currently pursuing his **B.Tech in Digital Transformation (2024 — 2028)** at **Atria University, Bengaluru**.
- **Industry Experience:** AI & Full-Stack Systems Intern at **OpenAlgon / Decembay Technologies** (May 2026 — Present), having shipped 9 production platforms.
- **EV Engineering:** Powertrain & BMS Engineer for **Formula Bharat 2026** (RevX Atria E17 Electric Race Vehicle).
- **Academic Milestone:** Graduated Higher Secondary (12th STEM) in 2024 from Kendriya Vidyalaya Malleswaram.`;
    }

    // 1. Direct Project Title or Keyword Match against ALL dynamic projects in database!
    for (const proj of this.projects) {
      const titleLower = proj.title.toLowerCase();
      const idLower = (proj.id || '').toLowerCase();
      const idWords = idLower.replace(/-/g, ' ');
      const cleanTitle = titleLower.replace(/[^a-z0-9\s]/g, ' ');
      const titleWords = cleanTitle.split(/\s+/).filter(w => w.length > 2);

      // Match if query contains project title, id, spaced id, or key project words
      const isMatch = q.includes(titleLower) || 
                      q.includes(idLower) || 
                      q.includes(idWords) || 
                      (titleWords.length > 0 && titleWords.some(w => q.includes(w) && w.length >= 4 && !['with', 'from', 'into', 'team', 'real', 'time', 'flow', 'deep', '2026', '2025', '2024'].includes(w)));

      if (isMatch) {
        let resp = `### 🚀 ${proj.title} [${proj.status || 'Active'}]\n`;
        if (proj.tagline) resp += `*${proj.tagline}*\n\n`;
        resp += `${proj.description}\n\n`;

        if (Array.isArray(proj.techStack) && proj.techStack.length > 0) {
          resp += `**Tech Stack:** \`${proj.techStack.join('` • `')}\`\n\n`;
        }

        if (Array.isArray(proj.highlights) && proj.highlights.length > 0) {
          resp += `**Architecture & Highlights:**\n`;
          proj.highlights.forEach(h => { resp += `- ${h}\n`; });
          resp += `\n`;
        }

        const links = [];
        if (proj.links?.live) links.push(`[🌐 Live Demo](${proj.links.live})`);
        if (proj.links?.github) links.push(`[💻 GitHub Repository](${proj.links.github})`);
        if (links.length > 0) {
          resp += `**Direct Access:** ${links.join(' | ')}`;
        }

        return resp;
      }
    }

    // 2. OpenAlgon 9 Apps Overview
    if (q.includes('openalgon') || q.includes('9 apps') || q.includes('production') || q.includes('intern') || q.includes('decembay')) {
      const openAlgonProjs = this.projects.filter(p => p.category === 'internship' || (p.highlights && p.highlights.some(h => h.toLowerCase().includes('openalgon'))));
      let resp = `### 🏢 9 Production Applications Shipped at OpenAlgon\nRahul is an **AI & Full-Stack Systems Intern** at OpenAlgon / Decembay Technologies (May 2026 — Present). He independently owned architectures end-to-end across 9 live commercial apps:\n\n`;
      
      if (openAlgonProjs.length > 0) {
        openAlgonProjs.forEach((p, idx) => {
          resp += `${idx + 1}. **${p.title}** ${p.links?.live ? `([Link](${p.links.live}))` : ''} — ${p.description}\n`;
        });
      } else {
        resp += `1. **RankPrediction** ([rankprediction.com](https://rankprediction.com)) — Sub-100ms KCET/COMEDK rank forecasting with Recharts & Firebase.\n` +
          `2. **Shree Udupi Aramane** ([shreeudupiaramane.com](https://shreeudupiaramane.com/)) — Monolith serving 4 operational portals with Socket.IO, BullMQ, & Cashfree payments.\n` +
          `3. **Abhyas Nepal** ([abhyas.pro](https://abhyas.pro/)) — Timed medical entrance platform with KaTeX formula rendering & anti-cheat.\n` +
          `4. **Agro ERP (Field Flow)** ([agro.openalgon.com](https://agro.openalgon.com/)) — Web + Android Capacitor + Desktop Tauri from one codebase.\n` +
          `5. **AgriArchives** ([agriarchives.in](https://agriarchives.in)) — Agriculture journal e-magazine with sub-millisecond Fuse.js search.`;
      }
      return resp;
    }

    // 3. Cybersecurity & VAPT
    if (q.includes('security') || q.includes('cyber') || q.includes('vapt') || q.includes('hacking') || q.includes('owasp') || q.includes('exploit') || q.includes('attack') || q.includes('cash')) {
      return `### 🛡️ Cybersecurity & VAPT (Primary Career Focus)
**Cybersecurity is Rahul's primary domain.** Key technical capabilities:
- **Offensive Security & VAPT:** Vulnerability Assessment & Penetration Testing, Kali Linux, Nmap reconnaissance, Wireshark packet capture, Burp Suite Pro, and Metasploit.
- **OWASP Top 10 Mitigation:** Hardened APIs with HMAC authentication, JWT session validation, Honeypot bot traps, and Stored XSS entity encoding.
- **Cryptographic Protocol Engineering:** Built a from-scratch **Minimal Digital Cash Protocol** with **secp256k1 ECDSA** elliptic curve cryptography and **SHA-256** append-only hash chains.
- **6-Vector Adversarial Attack Suite (\`attack_simulation.py\`):**
  1. *Double-spending* ➔ **BLOCKED**
  2. *Signature forgery* ➔ **BLOCKED**
  3. *Replay attacks* ➔ **BLOCKED**
  4. *Nonce sequence rejection* ➔ **BLOCKED**
  5. *Balance underflow* ➔ **BLOCKED**
  6. *SHA-256 chain tampering* ➔ **BLOCKED**
- **Job Simulation:** Completed the **Tata & Forage Cybersecurity Analyst** simulation covering threat actor modeling and enterprise incident response.`;
    }

    // 4. Technology / Skill Query
    if (Array.isArray(this.skills)) {
      for (const skillCat of this.skills) {
        if (Array.isArray(skillCat.skills)) {
          for (const skillItem of skillCat.skills) {
            const sName = (skillItem.name || skillItem || '').toLowerCase();
            if (sName.length > 2 && q.includes(sName)) {
              // Find projects using this skill
              const matchingProjects = this.projects.filter(p => 
                p.techStack && p.techStack.some(t => t.toLowerCase().includes(sName))
              );

              let resp = `### 💻 Skill: **${skillItem.name || skillItem}** (${skillCat.category || 'Core Skill'})\n`;
              if (skillItem.level) resp += `**Proficiency:** ${skillItem.level}%\n\n`;
              if (matchingProjects.length > 0) {
                resp += `**Projects Built by Rahul Using ${skillItem.name || skillItem}:**\n`;
                matchingProjects.forEach(p => {
                  resp += `- **${p.title}**: ${p.description} ${p.links?.live ? `([Live Demo](${p.links.live}))` : ''}\n`;
                });
              } else {
                resp += `Rahul utilizes **${skillItem.name || skillItem}** across his production architectures and security toolchains.\n`;
              }
              return resp;
            }
          }
        }
      }
    }

    // 5. Machine Learning & Wine Quality
    if (q.includes('wine') || q.includes('ml') || q.includes('leakage') || q.includes('auc') || q.includes('model') || q.includes('data science') || q.includes('xgboost')) {
      return `### 🤖 Machine Learning: Wine Quality Supervised Pipeline (AUC 0.816)
Rahul engineered an end-to-end supervised learning classification pipeline applied to 6,497 UCI wine samples ([GitHub](https://github.com/rahul200618/wine-quality-ml)):
- **Zero-Leakage Guarantee:** \`StandardScaler\` was fitted **strictly and exclusively on the training partition**, completely eliminating test data leakage.
- **Stratified Splitting:** Applied a stratified **60/20/20 train/val/test split** to maintain class ratios on an imbalanced target (63% good vs 37% poor).
- **Model Benchmarking:** Evaluated Linear/Logistic Regression, tuned k-NN, and XGBoost, achieving binary classification **AUC-ROC of 0.816** and **F1 score of 0.78**.`;
    }

    // 6. Formula Bharat & EV
    if (q.includes('formula') || q.includes('race') || q.includes('ev') || q.includes('bms') || q.includes('atria racing') || q.includes('car') || q.includes('can bus')) {
      return `### 🏎️ Formula Bharat 2026 — RevX Atria (E17 Electric Vehicle)
Rahul served as an **EV Powertrain & BMS Engineer** for Atria University's Formula Student electric race vehicle team:
- **Battery Management System (BMS):** Architected the battery pack monitoring topology, cell thermal monitoring, and cell balancing circuits.
- **CAN Bus Telemetry:** Implemented communication protocols aggregating real-time sensor streams across motor controller, inverter, and battery pack.
- **High-Voltage Safety:** Engineered high-voltage isolation loops and emergency shutdown safety circuits in compliance with strict Formula Bharat technical rules.`;
    }

    // 7. Resume & Academic Record
    if (q.includes('resume') || q.includes('education') || q.includes('degree') || q.includes('university') || q.includes('atria') || q.includes('college')) {
      let resp = `### 🎓 Education & Master Career Record\n` +
        `- **Degree:** B.Tech in Digital Transformation (2024 — 2028 Expected) at **Atria University, Bengaluru**.\n` +
        `- **Specialization:** Cybersecurity (VAPT, Ethical Hacking), High-Concurrency Full-Stack, and Machine Learning.\n` +
        `- **Senior Secondary (12th):** Kendriya Vidyalaya Malleswaram, Bengaluru (STEM Graduated 2024).\n` +
        `- **Internship:** AI & Full-Stack Systems Intern at OpenAlgon / Decembay Technologies (May 2026 — Present).\n` +
        `- **EV Engineering:** Formula Bharat 2026 (RevX Atria E17 Electric Race Vehicle).\n` +
        `- **Official Resume PDF:** Download Rahul's verified resume directly via the [Download Resume Link](/api/resume/download)!\n`;
      
      if (this.resumeData.primaryFile) {
        resp += `\n*Note: Dynamic knowledge engine is synchronized with latest resume: \`${this.resumeData.primaryFile}\` (${this.resumeData.extractedText.length.toLocaleString()} characters indexed).*`;
      }
      return resp;
    }

    // 8. Contact & Hiring
    if (q.includes('hire') || q.includes('contact') || q.includes('email') || q.includes('phone') || q.includes('available') || q.includes('opportunity') || q.includes('interview')) {
      return `### 📬 Hire Rahul A. / Opportunities
Rahul is actively available for **Software Engineering Internships**, **Full-Stack Developer Roles**, and **Cybersecurity / VAPT Engagements** in 2026:

- **Email:** [rahuldheeraj.anil@gmail.com](mailto:rahuldheeraj.anil@gmail.com)
- **Phone:** [+91 7026802690](tel:+917026802690)
- **Location:** Bengaluru, Karnataka, India
- **LinkedIn:** [linkedin.com/in/rahul-a-200618-ln](https://www.linkedin.com/in/rahul-a-200618-ln)
- **GitHub:** [github.com/rahul200618](https://github.com/rahul200618)

You can also send a transmission directly through the **Transmission Form** on this website!`;
    }

    // 9. General Greeting / Fallback Overview
    return `### 👋 Hello! I'm Rahul-Bot
I am Rahul A's AI technical career representative, fully synchronized with his **master career record, ${this.projects.length} live projects, and verified resume**:

- **Primary Focus:** **Cybersecurity** (VAPT, Ethical Hacking, OWASP Top 10, ECDSA secp256k1 Cryptography).
- **Track Record:** **9 live commercial production apps** shipped during his internship at OpenAlgon.
- **Projects Database:** Currently tracking **${this.projects.length} active projects** with architecture breakdowns.
- **Machine Learning:** Zero-leakage supervised classification pipeline (**AUC-ROC 0.816**).
- **EV Engineering:** Powertrain & BMS Engineer for **Formula Bharat 2026 (RevX Atria E17)**.

Ask me about any specific project (e.g., *"Tell me about ${this.projects[0]?.title || 'Symbio Insight'}"*), his technical architecture decisions, or his availability!`;
  }

  // Telemetry status
  getStatus() {
    return {
      status: 'active',
      lastUpdated: new Date(this.lastBuildTimestamp).toISOString(),
      projectsCount: this.projects.length,
      skillsCount: this.skills.length,
      trackedResumes: this.resumeData.allFiles,
      primaryResume: this.resumeData.primaryFile,
      resumeCharCount: this.resumeData.extractedText.length,
      websiteSectionsIndexed: Object.keys(this.websiteSections),
      documentationLoaded: this.documentationText.length > 0,
      totalTrackedFiles: this.fileTimestamps.size
    };
  }
}

// Export singleton
export const knowledgeService = new KnowledgeService();

