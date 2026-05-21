import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Hook to automatically track page visits
 * Call this in a layout component to track all pages
 */
export function useTrackPageView() {
  const pathname = usePathname();
  const prevPathnameRef = useRef<string | null>(null);

  useEffect(() => {
    // Disable visit tracking for local development environments
    if (process.env.NODE_ENV === 'development' || (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))) {
      return;
    }

    // Retrieve session ID
    let sessionId = localStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
      localStorage.setItem('analytics_session_id', sessionId);
    }

    // List of paths to exclude from tracking
    const excludedPaths = ['/my-application', '/admin', '/api'];
    if (excludedPaths.some(path => pathname.startsWith(path))) {
      return;
    }

    // Determine the referrer: use previous SPA pathname if available, otherwise document.referrer
    const referrer = prevPathnameRef.current || (typeof document !== 'undefined' ? document.referrer : '');

    // Track the page view
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pagePath: pathname,
        referrer: referrer || null,
        sessionId,
      }),
    }).catch(err => {
      // Silently fail if tracking fails
      console.debug('Analytics tracking failed:', err);
    });

    // Update the previous pathname ref for the next navigation
    prevPathnameRef.current = pathname;
  }, [pathname]);
}
