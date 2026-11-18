import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { config } from '../config/index.js';
import { knowledgeService } from '../services/knowledgeService.js';

let geminiQuotaExceededUntil = 0;

// Dynamically retrieve Gemini API key (supports runtime updates to .env)
function getLiveGeminiApiKey() {
  // Always inspect .env in real time if process.env is empty or if .env was edited
  try {
    const envPath = path.join(config.paths.root, '.env');
    if (fs.existsSync(envPath)) {
      const parsed = dotenv.parse(fs.readFileSync(envPath, 'utf8'));
      if (parsed.GEMINI_API_KEY && parsed.GEMINI_API_KEY.trim()) {
        process.env.GEMINI_API_KEY = parsed.GEMINI_API_KEY.trim();
        return parsed.GEMINI_API_KEY.trim();
      }
    }
  } catch (_) {}

  return process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : '';
}

// Controller function: handles POST /api/chat
export async function handleChatMessage(req, res) {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a non-empty message.'
      });
    }

    const trimmedMsg = message.trim();
    const apiKey = getLiveGeminiApiKey();

    // Retrieve guaranteed up-to-date dynamic context (auto-syncs on file changes)
    const context = await knowledgeService.getOrRefreshContext();
    const freshSuggestions = knowledgeService.getRandomSuggestions();

    // 1. Try Google Gemini API with highest daily-quota Flash-Lite models (1,500 Requests Per Day)
    if (apiKey && Date.now() >= geminiQuotaExceededUntil) {
      const highQuotaModels = ['gemini-3.5-flash-lite', 'gemini-flash-lite-latest'];

      for (const modelName of highQuotaModels) {
        try {
          const contents = [
            {
              role: 'user',
              parts: [{ text: `SYSTEM CONTEXT & GROUND TRUTH (AUTOMATICALLY SYNCED WITH PORTFOLIO, RESUME & PROJECTS):\n${context.masterContextPrompt}` }]
            },
            {
              role: 'model',
              parts: [{ text: 'Understood. I am Rahul\'s AI Copilot, the official technical representative for Rahul A. I am dynamically synchronized with his verified resume, real-time system clock, all live projects in data/projects.json, and technical skills matrix.' }]
            }
          ];

          if (Array.isArray(history)) {
            history.slice(-6).forEach(h => {
              if (h.role && h.text) {
                contents.push({
                  role: h.role === 'user' ? 'user' : 'model',
                  parts: [{ text: h.text }]
                });
              }
            });
          }

          contents.push({
            role: 'user',
            parts: [{ text: trimmedMsg }]
          });

          // Timeout for high-capacity flash-lite generation
          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              signal: AbortSignal.timeout(5500),
              body: JSON.stringify({
                contents,
                generationConfig: {
                  temperature: 0.35,
                  maxOutputTokens: 850
                }
              })
            }
          );

          if (geminiRes.ok) {
            const data = await geminiRes.json();
            const textPart = data.candidates?.[0]?.content?.parts?.find(p => p.text);
            const replyText = textPart?.text || data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (replyText) {
              console.log(`[GEMINI LIVE SUCCESS] Answered via ${modelName} (1,500 RPD tier) for: "${trimmedMsg.slice(0, 40)}..."`);
              return res.status(200).json({
                success: true,
                source: modelName,
                isAI: true,
                reply: replyText,
                suggestions: freshSuggestions,
                syncedAt: new Date(context.lastBuildTimestamp).toISOString()
              });
            }
          } else if (geminiRes.status === 429) {
            geminiQuotaExceededUntil = Date.now() + 60 * 1000; // 60s fast-fallback cache
            console.warn(`[GEMINI 429] Rate limit reached on ${modelName}. Seamlessly serving dynamic knowledge engine.`);
            break;
          } else {
            const errData = await geminiRes.json().catch(() => ({}));
            console.warn(`[GEMINI ${modelName} REJECTED] HTTP ${geminiRes.status}:`, errData?.error?.message || geminiRes.statusText);
          }
        } catch (err) {
          console.warn(`[GEMINI ${modelName} TIMEOUT/ERR]`, err.message);
        }
      }
    }

    // 2. Intelligent Dynamic Offline/Local Knowledge Responder
    const fallbackReply = knowledgeService.generateDynamicKnowledgeResponse(trimmedMsg);
    return res.status(200).json({
      success: true,
      source: 'dynamic-knowledge-engine',
      isAI: false,
      reply: fallbackReply,
      suggestions: freshSuggestions,
      syncedAt: new Date(context.lastBuildTimestamp).toISOString()
    });
  } catch (err) {
    console.error('[CHAT CONTROLLER ERROR]', err);
    return res.status(500).json({
      success: false,
      error: 'An internal error occurred while processing the chat inquiry.'
    });
  }
}

// Controller function: handles GET /api/chat/suggestions to rotate prompts dynamically
export async function getChatSuggestions(req, res) {
  await knowledgeService.getOrRefreshContext();
  const suggestions = knowledgeService.getRandomSuggestions();
  return res.status(200).json({
    success: true,
    suggestions
  });
}

// Controller function: handles GET /api/chat/status to check dynamic synchronization telemetry
export async function getKnowledgeStatus(req, res) {
  await knowledgeService.getOrRefreshContext();
  const status = knowledgeService.getStatus();
  const apiKey = getLiveGeminiApiKey();
  const isGeminiAvailable = !!apiKey && Date.now() >= geminiQuotaExceededUntil;

  return res.status(200).json({
    success: true,
    geminiConfigured: isGeminiAvailable,
    activeModel: 'gemini-3.5-flash-lite',
    dailyQuota: '1,500 RPD',
    quotaExceeded: Date.now() < geminiQuotaExceededUntil,
    status
  });
}

// Controller function: handles POST /api/chat/sync to manually force an immediate rebuild
export async function syncKnowledge(req, res) {
  try {
    await knowledgeService.build();
    return res.status(200).json({
      success: true,
      message: 'Knowledge base synchronized successfully with all resume, project, and website files.',
      status: knowledgeService.getStatus()
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
}
