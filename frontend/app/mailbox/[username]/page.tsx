"use client"

import { useParams } from "next/navigation"
import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw as Refresh, Lock, ArrowRightLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { Screen } from "@/components/screen"
import { Header, Footer, BorderDecoration } from "@/components/layout"
import { fetchMessages } from "@/lib/api"
import { trackEvent } from "@/lib/posthog"

export default function MailboxPage() {
  const params = useParams()
  const username = params.username as string

  const [emails, setEmails] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [isListening, setIsListening] = useState(true)
  const [lastChecked, setLastChecked] = useState(new Date())
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [apiErrorState, setApiErrorState] = useState(false)
  const [hasStableEmails, setHasStableEmails] = useState(false)
  const [stableEmailCount, setStableEmailCount] = useState(0)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastEmailCountRef = useRef<number>(0)

  const loadEmails = async (forceRefresh = false) => {
    if (apiErrorState && failedAttempts >= 5) {
      return;
    }

    setLoading(true);
    
    try {
      const result = await fetchMessages(`${username}@temp.abhi.at`, forceRefresh);
      
      const newEmails = result.messages || [];
      setEmails(newEmails);
      
      const currentCount = newEmails.length;
      if (currentCount > 0 && currentCount === lastEmailCountRef.current) {
        setStableEmailCount(prev => prev + 1);
      } else {
        setStableEmailCount(0);
        setHasStableEmails(false);
      }
      lastEmailCountRef.current = currentCount;
      
      if (failedAttempts > 0) {
        setFailedAttempts(0);
        setApiErrorState(false);
      }
    } catch (error) {
      console.error('Failed to load emails:', error);
      
      const newFailedAttempts = failedAttempts + 1;
      setFailedAttempts(newFailedAttempts);
      setApiErrorState(true);

      toast.error(`Cannot reach server right now. Retry ${newFailedAttempts}/5`, {
        style: {
          background: 'white',
          color: 'black',
          border: '1px solid #ef4444',
        },
      });

      if (newFailedAttempts >= 5) {
        toast.error("Maximum retry attempts reached. Please refresh the page to try again.", {
          style: {
            background: 'white',
            color: 'black',
            border: '1px solid #ef4444',
          },
          duration: 10000,
        });
        setIsListening(false);
      }
    } finally {
      setLoading(false);
      setLastChecked(new Date());
    }
  }

  useEffect(() => {
    if (stableEmailCount >= 3 && lastEmailCountRef.current > 0) {
      setHasStableEmails(true)
    }
  }, [stableEmailCount])

  useEffect(() => {
    loadEmails(true)
  }, [])

  useEffect(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    if (apiErrorState && failedAttempts >= 5) {
      return;
    }

    const getBackoffTime = () => {
      if (hasStableEmails && emails.length > 0) {
        return 120000; 
      }
      
      if (failedAttempts === 0) return 45000;
      
      return Math.min(Math.pow(2, failedAttempts) * 5000, 300000);
    };

    const interval = setInterval(() => {
      if (isListening && !loading) { 
        loadEmails()
      }
    }, getBackoffTime())

    return () => clearInterval(interval)
  }, [isListening, failedAttempts, apiErrorState, hasStableEmails, emails.length, loading])


  const manualRefresh = async () => {
    trackEvent('manual_refresh', {
      username: username,
      current_email_count: emails.length
    });

    setApiErrorState(false);
    setFailedAttempts(0);
    setHasStableEmails(false);
    setStableEmailCount(0);
    setIsListening(true);

    toast("Refreshing mailbox...", {
      style: {
        background: 'white',
        color: 'black',
        border: '1px solid #e5e7eb',
      },
    });

    setRefreshing(true);

    try {
      const result = await fetchMessages(`${username}@temp.abhi.at`, true);
      setEmails(result.messages || []);

      trackEvent('manual_refresh_success', {
        username: username,
        new_email_count: result.messages?.length || 0,
        previous_email_count: emails.length
      });

      toast.success("Mailbox refreshed!", {
        style: {
          background: 'white',
          color: 'black',
          border: '1px solid #e5e7eb',
        },
      });
    } catch (error) {
      const err = error as Error;
      trackEvent('manual_refresh_failed', {
        username: username,
        error: err.message
      });

      toast.error("Failed to refresh mailbox. Please try again later.", {
        style: {
          background: 'white',
          color: 'black',
          border: '1px solid #ef4444',
        },
      });
    } finally {
      setRefreshing(false);
      setLastChecked(new Date());
    }
  }
  

  const EmailAddressDisplay = () => (
    <div
      className="inline-flex items-center px-4 py-2 rounded-full bg-gray-300 text-gray-900 font-semibold text-lg mb-4 cursor-pointer hover:bg-gray-400 transition-colors"
      onClick={() => {
        const email = `${username}@temp.abhi.at`;
        navigator.clipboard.writeText(email);
        trackEvent('email_copied', {
          username: username,
          method: 'email_display_click',
          email_address: email
        });
        toast.success("Email copied to clipboard!");
      }}
    >
      {username}@temp.abhi.at
    </div>
  );
  
  const ActionButtons = () => (
    <div className="flex flex-col gap-2 px-2 sm:px-0">
      <div className="flex flex-row justify-center gap-2 sm:gap-3">
        <Button
          className="bg-green-600 hover:bg-green-700 text-white text-sm sm:text-base flex-1 sm:flex-initial sm:min-w-[120px]"
          onClick={() => {
            const email = `${username}@temp.abhi.at`;
            navigator.clipboard.writeText(email);
            trackEvent('email_copied', {
              username: username,
              method: 'copy_button',
              email_address: email
            });
            toast.success("Email copied to clipboard!");
          }}
        >
          <svg width="14" height="14" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
            <path fillRule="evenodd" clipRule="evenodd" d="M24.7397 9.91727V19.9465C24.7397 21.0543 23.8416 21.9524 22.7338 21.9524C22.1799 21.9524 21.7309 21.5033 21.7309 20.9494V14.27C21.7315 13.9643 21.6085 13.6713 21.3899 13.4576L17.8997 10.0075C17.2774 9.37513 16.4301 9.01459 15.5429 9.00461H11.7017C11.1478 9.00461 10.6987 8.55559 10.6987 8.00169V6.87841C10.6987 6.11327 11.0034 5.37962 11.5454 4.83953C12.0873 4.29943 12.822 3.99735 13.5872 4.00002H18.9127C19.6658 4.00761 20.3859 4.31006 20.9186 4.84247L23.9273 7.85125C24.4625 8.40421 24.7549 9.14788 24.7397 9.91727ZM19.8855 13.929L16.8768 10.9202C16.3453 10.386 15.6244 10.0832 14.8709 10.0777H9.54539C7.95407 10.0833 6.66698 11.3748 6.66699 12.9662V25.1116C6.66699 26.7068 7.96018 28 9.55541 28H17.8697C19.4531 27.9835 20.7281 26.6951 20.728 25.1116V15.9348C20.7358 15.1776 20.4479 14.4472 19.9257 13.8989L19.8855 13.929Z" fill="#ffffff"></path>
          </svg>
          Copy
        </Button>
        <Link href="/" className="flex-1 sm:flex-initial">
          <Button className="bg-red-600 hover:bg-red-700 text-white text-sm sm:text-base w-full sm:min-w-[140px]">
            <ArrowRightLeft className="w-4 h-4 mr-2" />
            Change Email
          </Button>
        </Link>
        <Button variant="outline" onClick={manualRefresh} className="hidden sm:flex text-sm sm:text-base sm:min-w-[140px]">
          <Refresh className="w-4 h-4 mr-2" />
          Manual Refresh
        </Button>
      </div>

      <div className="flex justify-center sm:hidden">
        <Button variant="outline" onClick={manualRefresh} className="text-sm w-full max-w-[300px]">
          <Refresh className="w-4 h-4 mr-2" />
          Manual Refresh
        </Button>
      </div>
    </div>
  );
  
  const MailboxHeader = () => (
    <div className="text-center mb-4 sm:mb-6">
      <EmailAddressDisplay />
      <ActionButtons />
    </div>
  );
  
  const EmailsList = () => {
    if (refreshing) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400 text-lg">Refreshing...</p>
        </div>
      );
    }
    
    if (apiErrorState && failedAttempts >= 5) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center py-12 border-2 border-dashed border-red-300 dark:border-red-800 rounded-lg">
          <p className="text-red-500 dark:text-red-400 font-medium text-lg">Server connection error</p>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Could not connect to the server after multiple attempts.</p>
          <Button variant="outline" size="sm" onClick={manualRefresh} className="mt-6">
            Try Again
          </Button>
        </div>
      );
    }
    
    if (emails.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400 text-lg">No emails yet. Check back later!</p>
        </div>
      );
    }
    
    return (
      <>
        {Array.from({ length: Math.ceil(emails.length / 2) }, (_, i) => {
          const email1 = emails[i * 2];
          const email2 = emails[i * 2 + 1];
          return (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {email1 && (
                <Link href={`/mailbox/${username}/message/${email1.id}`}>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 p-3 sm:p-4 rounded-lg hover:shadow-md transition-shadow cursor-pointer bg-white dark:bg-gray-700 h-full">
                    <h3 className="text-lg sm:text-xl font-semibold mb-1 text-gray-900 dark:text-white break-words">
                      {email1.subject}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2">
                      {email1.createdAt ? new Date(email1.createdAt).toLocaleDateString('en-US', {
                        month: 'numeric',
                        day: 'numeric',
                        year: 'numeric'
                      }) : email1.time}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 line-clamp-2 break-words">
                      {email1.preview}
                    </p>
                  </div>
                </Link>
              )}
              {email2 && (
                <Link href={`/mailbox/${username}/message/${email2.id}`}>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 p-3 sm:p-4 rounded-lg hover:shadow-md transition-shadow cursor-pointer bg-white dark:bg-gray-700 h-full">
                    <h3 className="text-lg sm:text-xl font-semibold mb-1 text-gray-900 dark:text-white break-words">
                      {email2.subject}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2">
                      {email2.createdAt ? new Date(email2.createdAt).toLocaleDateString('en-US', {
                        month: 'numeric',
                        day: 'numeric',
                        year: 'numeric'
                      }) : email2.time}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 line-clamp-2 break-words">
                      {email2.preview}
                    </p>
                  </div>
                </Link>
              )}
            </div>
          );
        })}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#0D0E0E] relative overflow-y-auto">
      <BorderDecoration />

      {/* Mobile View */}
      <div className="md:hidden flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 bg-white dark:bg-[#0D0E0E] overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 lg:px-8 sm:py-8">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 mb-6 sm:mb-8">
              <MailboxHeader />
            </div>
                
            <div className="space-y-3 sm:space-y-4">
              <EmailsList />
            </div>
          </div>
        </main>

        <Footer />
      </div>

      {/* Desktop View */}
      <div className="hidden md:block">
        <Screen>
          <Header />

          <main className="flex-1 bg-white dark:bg-[#0D0E0E] overflow-y-auto">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 mb-8">
                <MailboxHeader />
              </div>

              <div className="space-y-4">
                <EmailsList />
              </div>
            </div>
          </main>

          <div className="px-4 py-6 bg-gray-50 dark:bg-[#0D0E0E] border-t border-gray-200 dark:border-gray-700">
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-2">
                Your temporary email expires in 24 hours. Only you can access your messages.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Private mailbox • No registration required • Auto-cleanup after expiry
              </p>
            </div>
          </div>

          <Footer />
        </Screen>
      </div>
    </div>
  )
}
