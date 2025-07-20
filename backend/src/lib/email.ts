import { nanoid } from 'nanoid';

const DOMAIN = process.env.MAIL_DOMAIN || 'temp-mail.abhi.at';

export function makeRandomAddress() {
  return `${nanoid(8).toLowerCase()}@${DOMAIN}`;
}

export function normalizeAddress(addr: string) {
  return addr.trim().toLowerCase();
}

export function isOurDomain(addr: string) {
  return addr.toLowerCase().endsWith(`@${DOMAIN.toLowerCase()}`);
} 