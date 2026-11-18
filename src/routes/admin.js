import express from 'express';
import {
  loginAdmin,
  getAdminMessages,
  markMessageAsRead,
  deleteMessage,
  getAdminAnalytics,
  updateAdminPassword
} from '../controllers/adminController.js';
import { requireAdminAuth } from '../middleware/auth.js';
import { adminLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Admin Authentication
router.post('/login', adminLimiter, loginAdmin);

// Protected Admin Routes (require valid Bearer token)
router.get('/messages', requireAdminAuth, getAdminMessages);
router.patch('/messages/:id/read', requireAdminAuth, markMessageAsRead);
router.delete('/messages/:id', requireAdminAuth, deleteMessage);
router.get('/analytics', requireAdminAuth, getAdminAnalytics);
router.post('/password', requireAdminAuth, updateAdminPassword);

export default router;

