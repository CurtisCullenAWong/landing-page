'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export interface AnalyticsMetrics {
  totalVisits: number;
  uniqueVisitors: number;
  topPages: Array<{ path: string; visits: number }>;
  topReferrers: Array<{ referrer: string; visits: number }>;
  visitsOverTime: Array<{ date: string; visits: number }>;
}

export async function fetchAnalyticsMetrics(
  daysBack: number = 30
): Promise<AnalyticsMetrics> {
  try {
    const supabase = await createClient();

    const dateRange = new Date();
    dateRange.setDate(dateRange.getDate() - daysBack);

    // Get all visits in the date range
    const { data: visits, error } = await supabase
      .from('site_visits')
      .select('*')
      .gte('created_at', dateRange.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch analytics:', error);
      return {
        totalVisits: 0,
        uniqueVisitors: 0,
        topPages: [],
        topReferrers: [],
        visitsOverTime: [],
      };
    }

    if (!visits || visits.length === 0) {
      return {
        totalVisits: 0,
        uniqueVisitors: 0,
        topPages: [],
        topReferrers: [],
        visitsOverTime: [],
      };
    }

    // Calculate metrics
    const totalVisits = visits.length;
    const uniqueSessions = new Set(visits.map((v: any) => v.session_id)).size;

    // Top pages
    const pageMap = new Map<string, number>();
    visits.forEach((v: any) => {
      pageMap.set(v.page_path, (pageMap.get(v.page_path) || 0) + 1);
    });
    const topPages = Array.from(pageMap.entries())
      .map(([path, count]) => ({ path, visits: count }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 5);

    // Top referrers
    const referrerMap = new Map<string, number>();
    visits.forEach((v: any) => {
      if (v.referrer) {
        const domain = new URL(v.referrer).hostname;
        referrerMap.set(domain, (referrerMap.get(domain) || 0) + 1);
      }
    });
    const topReferrers = Array.from(referrerMap.entries())
      .map(([referrer, count]) => ({ referrer, visits: count }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 5);

    // Visits over time
    const dateMap = new Map<string, number>();
    visits.forEach((v: any) => {
      const date = new Date(v.created_at).toLocaleDateString('en-US');
      dateMap.set(date, (dateMap.get(date) || 0) + 1);
    });
    const visitsOverTime = Array.from(dateMap.entries())
      .map(([date, count]) => ({ date, visits: count }))
      .sort(
        (a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
      );

    return {
      totalVisits,
      uniqueVisitors: uniqueSessions,
      topPages,
      topReferrers,
      visitsOverTime,
    };
  } catch (error) {
    console.error('Error fetching analytics metrics:', error);
    return {
      totalVisits: 0,
      uniqueVisitors: 0,
      topPages: [],
      topReferrers: [],
      visitsOverTime: [],
    };
  }
}
