import posthog from 'posthog-js'

declare global {
  interface Window {
    posthog: typeof posthog
  }
}

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    person_profiles: 'identified_only',
    capture_pageview: false,
  });

  window.posthog = posthog;
}
