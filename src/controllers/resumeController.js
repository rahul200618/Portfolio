import fs from 'fs';
import path from 'path';
import { db } from '../db/database.js';
import { config } from '../config/index.js';

export function downloadResume(req, res) {
  try {
    // Record resume download in analytics
    const totalDownloads = db.analytics.recordDownload('resume');
    console.log(`[RESUME DOWNLOAD] Resume downloaded. Total downloads: ${totalDownloads}`);

    // Check possible file locations
    const candidatePaths = [
      path.join(config.paths.public, 'Rahul_Resume4.3.pdf'),
      path.join(config.paths.root, 'Rahul_Resume4.3.pdf'),
      path.join(config.paths.root, 'public', 'Rahul_Resume4.3.pdf')
    ];

    const resumePath = candidatePaths.find(p => fs.existsSync(p));

    if (!resumePath) {
      return res.status(404).json({
        success: false,
        error: 'Resume PDF file not found on server.'
      });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="Rahul_A_Resume.pdf"');
    return res.sendFile(resumePath);
  } catch (err) {
    console.error('[RESUME DOWNLOAD ERROR]', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to process resume download.'
    });
  }
}

