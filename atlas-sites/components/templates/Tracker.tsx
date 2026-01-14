'use client';

import { useEffect, useRef } from 'react';
import { initTracking, trackPageView, trackPageExit, updateScrollDepth } from '@/lib/tracking';
import { usePathname } from 'next/navigation';

interface TrackerProps {
  businessId: string;
}

export default function Tracker({ businessId }: TrackerProps) {
  const pathname = usePathname();
  const isFirstRender = useRef(true);
  const previousPathname = useRef<string | null>(null);

  // Initialize tracking on mount (sets up listeners)
  useEffect(() => {
    initTracking(businessId);

    // Capture initial scroll position after page load
    const timer = setTimeout(() => {
      updateScrollDepth();
    }, 100);

    return () => clearTimeout(timer);
  }, [businessId]);

  // Track page views on route changes (client-side navigation)
  useEffect(() => {
    // Skip the initial mount since initTracking already tracks the page view
    if (isFirstRender.current) {
      isFirstRender.current = false;
      previousPathname.current = pathname;
      return;
    }

    // Only track if pathname actually changed
    if (pathname && pathname !== previousPathname.current) {
      // Track exit from previous page before tracking new page view
      trackPageExit();
      trackPageView(businessId, pathname);
      previousPathname.current = pathname;

      // Scroll to top and reset scroll tracking for new page
      window.scrollTo(0, 0);
      setTimeout(() => {
        updateScrollDepth();
      }, 100);
    }
  }, [pathname, businessId]);

  return null;
}
