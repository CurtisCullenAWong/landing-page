import { Suspense } from 'react';
import { JobDetailsSkeleton } from '@/components/loading';
import JobDetailsClient from './JobDetailsClient';

export default function JobDetailsPage() {
  return (
    <Suspense fallback={<JobDetailsSkeleton />}>
      <JobDetailsClient />
    </Suspense>
  );
}
