import express from 'express';
import { submitContactForm } from '../controllers/contactController.js';
import { getAllProjects, getProjectById, getAllSkills } from '../controllers/projectsController.js';
import { getStats, recordPageVisit, getHealth } from '../controllers/statsController.js';
import { downloadResume } from '../controllers/resumeController.js';
import { handleChatMessage, getChatSuggestions, getKnowledgeStatus, syncKnowledge } from '../controllers/chatController.js';
import { validateContactPayload } from '../middleware/validation.js';
import { contactLimiter, chatLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// System Health & Telemetry
router.get('/health', getHealth);
router.get('/stats', getStats);
router.post('/analytics/visit', recordPageVisit);

// Dynamic Content Endpoints
router.get('/projects', getAllProjects);
router.get('/projects/:id', getProjectById);
router.get('/skills', getAllSkills);

// Tracked Resume Download
router.get('/resume/download', downloadResume);

// Contact Form Submission (Rate Limited + Validated + Sanitized)
router.post('/contact', contactLimiter, validateContactPayload, submitContactForm);

// AI Career Chatbot Assistant & Dynamic Knowledge Synchronization
router.get('/chat/status', getKnowledgeStatus);
router.post('/chat/sync', syncKnowledge);
router.get('/chat/suggestions', getChatSuggestions);
router.post('/chat', chatLimiter, handleChatMessage);

export default router;

