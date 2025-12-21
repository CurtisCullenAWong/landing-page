'use client';

import { JobProvider } from '@/contexts/JobContext';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <JobProvider>{children}</JobProvider>;
}
