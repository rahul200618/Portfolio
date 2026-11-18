import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { config } from './src/config/index.js';
import apiRoutes from './src/routes/api.js';
import adminRoutes from './src/routes/admin.js';
import { apiLimiter } from './src/middleware/rateLimiter.js';
import { knowledgeService } from './src/services/knowledgeService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Trust proxy for rate-limiting behind reverse proxies (Render, Vercel, Railway, Nginx)
app.set('trust proxy', 1);

// Security Headers via Helmet with customized CSP for Three.js & Google Fonts
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          "https://cdnjs.cloudflare.com",
          "https://cdn.jsdelivr.net"
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com"
        ],
        fontSrc: [
          "'self'",
          "https://fonts.gstatic.com",
          "data:"
        ],
        imgSrc: [
          "'self'",
          "data:",
          "blob:",
          "https:"
        ],
        connectSrc: [
          "'self'",
          "https:"
        ]
      }
    },
    crossOriginEmbedderPolicy: false
  })
);

// Cross-Origin Resource Sharing (CORS)
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        config.cors.allowedOrigins.includes(origin) ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1') ||
        origin.includes('github.io')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS']
  })
);

// Body Parsing Middleware
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Apply rate limiter to API routes
app.use('/api', apiLimiter);

// API Routes
app.use('/api', apiRoutes);
app.use('/api/admin', adminRoutes);

// Static assets
const publicDir = path.join(__dirname, 'public');
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
}
app.use(express.static(__dirname));

// Serve Admin Dashboard
app.get('/admin', (req, res) => {
  const adminFile = fs.existsSync(path.join(publicDir, 'admin.html'))
    ? path.join(publicDir, 'admin.html')
    : path.join(__dirname, 'admin.html');
  if (fs.existsSync(adminFile)) {
    return res.sendFile(adminFile);
  }
  return res.status(404).send('Admin dashboard file not found.');
});

// 404 Handler for undefined API routes
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    error: `API route not found: ${req.method} ${req.originalUrl}`
  });
});

// Fallback to index.html for frontend
app.use((req, res, next) => {
  if (req.method !== 'GET') return next();
  const indexFile = fs.existsSync(path.join(publicDir, 'index.html'))
    ? path.join(publicDir, 'index.html')
    : path.join(__dirname, 'index.html');
  if (fs.existsSync(indexFile)) {
    return res.sendFile(indexFile);
  }
  next();
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[UNHANDLED SERVER ERROR]', err);
  res.status(err.status || 500).json({
    success: false,
    error: config.isProduction ? 'Internal Server Error' : err.message
  });
});

// Only start listening if run directly from CLI
const isDirectExecution = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);

if (isDirectExecution) {
  knowledgeService.init().catch(err => console.error('[KNOWLEDGE SERVICE INIT ERROR]', err));
  app.listen(config.port, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🚀 RAHUL A. — FULL STACK PORTFOLIO & API SERVER             ║
║                                                               ║
║   • Local URL:      http://localhost:${config.port}                   ║
║   • Admin Portal:   http://localhost:${config.port}/admin             ║
║   • API Health:     http://localhost:${config.port}/api/health        ║
║   • REST API:       http://localhost:${config.port}/api/projects      ║
║   • Environment:    ${config.nodeEnv.toUpperCase().padEnd(30)} ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
    `);
  });
}

export default app;
