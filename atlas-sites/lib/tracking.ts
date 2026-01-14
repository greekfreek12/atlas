// Client-side analytics tracking with session support
// Uses sendBeacon for reliable event delivery (survives page navigation)

type EventType =
  | 'page_view'
  | 'page_exit'
  | 'phone_click'
  | 'email_click'
  | 'form_start'
  | 'form_submit'
  | 'service_click'
  | 'cta_click'
  | 'button_click'
  | 'link_click'
  | 'scroll';

interface TrackEventOptions {
  businessId: string;
  event: EventType;
  metadata?: Record<string, unknown>;
}

// Generate a unique ID
function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Get or create visitor ID (persists across sessions)
function getVisitorId(): string {
  if (typeof window === 'undefined') return '';

  let visitorId = localStorage.getItem('atlas_visitor_id');
  if (!visitorId) {
    visitorId = 'v_' + generateId();
    localStorage.setItem('atlas_visitor_id', visitorId);
  }
  return visitorId;
}

// Session expires after 5 minutes of inactivity
const SESSION_TIMEOUT = 5 * 60 * 1000;

// Get or create session ID (new session after timeout)
function getSessionId(): string {
  if (typeof window === 'undefined') return '';

  const now = Date.now();
  const stored = localStorage.getItem('atlas_session');

  if (stored) {
    try {
      const { sessionId, lastActivity } = JSON.parse(stored);
      if (now - lastActivity < SESSION_TIMEOUT) {
        // Update last activity
        localStorage.setItem('atlas_session', JSON.stringify({ sessionId, lastActivity: now }));
        return sessionId;
      }
    } catch {
      // Invalid stored data, create new session
    }
  }

  // Create new session
  const sessionId = 's_' + generateId();
  localStorage.setItem('atlas_session', JSON.stringify({ sessionId, lastActivity: now }));
  return sessionId;
}

// Parse device info from user agent
function getDeviceInfo(): { deviceType: string; browser: string; os: string } {
  if (typeof navigator === 'undefined') {
    return { deviceType: 'unknown', browser: 'unknown', os: 'unknown' };
  }

  const ua = navigator.userAgent;

  // Device type
  let deviceType = 'desktop';
  if (/Mobile|Android|iPhone|iPad|iPod/i.test(ua)) {
    deviceType = /iPad|Tablet/i.test(ua) ? 'tablet' : 'mobile';
  }

  // Browser
  let browser = 'unknown';
  if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Edg')) browser = 'Edge';

  // OS
  let os = 'unknown';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

  return { deviceType, browser, os };
}

// Check if this is an admin preview
function isAdminPreview(): boolean {
  if (typeof window === 'undefined') return false;

  // Check for admin preview query param
  const params = new URLSearchParams(window.location.search);
  if (params.get('source') === 'admin') return true;

  // Check if referrer is from admin
  const referrer = document.referrer || '';
  if (referrer.includes('/admin')) return true;

  return false;
}

// Send event using sendBeacon for reliability (survives page navigation)
function sendEvent(data: Record<string, unknown>): void {
  try {
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/track', blob);
    } else {
      // Fallback to fetch with keepalive
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // Silently fail
  }
}

// Track event with session info
export async function trackEvent({ businessId, event, metadata }: TrackEventOptions): Promise<void> {
  try {
    const visitorId = getVisitorId();
    const sessionId = getSessionId();
    const deviceInfo = getDeviceInfo();
    const adminPreview = isAdminPreview();

    sendEvent({
      businessId,
      event,
      visitorId,
      sessionId,
      isAdmin: adminPreview,
      metadata: {
        ...metadata,
        url: typeof window !== 'undefined' ? window.location.pathname : undefined,
        referrer: typeof document !== 'undefined' ? document.referrer : undefined,
        ...deviceInfo,
      },
    });
  } catch {
    // Silently fail
  }
}

// Page view tracking with duration and scroll depth
let pageEnterTime: number = 0;
let currentBusinessId: string = '';
let lastTrackedPage: string = '';
let lastTrackTime: number = 0;
let maxScrollDepth: number = 0;

export function trackPageView(businessId: string, page?: string): void {
  const currentPage = page || (typeof window !== 'undefined' ? window.location.pathname : '');
  const now = Date.now();

  // Prevent duplicate tracking (React Strict Mode double-renders)
  // Skip if same page was tracked less than 1 second ago
  if (currentPage === lastTrackedPage && now - lastTrackTime < 1000) {
    return;
  }

  // Reset scroll depth for new page
  maxScrollDepth = 0;
  pageEnterTime = now;
  currentBusinessId = businessId;
  lastTrackedPage = currentPage;
  lastTrackTime = now;

  trackEvent({
    businessId,
    event: 'page_view',
    metadata: { page: currentPage },
  });
}

// Track page exit with duration and scroll depth
let lastExitTime: number = 0;

export function trackPageExit(): void {
  if (!currentBusinessId || !pageEnterTime) return;

  const now = Date.now();
  // Prevent duplicate exit tracking (React Strict Mode)
  if (now - lastExitTime < 1000) return;
  lastExitTime = now;

  const duration = now - pageEnterTime;

  sendEvent({
    businessId: currentBusinessId,
    event: 'page_exit',
    visitorId: getVisitorId(),
    sessionId: getSessionId(),
    metadata: {
      url: window.location.pathname,
      durationMs: duration,
      scrollDepth: maxScrollDepth,
    },
  });
}

// Track scroll depth (call this on scroll events)
export function updateScrollDepth(): void {
  if (typeof window === 'undefined') return;

  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;

  if (scrollHeight <= 0) {
    maxScrollDepth = 100;
    return;
  }

  const currentDepth = Math.min(100, Math.round((scrollTop / scrollHeight) * 100));
  if (currentDepth > maxScrollDepth) {
    maxScrollDepth = currentDepth;
  }
}

// Get current scroll depth (for reporting)
export function getMaxScrollDepth(): number {
  return maxScrollDepth;
}

// Track if we've already initialized listeners
let listenersInitialized = false;

// Visibility change handler (stored for cleanup)
function handleVisibilityChange(): void {
  if (document.visibilityState === 'hidden') {
    trackPageExit();
  } else if (document.visibilityState === 'visible') {
    pageEnterTime = Date.now(); // Reset timer when coming back
  }
}

// Scroll handler with throttling
let scrollTimeout: ReturnType<typeof setTimeout> | null = null;
function handleScroll(): void {
  updateScrollDepth();

  // Throttle scroll depth tracking events (send every 5 seconds during scrolling)
  if (!scrollTimeout) {
    scrollTimeout = setTimeout(() => {
      scrollTimeout = null;
    }, 5000);
  }
}

// Global click handler - tracks all button and link clicks automatically
function handleClick(event: MouseEvent): void {
  if (!currentBusinessId) return;

  const target = event.target as HTMLElement;
  const clickedElement = target.closest('button, a, [role="button"]');

  if (!clickedElement) return;

  // Get element info
  const tagName = clickedElement.tagName.toLowerCase();
  const href = tagName === 'a' ? (clickedElement as HTMLAnchorElement).href : undefined;

  // Smart text extraction - get the most relevant text
  let text = '';

  // Try to find actual button/link text (not all the content)
  if (tagName === 'button' || clickedElement.getAttribute('role') === 'button') {
    // For buttons, use aria-label, or the direct text (not nested content)
    text = clickedElement.getAttribute('aria-label') ||
           clickedElement.getAttribute('title') ||
           (clickedElement as HTMLElement).innerText?.trim() || '';
  } else if (tagName === 'a') {
    // For links, prefer aria-label or title, then fall back to text
    text = clickedElement.getAttribute('aria-label') ||
           clickedElement.getAttribute('title') ||
           (clickedElement as HTMLElement).innerText?.trim() || '';
  }

  // Clean and truncate the text
  text = text
    .split('\n')[0] // Take only first line
    .trim()
    .slice(0, 30); // Shorter truncation

  // Detect special click types from data attributes or classes
  let eventType: EventType = 'button_click';
  let metadata: Record<string, unknown> = { text };

  if (href) {
    metadata.href = href;
    eventType = 'link_click';

    // Detect phone clicks
    if (href.startsWith('tel:')) {
      eventType = 'phone_click';
      metadata.phone = href.replace('tel:', '');
      metadata.text = 'Phone'; // Override text for phone clicks
    }
    // Detect email clicks
    else if (href.startsWith('mailto:')) {
      eventType = 'email_click';
      metadata.email = href.replace('mailto:', '');
      metadata.text = 'Email'; // Override text for email clicks
    }
  }

  // Check for data attributes that indicate specific actions
  const dataAction = (clickedElement as HTMLElement).getAttribute('data-track');
  if (dataAction) {
    if (dataAction.includes('phone')) eventType = 'phone_click';
    else if (dataAction.includes('email')) eventType = 'email_click';
    else if (dataAction.includes('cta')) eventType = 'cta_click';
  }

  trackEvent({
    businessId: currentBusinessId,
    event: eventType,
    metadata,
  });
}

// Initialize tracking - call this on page load
export function initTracking(businessId: string): void {
  if (typeof window === 'undefined') return;

  // Track page view
  trackPageView(businessId);

  // Only add listeners once
  if (!listenersInitialized) {
    window.addEventListener('beforeunload', trackPageExit);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('click', handleClick, true); // Use capture phase to catch all clicks
    listenersInitialized = true;
  }
}

// Cleanup function for component unmount
export function cleanupTracking(): void {
  if (typeof window === 'undefined') return;

  // Track exit before cleanup
  trackPageExit();

  window.removeEventListener('beforeunload', trackPageExit);
  document.removeEventListener('visibilitychange', handleVisibilityChange);
  window.removeEventListener('scroll', handleScroll);
  document.removeEventListener('click', handleClick, true);
  listenersInitialized = false;
}

// Convenience functions - all use sendBeacon for reliability
export const trackPhoneClick = (businessId: string, location?: string) =>
  trackEvent({ businessId, event: 'phone_click', metadata: { location } });

export const trackEmailClick = (businessId: string, location?: string) =>
  trackEvent({ businessId, event: 'email_click', metadata: { location } });

export const trackFormStart = (businessId: string, formName?: string) =>
  trackEvent({ businessId, event: 'form_start', metadata: { formName } });

export const trackFormSubmit = (businessId: string, formName?: string) =>
  trackEvent({ businessId, event: 'form_submit', metadata: { formName } });

export const trackServiceClick = (businessId: string, serviceName: string) =>
  trackEvent({ businessId, event: 'service_click', metadata: { serviceName } });

export const trackCtaClick = (businessId: string, ctaName: string, location?: string) =>
  trackEvent({ businessId, event: 'cta_click', metadata: { ctaName, location } });

export const trackButtonClick = (businessId: string, buttonName: string, location?: string) =>
  trackEvent({ businessId, event: 'button_click', metadata: { buttonName, location } });

export const trackLinkClick = (businessId: string, linkText: string, href?: string) =>
  trackEvent({ businessId, event: 'link_click', metadata: { linkText, href } });

export const trackScroll = (businessId: string, percent: number) =>
  trackEvent({ businessId, event: 'scroll', metadata: { scrollPercent: percent } });

// Get current visitor and session IDs (for debugging)
export function getTrackingIds(): { visitorId: string; sessionId: string } {
  return {
    visitorId: getVisitorId(),
    sessionId: getSessionId(),
  };
}
