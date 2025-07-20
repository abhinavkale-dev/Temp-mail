import { MailboxResponse, MessageDetail } from './types';

const BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';

export async function createRandomMailbox(): Promise<string> {
  const response = await fetch(`${BASE}/mailboxes/random`, { 
    method: 'POST',
    cache: 'no-store'
  });
  
  if (!response.ok) {
    throw new Error('Failed to create mailbox');
  }
  
  const data = await response.json();
  return data.address;
}

export async function fetchMessages(address: string): Promise<MailboxResponse> {
  const response = await fetch(`${BASE}/mailboxes/${address}/messages`, { 
    cache: 'no-store' 
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch messages');
  }
  
  return response.json();
}

export async function fetchMessage(id: string): Promise<MessageDetail> {
  const response = await fetch(`${BASE}/messages/${id}`, { 
    cache: 'no-store' 
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch message');
  }
  
  return response.json();
} 