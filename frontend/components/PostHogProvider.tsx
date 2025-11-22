'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import posthog from 'posthog-js'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    // Initialize PostHog with proper configuration
    if (typeof window !== 'undefined') {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        capture_pageview: true,
        capture_pageleave: true,
        autocapture: true,
        person_profiles: 'identified_only',
        loaded: (posthog) => {
          if (process.env.NODE_ENV === 'development') {
            console.log('PostHog loaded successfully')
          }
        },
      })
    }
  }, [])

  useEffect(() => {
    if (pathname) {
      posthog.capture('$pageview', {
        $current_url: pathname,
      })
    }
  }, [pathname])

  return <>{children}</>
}
