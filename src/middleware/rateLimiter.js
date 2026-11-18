import rateLimit from 'express-rate-limit';

// Global API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP address. Please try again in a few minutes.'
  }
});

// Stricter rate limiter for contact form submissions (prevent spam & flooding)
export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 8, // Limit each IP to 8 contact messages per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Contact message limit reached. Please wait an hour before submitting again, or email directly.'
  }
});

// Stricter rate limiter for Admin authentication (prevent brute force attacks)
export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 failed login attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many admin authorization attempts. IP temporarily throttled.'
  }
});


// Rate limiter for AI Career Chatbot
export const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 40, // Max 40 questions per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'AI chat inquiry rate limit reached. Please wait a few minutes before asking more questions.'
  }
});
