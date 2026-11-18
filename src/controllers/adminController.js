import { db } from '../db/database.js';
import { createAdminToken } from '../middleware/auth.js';

export function loginAdmin(req, res) {
  try {
    const { password } = req.body;
    if (!password || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Password is required.'
      });
    }

    const isValid = db.admin.verifyPassword(password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid administrator credentials.'
      });
    }

    const token = createAdminToken();
    return res.status(200).json({
      success: true,
      message: 'Authentication successful.',
      token,
      expiresIn: '24h'
    });
  } catch (err) {
    console.error('[ADMIN LOGIN ERROR]', err);
    return res.status(500).json({
      success: false,
      error: 'An internal authentication error occurred.'
    });
  }
}

export function getAdminMessages(req, res) {
  try {
    const { unreadOnly } = req.query;
    const messages = db.messages.getAll({ unreadOnly: unreadOnly === 'true' });
    return res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (err) {
    console.error('[ADMIN GET MESSAGES ERROR]', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve messages.'
    });
  }
}

export function markMessageAsRead(req, res) {
  try {
    const { id } = req.params;
    const updated = db.messages.markRead(id);
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: `Message with ID '${id}' not found.`
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Message marked as read.',
      data: updated
    });
  } catch (err) {
    console.error('[ADMIN MARK READ ERROR]', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to update message.'
    });
  }
}

export function deleteMessage(req, res) {
  try {
    const { id } = req.params;
    const deleted = db.messages.delete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: `Message with ID '${id}' not found.`
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Message permanently removed.'
    });
  } catch (err) {
    console.error('[ADMIN DELETE MESSAGE ERROR]', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete message.'
    });
  }
}

export function getAdminAnalytics(req, res) {
  try {
    const summary = db.analytics.getSummary();
    return res.status(200).json({
      success: true,
      data: summary
    });
  } catch (err) {
    console.error('[ADMIN ANALYTICS ERROR]', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve analytics data.'
    });
  }
}

export function updateAdminPassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 8 characters long.'
      });
    }

    const isValid = db.admin.verifyPassword(currentPassword);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'Current password verification failed.'
      });
    }

    db.admin.updatePassword(newPassword);
    return res.status(200).json({
      success: true,
      message: 'Admin password updated successfully.'
    });
  } catch (err) {
    console.error('[UPDATE ADMIN PASSWORD ERROR]', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to update admin password.'
    });
  }
}

