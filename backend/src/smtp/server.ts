import { SMTPServer } from 'smtp-server';
import { simpleParser } from 'mailparser';
import { prisma } from '../lib/prisma.js';
import { normalizeAddress, isOurDomain } from '../lib/email.js';

export function startSmtp(): void {
  const server = new SMTPServer({
    disabledCommands: ['AUTH'],
    onRcptTo(address, session, cb) {
      const rcpt = normalizeAddress(address.address);
      if (!isOurDomain(rcpt)) {
        return cb(new Error('Invalid domain'));
      }
      
      prisma.mailbox.upsert({
        where: { address: rcpt },
        update: {},
        create: { address: rcpt }
      }).then(() => cb()).catch((err: unknown) => cb(err as Error));
    },
    async onData(stream, session, cb) {
      try {
        const parsed = await simpleParser(stream);
        const rcptAddr = normalizeAddress(session.envelope.rcptTo[0].address);
        
        await prisma.message.create({
          data: {
            mailbox: { connect: { address: rcptAddr } },
            from: parsed.from?.text || 'unknown',
            subject: parsed.subject || null,
            raw: parsed.text || parsed.html || ''
          }
        });
        
        cb();
      } catch (e: unknown) {
        cb(e as Error);
      }
    }
  });

  const port = Number(process.env.SMTP_PORT) || 2525;
  server.listen(port, (): void => console.log(`SMTP listening on :${port}`));
} 