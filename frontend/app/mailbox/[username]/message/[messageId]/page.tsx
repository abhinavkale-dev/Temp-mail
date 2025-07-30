'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchMessage } from '../../../../../lib/api';
import { MessageDetail } from '../../../../../lib/types';
import { GradientBackground } from '../../../../../components/GradientBackground';
import { MessageView } from '../../../../../components/MessageView';

export default function MessagePage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const messageId = params.messageId as string;
  
  const [message, setMessage] = useState<MessageDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (messageId) {
      loadMessage(messageId);
    }
  }, [messageId]);

  async function loadMessage(id: string) {
    setLoading(true);
    setError(null);
    try {
      const messageDetail = await fetchMessage(username, id);
      setMessage(messageDetail);
    } catch (err) {
      setError('Failed to load message');
      console.error('Error fetching message:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleBackToMailbox() {
    router.push(`/mailbox/${encodeURIComponent(username)}`);
  }

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <GradientBackground />
        <div className="relative z-10 flex flex-col min-h-screen justify-center items-center">
          <div className="text-center text-[#e8feff] py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FAFF] mb-4"></div>
            <p className="text-xl">Loading message...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !message) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <GradientBackground />
        <div className="relative z-10 flex flex-col min-h-screen justify-center items-center">
          <div className="text-center text-[#e8feff] py-12">
            <p className="text-xl mb-4">{error || 'Message not found'}</p>
            <button
              onClick={handleBackToMailbox}
              className="px-6 py-3 rounded-lg font-medium transition-all"
              style={{
                background: 'linear-gradient(135deg,#00FAFF 0%,#21FF7D 100%)',
                color: '#002530',
              }}
            >
              Back to Mailbox
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <GradientBackground />
      <div className="relative z-10 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <MessageView
            message={message}
            onBack={handleBackToMailbox}
          />
        </div>
      </div>
    </div>
  );
}
