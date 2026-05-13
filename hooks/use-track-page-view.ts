import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Hook to automatically track page visits
 * Call this in a layout component to track all pages
 */
export function useTrackPageView() {
  const pathname = usePathname();

  useEffect(() => {
    // Generate or retrieve session ID
    let sessionId = localStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
      localStorage.setItem('analytics_session_id', sessionId);
    }

    // Track the page view
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pagePath: pathname,
        referrer: document.referrer,
        sessionId,
      }),
    }).catch(err => {
      // Silently fail if tracking fails
      console.debug('Analytics tracking failed:', err);
    });
  }, [pathname]);
}
