import { db } from '../db/database.js';

const startTime = Date.now();

export function getStats(req, res) {
  try {
    const stats = db.stats.getStats();
    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (err) {
    console.error('[STATS ERROR]', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve system statistics.'
    });
  }
}

export function recordPageVisit(req, res) {
  try {
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'unknown';
    const referrer = req.headers['referer'] || '';
    const reqPath = req.body.path || req.query.path || '/';

    const result = db.analytics.recordVisit({
      ip: clientIp,
      userAgent,
      path: reqPath,
      referrer
    });

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    console.error('[ANALYTICS VISIT ERROR]', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to record page visit.'
    });
  }
}

export function getHealth(req, res) {
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
  const memory = process.memoryUsage();

  return res.status(200).json({
    status: 'HEALTHY',
    service: 'Rahul-Portfolio-Backend',
    timestamp: new Date().toISOString(),
    uptime: `${uptimeSeconds}s`,
    environment: process.env.NODE_ENV || 'development',
    runtime: {
      node: process.version,
      platform: process.platform,
      arch: process.arch
    },
    memory: {
      rss: `${Math.round(memory.rss / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memory.heapUsed / 1024 / 1024)} MB`
    }
  });
}

