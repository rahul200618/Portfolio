export const initialProjects = [
  {
    id: "symbio-insight",
    title: "Symbio Insight",
    tagline: "AI-POWERED BIOINFORMATICS PLATFORM",
    category: "flagship",
    subCategory: "ai_ml",
    featured: true,
    description: "A production-ready full-stack bioinformatics web app for DNA & RNA sequence analysis. Makes biological data accessible and visual for researchers and students with Google Gemini AI.",
    highlights: [
      "Upload & analyze FASTA files with nucleotide composition charts",
      "Google Gemini AI for intelligent biological sequence insights",
      "Auto-generates professional PDF & HTML analysis reports",
      "Deployed live on Render with robust streaming inference"
    ],
    techStack: ["Python", "JavaScript", "Gemini API", "Full Stack", "BioPython", "Render"],
    links: {
      live: "https://symbio-insight-app-2.onrender.com",
      github: "https://github.com/rahul200618/symbio-insight-app"
    },
    image: "symbio-preview.png",
    status: "Production"
  },
  {
    id: "curated-cinema",
    title: "Curated Cinema",
    tagline: "INDIE FILM STREAMING PLATFORM",
    category: "flagship",
    subCategory: "fullstack",
    featured: true,
    description: "Director-first streaming platform. Cinema discovered through curation, not algorithms — with direct filmmaker support and offline screening ticketing.",
    highlights: [
      "Free film streaming + optional filmmaker donations",
      "Offline screening ticket booking system with QR validation",
      "Director profiles, filmography breakdowns & curated theme collections"
    ],
    techStack: ["Full Stack", "UI/UX", "JavaScript", "React", "Video.js", "Tailwind CSS"],
    links: {
      live: "https://ai.studio/apps/drive/1LW3wz8j-uInj_2CIDa3WJLV6lNqUYwNf?fullscreenApplet=true",
      github: "https://github.com/rahul200618/CineIndie-App"
    },
    image: "cinema-preview.png",
    status: "Live Demo"
  },
  {
    id: "wine-quality-ml",
    title: "Wine Quality ML Pipeline",
    tagline: "ZERO-LEAKAGE SUPERVISED PIPELINE · AUC 0.816",
    category: "flagship",
    subCategory: "ai_ml",
    featured: false,
    description: "End-to-end supervised learning pipeline applied to 6,497 UCI wine samples, benchmarking 4 models with strict zero-leakage preprocessing.",
    highlights: [
      "Stratified 60/20/20 train-val-test split preserving class distribution on imbalanced target",
      "StandardScaler fit strictly on training split to eliminate test information leakage",
      "Benchmarked Linear/Logistic Regression and tuned k-NN: achieved AUC-ROC of 0.816"
    ],
    techStack: ["Python", "Scikit-learn", "Pandas", "NumPy", "StandardScaler", "AUC 0.816"],
    links: {
      live: null,
      github: "https://github.com/rahul200618/wine-quality-ml"
    },
    image: null,
    status: "Completed"
  },
  {
    id: "minimal-digital-cash",
    title: "Minimal Digital Cash Protocol",
    tagline: "CRYPTOGRAPHIC LEDGER & 6-VECTOR ATTACK SUITE",
    category: "flagship",
    subCategory: "cybersecurity",
    featured: false,
    description: "Tamper-evident append-only ledger in Python featuring secp256k1 ECDSA wallets, SHA-256 hash chains, and automated exploit tests.",
    highlights: [
      "secp256k1 ECDSA wallet derivation with nonce-based replay attack mitigation",
      "Tamper-evident SHA-256 block hash chaining — mathematically detects silent alterations",
      "Automated 6-vector exploit suite: double-spending, signature forgery, replay & tampering"
    ],
    techStack: ["Python", "ECDSA secp256k1", "SHA-256", "VAPT", "Offensive Security", "Cryptography"],
    links: {
      live: null,
      github: "https://github.com/rahul200618/Minimal-Digital-Cash-System-Cryptography"
    },
    image: null,
    status: "Verified"
  },
  {
    id: "rank-prediction",
    title: "RankPrediction",
    tagline: "AI COUNSELING INTELLIGENCE PLATFORM",
    category: "production",
    subCategory: "fullstack",
    featured: false,
    description: "KCET & COMEDK rank prediction, cutoff analysis, AI counselor, and college discovery for Karnataka engineering aspirants.",
    highlights: [
      "Sub-100ms rank estimation calibrated against thousands of historical cutoff ranks",
      "Integrated AI Counselor module with interactive college discovery",
      "Firebase Phone Auth with reCAPTCHA and Recharts visual cutoffs"
    ],
    techStack: ["React 18", "TypeScript", "Vite", "Supabase", "Firebase Auth", "Recharts", "jsPDF"],
    links: {
      live: "https://rankprediction.com",
      github: "https://github.com/rahul200618/Rankpredictor"
    },
    image: null,
    status: "Production Live"
  },
  {
    id: "shree-udupi-aramane",
    title: "Shree Udupi Aramane",
    tagline: "RESTAURANT OPERATIONS MONOLITH & POS",
    category: "production",
    subCategory: "fullstack",
    featured: false,
    description: "Production restaurant operations monolith serving 4 portals (Customer, Kitchen KDS, Delivery Valet, Admin) with Socket.IO, BullMQ, and Cashfree payments.",
    highlights: [
      "Strict FSM order progression (PLACED ➔ CONFIRMED ➔ PREPARING ➔ READY ➔ DELIVERED)",
      "Real-time multi-device order coordination via WebSockets and BullMQ transactional queue",
      "Minor-unit integer paise financial calculations and dynamic UPI QR generation"
    ],
    techStack: ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS v4", "Express", "Prisma ORM", "Supabase", "BullMQ", "Socket.IO", "Cashfree"],
    links: {
      live: "https://shreeudupiaramane.com/",
      github: null
    },
    image: null,
    status: "Production Live"
  },
  {
    id: "abhyas-nepal",
    title: "Abhyas Nepal",
    tagline: "NEPAL MEDICAL ENTRANCE EXAM PLATFORM (MECEE-BL)",
    category: "production",
    subCategory: "fullstack",
    featured: false,
    description: "Medical Entrance Examination Preparation Platform with timed model exams, chapter MCQs, KaTeX formula rendering, accuracy analytics, anti-cheat, and All-Nepal leaderboards.",
    highlights: [
      "Timed full-length mock examinations across Physics, Chemistry, Botany, Zoology",
      "Persistent test attempts with KaTeX mathematical/chemical formula rendering",
      "Automated Vitest test coverage ensuring high reliability under high student concurrency"
    ],
    techStack: ["TanStack Start", "React 19", "TypeScript", "Tailwind CSS", "Supabase", "Vitest", "KaTeX"],
    links: {
      live: "https://abhyas.pro/",
      github: null
    },
    image: null,
    status: "Production Live"
  },
  {
    id: "nepal-cee-predictor",
    title: "Nepal CEE College Predictor",
    tagline: "ADMISSION PREDICTOR · CLOUDFLARE EDGE SSR",
    category: "production",
    subCategory: "fullstack",
    featured: false,
    description: "Rank estimation and admission probability predictor for Nepal CEE entrance across 16+ medical bachelor degrees and 14 official reservation quotas.",
    highlights: [
      "Deployed on Cloudflare Pages edge runtime with Nitro for sub-50ms TTFB",
      "Evaluates 16+ medical degrees (MBBS, BDS, BSc Nursing, B.Pharm)",
      "Precise quota modeling across all 14 official MEC reservation categories"
    ],
    techStack: ["TanStack Start", "React 19", "Tailwind CSS v4", "Supabase", "Nitro", "Cloudflare Pages"],
    links: {
      live: "https://nepal-college-predictor.pages.dev/",
      github: null
    },
    image: null,
    status: "Production Live"
  },
  {
    id: "agro-erp",
    title: "Agro ERP (Field Flow)",
    tagline: "MULTI-PLATFORM ERP · WEB + ANDROID + DESKTOP",
    category: "production",
    subCategory: "fullstack",
    featured: false,
    description: "Multi-platform enterprise ERP for agricultural businesses — multi-shop inventory, Razorpay billing, QR scanning, and 3D product visualization.",
    highlights: [
      "Deployed Web, Android (Capacitor), and Desktop (Tauri) from a single unified codebase",
      "100% tenant data isolation per outlet with Super Admin switcher",
      "Camera-based QR inventory scanning and interactive Three.js 3D product visualizations"
    ],
    techStack: ["TanStack Start", "React 19", "TypeScript", "Drizzle ORM", "Neon DB", "Capacitor", "Tauri", "Three.js", "Razorpay", "jsPDF"],
    links: {
      live: "https://agro.openalgon.com/",
      github: null
    },
    image: null,
    status: "Production Live"
  },
  {
    id: "agri-archives",
    title: "AgriArchives",
    tagline: "AGRICULTURE E-MAGAZINE & PUBLICATION PLATFORM",
    category: "production",
    subCategory: "fullstack",
    featured: false,
    description: "International monthly agriculture e-magazine with admin CMS, fuzzy search, SEO optimization, and Supabase file storage for PDFs.",
    highlights: [
      "Auth-gated Admin CMS enabling editors to upload and archive monthly journal editions",
      "Sub-millisecond client-side fuzzy search via Fuse.js",
      "Optimized PDF viewer with responsive preview streaming"
    ],
    techStack: ["React 18", "TypeScript", "Tailwind CSS", "shadcn/ui", "Supabase", "Fuse.js", "Vercel"],
    links: {
      live: "https://agriarchives.in",
      github: "https://github.com/rahul200618/agriarchive"
    },
    image: null,
    status: "Production Live"
  },
  {
    id: "agri-catalogues",
    title: "AgriCatalogues",
    tagline: "RESEARCH E-MAGAZINE & CATALOGUE PORTAL",
    category: "production",
    subCategory: "fullstack",
    featured: false,
    description: "Agriculture research catalogue and journal with article management, editorial board profiles, real-time search, and responsive mobile UI.",
    highlights: [
      "Dynamic category filtering and type-safe schemas for author profiles",
      "Digital author submission workflows with peer-review stage tracking",
      "Modern design system built with shadcn/ui and Tailwind CSS"
    ],
    techStack: ["React", "TypeScript", "Vite", "Tailwind CSS", "shadcn/ui", "Supabase", "React Router DOM"],
    links: {
      live: "https://www.agricatalogues.in/",
      github: null
    },
    image: null,
    status: "Production Live"
  },
  {
    id: "krishikuta",
    title: "Krishikuta",
    tagline: "AGRI-EDUCATION & CONSULTING PLATFORM",
    category: "production",
    subCategory: "fullstack",
    featured: false,
    description: "Exam coaching (ICAR, K-CET), admission guidance, and professional consulting for agricultural DPRs and startup models.",
    highlights: [
      "Exam coaching modules for ICAR JRF/SRF, Agriculture Officer (AO/AAO), and K-CET",
      "Commercial DPR lead funnels for agricultural startup project reports",
      "Smooth micro-interactions powered by Framer Motion and TanStack Query"
    ],
    techStack: ["React 19", "TypeScript", "TanStack Router", "TanStack Query", "Tailwind CSS", "Supabase", "Framer Motion"],
    links: {
      live: "https://krishikuta.com/",
      github: "https://github.com/rahul200618/krushikuta"
    },
    image: null,
    status: "Production Live"
  },
  {
    id: "bluedot-immigrations",
    title: "Bluedot Immigrations",
    tagline: "IMMIGRATION SERVICES PORTAL & CRM",
    category: "production",
    subCategory: "fullstack",
    featured: false,
    description: "Comprehensive immigration services web app designed to streamline client onboarding and consultation management with a public portal and admin dashboard.",
    highlights: [
      "Full-stack consultation booking portal and protected Admin dashboard",
      "Visualized lead conversion metrics via Recharts on Cloudflare Workers edge runtime",
      "Automated document validation checklist for visa applications"
    ],
    techStack: ["TanStack Start", "React 19", "TypeScript", "Tailwind CSS v4", "shadcn/ui", "Supabase", "Cloudflare Workers", "Recharts"],
    links: {
      live: "https://bluedotimmigrations.com",
      github: null
    },
    image: null,
    status: "Production Live"
  },
  {
    id: "agriloop",
    title: "AgriLoop 2.0",
    tagline: "AI + CIRCULAR ECONOMY SUSTAINABILITY PLATFORM",
    category: "ai_ml",
    subCategory: "ai_ml",
    featured: false,
    description: "AI-powered circular-economy platform that converts agricultural waste into income by classifying crop residue and listing it on a digital marketplace.",
    highlights: [
      "Gemini 2.5 integration for waste classification, moisture & purity analysis",
      "Digital biomass marketplace with bidding system and order tracking",
      "Interactive geo-map intelligence with satellite view and district-level insights"
    ],
    techStack: ["AI", "Python", "React", "TypeScript", "Full Stack", "Gemini 2.5"],
    links: {
      live: null,
      github: "https://github.com/rahul200618/AGRILOOP"
    },
    image: null,
    status: "In Progress"
  },
  {
    id: "smart-energy-tracker",
    title: "Smart Energy Usage Tracker",
    tagline: "IOT + DATA ANALYTICS CONSUMPTION PLATFORM",
    category: "engineering",
    subCategory: "ai_ml",
    featured: false,
    description: "Energy monitoring system with IoT data collection, usage analytics, and visualization for smarter consumption patterns.",
    highlights: [
      "Real-time sensor telemetry ingestion and anomaly detection",
      "Collaborative project with dynamic consumption breakdown charts"
    ],
    techStack: ["IoT", "Python", "Data Analytics", "Pandas", "Matplotlib"],
    links: {
      live: null,
      github: "https://github.com/rahul200618/Smart-Energy-Usage-Tracker"
    },
    image: null,
    status: "In Progress"
  },
  {
    id: "formula-bharat-2026",
    title: "Formula Bharat 2026 — RevX Atria (E17)",
    tagline: "EV POWERTRAIN & ELECTRICAL SYSTEMS",
    category: "engineering",
    subCategory: "engineering",
    featured: false,
    description: "Core team member for Atria University's Formula Bharat 2026 electric race vehicle — hands-on exposure to EV drivetrain integration and electrical systems.",
    highlights: [
      "EV drivetrain integration and battery management system (BMS) architecture",
      "High-voltage isolation loop implementation and thermal monitoring",
      "Cross-functional collaboration across mechanical, electrical, and software teams"
    ],
    techStack: ["EV Engineering", "Circuit Design", "BMS Architecture", "CAN Bus", "Telemetry"],
    links: {
      live: null,
      github: null
    },
    image: null,
    status: "Competition Team"
  }
];

export const initialSkills = {
  cybersecurity: {
    title: "Cybersecurity (Primary Career Domain)",
    subtitle: "VAPT · Ethical Hacking · Secure API Design · Cryptography",
    icon: "🛡️",
    badgeColor: "purple",
    skills: [
      "Vulnerability Assessment & Penetration Testing (VAPT)",
      "OWASP Top 10 Mitigation",
      "Ethical Hacking & Reconnaissance",
      "Burp Suite Pro & Nmap",
      "Kali Linux & VM Environments",
      "Secure Coding Awareness & Sanitization",
      "JWT Authentication & Session Hardening",
      "ECDSA secp256k1 & SHA-256 Ledger Security",
      "Adversarial Testing & Exploit Simulation",
      "Linux Kernel Hardening & ZTNA"
    ]
  },
  fullstack: {
    title: "Full-Stack Engineering",
    subtitle: "Frontend, Backend, Databases & Mobile/Desktop",
    icon: "⚡",
    badgeColor: "yellow",
    skills: [
      "Frontend: React 18/19, Next.js 16, TypeScript, Vite",
      "State & Routing: TanStack Start, TanStack Router, TanStack Query",
      "Styling: Tailwind CSS v4, shadcn/ui, Radix UI, Framer Motion",
      "Backend: Node.js, Express, Python (FastAPI, Django)",
      "Databases: PostgreSQL, Supabase, Neon DB, MongoDB, Redis",
      "ORMs: Prisma ORM, Drizzle ORM",
      "Real-time & Queues: Socket.IO, BullMQ, Upstash Redis",
      "Edge & Serverless: Cloudflare Workers, Cloudflare Pages (Nitro), Vercel",
      "Cross-Platform: Capacitor (Android/iOS), Tauri (Desktop)",
      "Payments: Cashfree Payment Gateway, Razorpay"
    ]
  },
  aiml: {
    title: "Data Science, ML & Generative AI",
    subtitle: "Predictive Analytics, Supervised Learning & LLM Integration",
    icon: "🤖",
    badgeColor: "green",
    skills: [
      "Python: Scikit-learn, XGBoost, Pandas, NumPy, StandardScaler",
      "Supervised & Unsupervised Learning Architectures",
      "Zero-Leakage ML Preprocessing Pipelines",
      "ROC/AUC Analysis & Cross-Validation",
      "Google Gemini 2.5 & Flash API Integration",
      "AI Counselor & Recommender Logic",
      "Exploratory Data Analysis (EDA) & Data Cleansing",
      "Bioinformatics: BioPython & FASTA Sequence Analysis"
    ]
  },
  tools: {
    title: "Tools, Platforms & Languages",
    subtitle: "Developer Toolchain, Cloud Infrastructure & Version Control",
    icon: "🔧",
    badgeColor: "blue",
    skills: [
      "Languages: Python, JavaScript, TypeScript, SQL, HTML5, CSS3",
      "Cloud & Hosting: Supabase, Firebase, AWS S3, Render, Vercel, Cloudflare",
      "Tools: Git, GitHub, Postman, Docker, Vite, Vitest",
      "Libraries: Three.js, Recharts, KaTeX, Fuse.js, jsPDF, html5-qrcode",
      "Languages: English (Fluent), Kannada (Native), Hindi (Professional)"
    ]
  }
};

