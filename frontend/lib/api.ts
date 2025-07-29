const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';

import type { Message, MessageDetail } from './types';

async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/health`, { 
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function createCustomMailbox(username: string): Promise<{ address: string; createdAt: string; expiresAt: string | null }> {
  try {
    const isHealthy = await checkBackendHealth();
    if (!isHealthy) {
      throw new Error(`Backend server is not running. Please check the connection to ${API_BASE}`);
    }

    const response = await fetch(`${API_BASE}/mailboxes/custom`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', response.status, errorData);
      throw new Error(`Failed to create custom mailbox: ${response.status} ${errorData.error || response.statusText}`);
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
    const response = await fetch(`${API_BASE}/mailboxes/${encodeURIComponent(address)}/messages`, {
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

export async function fetchMessage(messageId: string): Promise<MessageDetail> {
  try {
    const response = await fetch(`${API_BASE}/messages/${encodeURIComponent(messageId)}`);
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
