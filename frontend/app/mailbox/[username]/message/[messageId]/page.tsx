"use client"

import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Screen } from "@/components/screen"
import { Header, Footer, BorderDecoration } from "@/components/layout"
import { fetchMessage } from "@/lib/api"

export default function MessagePage() {
  const params = useParams()
  const router = useRouter()
  const messageId = params.messageId as string
  const username = params.username as string

  const [message, setMessage] = useState<any>(null)
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    const loadMessage = async () => {
      setLoading(true)
      try {
        const messageData = await fetchMessage(`${params.username}@temp.abhi.at`, messageId)
        setMessage(messageData)
      } catch (error) {
        console.error('Failed to load message from API:', error)
        
        toast.error("Failed to load email message. Please try again later.", {
          duration: 5000,
        })
      } finally {
        setLoading(false)
      }
    }

    loadMessage()
  }, [messageId, params.username])


  if (loading) {
    return (
      <div
        className="h-screen bg-gray-100 dark:bg-[#0D0E0E] relative overflow-hidden"
      >
        <BorderDecoration />

        {/* Mobile loading */}
        <div className="md:hidden">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-500 dark:text-gray-400">
                Loading message...
              </p>
            </div>
          </div>
        </div>

        {/* Desktop loading */}
        <div className="hidden md:block">
          <Screen>
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-500 dark:text-gray-400">
                  Loading message...
                </p>
              </div>
            </div>
          </Screen>
        </div>
      </div>
    )
  }

  if (!message) {
    return (
      <div
        className="h-screen bg-gray-100 dark:bg-[#0D0E0E] relative overflow-hidden"
      >
        <div className="md:hidden">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-500 dark:text-gray-400">Message not found</p>
              <Link href="/">
                <Button className="mt-4">Go Home</Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="hidden md:block">
          <Screen>
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-gray-500 dark:text-gray-400">Message not found</p>
                <Link href="/">
                  <Button className="mt-4">Go Home</Button>
                </Link>
              </div>
            </div>
          </Screen>
        </div>
      </div>
    )
  }

  return (
    <div
      className="h-screen bg-gray-100 dark:bg-[#0D0E0E] relative overflow-hidden"
    >
      <BorderDecoration />

      <div className="md:hidden flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 bg-white dark:bg-[#0D0E0E]">
          <div className="max-w-4xl mx-auto p-6">
            <div className="flex items-center gap-4 mb-6">
              <Link href={`/mailbox/${username}`}>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Mailbox
                </Button>
              </Link>
            </div>

            <div
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800"
            >
              <div className="p-6 border-b border-dashed border-gray-300 dark:border-gray-600">
                <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                  {message.subject}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {message.createdAt ? new Date(message.createdAt).toLocaleDateString('en-US', {
                    month: 'numeric',
                    day: 'numeric',
                    year: 'numeric'
                  }) : message.time}
                </p>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                    <span className="font-medium">From:</span> {message.from}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">To:</span> {`<${username}@temp.abhi.at>`}
                  </p>
                </div>
                
                {/* Email Preview Section */}
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700">
                  <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email Preview:</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {message.parsedData?.text || message.preview || "No preview available"}
                  </p>
                </div>
              </div>

              <div className="p-6">
                <div
                  className="prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: message.content }}
                />
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>

      <div className="hidden md:block">
        <Screen>
          <Header />

          <main className="flex-1 bg-white dark:bg-[#0D0E0E]">
            <div className="max-w-4xl mx-auto p-6">
              <div className="flex items-center gap-4 mb-6">
                <Link href={`/mailbox/${username}`}>
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Mailbox
                  </Button>
                </Link>
              </div>

              <div
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800"
              >
                <div className="p-6 border-b border-dashed border-gray-300 dark:border-gray-600">
                  <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                    {message.subject}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {message.createdAt ? new Date(message.createdAt).toLocaleDateString('en-US', {
                      month: 'numeric',
                      day: 'numeric',
                      year: 'numeric'
                    }) : message.time}
                  </p>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                      <span className="font-medium">From:</span> {message.from}
                    </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">To:</span> {`<${username}@temp.abhi.at>`}
                  </p>
                  </div>
                  
                  {/* Email Preview Section */}
                  <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-600 dark:text-gray-400 prose-sm max-w-none dark:prose-invert"
                         dangerouslySetInnerHTML={{ 
                           __html: message.parsedData?.html || 
                                  `<p>${message.parsedData?.text || message.preview || "No preview available"}</p>` 
                         }}
                    />
                  </div>
                </div>

                <div className="p-6">
                  <div
                    className="prose dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: message.content }}
                  />
                </div>
              </div>
            </div>
          </main>

          <Footer />
        </Screen>
      </div>
    </div>
  )
}
