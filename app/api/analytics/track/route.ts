import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/analytics/track
 * Track a site visit
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pagePath, referrer, sessionId } = body;

    if (!pagePath || !sessionId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { error } = await supabase.from('site_visits').insert({
      page_path: pagePath,
      referrer: referrer || null,
      user_agent: request.headers.get('user-agent'),
      ip_address: request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip') || null,
      session_id: sessionId,
    });

    if (error) {
      console.error('Analytics insert error:', error);
      return NextResponse.json({ error: 'Failed to track visit' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics endpoint error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
