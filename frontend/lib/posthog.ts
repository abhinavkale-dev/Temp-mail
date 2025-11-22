import posthog from 'posthog-js';

export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    posthog.capture(eventName, properties);
  }
};

export const trackPageView = (pageName: string, properties?: Record<string, any>) => {
  trackEvent('$pageview', { page: pageName, ...properties });
};

export const identifyUser = (userId: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    posthog.identify(userId, properties);
  }
};

export const resetUser = () => {
  if (typeof window !== 'undefined') {
    posthog.reset();
  }
};

export { posthog };
