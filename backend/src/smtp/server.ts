import { SMTPServer } from "smtp-server";
import { simpleParser } from "mailparser";
import { prisma } from "../lib/prisma.js";
import { normalizeAddress, isOurDomain, extractDomain } from "../lib/email.js";
import { trackServerEvent, shouldSample } from "../lib/posthog.js";

interface SMTPError extends Error {
  responseCode?: number;
}

export function startSmtp(): void {
  const server = new SMTPServer({
    disabledCommands: ['AUTH'],
    async onRcptTo(address, session, cb) {
      const rcpt = normalizeAddress(address.address);
      console.log('[RCPT TO]', {raw: address.address, normalized: rcpt});
      if(!isOurDomain(rcpt)) {
        const domain = extractDomain(rcpt);
        const err = new Error(`Relay denied for domain ${domain || '(none)'}`) as SMTPError;
        err.responseCode = 550;
        return cb(err);
      }

      try {
        await prisma.mailbox.upsert({
          where: { address: rcpt },
          update: {},
          create: { address: rcpt, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) }
        });
        console.log('[RCPT ACCEPTED]', rcpt);
        cb();
      } catch (err) {
        console.error('[RCPT ERROR]', err);
        cb(err as Error);
      }
    },
    async onData(stream, session, cb) {
      let rcptAddr = '';
      let parsed: any = null;

      try {
        const chunks: Buffer[] = [];
        for await (const chunk of stream) {
          chunks.push(Buffer.from(chunk));
        }
        const rawBuffer = Buffer.concat(chunks);

        parsed = await simpleParser(rawBuffer);

        rcptAddr = normalizeAddress(session.envelope.rcptTo[0].address);

        console.log('[MESSAGE]', {
          to: rcptAddr,
          from: parsed.from?.text,
          subject: parsed.subject,
        });

        await prisma.message.create({
          data: {
            mailbox: {connect: {address: rcptAddr}},
            from: parsed.from?.text || 'unknown',
            subject: parsed.subject || '(No Subject)',
            raw: rawBuffer,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          }
        });

        console.log('[MESSAGE STORED]', rcptAddr);

        if (shouldSample(50)) {
          trackServerEvent('smtp_email_received', {
            to: rcptAddr,
            from: parsed.from?.text,
            subject: parsed.subject,
            has_html: !!parsed.html,
            has_text: !!parsed.text,
            raw_size: rawBuffer.length
          });
        }
        cb();
      } catch (e) {
        console.error('[MESSAGE ERROR]', e);

        const error = e as Error;
        trackServerEvent('smtp_email_failed', {
          to: rcptAddr,
          from: parsed?.from?.text,
          subject: parsed?.subject,
          error: error.message,
          error_type: error.constructor.name
        });

        const err = e as SMTPError;
        cb(err);
      }

    }
  })
  const port = Number(process.env.SMTP_PORT) || 25;
  server.listen(port, () => console.log(`SMTP server listening on port ${port}`));
}