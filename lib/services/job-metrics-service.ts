import { createClient } from '@/lib/supabase/client';

type JobCounterField = 'views_count' | 'applications_count';
type JobMetricType = 'view' | 'application';

const LOCAL_USER_KEY = 'bce_metrics_user_id';

function getMetricStorageKey(metric: JobMetricType, jobId: string, userKey: string): string {
  return `bce_job_${metric}_${jobId}_${userKey}`;
}

async function getUserMetricKey() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.id) {
    return { supabase, userKey: `auth:${user.id}` };
  }

  const storedAnonId = window.localStorage.getItem(LOCAL_USER_KEY);
  if (storedAnonId) {
    return { supabase, userKey: `anon:${storedAnonId}` };
  }

  const anonId = crypto.randomUUID();
  window.localStorage.setItem(LOCAL_USER_KEY, anonId);
  return { supabase, userKey: `anon:${anonId}` };
}

export async function incrementJobCounterOnce(
  jobId: string,
  counterField: JobCounterField,
  metric: JobMetricType,
): Promise<boolean> {
  if (!jobId || typeof window === 'undefined') {
    return false;
  }

  try {
    const { supabase, userKey } = await getUserMetricKey();
    const metricStorageKey = getMetricStorageKey(metric, jobId, userKey);

    if (window.localStorage.getItem(metricStorageKey) === '1') {
      return false;
    }

    const { data: job, error: readError } = await supabase
      .from('jobs')
      .select(counterField)
      .eq('id', jobId)
      .maybeSingle();

    if (readError || !job) {
      if (readError) {
        console.error(`Failed to read ${counterField}:`, readError);
      }
      return false;
    }

    const nextCount = (job[counterField] ?? 0) + 1;
    const { error: updateError } = await supabase
      .from('jobs')
      .update({ [counterField]: nextCount })
      .eq('id', jobId);

    if (updateError) {
      console.error(`Failed to update ${counterField}:`, updateError);
      return false;
    }

    window.localStorage.setItem(metricStorageKey, '1');
    return true;
  } catch (error) {
    console.error(`Failed to increment ${counterField}:`, error);
    return false;
  }
}
