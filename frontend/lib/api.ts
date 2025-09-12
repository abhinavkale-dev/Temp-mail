const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';

import type { Message, MessageDetail } from './types';

const requestCache = new Map<string, { data: any; timestamp: number; promise?: Promise<any> }>();
const pendingRequests = new Map<string, Promise<any>>();
const CACHE_DURATION = 60000; 

function getCachedData(key: string) {
  const cached = requestCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`Cache hit for ${key}`);
    return cached.data;
  }
  return null;
}

function setCachedData(key: string, data: any) {
  requestCache.set(key, { data, timestamp: Date.now() });
}

export function clearCache() {
  requestCache.clear();
  pendingRequests.clear();
  console.log('API cache cleared');
}

export function clearCacheForAddress(address: string) {
  const username = address.split('@')[0];
  const keys = [`messages-${address}`, `mailbox-${username}`];
  keys.forEach(key => {
    requestCache.delete(key);
    pendingRequests.delete(key);
  });
  console.log(`Cache cleared for address: ${address}`);
}

function deduplicate<T>(key: string, request: () => Promise<T>): Promise<T> {
  if (pendingRequests.has(key)) {
    console.log(`Deduplicating request for ${key}`);
    return pendingRequests.get(key)!;
  }

  const promise = request().finally(() => {
    pendingRequests.delete(key);
  });
  
  pendingRequests.set(key, promise);
  return promise;
}


export async function createCustomMailbox(username: string): Promise<{ address: string; createdAt: string; expiresAt: string | null }> {
  const cacheKey = `mailbox-${username}`;
  
  const cached = getCachedData(cacheKey);
  if (cached) {
    return cached;
  }

  return deduplicate(cacheKey, async () => {
    try {
      // Add cache-busting parameter to avoid 429 errors
      const cacheBuster = `?_=${Date.now()}`;
      const response = await fetch(`${API_BASE}/api/mailboxes/custom${cacheBuster}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
        cache: 'no-store' // Ensure we don't use browser cache
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 429) {
          console.log('Rate limit hit on mailbox creation');
          
          const fallbackData = {
            address: `${username}@temp.abhi.at`,
            createdAt: new Date().toISOString(),
            expiresAt: null
          };
          setCachedData(cacheKey, fallbackData);
          return fallbackData;
        }
        
        throw new Error(`Failed to create custom mailbox: ${response.status} ${errorData.error || response.statusText}`);
      }
      
      const data = await response.json();
      const result = {
        address: data.address,
        createdAt: data.createdAt,
        expiresAt: data.expiresAt
      };
      
      setCachedData(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error creating custom mailbox:', error);
      throw error;
    }
  });
}

export async function fetchMessages(address: string, forceRefresh = false): Promise<{ messages: Message[] }> {
  const cacheKey = `messages-${address}`;
  
  if (!forceRefresh) {
    const cached = getCachedData(cacheKey);
    if (cached) {
      return cached;
    }
  }

  return deduplicate(cacheKey, async () => {
    try {
      const username = address.split('@')[0];
      const mailboxCacheKey = `mailbox-${username}`;
      if (!getCachedData(mailboxCacheKey)) {
        try {
          await createCustomMailbox(username);
        } catch (mailboxError) {
          console.warn('Mailbox creation failed, continuing with message fetch:', mailboxError);
        }
      }
      
      // Add cache-busting parameter to avoid 429 errors from browser caching
      const cacheBuster = forceRefresh ? `?_=${Date.now()}` : '';
      const response = await fetch(`${API_BASE}/api/mailboxes/${encodeURIComponent(address)}/messages${cacheBuster}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store' // Ensure we don't use browser cache
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 429) {
          console.log('Rate limit hit on message fetch');
          
          const fallbackData = { messages: [] };
          return fallbackData;
        }
        
        throw new Error(`Failed to fetch messages: ${response.status} ${errorData.error || response.statusText}`);
      }
      
      const result = await response.json();
      setCachedData(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  });
}

export async function fetchMessage(messageId: string): Promise<MessageDetail> {
  const cacheKey = `message-${messageId}`;
  
  const cached = getCachedData(cacheKey);
  if (cached) {
    return cached;
  }

  return deduplicate(cacheKey, async () => {
    try {
      const response = await fetch(`${API_BASE}/api/messages/${messageId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 429) {
          console.log('Rate limit hit on individual message fetch');
          
          await new Promise(resolve => setTimeout(resolve, 2000));
          const retryResponse = await fetch(`${API_BASE}/api/messages/${messageId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
          });
          
          if (retryResponse.ok) {
            const result = await retryResponse.json();
            setCachedData(cacheKey, result);
            return result;
          }
        }
        
        throw new Error(`Failed to fetch message: ${response.status} ${errorData.error || response.statusText}`);
      }
      
      const result = await response.json();
      setCachedData(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error fetching message:', error);
      throw error;
    }
  });
}
