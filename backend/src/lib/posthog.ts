import { PostHog } from 'posthog-node';

const posthog = new PostHog(process.env.POSTHOG_KEY || process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  host: process.env.POSTHOG_HOST || process.env.NEXT_PUBLIC_POSTHOG_HOST,
  disableGeoip: false,
});


export const shouldSample = (percentage: number): boolean => {
  return Math.random() * 100 <= percentage;
};

export const trackServerEvent = (event: string, properties?: Record<string, any>, distinctId?: string) => {
  try {
    posthog.capture({
      distinctId: distinctId || 'anonymous',
      event,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
      },
    });
  } catch (error) {
    console.error('PostHog tracking error:', error);
  }
};

export const identifyUser = (distinctId: string, properties?: Record<string, any>) => {
  try {
    posthog.identify({
      distinctId,
      properties,
    });
  } catch (error) {
    console.error('PostHog identify error:', error);
  }
};

process.on('exit', () => {
  posthog.shutdown();
});

export { posthog };
