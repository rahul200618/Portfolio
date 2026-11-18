/**
 * Rahul A. — "Rahul-Bot" AI Career & Technical Agent
 * Client-side assistant connecting to Gemini API & master career knowledge engine
 * Features auto-refreshing dynamic suggestion prompts & interactive shuffle
 */

(function () {
  'use strict';

  const API_BASE = window.location.origin.includes('http') ? window.location.origin : 'http://localhost:5000';
  let conversationHistory = [];
  let suggestionInterval = null;

  // Fallback suggestion sets across domains
  const LOCAL_SUGGESTION_POOLS = [
    [
      "Tell me about the 9 production apps Rahul built at OpenAlgon",
      "What is Rahul's cybersecurity & VAPT background?",
      "How did Rahul achieve AUC 0.816 on Wine Quality without data leakage?",
      "What were Rahul's contributions to Formula Bharat 2026 (E17)?",
      "How can I interview or hire Rahul?"
    ],
    [
      "How does RankPrediction achieve sub-100ms rank estimations?",
      "Explain the 6-vector exploit suite in his Digital Cash protocol",
      "How was Agro ERP deployed to Web, Android & Desktop from one repo?",
      "How does Symbio Insight analyze DNA sequences with Gemini AI?",
      "What is Rahul's academic background at Atria University?"
    ],
    [
      "Explain the Shree Udupi Aramane restaurant operations monolith",
      "What offensive security tools does Rahul use in Kali Linux?",
      "How does Abhyas Nepal handle timed exams and anti-cheat?",
      "How does the CAN bus telemetry & BMS isolation loop work?",
      "What roles & internships is Rahul currently seeking in 2026?"
    ]
  ];
  let poolIndex = 0;

  function initChat() {
    const chatDrawer = document.getElementById('ai-chat-drawer');
    const chatTrigger = document.getElementById('btn-chat-trigger');
    const chatClose = document.getElementById('chat-close');
    const chatForm = document.getElementById('chat-input-form');
    const chatInput = document.getElementById('chat-user-input');
    const chatBody = document.getElementById('chat-messages-body');
    const typingIndicator = document.getElementById('chat-typing');
    const chipsBar = document.querySelector('.chat-chips-bar');

    if (!chatDrawer || !chatForm || !chatInput) return;

    function openChat() {
      chatDrawer.classList.add('open');
      chatInput.focus();
      fetchKnowledgeStatus();
      startAutoRefreshSuggestions();
    }
    function closeChat() {
      chatDrawer.classList.remove('open');
      stopAutoRefreshSuggestions();
    }

    if (chatTrigger) chatTrigger.addEventListener('click', () => {
      chatDrawer.classList.contains('open') ? closeChat() : openChat();
    });
    if (chatClose) chatClose.addEventListener('click', closeChat);

    // Initial suggestions render & status check
    fetchKnowledgeStatus();
    fetchFreshSuggestions();

    // Form submit
    chatForm.addEventListener('submit', e => {
      e.preventDefault();
      const text = chatInput.value.trim();
      if (!text) return;
      chatInput.value = '';
      sendMessage(text);
    });

    async function sendMessage(text) {
      appendUserMessage(text);
      scrollBottom();

      // Show typing indicator
      if (typingIndicator) typingIndicator.style.display = 'flex';
      scrollBottom();

      try {
        const res = await fetch(`${API_BASE}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            history: conversationHistory
          })
        });

        const data = await res.json();
        if (typingIndicator) typingIndicator.style.display = 'none';

        if (res.ok && data.success && data.reply) {
          appendBotMessage(data.reply, { source: data.source, isAI: data.isAI });
          conversationHistory.push({ role: 'user', text });
          conversationHistory.push({ role: 'model', text: data.reply });
          if (conversationHistory.length > 8) {
            conversationHistory = conversationHistory.slice(-8);
          }

          // Automatically refresh suggestions with new follow-ups
          if (Array.isArray(data.suggestions) && data.suggestions.length > 0) {
            renderSuggestions(data.suggestions);
          } else {
            cycleLocalSuggestions();
          }
        } else {
          appendBotMessage(data.error || 'I encountered an issue processing that query. Please try again or reach out to Rahul directly.');
        }
      } catch (err) {
        if (typingIndicator) typingIndicator.style.display = 'none';
        appendBotMessage('Network connection failed. You can email Rahul directly at **rahuldheeraj.anil@gmail.com**.');
      }
      scrollBottom();
    }

    // Dynamic Suggestion Chips Renderer
    function renderSuggestions(suggestions) {
      if (!chipsBar) return;
      chipsBar.innerHTML = '';

      suggestions.forEach(prompt => {
        const chip = document.createElement('button');
        chip.className = 'chat-chip';
        // Shorten label if too long
        let displayLabel = prompt;
        if (displayLabel.length > 36) {
          displayLabel = displayLabel.slice(0, 34) + '...';
        }
        chip.textContent = displayLabel;
        chip.title = prompt;
        chip.setAttribute('data-prompt', prompt);

        chip.addEventListener('click', () => {
          sendMessage(prompt);
        });

        chipsBar.appendChild(chip);
      });
    }

    async function fetchKnowledgeStatus() {
      try {
        const res = await fetch(`${API_BASE}/api/chat/status`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.status) {
            const statusEl = document.getElementById('chat-header-status');
            if (statusEl) {
              const count = data.status.projectsCount || 0;
              const aiNote = data.geminiConfigured ? 'GEMINI 3.5 FLASH-LITE (1500 RPD)' : 'KNOWLEDGE ENGINE ACTIVE';
              statusEl.innerHTML = `<span>●</span> ${aiNote} (${count} PROJS)`;
              statusEl.title = `Knowledge base auto-synced with ${count} projects. ${data.geminiConfigured ? 'Gemini 3.5 Flash-Lite active with 1,500 RPD daily limit' : 'Running instant local knowledge engine'}`;
            }
          }
        }
      } catch (_) {}
    }

    async function fetchFreshSuggestions() {
      try {
        const res = await fetch(`${API_BASE}/api/chat/suggestions`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.suggestions)) {
            renderSuggestions(data.suggestions);
            return;
          }
        }
      } catch (_) {}
      cycleLocalSuggestions();
    }

    function cycleLocalSuggestions() {
      poolIndex = (poolIndex + 1) % LOCAL_SUGGESTION_POOLS.length;
      renderSuggestions(LOCAL_SUGGESTION_POOLS[poolIndex]);
    }

    function startAutoRefreshSuggestions() {
      if (suggestionInterval) clearInterval(suggestionInterval);
      // Gently rotate suggestions every 35 seconds if idle
      suggestionInterval = setInterval(() => {
        fetchFreshSuggestions();
      }, 35000);
    }

    function stopAutoRefreshSuggestions() {
      if (suggestionInterval) clearInterval(suggestionInterval);
    }

    function appendUserMessage(text) {
      const msg = document.createElement('div');
      msg.className = 'chat-msg chat-msg-user';
      msg.innerHTML = `<div class="chat-bubble chat-bubble-user">${escapeHtml(text)}</div>`;
      chatBody.appendChild(msg);
    }

    function appendBotMessage(markdownText, meta = {}) {
      const msg = document.createElement('div');
      msg.className = 'chat-msg chat-msg-bot';
      const aiBadge = meta.source && meta.source.includes('gemini')
        ? `<div style="font-size:9.5px;color:rgba(0,212,255,0.85);font-family:'JetBrains Mono',monospace;margin-top:8px;padding-top:4px;border-top:1px solid rgba(0,212,255,0.15);display:flex;align-items:center;gap:4px;"><span>✨</span> Gemini AI Active (${meta.source})</div>`
        : `<div style="font-size:9.5px;color:rgba(0,255,170,0.85);font-family:'JetBrains Mono',monospace;margin-top:8px;padding-top:4px;border-top:1px solid rgba(0,255,170,0.15);display:flex;align-items:center;gap:4px;"><span>⚡</span> Knowledge Engine Active (Instant Sync)</div>`;
      msg.innerHTML = `
        <div class="chat-avatar">✨</div>
        <div class="chat-bubble chat-bubble-bot">
          ${parseSimpleMarkdown(markdownText)}
          ${aiBadge}
        </div>
      `;
      chatBody.appendChild(msg);
    }

    function scrollBottom() {
      if (chatBody) chatBody.scrollTop = chatBody.scrollHeight;
    }
  }

  // Lightweight Markdown Parser
  function parseSimpleMarkdown(md) {
    if (!md) return '';
    let html = escapeHtml(md);

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h4 style="color:#00d4ff;margin:8px 0 4px;font-size:13px;font-weight:600;">$1</h4>');
    html = html.replace(/^## (.*$)/gim, '<h3 style="color:#00d4ff;margin:10px 0 6px;font-size:14px;font-weight:600;">$1</h3>');

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong style="color:#fff;">$1</strong>');

    // Inline code
    html = html.replace(/`(.*?)`/gim, '<code style="background:rgba(0,212,255,0.1);color:#00d4ff;padding:2px 5px;border-radius:4px;font-family:monospace;font-size:11px;">$1</code>');

    // Markdown Links: [text](url)
    html = html.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank" style="color:#00d4ff;text-decoration:underline;">$1</a>');

    // Unordered lists
    html = html.replace(/^\* (.*$)/gim, '<li style="margin:2px 0 2px 14px;list-style-type:disc;">$1</li>');
    html = html.replace(/^- (.*$)/gim, '<li style="margin:2px 0 2px 14px;list-style-type:disc;">$1</li>');

    // Numbered lists
    html = html.replace(/^(\d+)\. (.*$)/gim, '<li style="margin:3px 0 3px 14px;list-style-type:decimal;"><span style="color:#dde6f5;">$2</span></li>');

    // Line breaks
    html = html.replace(/\n\n/g, '<div style="height:6px;"></div>');
    html = html.replace(/\n/g, '<br>');

    return html;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChat);
  } else {
    initChat();
  }
})();
