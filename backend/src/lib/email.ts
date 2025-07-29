const ALLOWED_DOMAIN = process.env.SMTP_DOMAIN || process.env.MAIL_DOMAIN || 'temp.abhi.at';

export function makeCustomAddress(username: string) {
  const sanitizedUsername = username
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]/g, '');
  
  if (!sanitizedUsername) {
    throw new Error('Invalid username');
  }
  
  if (sanitizedUsername.length < 1 || sanitizedUsername.length > 64) {
    throw new Error('Username must be between 1 and 64 characters');
  }
  
  return `${sanitizedUsername}@${ALLOWED_DOMAIN}`;
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