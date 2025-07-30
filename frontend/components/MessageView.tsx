import { MessageDetail } from '../lib/types';

interface MessageViewProps {
  message: MessageDetail;
  onBack: () => void;
}

export function MessageView({ message, onBack }: MessageViewProps) {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="button button--ghost text-sm flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Inbox
        </button>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
        <div className="p-6 border-b border-white/10 bg-white/5">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#00FAFF] to-[#21FF7D] rounded-xl flex items-center justify-center text-[#002530] font-semibold">
              {(message.parsedData?.from?.charAt(0) || message.from?.charAt(0) || '?').toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-[#e8feff] mb-2 break-words">
                {message.parsedData?.subject || message.subject || '(No Subject)'}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-[#e8feff]/70">
                <div className="flex items-center gap-2">
                  <span className="font-medium">From:</span>
                  <span className="px-2 py-1 bg-white/10 rounded-lg text-[#e8feff]">
                    {message.parsedData?.from || message.from}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">To:</span>
                  <span className="px-2 py-1 bg-white/10 rounded-lg text-[#e8feff]">
                    {message.mailbox}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>
                    {new Date(message.parsedData?.date || message.createdAt).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="prose prose-invert max-w-none">
            {message.parsedData?.html ? (
              <div 
                dangerouslySetInnerHTML={{ __html: message.parsedData.html }}
                className="text-[#e8feff]/90 leading-relaxed [&_a]:text-[#00FAFF] [&_a]:underline hover:[&_a]:text-[#6EFFFF]"
              />
            ) : (
              <div className="whitespace-pre-wrap text-[#e8feff]/90 leading-relaxed">
                {message.parsedData?.text || message.body || '(Empty message)'}
              </div>
            )}
          </div>
          
          {message.parsedData?.attachments && message.parsedData.attachments.length > 0 && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <h3 className="text-lg font-semibold text-[#e8feff] mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                Attachments ({message.parsedData.attachments.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {message.parsedData.attachments.map((attachment: any, index: number) => (
                  <div key={index} className="p-3 bg-white/5 border border-white/10 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#00FAFF]/20 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-[#00FAFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#e8feff] truncate">{attachment.filename || 'Unnamed'}</p>
                        <p className="text-xs text-[#e8feff]/60">{attachment.contentType || 'Unknown type'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 