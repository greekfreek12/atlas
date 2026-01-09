// Client-side analytics tracking

type EventType =
  | 'page_view'
  | 'phone_click'
  | 'email_click'
  | 'form_start'
  | 'form_submit'
  | 'service_click'
  | 'cta_click';

interface TrackEventOptions {
  businessId: string;
  event: EventType;
  metadata?: Record<string, unknown>;
}

export async function trackEvent({ businessId, event, metadata }: TrackEventOptions): Promise<void> {
  try {
    // Fire and forget - don't await or block user interaction
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessId,
        event,
        metadata: {
          ...metadata,
          url: typeof window !== 'undefined' ? window.location.pathname : undefined,
          referrer: typeof document !== 'undefined' ? document.referrer : undefined,
        },
      }),
    }).catch(() => {
      // Silently fail - analytics should never break the user experience
    });
  } catch {
    // Silently fail
  }
}

// Convenience functions
export const trackPageView = (businessId: string, page?: string) =>
  trackEvent({ businessId, event: 'page_view', metadata: { page } });

export const trackPhoneClick = (businessId: string) =>
  trackEvent({ businessId, event: 'phone_click' });

export const trackEmailClick = (businessId: string) =>
  trackEvent({ businessId, event: 'email_click' });

export const trackFormStart = (businessId: string) =>
  trackEvent({ businessId, event: 'form_start' });

export const trackFormSubmit = (businessId: string) =>
  trackEvent({ businessId, event: 'form_submit' });

export const trackServiceClick = (businessId: string, serviceName: string) =>
  trackEvent({ businessId, event: 'service_click', metadata: { serviceName } });

export const trackCtaClick = (businessId: string, ctaName: string) =>
  trackEvent({ businessId, event: 'cta_click', metadata: { ctaName } });
