const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';

import type { Message, MessageDetail } from './types';

async function checkBackendHealth(): Promise<boolean> {
  try {
    console.log('Checking backend health at:', API_BASE + '/api/health');
    const response = await fetch(`${API_BASE}/api/health`, { 
      method: 'GET',
      signal: AbortSignal.timeout(10000)
    });
    console.log('Health check response:', response.status, response.statusText);
    return response.ok;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
}

export async function createCustomMailbox(username: string): Promise<{ address: string; createdAt: string; expiresAt: string | null }> {
  try {
    const isHealthy = await checkBackendHealth();
    if (!isHealthy) {
      console.warn(`Health check failed for ${API_BASE}, but attempting to proceed...`);
    }

    const response = await fetch(`${API_BASE}/api/mailboxes/custom`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', response.status, errorData);
      
      if (!isHealthy) {
        throw new Error(`Backend server is not responding. Health check failed for ${API_BASE} and API call returned ${response.status}: ${errorData.error || response.statusText}`);
      } else {
        throw new Error(`Failed to create custom mailbox: ${response.status} ${errorData.error || response.statusText}`);
      }
    }
    
    const data = await response.json();
    
    return {
      address: data.address,
      createdAt: data.createdAt,
      expiresAt: data.expiresAt
    };
  } catch (error) {
    console.error('Error creating custom mailbox:', error);
    throw error;
  }
}

export async function fetchMessages(address: string): Promise<{ messages: Message[] }> {
  try {
    const response = await fetch(`${API_BASE}/api/mailboxes/${encodeURIComponent(address)}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', response.status, errorData);
      throw new Error(`Failed to fetch messages: ${response.status} ${errorData.error || response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
}

export async function fetchMessage(address: string, messageId: string): Promise<MessageDetail> {
  try {
    const response = await fetch(`${API_BASE}/api/messages/${messageId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', response.status, errorData);
      throw new Error(`Failed to fetch message: ${response.status} ${errorData.error || response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching message:', error);
    throw error;
  }
}
