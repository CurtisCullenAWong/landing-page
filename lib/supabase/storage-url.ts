const SUPABASE_PUBLIC_SEGMENT = '/storage/v1/object/public/';

const trimSlash = (value: string) => value.replace(/^\/+|\/+$/g, '');

export function toSupabasePublicUrl(
  urlOrPath: string | null | undefined,
  bucket = 'posts'
): string {
  if (!urlOrPath) return '';

  const value = urlOrPath.trim();
  if (!value) return '';

  // Preserve already-absolute URLs and data URIs.
  if (/^(https?:)?\/\//i.test(value) || value.startsWith('data:')) {
    return value;
  }

  const normalizedBucket = trimSlash(bucket);
  const normalizedValue = value.replace(/^\/+/, '');

  const supabaseBase = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, '');
  if (!supabaseBase) return value;

  if (normalizedValue.startsWith(SUPABASE_PUBLIC_SEGMENT.replace(/^\//, ''))) {
    return `${supabaseBase}/${normalizedValue}`;
  }

  const objectPath = normalizedValue.startsWith(`${normalizedBucket}/`)
    ? normalizedValue.slice(normalizedBucket.length + 1)
    : normalizedValue;

  return `${supabaseBase}${SUPABASE_PUBLIC_SEGMENT}${normalizedBucket}/${objectPath}`;
}

export function toSupabaseObjectPath(
  urlOrPath: string | null | undefined,
  bucket = 'posts'
): string | null {
  if (!urlOrPath) return null;

  const value = urlOrPath.trim();
  if (!value) return null;

  const normalizedBucket = trimSlash(bucket);
  const marker = `${SUPABASE_PUBLIC_SEGMENT}${normalizedBucket}/`;

  if (/^https?:\/\//i.test(value)) {
    const [cleanUrl] = value.split(/[?#]/, 1);
    const markerIndex = cleanUrl.indexOf(marker);
    if (markerIndex === -1) return null;

    return cleanUrl.slice(markerIndex + marker.length);
  }

  const normalizedValue = value.replace(/^\/+/, '');
  if (normalizedValue.startsWith(`${normalizedBucket}/`)) {
    return normalizedValue.slice(normalizedBucket.length + 1);
  }

  return normalizedValue;
}
