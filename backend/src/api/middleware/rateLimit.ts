import { Request, Response, NextFunction } from 'express';

const hits = new Map<string, { count: number; ts: number }>();
const WINDOW = Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000;
const MAX = Number(process.env.RATE_LIMIT_MAX) || 120;

export default function rateLimit(req: Request, res: Response, next: NextFunction) {
  const key = req.ip || 'unknown';
  const now = Date.now();
  const entry = hits.get(key);
  
  if (!entry || now - entry.ts > WINDOW) {
    hits.set(key, { count: 1, ts: now });
    return next();
  }
  
  entry.count++;
  if (entry.count > MAX) {
    return res.status(429).json({ error: 'Too many requests' });
  }
  
  next();
} 