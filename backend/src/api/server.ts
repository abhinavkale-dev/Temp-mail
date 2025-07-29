import express from 'express';
import cors from 'cors';
import {prisma} from '../lib/prisma.js';
import { makeCustomAddress, normalizeAddress, isOurDomain } from '../lib/email.js';
import rateLimit from './middleware/rateLimit.js';

interface Server {
  listen(port: number, callback?: () => void): void;
}


export function createApiServer(): Server {
  const app = express();
  
  app.use(express.json());
  app.use(cors({origin: process.env.CORS_ORIGIN || true}));
  app.use(rateLimit);

  app.get('/health', (req, res) => res.json({ok: true}));

  app.post('/mailboxes/custom', async(req, res) => {
    try {
      const { username } = req.body;
      
      if (!username || typeof username !== 'string') {
        return res.status(400).json({ error: 'Username is required' });
      }
      
      const address = makeCustomAddress(username);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      
      let mailbox = await prisma.mailbox.findUnique({
        where: { address }
      });
      
      if (!mailbox) {
        mailbox = await prisma.mailbox.create({
          data: {
            address,
            expiresAt
          }
        });
        
        console.log('[CUSTOM MAILBOX CREATED]', {
          username,
          address: address,
          expiresAt: expiresAt.toISOString(),
          timestamp: new Date().toISOString()
        });
      } else {
        console.log('[EXISTING MAILBOX ACCESSED]', {
          username,
          address: address,
          timestamp: new Date().toISOString()
        });
      }
      
      res.json({
        address: mailbox.address,
        createdAt: mailbox.createdAt,
        expiresAt: mailbox.expiresAt
      });
    } catch (error) {
      console.error('Error creating custom mailbox', error);
      res.status(500).json({error: 'Failed to create mailbox'});
    }
  });

  app.post('/mailboxes', async (req, res) => {
    try {
      const { address } = req.body ?? {}; 
      if (!address)
        return res.status(400).json({ error: 'address required' });

      const norm = normalizeAddress(address);
      if (!isOurDomain(norm))
        return res.status(400).json({ error: 'wrong domain' });

      const mb = await prisma.mailbox.create({ data: { address: norm } });
      res.json({ address: mb.address });
    } catch (e) {
      res.status(409).json({ error: 'address exists' });
    }
  });

  app.post('/mailboxes/:address/messages', async(req, res) => {
    try {
      const addr = normalizeAddress(req.params.address);

      const mb = await prisma.mailbox.findUnique({
        where: {address: addr},
        include: {
          messages: {
            orderBy: {createdAt: 'desc'},
            take: 50,
            select: {
              id: true,
              from: true,
              subject: true,
              createdAt: true,
            }
          }
        }
      });

      if(!mb) return res.status(404).json({error: 'not found'});

      console.log('[MESSAGES ACCESSED]', {
        address: addr,
        messageCount: mb.messages.length,
        timestamp: new Date().toISOString(),
        userAgent: req.headers['user-agent']?.slice(0, 50) || 'unknown'
      });

      res.json({
        address: mb.address,
        createdAt: mb.createdAt,
        expiresAt: mb.expiresAt,
        messageCount: mb.messages.length,
        messages: mb.messages,
      });
    } catch (error) {
      console.error('Error fetching messages', error);
      res.status(500).json({error: 'Failed to fetch messages'});
    }
  })

  app.get('/messages/:id', async(req, res)=> {
    try {
      const msg = await prisma.message.findUnique({
        where: {id: req.params.id},
        include: {
          mailbox: {select: {address: true}},
        }
      });

      if(!msg) return res.status(404).json({error: 'not found'});
      
      console.log('[MESSAGE ACCESSED]', {
        id: msg.id,
        mailbox: msg.mailbox.address
      });

      const { simpleParser } = await import('mailparser');
      const parsed = await simpleParser(Buffer.from(msg.raw));

      console.log('[EMAIL PARSED]', {
        messageId: msg.id,
        hasHtml: !!parsed.html,
        htmlLength: parsed.html ? parsed.html.length : 0,
        hasText: !!parsed.text,
        textLength: parsed.text ? parsed.text.length : 0,
        htmlPreview: parsed.html ? parsed.html.substring(0, 200) + '...' : 'No HTML'
      });

      res.json({
        id: msg.id,
        from: msg.from,
        subject: msg.subject,
        body: msg.raw, 
        createdAt: msg.createdAt,
        mailbox: msg.mailbox.address,
        parsedData: {
          subject: parsed.subject || '',
          from: parsed.from?.text || '',
          text: parsed.text || '',
          html: parsed.html || '',
          textAsHtml: parsed.textAsHtml || '',
          attachments: parsed.attachments || [],
          date: parsed.date || new Date(msg.createdAt),
        }
      });
    } catch (error) {
      console.error('Error fetching message', error);
      res.status(500).json({error: 'Failed to fetch message'});
    }
  })

  return app;
}
