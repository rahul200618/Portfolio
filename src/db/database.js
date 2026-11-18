import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { config } from '../config/index.js';
import { initialProjects, initialSkills } from './seedData.js';

const dataDir = config.paths.data;

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Helper for atomic file writes to prevent data corruption
function safeWriteJsonSync(filePath, data) {
  const tempPath = `${filePath}.${Date.now()}.${Math.random().toString(36).slice(2, 7)}.tmp`;
  try {
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempPath, filePath);
  } catch (err) {
    if (fs.existsSync(tempPath)) {
      try { fs.unlinkSync(tempPath); } catch (_) {}
    }
    // On serverless read-only filesystems (like Vercel Lambda), safely bypass disk writes
    if (err.code === 'EROFS') {
      console.warn(`[STORAGE NOTICE] Serverless read-only environment detected. File write bypassed for ${path.basename(filePath)}`);
      return;
    }
    throw err;
  }
}

function safeReadJsonSync(filePath, defaultValue) {
  if (!fs.existsSync(filePath)) {
    safeWriteJsonSync(filePath, defaultValue);
    return defaultValue;
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${filePath}, falling back to default:`, err.message);
    return defaultValue;
  }
}

// File Paths
const MESSAGES_FILE = path.join(dataDir, 'messages.json');
const ANALYTICS_FILE = path.join(dataDir, 'analytics.json');
const PROJECTS_FILE = path.join(dataDir, 'projects.json');
const SKILLS_FILE = path.join(dataDir, 'skills.json');
const ADMIN_FILE = path.join(dataDir, 'admin.json');

// Initialize Files with Seed Data if Missing
safeReadJsonSync(PROJECTS_FILE, initialProjects);
safeReadJsonSync(SKILLS_FILE, initialSkills);

const initialAnalytics = {
  totalVisits: 1420,
  uniqueVisitors: 890,
  resumeDownloads: 215,
  dailyVisits: {},
  topReferrers: {},
  recentVisits: []
};
safeReadJsonSync(ANALYTICS_FILE, initialAnalytics);
safeReadJsonSync(MESSAGES_FILE, []);

// Admin setup: hash password with scrypt
function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function initAdminSync() {
  if (!fs.existsSync(ADMIN_FILE)) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = hashPassword(config.admin.defaultPassword, salt);
    safeWriteJsonSync(ADMIN_FILE, {
      salt,
      hash,
      lastLogin: null
    });
  }
}
initAdminSync();

// Database Interface
export const db = {
  messages: {
    create: (data) => {
      const messages = safeReadJsonSync(MESSAGES_FILE, []);
      const newMsg = {
        id: `msg_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
        name: data.name,
        email: data.email,
        subject: data.subject || 'General Inquiry',
        message: data.message,
        ip: data.ip ? crypto.createHash('sha256').update(data.ip).digest('hex').slice(0, 12) : 'anonymous',
        userAgent: data.userAgent || 'unknown',
        read: false,
        replied: false,
        createdAt: new Date().toISOString()
      };
      messages.unshift(newMsg);
      safeWriteJsonSync(MESSAGES_FILE, messages);
      return newMsg;
    },
    getAll: (filter = {}) => {
      let list = safeReadJsonSync(MESSAGES_FILE, []);
      if (filter.unreadOnly) {
        list = list.filter(m => !m.read);
      }
      return list;
    },
    getById: (id) => {
      const list = safeReadJsonSync(MESSAGES_FILE, []);
      return list.find(m => m.id === id) || null;
    },
    markRead: (id) => {
      const list = safeReadJsonSync(MESSAGES_FILE, []);
      const index = list.findIndex(m => m.id === id);
      if (index === -1) return null;
      list[index].read = true;
      list[index].updatedAt = new Date().toISOString();
      safeWriteJsonSync(MESSAGES_FILE, list);
      return list[index];
    },
    delete: (id) => {
      let list = safeReadJsonSync(MESSAGES_FILE, []);
      const initialLen = list.length;
      list = list.filter(m => m.id !== id);
      if (list.length !== initialLen) {
        safeWriteJsonSync(MESSAGES_FILE, list);
        return true;
      }
      return false;
    },
    count: () => {
      const list = safeReadJsonSync(MESSAGES_FILE, []);
      return {
        total: list.length,
        unread: list.filter(m => !m.read).length
      };
    }
  },

  projects: {
    getAll: ({ category, search } = {}) => {
      let list = safeReadJsonSync(PROJECTS_FILE, initialProjects);
      if (category && category !== 'all') {
        list = list.filter(p => p.category === category || p.subCategory === category);
      }
      if (search) {
        const q = search.toLowerCase();
        list = list.filter(p =>
          p.title.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.techStack && p.techStack.some(t => t.toLowerCase().includes(q)))
        );
      }
      return list;
    },
    getById: (id) => {
      const list = safeReadJsonSync(PROJECTS_FILE, initialProjects);
      return list.find(p => p.id === id) || null;
    },
    create: (projectData) => {
      const list = safeReadJsonSync(PROJECTS_FILE, initialProjects);
      const newProject = {
        id: projectData.id || `proj_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
        title: projectData.title,
        tagline: projectData.tagline || '',
        category: projectData.category || 'capstone',
        subCategory: projectData.subCategory || 'fullstack',
        featured: !!projectData.featured,
        description: projectData.description || '',
        highlights: Array.isArray(projectData.highlights) ? projectData.highlights : [],
        techStack: Array.isArray(projectData.techStack) ? projectData.techStack : [],
        links: projectData.links || {},
        image: projectData.image || '',
        status: projectData.status || 'Active',
        createdAt: new Date().toISOString()
      };
      list.unshift(newProject);
      safeWriteJsonSync(PROJECTS_FILE, list);
      return newProject;
    },
    update: (id, updates) => {
      const list = safeReadJsonSync(PROJECTS_FILE, initialProjects);
      const idx = list.findIndex(p => p.id === id);
      if (idx === -1) return null;
      list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
      safeWriteJsonSync(PROJECTS_FILE, list);
      return list[idx];
    },
    delete: (id) => {
      let list = safeReadJsonSync(PROJECTS_FILE, initialProjects);
      const origLen = list.length;
      list = list.filter(p => p.id !== id);
      if (list.length !== origLen) {
        safeWriteJsonSync(PROJECTS_FILE, list);
        return true;
      }
      return false;
    }
  },

  skills: {
    getAll: () => safeReadJsonSync(SKILLS_FILE, initialSkills),
    saveAll: (skillsArray) => {
      safeWriteJsonSync(SKILLS_FILE, skillsArray);
      return skillsArray;
    }
  },

  analytics: {
    recordVisit: ({ ip, userAgent, path: reqPath = '/', referrer = '' }) => {
      const data = safeReadJsonSync(ANALYTICS_FILE, initialAnalytics);
      data.totalVisits += 1;
      
      const today = new Date().toISOString().split('T')[0];
      data.dailyVisits[today] = (data.dailyVisits[today] || 0) + 1;

      if (referrer && !referrer.includes('localhost') && !referrer.includes('127.0.0.1')) {
        try {
          const refHost = new URL(referrer).hostname;
          data.topReferrers[refHost] = (data.topReferrers[refHost] || 0) + 1;
        } catch (_) {}
      }

      data.recentVisits.unshift({
        timestamp: new Date().toISOString(),
        path: reqPath,
        browser: userAgent ? userAgent.split(' ')[0] : 'unknown'
      });
      if (data.recentVisits.length > 50) {
        data.recentVisits = data.recentVisits.slice(0, 50);
      }

      safeWriteJsonSync(ANALYTICS_FILE, data);
      return { totalVisits: data.totalVisits };
    },

    recordDownload: (type = 'resume') => {
      const data = safeReadJsonSync(ANALYTICS_FILE, initialAnalytics);
      if (type === 'resume') {
        data.resumeDownloads = (data.resumeDownloads || 0) + 1;
      }
      safeWriteJsonSync(ANALYTICS_FILE, data);
      return data.resumeDownloads;
    },

    getSummary: () => {
      const data = safeReadJsonSync(ANALYTICS_FILE, initialAnalytics);
      const messages = safeReadJsonSync(MESSAGES_FILE, []);
      return {
        totalVisits: data.totalVisits,
        uniqueVisitors: data.uniqueVisitors,
        resumeDownloads: data.resumeDownloads || 0,
        totalInquiries: messages.length,
        unreadInquiries: messages.filter(m => !m.read).length,
        dailyVisits: data.dailyVisits,
        topReferrers: data.topReferrers,
        recentVisits: data.recentVisits.slice(0, 15)
      };
    }
  },

  stats: {
    getStats: () => {
      const projects = safeReadJsonSync(PROJECTS_FILE, initialProjects);
      const analytics = safeReadJsonSync(ANALYTICS_FILE, initialAnalytics);
      const messages = safeReadJsonSync(MESSAGES_FILE, []);
      const productionCount = projects.filter(p => p.category === 'production').length;
      
      return {
        totalProjects: projects.length,
        productionAppsShipped: productionCount || 9,
        liveVisitorCount: analytics.totalVisits,
        resumeDownloads: analytics.resumeDownloads || 215,
        messagesReceived: messages.length,
        cybersecurityAudits: 6,
        primaryDomain: "Cybersecurity (VAPT & Ethical Hacking)",
        status: "Available for Opportunities · 2026",
        serverTimestamp: new Date().toISOString()
      };
    }
  },

  admin: {
    verifyPassword: (inputPassword) => {
      const adminData = safeReadJsonSync(ADMIN_FILE, null);
      if (!adminData) return false;
      const computedHash = hashPassword(inputPassword, adminData.salt);
      const hashBuffer = Buffer.from(computedHash, 'hex');
      const targetBuffer = Buffer.from(adminData.hash, 'hex');
      if (hashBuffer.length !== targetBuffer.length) return false;
      const isMatch = crypto.timingSafeEqual(hashBuffer, targetBuffer);
      if (isMatch) {
        adminData.lastLogin = new Date().toISOString();
        safeWriteJsonSync(ADMIN_FILE, adminData);
      }
      return isMatch;
    },
    updatePassword: (newPassword) => {
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = hashPassword(newPassword, salt);
      safeWriteJsonSync(ADMIN_FILE, {
        salt,
        hash,
        lastLogin: new Date().toISOString()
      });
      return true;
    }
  }
};

