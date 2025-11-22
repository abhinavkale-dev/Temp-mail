'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import posthog from 'posthog-js'

declare global {
  interface Window {
    posthog?: typeof posthog
  }
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    if (pathname && typeof window !== 'undefined' && window.posthog) {
      posthog.capture('$pageview', {
        $current_url: pathname,
      })
    }
  }, [pathname])

  return <>{children}</>
}
