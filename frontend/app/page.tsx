'use client';
import { useState, useEffect, useRef } from 'react';
import { createCustomMailbox, fetchMessages, fetchMessage } from '../lib/api';
import { Message, MessageDetail } from '../lib/types';
import { GradientBackground } from '../components/GradientBackground';
import { ErrorAlert } from '@/components/ErrorAlert';
import { MessageView } from '../components/MessageView';
import { CopyIcon, CopyIconHandle } from '../components/ui/copy-icon';
import { RefreshCWIcon, RefreshCWIconHandle } from '../components/ui/refresh-cw-icon';
import { toast } from 'sonner';

export default function Home() {
  const [username, setUsername] = useState('');
  const [address, setAddress] = useState<string | null>(null);
  const [mailboxCreatedAt, setMailboxCreatedAt] = useState<string | null>(null);
  const [mailboxExpiresAt, setMailboxExpiresAt] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'home' | 'mailbox' | 'message'>('home');
  const [selectedMessage, setSelectedMessage] = useState<MessageDetail | null>(null);
  const [messageLoading, setMessageLoading] = useState(false);
  const [viewAsHtml, setViewAsHtml] = useState(true);
  const [copied, setCopied] = useState(false);
  const [expiryTime, setExpiryTime] = useState('');
  const copyIconRef = useRef<CopyIconHandle>(null);
  const refreshIconRef = useRef<RefreshCWIconHandle>(null);

  useEffect(() => {
    const storedUsername = localStorage.getItem('tempmail_username');
    if (storedUsername) {
      setUsername(storedUsername);
      generateMailbox(storedUsername);
    } else {
      setInitialLoading(false);
    }
  }, []);

  async function fetchMessagesForAddress(emailAddress: string, showNotification = false) {
    try {
      const data = await fetchMessages(emailAddress);
      setMessages(data.messages);
      if (showNotification && data.messages.length > 0) {
        toast.success(`Found ${data.messages.length} message${data.messages.length === 1 ? '' : 's'}!`);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  }

  useEffect(() => {
    if (!address || !mailboxExpiresAt) return;
    
    const expiryTimestamp = new Date(mailboxExpiresAt).getTime();
    
    const updateExpiry = () => {
      const now = Date.now();
      const remaining = Math.max(0, expiryTimestamp - now);
      
      if (remaining === 0) {
        setExpiryTime('Expired');
        return;
      }
      
      const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
      const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
      const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
      const seconds = Math.floor((remaining % (60 * 1000)) / 1000);
      
      if (days > 0) {
        setExpiryTime(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      } else if (hours > 0) {
        setExpiryTime(`${hours}h ${minutes}m ${seconds}s`);
      } else if (minutes > 0) {
        setExpiryTime(`${minutes}m ${seconds}s`);
      } else {
        setExpiryTime(`${seconds}s`);
      }
    };
    
    updateExpiry();
    const interval = setInterval(updateExpiry, 1000);
    return () => clearInterval(interval);
  }, [address, mailboxExpiresAt]);

  async function generateMailbox(usernameInput?: string) {
    const targetUsername = usernameInput || username;
    if (!targetUsername.trim()) {
      setError('Please enter a username');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const mailboxData = await createCustomMailbox(targetUsername.trim());
      setAddress(mailboxData.address);
      setMailboxCreatedAt(mailboxData.createdAt);
      setMailboxExpiresAt(mailboxData.expiresAt);
      setMessages([]);
      setCurrentView('mailbox');
      setSelectedMessage(null);
      
      localStorage.setItem('tempmail_username', targetUsername.trim());
      
      toast.success('Email address created successfully!');
      
    } catch (err: any) {
      setError(err.message || 'Failed to create email address');
      console.error('Error generating mailbox:', err);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }

  function handleUsernameSubmit() {
    generateMailbox();
  }

  function handleKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      handleUsernameSubmit();
    }
  }

  function handleBackToHome() {
    setCurrentView('home');
    setAddress(null);
    setMessages([]);
    setSelectedMessage(null);
    localStorage.removeItem('tempmail_username');
  }

  async function refreshMessages() {
    if (!address) return;
    
    refreshIconRef.current?.startAnimation();
    
    try {
      await fetchMessagesForAddress(address, true);
    } catch (err) {
      console.error('Error fetching messages:', err);
      toast.error('Failed to refresh messages. Please try again.');
    } finally {
      setTimeout(() => {
        refreshIconRef.current?.stopAnimation();
      }, 500);
    }
  }

  async function handleMessageClick(messageId: string) {
    setMessageLoading(true);
    setError(null);
    try {
      const messageDetail = await fetchMessage(messageId);
      setSelectedMessage(messageDetail);
      setCurrentView('message');
    } catch (err) {
      setError('Failed to load message');
      console.error('Error fetching message:', err);
    } finally {
      setMessageLoading(false);
    }
  }

  function handleBackToMailbox() {
    setCurrentView('mailbox');
    setSelectedMessage(null);
  }

  function handleToggleView() {
    setViewAsHtml(!viewAsHtml);
  }

  async function handleCopyAddress() {
    if (!address) return;
    
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      copyIconRef.current?.startAnimation();
      toast.success('Email address copied!');
      
      setTimeout(() => {
        setCopied(false);
        copyIconRef.current?.stopAnimation();
      }, 2000);
    } catch (err) {
      toast.error('Failed to copy address');
    }
  }

  useEffect(() => {
    if (!address || currentView !== 'mailbox') return;
    
    const refreshInterval = messages.length === 0 ? 10000 : 30000;
    
    const interval = setInterval(async () => {
      try {
        await fetchMessagesForAddress(address);
      } catch (err) {
        console.error('Error fetching messages during auto-refresh:', err);
      }
    }, refreshInterval);
    
    return () => clearInterval(interval);
  }, [address, currentView, messages.length]);

  if (currentView === 'message' && selectedMessage) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <GradientBackground />
        <div className="relative z-10 py-12">
          <div className="max-w-4xl mx-auto px-4">
            <MessageView
              message={selectedMessage}
              viewAsHtml={viewAsHtml}
              onToggleView={handleToggleView}
              onBack={handleBackToMailbox}
            />
          </div>
        </div>
      </div>
    );
  }

  // Mailbox view
  if (currentView === 'mailbox' && address) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <GradientBackground />
        <div className="relative z-10 flex flex-col min-h-screen py-8">
          
          {/* Header */}
          <header className="border-b border-white/10 px-8 py-6">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <button
                onClick={handleBackToHome}
                className="text-4xl font-bold hover:text-[#00FAFF] transition-colors"
                style={{ 
                  fontFamily: 'cursive',
                  background: 'linear-gradient(135deg, #00FAFF 0%, #21FF7D 50%, #003F5C 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                Temp Mail
              </button>

              <div className="flex items-center gap-6">
                {/* Expiry Time */}
                <div className="flex items-center gap-2 text-[#e8feff]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-mono text-lg font-medium">
                    {expiryTime || 'Loading...'}
                  </span>
                </div>

                {/* Email Address */}
                <div className="flex items-center gap-3 bg-gradient-to-r from-[#00FAFF]/20 to-[#21FF7D]/20 rounded-lg px-6 py-3 border border-[#00FAFF]/30">
                  <span className="text-[#e8feff] font-mono text-lg">
                    <span className="text-[#00FAFF] font-semibold">{address?.split('@')[0]}</span>
                    <span className="text-[#21FF7D]">@{address?.split('@')[1]}</span>
                  </span>
                  <button
                    onClick={handleCopyAddress}
                    className={`p-1 rounded transition-colors ${
                      copied 
                        ? 'text-[#21FF7D]' 
                        : 'text-[#00FAFF] hover:text-[#6EFFFF]'
                    }`}
                    title="Copy to clipboard"
                  >
                    <CopyIcon ref={copyIconRef} size={20} />
                  </button>
                </div>
              </div>
            </div>
          </header>

          {error && (
            <div className="px-8 pt-6">
              <div className="max-w-6xl mx-auto">
                <ErrorAlert message={error} />
              </div>
            </div>
          )}

          <main className="flex-1 flex flex-col justify-center items-center px-8 py-12">
            <div className="max-w-6xl mx-auto w-full">
              {messages.length > 0 ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold text-[#e8feff]">
                      Mails for "{address?.split('@')[0]}@temp.abhi.at"
                    </h2>
                    <button
                      onClick={refreshMessages}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all transform hover:-translate-y-0.5"
                      style={{
                        background: 'linear-gradient(135deg,#00FAFF 0%,#21FF7D 100%)',
                        color: '#002530',
                        boxShadow: '0 0 0 2px rgba(0,250,255,.35), 0 0 14px rgba(33,255,125,.55)',
                      }}
                    >
                      <RefreshCWIcon ref={refreshIconRef} size={16} />
                      Refresh
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        onClick={() => handleMessageClick(message.id)}
                        className="bg-white/5 rounded-lg border border-white/10 p-6 cursor-pointer hover:border-[#00FAFF]/50 hover:bg-white/10 transition-all h-[200px] flex flex-col"
                      >
                        <h3 className="text-xl font-bold mb-2 text-[#e8feff] line-clamp-2 flex-none">
                          {message.subject || "(No Subject)"}
                        </h3>
                        <p className="text-lg mb-2 text-[#e8feff]/70 flex-none">
                          {new Date(message.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-base text-[#e8feff]/60 line-clamp-3 overflow-hidden">
                          From: {message.from}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 mb-12">
                    <svg className="animate-spin w-full h-full text-[#00FAFF]" fill="none" viewBox="0 0 24 24">
                      <circle 
                        className="opacity-25" 
                        cx="12" 
                        cy="12" 
                        r="10" 
                        stroke="currentColor" 
                        strokeWidth="2"
                      />
                      <path 
                        className="opacity-75" 
                        fill="currentColor" 
                        d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  </div>

                  <p className="text-[#e8feff] text-xl mb-12">
                    Waiting for incoming emails ...
                  </p>

                  <button
                    onClick={refreshMessages}
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-medium transition-all transform hover:-translate-y-0.5"
                    style={{
                      background: 'linear-gradient(135deg,#00FAFF 0%,#21FF7D 100%)',
                      color: '#002530',
                      boxShadow: '0 0 0 2px rgba(0,250,255,.35), 0 0 14px rgba(33,255,125,.55)',
                    }}
                  >
                    <RefreshCWIcon ref={refreshIconRef} size={16} />
                    Refresh
                  </button>
                </div>
              )}

              {messageLoading && (
                <div className="text-center text-[#e8feff] py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#00FAFF]"></div>
                  <p className="mt-4 text-lg">Loading message...</p>
                </div>
              )}
            </div>
          </main>

          <footer className="py-6 text-center border-t border-white/10" style={{ background: 'rgba(0, 20, 30, 0.5)' }}>
            <div className="max-w-6xl mx-auto">
              <p className="text-[#e8feff]/80 text-base mb-2">
                Your temporary email expires in 7 days. Only you can access your messages.
              </p>
              <p className="text-[#e8feff]/60 text-sm">
                🔒 Private mailbox • No registration required • Auto-cleanup after expiry
              </p>
            </div>
          </footer>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <GradientBackground />
      <div className="relative z-10 flex flex-col min-h-screen py-8">
        
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold mb-2" style={{ 
            fontFamily: 'cursive',
            background: 'linear-gradient(135deg, #00FAFF 0%, #21FF7D 50%, #003F5C 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Temp Mail
          </h1>
        </div>

        <div className="flex-1 flex flex-col justify-center items-center px-4">
          <div className="w-full max-w-4xl">
            
            <div 
              className="rounded-2xl shadow-2xl p-8 mb-8 border border-white/10"
              style={{
                background: 'rgba(0, 30, 40, 0.85)',
                backdropFilter: 'blur(20px)',
              }}
            >
              {initialLoading ? (
                <div className="text-center text-[#e8feff] py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#00FAFF]"></div>
                  <p className="mt-4 text-lg">Loading...</p>
                </div>
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Enter your username"
                      className="flex-grow text-xl sm:text-2xl px-4 py-3 rounded-lg border-2 border-[#00FAFF]/30 bg-white/5 text-[#e8feff] placeholder-[#e8feff]/50 focus:border-[#00FAFF] focus:outline-none"
                      disabled={loading}
                    />
                    <button
                      onClick={handleUsernameSubmit}
                      disabled={loading || !username.trim()}
                      className="px-8 py-3 rounded-lg font-medium text-xl sm:text-2xl transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        background: loading || !username.trim() 
                          ? 'rgba(255,255,255,0.1)' 
                          : 'linear-gradient(135deg,#00FAFF 0%,#21FF7D 100%)',
                        color: loading || !username.trim() ? '#e8feff' : '#002530',
                        boxShadow: loading || !username.trim() 
                          ? 'none' 
                          : '0 0 0 2px rgba(0,250,255,.35), 0 0 14px rgba(33,255,125,.55)',
                      }}
                    >
                      {loading ? 'Creating...' : 'GO'}
                    </button>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-[#e8feff]/70 text-lg">
                      Your email will be: <span className="text-[#00FAFF] font-mono">{username || 'username'}</span><span className="text-[#21FF7D] font-mono">@temp.abhi.at</span>
                    </p>
                  </div>
                </>
              )}
            </div>

            {error && (
              <div className="mb-8">
                <ErrorAlert message={error} />
              </div>
            )}

            <div 
              className="rounded-2xl shadow-2xl p-8 border border-white/10"
              style={{
                background: 'rgba(0, 30, 40, 0.85)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-[#e8feff]">
                Temp Mail Service
              </h2>
              <p className="text-xl sm:text-2xl text-[#e8feff]/80 mb-3">
                1) Your mails are public. Don't use it for important mails. Use it to subscribe to all unwanted services.
              </p>
              <p className="text-xl sm:text-2xl text-[#e8feff]/80">
                2) Your mails will be cleared from the database to prevent junk after 7 days. Please save all the data that you might need later!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 