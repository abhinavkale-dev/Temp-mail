'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GradientBackground } from '../components/GradientBackground';
import { ErrorAlert } from '@/components/ErrorAlert';
import { toast } from 'sonner';

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for stored username
    const storedData = sessionStorage.getItem('tempmail_session');
    if (storedData) {
      try {
        const { username: storedUsername, sessionToken } = JSON.parse(storedData);
        
        // Check if we have a valid session token
        if (sessionToken) {
          // Session is still valid, redirect to mailbox
          router.push(`/mailbox/${encodeURIComponent(storedUsername)}`);
        } else {
          // No valid token, clear it
          sessionStorage.removeItem('tempmail_session');
          setInitialLoading(false);
        }
      } catch (err) {
        // Invalid data, clear it
        sessionStorage.removeItem('tempmail_session');
        setInitialLoading(false);
      }
    } else {
      setInitialLoading(false);
    }
  }, [router]);

  function handleUsernameSubmit() {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    setLoading(true);
    setError(null);
    
    // Navigate to mailbox route
    router.push(`/mailbox/${encodeURIComponent(username.trim())}`);
  }

  function handleKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      handleUsernameSubmit();
    }
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
                2) Your mails will be cleared from the database to prevent junk after 24 hours. Please save all the data that you might need later!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 