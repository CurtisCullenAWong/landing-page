import { Suspense } from 'react';
import JobApplicationClient from './JobApplicationClient';
import { JobDetailsSkeleton } from '@/components/loading';

interface Props {
  params: Promise<{ id: string }>;
}

export default function Page({ params }: Props) {
  return (
    <Suspense fallback={<JobDetailsSkeleton />}>
      <JobApplicationContainer params={params} />
    </Suspense>
  );
}

async function JobApplicationContainer({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <JobApplicationClient id={id} />;
}