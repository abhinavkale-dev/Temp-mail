import rateLimit from 'express-rate-limit';
import { Request } from 'express';

const getClientIp = (req: Request): string => {
  const forwardedFor = req.headers['x-forwarded-for'];
  const realIp = req.headers['x-real-ip'] as string | undefined;
  const cfIp = req.headers['cf-connecting-ip'] as string | undefined;
  
  if (typeof forwardedFor === 'string' && forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  return realIp || cfIp || req.ip || '';
};

export const createMailboxLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  message: {
    error: 'Too many mailboxes created from this IP, please try again after 5 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => getClientIp(req),
  handler: (req, res) => {
    console.warn('[RATE LIMIT EXCEEDED]', {
      ip: getClientIp(req),
      endpoint: req.path,
      timestamp: new Date().toISOString()
    });
    res.status(429).json({
      error: 'Too many requests from this IP, please try again later'
    });
  }
});


export const messageAccessLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  message: {
    error: 'Too many requests, please slow down'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => getClientIp(req),
  handler: (req, res) => {
    console.warn('[RATE LIMIT EXCEEDED]', {
      ip: getClientIp(req),
      endpoint: req.path,
      timestamp: new Date().toISOString()
    });
    res.status(429).json({
      error: 'Too many requests from this IP, please slow down'
    });
  }
});

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: 'Too many requests from this IP'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => getClientIp(req),
  handler: (req, res) => {
    console.warn('[GENERAL RATE LIMIT EXCEEDED]', {
      ip: getClientIp(req),
      endpoint: req.path,
      timestamp: new Date().toISOString()
    });
    res.status(429).json({
      error: 'Too many requests from this IP, please try again later'
    });
  }
});
