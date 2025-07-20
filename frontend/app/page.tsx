'use client';
import { useState, useEffect } from 'react';
import { createRandomMailbox, fetchMessages } from './lib/api';
import { Message } from './lib/types';

export default function Home() {
  const [address, setAddress] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generateMailbox() {
    setLoading(true);
    setError(null);
    try {
      const addr = await createRandomMailbox();
      setAddress(addr);
      setMessages([]);
    } catch (err) {
      setError('Failed to generate mailbox');
      console.error('Error generating mailbox:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!address) return;
    
    const interval = setInterval(async () => {
      try {
        const data = await fetchMessages(address);
        setMessages(data.messages);
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [address]);

  return (
    <main style={{ padding: 24, fontFamily: 'monospace', maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: 30 }}>Temp Mail</h1>
      
      <div style={{ marginBottom: 20 }}>
        <button 
          onClick={generateMailbox} 
          disabled={loading}
          style={{
            padding: '12px 24px',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: 16,
            width: '100%'
          }}
        >
          {loading ? 'Generating...' : 'Generate Random Mailbox'}
        </button>
      </div>

      {error && (
        <div style={{ 
          padding: 12, 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          borderRadius: 4, 
          marginBottom: 20 
        }}>
          {error}
        </div>
      )}

      {address && (
        <>
          <div style={{ 
            padding: 15, 
            backgroundColor: '#f9f9f9', 
            border: '2px solid #ddd', 
            borderRadius: 8, 
            marginBottom: 20 
          }}>
            <strong style={{ color: 'black' }}>Your email address:</strong>
            <div style={{ 
              marginTop: 8, 
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <div style={{ 
                flex: 1,
                padding: 8, 
                backgroundColor: 'white', 
                border: '1px solid #ccc', 
                borderRadius: 4, 
                fontFamily: 'monospace', 
                fontSize: 14,
                color: 'black'
              }}>
                {address}
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(address)}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 12,
                  whiteSpace: 'nowrap'
                }}
              >
                Copy
              </button>
            </div>
          </div>

          <h2>Messages ({messages.length})</h2>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 15 }}>
            Messages refresh every 5 seconds
          </div>
          
          {messages.length === 0 ? (
            <p style={{ color: '#666', fontStyle: 'italic' }}>
              No messages yet. Send an email to your address above.
            </p>
          ) : (
            <div>
              {messages.map(message => (
                <div 
                  key={message.id} 
                  style={{ 
                    border: '1px solid #ddd', 
                    borderRadius: 4, 
                    padding: 12, 
                    marginBottom: 10, 
                    backgroundColor: 'white' 
                  }}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                    From: {message.from}
                  </div>
                  <div style={{ marginBottom: 4 }}>
                    Subject: {message.subject || '(no subject)'}
                  </div>
                  <div style={{ fontSize: 12, color: '#666' }}>
                    {new Date(message.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
} 