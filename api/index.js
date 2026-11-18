import app from '../server.js';
import { knowledgeService } from '../src/services/knowledgeService.js';

// Pre-warm knowledge service for serverless cold-starts
knowledgeService.init().catch(err => {
  console.warn('[SERVERLESS KNOWLEDGE WARMUP NOTICE]', err.message);
});

export default app;

