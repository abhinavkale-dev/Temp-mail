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
  
  const corsOptions = {
    origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
      if (!origin) return callback(null, true);
      
      const allowedOrigins = [
        'https://temp-mail.abhi.at',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3001'
      ];
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log('CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  };
  
  app.use(cors(corsOptions));
  app.use(rateLimit);

  const router = express.Router();

  router.get('/health', (req, res) => res.json({ok: true}));

  router.post('/mailboxes/custom', async(req, res) => {
    try {
      const { username } = req.body;
      
      if (!username || typeof username !== 'string') {
        return res.status(400).json({ error: 'Username is required' });
      }
      
      const address = makeCustomAddress(username);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); 
      
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
        
        if (!mailbox.expiresAt) {
          mailbox = await prisma.mailbox.update({
            where: { id: mailbox.id },
            data: { expiresAt }
          });
          console.log('[MAILBOX EXPIRY UPDATED]', {
            address: address,
            expiresAt: expiresAt.toISOString()
          });
        }
        
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

  router.post('/mailboxes', async (req, res) => {
    try {
      const { address } = req.body ?? {}; 
      if (!address)
        return res.status(400).json({ error: 'address required' });

      const norm = normalizeAddress(address);
      if (!isOurDomain(norm))
        return res.status(400).json({ error: 'wrong domain' });

      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const mb = await prisma.mailbox.create({ data: { address: norm, expiresAt } });
      res.json({ address: mb.address });
    } catch (e) {
      res.status(409).json({ error: 'address exists' });
    }
  });

  router.post('/mailboxes/:address/messages', async(req, res) => {
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
              raw: true,
              createdAt: true,
            }
          }
        }
      });

      if(!mb) return res.status(404).json({error: 'not found'});

      const messagesWithPreview = await Promise.all(
        mb.messages.map(async (msg) => {
          let preview = '';
          try {
            const { simpleParser } = await import('mailparser');
            const parsed = await simpleParser(Buffer.from(msg.raw));
            const textContent = parsed.text || (parsed.html ? parsed.html.replace(/<[^>]*>/g, '') : '') || '';
            preview = textContent.substring(0, 150).trim();
            if (textContent.length > 150) preview += '...';
          } catch (e) {
            preview = 'Unable to load preview';
          }

          return {
            id: msg.id,
            from: msg.from,
            subject: msg.subject || '(No Subject)',
            preview,
            createdAt: msg.createdAt.toISOString(),
          };
        })
      );

      console.log('[MESSAGES ACCESSED]', {
        address: addr,
        messageCount: messagesWithPreview.length,
        timestamp: new Date().toISOString(),
        userAgent: req.headers['user-agent']?.slice(0, 50) || 'unknown'
      });

      res.json({
        address: mb.address,
        createdAt: mb.createdAt.toISOString(),
        expiresAt: mb.expiresAt?.toISOString() || null,
        messageCount: messagesWithPreview.length,
        messages: messagesWithPreview,
      });
    } catch (error) {
      console.error('Error fetching messages', error);
      res.status(500).json({error: 'Failed to fetch messages'});
    }
  })

  router.get('/messages/:id', async(req, res)=> {
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
        createdAt: msg.createdAt.toISOString(),
        mailbox: msg.mailbox.address,
        parsedData: {
          subject: parsed.subject || '',
          from: parsed.from?.text || '',
          text: parsed.text || '',
          html: parsed.html || '',
          textAsHtml: parsed.textAsHtml || '',
          attachments: parsed.attachments || [],
          date: (parsed.date || new Date(msg.createdAt)).toISOString(),
        }
      });
    } catch (error) {
      console.error('Error fetching message', error);
      res.status(500).json({error: 'Failed to fetch message'});
    }
  })

  app.use('/api', router);

  return app;
}
