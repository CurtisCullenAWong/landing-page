'use client';

import { JobProvider } from '@/contexts/JobContext';

export default function JobDetailsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <JobProvider>{children}</JobProvider>;
}
