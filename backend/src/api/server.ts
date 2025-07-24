import express from 'express';
import cors from 'cors';
import {prisma} from '../lib/prisma';
import { makeRandomAddress, normalizeAddress, isOurDomain } from '../lib/email';
import rateLimit from './middleware/rateLimit';

interface Server {
  listen(port: number, callback?: () => void): void;
}


export function createApiServer(): Server {
  const app = express();
  
  app.use(express.json());
  app.use(cors({origin: process.env.CORS_ORIGIN || true}));
  app.use(rateLimit);

  app.get('/health', (req, res) => res.json({ok: true}));

  app.post('/mailboxes/random', async(req, res) => {
    try {
      const address = makeRandomAddress();
      await prisma.mailbox.create({data: {address}});
      res.json({address});
    } catch (error) {
      console.error('Error creating random mailbox', error);
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

      res.json({
        address: mb.address,
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

      res.json({
        id: msg.id,
        from: msg.from,
        subject: msg.subject,
        body: msg.raw,
        createdAt: msg.createdAt,
        mailbox: msg.mailbox.address,
      });
    } catch (error) {
      console.error('Error fetching message', error);
      res.status(500).json({error: 'Failed to fetch message'});
    }
  })  

  return app;
}
