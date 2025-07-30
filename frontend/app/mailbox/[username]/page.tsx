'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createCustomMailbox, fetchMessages, fetchMessage } from '../../../lib/api';
import { Message, MessageDetail } from '../../../lib/types';
import { GradientBackground } from '../../../components/GradientBackground';
import { ErrorAlert } from '@/components/ErrorAlert';
import { CopyIcon, CopyIconHandle } from '../../../components/ui/copy-icon';
import { RefreshCWIcon, RefreshCWIconHandle } from '../../../components/ui/refresh-cw-icon';
import { toast } from 'sonner';

export default function MailboxPage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  
  const [address, setAddress] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const copyIconRef = useRef<CopyIconHandle>(null);
  const refreshIconRef = useRef<RefreshCWIconHandle>(null);

  useEffect(() => {
    if (username) {
      generateMailbox(decodeURIComponent(username));
    }
  }, [username]);

  async function fetchMessagesForAddress(emailAddress: string, showNotification = false) {
    try {
      console.log('[DEBUG] Fetching messages for:', emailAddress);
      const data = await fetchMessages(emailAddress);
      setMessages(data.messages);
      if (showNotification && data.messages.length > 0) {
        toast.success(`Found ${data.messages.length} message${data.messages.length === 1 ? '' : 's'}!`);
      }
    } catch (err: any) {
      console.error('Error fetching messages:', err);
      if (err.message?.includes('Session expired')) {
        console.log('[DEBUG] Session expired, redirecting to home');
        router.push('/');
      }
    }
  }

  async function generateMailbox(targetUsername: string) {
    if (!targetUsername.trim()) {
      setError('Invalid username');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('[DEBUG] Creating mailbox for:', targetUsername);
      const mailboxData = await createCustomMailbox(targetUsername.trim());
      console.log('[DEBUG] Mailbox created:', mailboxData);
      
      setAddress(mailboxData.address);
      setMessages([]);
      
      await fetchMessagesForAddress(mailboxData.address);
      
    } catch (err: any) {
      setError(err.message || 'Failed to create email address');
      console.error('Error generating mailbox:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleBackToHome() {
    router.push('/');
  }

  function handleChangeAddress() {
    router.push('/');
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
    router.push(`/mailbox/${encodeURIComponent(username)}/message/${messageId}`);
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
    if (!address) return;
    
    const refreshInterval = messages.length === 0 ? 3000 : 10000;
    
    const interval = setInterval(async () => {
      if (document.hidden) return;
      
      try {
        await fetchMessagesForAddress(address);
      } catch (err) {
        console.error('Error fetching messages during auto-refresh:', err);
      }
    }, refreshInterval);
    
    // Also refresh when tab becomes visible again
    const handleVisibilityChange = async () => {
      if (!document.hidden && address) {
        try {
          await fetchMessagesForAddress(address);
        } catch (err) {
          console.error('Error fetching messages on visibility change:', err);
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [address, messages.length]);

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <GradientBackground />
        <div className="relative z-10 flex flex-col min-h-screen justify-center items-center">
          <div className="text-center text-[#e8feff] py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FAFF] mb-4"></div>
            <p className="text-xl">Loading mailbox for {username}...</p>
          </div>
        </div>
      </div>
    );
  }

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

              {/* Change Address Button */}
              <button
                onClick={handleChangeAddress}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all bg-[#21FF7D]/20 text-[#21FF7D] border border-[#21FF7D]/50 hover:bg-[#21FF7D]/30"
              >
                <svg className="w-4 h-4" viewBox="0 0 32 32" fill="currentColor">
                  <path d="M29.999 19.005c0 2.8-1.68 3-2 3H3.411l5.289-5.29-1.41-1.42-6.999 7a1 1 0 0 0 0 1.41l6.999 6.999 1.41-1.41-5.289-5.289h24.588c1.38 0 4-1 4-5v-3h-2v3z"/>
                  <path d="M2.001 13.005c0-2.8 1.68-3 2-3h24.588l-5.289 5.29 1.41 1.41 6.999-7a1 1 0 0 0 0-1.41L24.71 1.296l-1.42 1.42 5.299 5.289H4.001c-1.38 0-4 1-4 5v-3h2v3z"/>
                </svg>
                Change
              </button>
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
                      className="relative bg-white/5 rounded-lg border-2 border-dashed border-white/20 p-6 cursor-pointer hover:border-[#00FAFF]/50 hover:bg-white/10 transition-all h-[200px] flex flex-col"
                    >
                      <div className="absolute inset-0 h-full w-full bg-neutral-800/20 rounded-lg">
                        <div className="absolute -top-px -left-px h-1 w-1 animate-pulse rounded-full bg-neutral-500"></div>
                        <div className="absolute -top-px -right-px h-1 w-1 animate-pulse rounded-full bg-neutral-500"></div>
                        <div className="absolute -bottom-px -left-px h-1 w-1 animate-pulse rounded-full bg-neutral-500"></div>
                        <div className="absolute -right-px -bottom-px h-1 w-1 animate-pulse rounded-full bg-neutral-500"></div>
                      </div>
                      <div className="relative z-10">
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

                <p className="text-[#e8feff] text-xl mb-4">
                  Listening for incoming emails...
                </p>
                <p className="text-[#e8feff]/60 text-sm mb-8">
                  Auto-checking every 3 seconds. No manual refresh needed.
                </p>

                <button
                  onClick={refreshMessages}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-[#e8feff]"
                >
                  <RefreshCWIcon ref={refreshIconRef} size={16} />
                  Manual Refresh
                </button>
              </div>
            )}
          </div>
        </main>

        <footer className="py-6 text-center border-t border-white/10" style={{ background: 'rgba(0, 20, 30, 0.5)' }}>
          <div className="max-w-6xl mx-auto">
            <p className="text-[#e8feff]/80 text-base mb-2">
              Your temporary email expires in 24 hours. Only you can access your messages.
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
