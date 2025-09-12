"use client"

import { useParams } from "next/navigation"
import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw as Refresh, Lock } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { Screen } from "@/components/screen"
import { Header, Footer, BorderDecoration } from "@/components/layout"
import { fetchMessages } from "@/lib/api"

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
  const [isRateLimited, setIsRateLimited] = useState(false)
  const [hasStableEmails, setHasStableEmails] = useState(false)
  const [stableEmailCount, setStableEmailCount] = useState(0)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastEmailCountRef = useRef<number>(0)

  const loadEmails = async () => {
    if (apiErrorState && failedAttempts >= 5) {
      return;
    }

    setLoading(true)
    try {
      const result = await fetchMessages(`${username}@temp.abhi.at`)

      const newEmails = result.messages || []
      setEmails(newEmails)
      
      const currentCount = newEmails.length
      if (currentCount > 0 && currentCount === lastEmailCountRef.current) {
        setStableEmailCount(prev => prev + 1)
      } else {
        setStableEmailCount(0)
        setHasStableEmails(false)
      }
      lastEmailCountRef.current = currentCount
      
      if (failedAttempts > 0) {
        setFailedAttempts(0)
        setApiErrorState(false)
      }
    } catch (error) {
      console.error('Failed to load emails:', error)

      setEmails([])

      const newFailedAttempts = failedAttempts + 1
      setFailedAttempts(newFailedAttempts)
      setApiErrorState(true)

      const errorMessage = error instanceof Error ? error.message : String(error)
      const isRateLimit = errorMessage.includes('429') || errorMessage.includes('Too many requests')

      if (isRateLimit) {
        setIsRateLimited(true)
        toast.error("Rate limit exceeded. Polling paused for 2 minutes. Will auto-resume.", {
          style: {
            background: 'white',
            color: 'black',
            border: '1px solid #ef4444',
          },
          duration: 15000,
        })

        setTimeout(() => {
          setIsRateLimited(false)
          setIsListening(true)
          toast.info("Rate limit period ended. Resuming polling.", {
            style: {
              background: 'white',
              color: 'black',
              border: '1px solid #22c55e',
            },
            duration: 5000,
          })
        }, 120000) // 2 minutes

        setIsListening(false)
        return;
      } else {
        toast.error(`Cannot reach server right now. Retry ${newFailedAttempts}/5`, {
          style: {
            background: 'white',
            color: 'black',
            border: '1px solid #ef4444',
          },
        })

        if (newFailedAttempts >= 5) {
          toast.error("Maximum retry attempts reached. Please refresh the page to try again.", {
            style: {
              background: 'white',
              color: 'black',
              border: '1px solid #ef4444',
            },
            duration: 10000,
          })
          setIsListening(false)
        }
      }
    } finally {
      setLoading(false)
      setLastChecked(new Date())
    }
  }

  useEffect(() => {
    if (stableEmailCount >= 3 && lastEmailCountRef.current > 0) {
      setHasStableEmails(true)
    }
  }, [stableEmailCount])

  useEffect(() => {
    loadEmails()

    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    if ((apiErrorState && failedAttempts >= 5) || isRateLimited) {
      return;
    }

    const getBackoffTime = () => {
      if (hasStableEmails && emails.length > 0) {
        return 30000;
      }
      
      if (failedAttempts === 0) return 10000;
      return Math.min(Math.pow(2, failedAttempts) * 2000, 60000);
    };

    const interval = setInterval(() => {
      if (isListening) {
        loadEmails()
      }
    }, getBackoffTime())

    return () => clearInterval(interval)
  }, [isListening, failedAttempts, apiErrorState, isRateLimited, hasStableEmails, emails.length])


  const manualRefresh = async () => {
    setApiErrorState(false)
    setFailedAttempts(0)
    setIsRateLimited(false)
    setHasStableEmails(false)
    setStableEmailCount(0)
    setIsListening(true)

    toast("Refreshing mailbox...", {
      style: {
        background: 'white',
        color: 'black',
        border: '1px solid #e5e7eb',
      },
    })

    setRefreshing(true)
    try {
      await loadEmails()
      setTimeout(() => {
        setRefreshing(false)
        toast.success("Mailbox refreshed!", {
          style: {
            background: 'white',
            color: 'black',
            border: '1px solid #e5e7eb',
          },
        })
        setLastChecked(new Date())
      }, 4000)
    } catch (error) {
      setRefreshing(false)
      toast.error("Failed to refresh mailbox. Please try again later.", {
        style: {
          background: 'white',
          color: 'black',
          border: '1px solid #ef4444',
        },
      })
    }
  }

  return (
    <div
      className="h-screen bg-gray-100 dark:bg-[#0D0E0E] relative overflow-hidden"
    >
      <BorderDecoration />

      <div className="md:hidden flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 bg-white dark:bg-[#0D0E0E]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 mb-8">

              <div className="text-center mb-6">
                <div
                  className="inline-flex items-center px-4 py-2 rounded-full bg-gray-300 text-gray-900 font-semibold text-lg mb-4 cursor-pointer hover:bg-gray-400 transition-colors"
                  onClick={() => {
                    const email = `${username}@temp.abhi.at`;
                    navigator.clipboard.writeText(email);
                    toast.success("Email copied to clipboard!");
                  }}
                >
                  {username}@temp.abhi.at
                </div>
                <div className="flex justify-center gap-3">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md transition-colors"
                    onClick={() => {
                      const email = `${username}@temp.abhi.at`;
                      navigator.clipboard.writeText(email);
                      toast.success("Email copied to clipboard!");
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M24.7397 9.91727V19.9465C24.7397 21.0543 23.8416 21.9524 22.7338 21.9524C22.1799 21.9524 21.7309 21.5033 21.7309 20.9494V14.27C21.7315 13.9643 21.6085 13.6713 21.3899 13.4576L17.8997 10.0075C17.2774 9.37513 16.4301 9.01459 15.5429 9.00461H11.7017C11.1478 9.00461 10.6987 8.55559 10.6987 8.00169V6.87841C10.6987 6.11327 11.0034 5.37962 11.5454 4.83953C12.0873 4.29943 12.822 3.99735 13.5872 4.00002H18.9127C19.6658 4.00761 20.3859 4.31006 20.9186 4.84247L23.9273 7.85125C24.4625 8.40421 24.7549 9.14788 24.7397 9.91727ZM19.8855 13.929L16.8768 10.9202C16.3453 10.386 15.6244 10.0832 14.8709 10.0777H9.54539C7.95407 10.0833 6.66698 11.3748 6.66699 12.9662V25.1116C6.66699 26.7068 7.96018 28 9.55541 28H17.8697C19.4531 27.9835 20.7281 26.6951 20.728 25.1116V15.9348C20.7358 15.1776 20.4479 14.4472 19.9257 13.8989L19.8855 13.929Z" fill="#ffffff"></path>
                    </svg>
                    Copy
                  </button>
                  <Link href="/">
                    <Button className="bg-red-600 hover:bg-red-700 text-white" size="sm">
                      Change
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={manualRefresh}>
                    <Refresh className="w-4 h-4 mr-2" />
                    Manual Refresh
                  </Button>
                </div>
              </div>


                </div>
                
            <div className="space-y-4">
              {refreshing ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-4 text-gray-500 dark:text-gray-400">Refreshing...</p>
                </div>
              ) : apiErrorState && failedAttempts >= 5 ? (
                <div className="text-center py-12 border-2 border-dashed border-red-300 dark:border-red-800 rounded-lg">
                  <p className="mt-2 text-red-500 dark:text-red-400 font-medium">Server connection error</p>
                  <p className="mt-2 text-gray-500 dark:text-gray-400">Could not connect to the server after multiple attempts.</p>
                  <Button variant="outline" size="sm" onClick={manualRefresh} className="mt-4">
                    Try Again
                  </Button>
                </div>
              ) : emails.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-4 text-gray-500 dark:text-gray-400">No emails yet. Check back later!</p>
                </div>
              ) : (
                Array.from({ length: Math.ceil(emails.length / 2) }, (_, i) => {
                  const email1 = emails[i * 2];
                  const email2 = emails[i * 2 + 1];
                  return (
                    <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {email1 && (
                        <Link href={`/mailbox/${username}/message/${email1.id}`}>
                          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 p-4 rounded-lg hover:shadow-md transition-shadow cursor-pointer bg-white dark:bg-gray-700 h-full">
                            <h3 className="text-xl font-semibold mb-1 text-gray-900 dark:text-white">
                              {email1.subject}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                              {email1.createdAt ? new Date(email1.createdAt).toLocaleDateString('en-US', {
                                month: 'numeric',
                                day: 'numeric',
                                year: 'numeric'
                              }) : email1.time}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                              {email1.preview}
                            </p>
                          </div>
                        </Link>
                      )}
                      {email2 && (
                        <Link href={`/mailbox/${username}/message/${email2.id}`}>
                          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 p-4 rounded-lg hover:shadow-md transition-shadow cursor-pointer bg-white dark:bg-gray-700 h-full">
                            <h3 className="text-xl font-semibold mb-1 text-gray-900 dark:text-white">
                              {email2.subject}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                              {email2.createdAt ? new Date(email2.createdAt).toLocaleDateString('en-US', {
                                month: 'numeric',
                                day: 'numeric',
                                year: 'numeric'
                              }) : email2.time}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                              {email2.preview}
                            </p>
                          </div>
                        </Link>
                      )}
                    </div>
                  );
                })
              )}
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
      </div>

      <div className="hidden md:block">
        <Screen>
          <Header />

          <main className="flex-1 bg-white dark:bg-[#0D0E0E]">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 mb-8">

                <div className="text-center mb-6">
                <div
                  className="inline-flex items-center px-4 py-2 rounded-full bg-gray-300 text-gray-900 font-semibold text-lg mb-4 cursor-pointer hover:bg-gray-400 transition-colors"
                  onClick={() => {
                    const email = `${username}@temp.abhi.at`;
                    navigator.clipboard.writeText(email);
                    toast.success("Email copied to clipboard!");
                  }}
                >
                  {username}@temp.abhi.at
                </div>
                  <div className="flex justify-center gap-3">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md transition-colors"
                      onClick={() => {
                        const email = `${username}@temp.abhi.at`;
                        navigator.clipboard.writeText(email);
                        toast.success("Email copied to clipboard!");
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M24.7397 9.91727V19.9465C24.7397 21.0543 23.8416 21.9524 22.7338 21.9524C22.1799 21.9524 21.7309 21.5033 21.7309 20.9494V14.27C21.7315 13.9643 21.6085 13.6713 21.3899 13.4576L17.8997 10.0075C17.2774 9.37513 16.4301 9.01459 15.5429 9.00461H11.7017C11.1478 9.00461 10.6987 8.55559 10.6987 8.00169V6.87841C10.6987 6.11327 11.0034 5.37962 11.5454 4.83953C12.0873 4.29943 12.822 3.99735 13.5872 4.00002H18.9127C19.6658 4.00761 20.3859 4.31006 20.9186 4.84247L23.9273 7.85125C24.4625 8.40421 24.7549 9.14788 24.7397 9.91727ZM19.8855 13.929L16.8768 10.9202C16.3453 10.386 15.6244 10.0832 14.8709 10.0777H9.54539C7.95407 10.0833 6.66698 11.3748 6.66699 12.9662V25.1116C6.66699 26.7068 7.96018 28 9.55541 28H17.8697C19.4531 27.9835 20.7281 26.6951 20.728 25.1116V15.9348C20.7358 15.1776 20.4479 14.4472 19.9257 13.8989L19.8855 13.929Z" fill="#ffffff"></path>
                      </svg>
                      Copy
                    </button>
                    <Link href="/">
                      <Button variant="outline" size="sm">
                        Change
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" onClick={manualRefresh}>
                      <Refresh className="w-4 h-4 mr-2" />
                      Manual Refresh
                    </Button>
                  </div>
                </div>


              </div>

              <div className="space-y-4">
                {refreshing ? (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-500 dark:text-gray-400">Refreshing...</p>
                  </div>
                ) : isRateLimited ? (
                  <div className="text-center py-12 border-2 border-dashed border-orange-300 dark:border-orange-800 rounded-lg">
                    <p className="mt-2 text-orange-500 dark:text-orange-400 font-medium">Rate Limit Active</p>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Too many requests. Polling paused for 2 minutes.</p>
                    <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">Will automatically resume</p>
                  </div>
                ) : isRateLimited ? (
                  <div className="text-center py-12 border-2 border-dashed border-orange-300 dark:border-orange-800 rounded-lg">
                    <p className="mt-2 text-orange-500 dark:text-orange-400 font-medium">Rate Limit Active</p>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Too many requests. Polling paused for 2 minutes.</p>
                    <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">Will automatically resume</p>
                  </div>
                ) : apiErrorState && failedAttempts >= 5 ? (
                  <div className="text-center py-12 border-2 border-dashed border-red-300 dark:border-red-800 rounded-lg">
                    <p className="mt-2 text-red-500 dark:text-red-400 font-medium">Server connection error</p>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Could not connect to the server after multiple attempts.</p>
                    <Button variant="outline" size="sm" onClick={manualRefresh} className="mt-4">
                      Try Again
                    </Button>
                  </div>
                ) : emails.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-500 dark:text-gray-400">No emails yet. Check back later!</p>
                  </div>
              ) : (
                Array.from({ length: Math.ceil(emails.length / 2) }, (_, i) => {
                  const email1 = emails[i * 2];
                  const email2 = emails[i * 2 + 1];
                  return (
                    <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {email1 && (
                        <Link href={`/mailbox/${username}/message/${email1.id}`}>
                          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 p-4 rounded-lg hover:shadow-md transition-shadow cursor-pointer bg-white dark:bg-gray-700 h-full">
                            <h3 className="text-xl font-semibold mb-1 text-gray-900 dark:text-white">
                              {email1.subject}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                              {email1.createdAt ? new Date(email1.createdAt).toLocaleDateString('en-US', {
                                month: 'numeric',
                                day: 'numeric',
                                year: 'numeric'
                              }) : email1.time}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                              {email1.preview}
                            </p>
                          </div>
                        </Link>
                      )}
                      {email2 && (
                        <Link href={`/mailbox/${username}/message/${email2.id}`}>
                          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 p-4 rounded-lg hover:shadow-md transition-shadow cursor-pointer bg-white dark:bg-gray-700 h-full">
                            <h3 className="text-xl font-semibold mb-1 text-gray-900 dark:text-white">
                              {email2.subject}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                              {email2.createdAt ? new Date(email2.createdAt).toLocaleDateString('en-US', {
                                month: 'numeric',
                                day: 'numeric',
                                year: 'numeric'
                              }) : email2.time}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                              {email2.preview}
                            </p>
                          </div>
                        </Link>
                      )}
                    </div>
                  );
                })
              )}
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
