import { Message } from '../lib/types';

interface MessageListProps {
  messages: Message[];
  address: string;
  onMessageClick: (messageId: string) => void;
  onRefresh: () => void;
}

export function MessageList({ messages, address, onMessageClick, onRefresh }: MessageListProps) {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
      {messages.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-6">
            <svg className="w-16 h-16 text-white/60 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          
          <h3 className="text-xl font-medium text-white/80 mb-4">
            Waiting for incoming emails ...
          </h3>
          
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 mx-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 border border-blue-600 hover:border-blue-700 rounded-lg text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      ) : (
        <>
          <div className="px-6 py-4 border-b border-white/10 bg-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Inbox</h2>
                  <p className="text-sm text-white/70">Your temporary mailbox</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="px-3 py-1 bg-purple-500/20 border border-purple-400/30 rounded-lg text-sm text-purple-300 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {messages.length} {messages.length === 1 ? 'message' : 'messages'}
                </div>
                <button
                  onClick={onRefresh}
                  className="flex items-center gap-2 text-sm text-white/70 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-2">
              {messages.map((message, index) => (
                <div 
                  key={message.id} 
                  onClick={() => onMessageClick(message.id)}
                  className="group bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        {(message.from?.charAt(0) || '?').toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-white group-hover:text-purple-300 transition-colors line-clamp-1 flex-1">
                            {message.subject || '(No Subject)'}
                          </h3>
                          {index === 0 && (
                            <span className="px-2 py-1 bg-purple-500/20 border border-purple-400/30 rounded-full text-xs text-purple-300 flex-shrink-0">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-white/70 line-clamp-1">
                          From: {message.from}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                      <div className="text-right">
                        <p className="text-sm text-white/60">
                          {new Date(message.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <svg className="w-5 h-5 text-white/50 group-hover:text-white/70 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="px-6 py-3 border-t border-white/10 bg-white/5">
            <div className="flex items-center justify-between text-sm text-white/60">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Messages are automatically deleted after 10 minutes
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </>
      )}
      
      <div className="px-6 py-4 border-t border-white/10 bg-white/5 text-center">
        <p className="text-sm text-white/60">
          Need to save email address, custom domain or forwarding emails?{' '}
          <button className="text-blue-400 hover:text-blue-300 underline transition-colors">
            Log in.
          </button>
        </p>
      </div>
    </div>
  );
} 