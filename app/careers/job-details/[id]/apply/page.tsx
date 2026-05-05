import { Suspense } from 'react';
import { JobDetailsSkeleton } from '@/components/loading';
import JobApplicationClient from './JobApplicationClient';

export default function Page() {
  return (
    <Suspense fallback={<JobDetailsSkeleton />}>
      <JobApplicationClient />
    </Suspense>
  );
}
