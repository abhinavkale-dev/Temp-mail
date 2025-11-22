'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import posthog from 'posthog-js'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window !== 'undefined' && !posthog.__loaded) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
        person_profiles: 'identified_only',
        capture_pageview: false,
        loaded: (posthog) => {
          if (process.env.NODE_ENV === 'development') console.log('PostHog initialized')
        }
      })
    }
  }, [])

  useEffect(() => {
    if (pathname && posthog.__loaded) {
      posthog.capture('$pageview')
    }
  }, [pathname])

  return <>{children}</>
}
