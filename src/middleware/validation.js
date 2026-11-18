// Input Sanitizer to neutralize HTML tags and script injections (OWASP XSS defense)
export function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str
    .trim()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Contact form payload validator
export function validateContactPayload(req, res, next) {
  const { name, email, subject, message, _gotcha } = req.body;

  // 1. Anti-spam Honeypot Check: bots automatically populate hidden input fields
  if (_gotcha && _gotcha.trim().length > 0) {
    // Silently reject or simulate success to trap bot without alerting attacker
    return res.status(200).json({
      success: true,
      message: 'Inquiry received successfully!'
    });
  }

  // 2. Validate Name
  if (!name || typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
    return res.status(400).json({
      success: false,
      error: 'Please provide a valid full name (2 to 100 characters).'
    });
  }

  // 3. Validate Email Format (RFC 5322 regex approximation)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== 'string' || !emailRegex.test(email.trim()) || email.trim().length > 254) {
    return res.status(400).json({
      success: false,
      error: 'Please provide a valid, deliverable email address.'
    });
  }

  // 4. Validate Subject (Optional, but if given, enforce bounds)
  if (subject && (typeof subject !== 'string' || subject.trim().length > 150)) {
    return res.status(400).json({
      success: false,
      error: 'Subject exceeds the maximum allowed length of 150 characters.'
    });
  }

  // 5. Validate Message
  if (!message || typeof message !== 'string' || message.trim().length < 10 || message.trim().length > 3000) {
    return res.status(400).json({
      success: false,
      error: 'Message must be between 10 and 3,000 characters.'
    });
  }

  // Sanitize cleaned fields and attach to request object
  req.sanitizedData = {
    name: sanitizeString(name),
    email: email.trim().toLowerCase(),
    subject: sanitizeString(subject || 'General Inquiry / Opportunity'),
    message: sanitizeString(message)
  };

  next();
}

