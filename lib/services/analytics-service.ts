import { createClient } from '@/lib/supabase/client';

/**
 * Track a site visit (client-side only)
 */
export async function trackSiteVisit(pagePath: string, referrer?: string) {
  try {
    const supabase = createClient();
    
    // Generate or retrieve session ID from localStorage
    let sessionId = localStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
      localStorage.setItem('analytics_session_id', sessionId);
    }

    const { error } = await supabase.from('site_visits').insert({
      page_path: pagePath,
      referrer: referrer || document.referrer,
      user_agent: navigator.userAgent,
      session_id: sessionId,
    });

    if (error) {
      console.error('Failed to track visit:', error);
    }
  } catch (error) {
    console.error('Error tracking site visit:', error);
  }
}
