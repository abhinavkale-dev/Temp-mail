import { nanoid } from "nanoid";

const ALLOWED_DOMAIN = process.env.SMTP_DOMAIN || process.env.MAIL_DOMAIN || 'temp.abhi.at';

export function makeRandomAddress() {
  return `${nanoid(8).toLocaleLowerCase()}@${ALLOWED_DOMAIN}`;
}

export function normalizeAddress(addr: string) {
  return addr.trim().toLocaleLowerCase();
}

export function extractDomain(addr: string) {
  if(!addr) return '';
  const cleaned = addr.replace(/[<>]/g, '').trim();
  const atIndex = cleaned.lastIndexOf('@');
  if(atIndex === -1) return '';
  let domain = cleaned.slice(atIndex + 1).toLocaleLowerCase();
  if(domain.endsWith('.')) domain = domain.slice(0, -1);
  return domain;
}

export function isOurDomain(addr: string) {
  const domain = extractDomain(addr);
  const allowedDomain = ALLOWED_DOMAIN.toLocaleLowerCase();
  console.log('[DOMAIN CHECK]', {
    address: addr,
    extractedDomain: domain,
    allowedDomain,
    matches: domain === allowedDomain
  });
  return domain === allowedDomain;
}