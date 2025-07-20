import { SMTPServer } from 'smtp-server';
import { simpleParser } from 'mailparser';
import { prisma } from '../lib/prisma.js';
import { normalizeAddress, isOurDomain, extractDomain } from '../lib/email.js';

interface SMTPError extends Error {
  responseCode?: number;
}

export function startSmtp(): void {
  const server = new SMTPServer({
    disabledCommands: ['AUTH'],
    onRcptTo(address, session, cb) {
      const rcpt = normalizeAddress(address.address);
      console.log('[RCPT TO]', { raw: address.address, normalized: rcpt });
      
      if (!isOurDomain(rcpt)) {
        const domain = extractDomain(rcpt);
        const err = new Error(`Relay denied for domain ${domain || '(none)'}`) as SMTPError;
        err.responseCode = 550;
        return cb(err);
      }
      
      prisma.mailbox.upsert({
        where: { address: rcpt },
        update: {},
        create: { address: rcpt }
      }).then(() => {
        console.log('[RCPT ACCEPTED]', rcpt);
        cb();
      }).catch((err: unknown) => {
        console.error('[RCPT ERROR]', err);
        cb(err as Error);
      });
    },
    async onData(stream, session, cb) {
      try {
        const parsed = await simpleParser(stream);
        const rcptAddr = normalizeAddress(session.envelope.rcptTo[0].address);
        
        console.log('[MESSAGE]', {
          to: rcptAddr,
          from: parsed.from?.text,
          subject: parsed.subject
        });
        
        await prisma.message.create({
          data: {
            mailbox: { connect: { address: rcptAddr } },
            from: parsed.from?.text || 'unknown',
            subject: parsed.subject || null,
            raw: parsed.text || parsed.html || ''
          }
        });
        
        console.log('[MESSAGE STORED]', rcptAddr);
        cb();
      } catch (e: unknown) {
        console.error('[DATA ERROR]', e);
        const err = e as SMTPError;
        err.responseCode = 451;
        cb(err);
      }
    }
  });

  const port = Number(process.env.SMTP_PORT) || 25;
  server.listen(port, (): void => console.log(`SMTP listening on :${port}`));
} 