import crypto from 'crypto';
import { config } from '../config/index.js';

// Create a signed tamper-proof token for admin session
export function createAdminToken() {
  const payload = {
    role: 'admin',
    issuedAt: Date.now(),
    expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours validity
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', config.admin.secretKey)
    .update(encodedPayload)
    .digest('base64url');
  return `${encodedPayload}.${signature}`;
}

// Verify admin token
export function verifyAdminToken(token) {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [encodedPayload, receivedSignature] = parts;
  const expectedSignature = crypto
    .createHmac('sha256', config.admin.secretKey)
    .update(encodedPayload)
    .digest('base64url');

  if (receivedSignature !== expectedSignature) return false;

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
    if (Date.now() > payload.expiresAt) return false;
    return payload;
  } catch (_) {
    return false;
  }
}

// Express Middleware for protected routes
export function requireAdminAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : req.headers['x-admin-token'];

  const verified = verifyAdminToken(token);
  if (!verified) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid or expired administrator session token.'
    });
  }

  req.adminUser = verified;
  next();
}

