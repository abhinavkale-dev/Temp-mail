import express from 'express';
import request from 'supertest';
import { createMailboxLimiter, messageAccessLimiter, generalLimiter } from '../middleware/rateLimit';

describe('Rate Limit Middleware', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
  });

  describe('createMailboxLimiter', () => {
    beforeEach(() => {
      app.use('/test-mailbox', createMailboxLimiter, (req, res) => {
        res.status(200).json({ success: true });
      });
    });

    it('should handle x-forwarded-for header correctly', async () => {
      const testIp = '192.168.1.1';
      
      // Make 5 requests (up to limit)
      for (let i = 0; i < 5; i++) {
        const response = await request(app)
          .get('/test-mailbox')
          .set('x-forwarded-for', testIp);
        
        expect(response.status).toBe(200);
      }
      
      // The 6th request should hit rate limit
      const response = await request(app)
        .get('/test-mailbox')
        .set('x-forwarded-for', testIp);
      
      expect(response.status).toBe(429);
      expect(response.body.error).toContain('Too many requests');
    });
  });

  describe('messageAccessLimiter', () => {
    beforeEach(() => {
      app.use('/test-messages', messageAccessLimiter, (req, res) => {
        res.status(200).json({ success: true });
      });
    });

    it('should handle cf-connecting-ip header correctly', async () => {
      const testIp = '192.168.1.2';
      
      // Make 30 requests (up to limit)
      for (let i = 0; i < 30; i++) {
        const response = await request(app)
          .get('/test-messages')
          .set('cf-connecting-ip', testIp);
        
        expect(response.status).toBe(200);
      }
      
      // The 31st request should hit rate limit
      const response = await request(app)
        .get('/test-messages')
        .set('cf-connecting-ip', testIp);
      
      expect(response.status).toBe(429);
      expect(response.body.error).toContain('Too many requests');
    });
  });

  describe('generalLimiter', () => {
    beforeEach(() => {
      app.use('/test-general', generalLimiter, (req, res) => {
        res.status(200).json({ success: true });
      });
    });

    it('should handle x-real-ip header correctly', async () => {
      const testIp = '192.168.1.3';
      
      // Make a few requests (not enough to hit limit)
      for (let i = 0; i < 10; i++) {
        const response = await request(app)
          .get('/test-general')
          .set('x-real-ip', testIp);
        
        expect(response.status).toBe(200);
      }
    });
  });
});
