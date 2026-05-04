'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useJobs } from '@/contexts/JobContext';
import { createClient } from '@/lib/supabase/client';
import {
  Box,
  Typography,
  Grid,
  Button,
  Stack,
  useTheme
} from '@mui/material';
import { AdminTableSkeleton } from '@/components/loading';
import { usePageTitle } from '@/lib/usePageTitle';
import { Plus, Download, Filter } from 'lucide-react';
import StatCards from '@/components/admin/StatCards';
import ApplicantTable from '@/components/admin/ApplicantTable';
import JobTable from '@/components/admin/JobTable';
import Link from 'next/link';

interface JobApplicant {
  id: string;
  job_id: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  status: 'pending' | 'reviewing' | 'interviewing' | 'offer' | 'hired' | 'rejected' | 'withdrawn';
  applied_at: string | null;
}

export default function AdminDashboardPage() {
  usePageTitle('Admin Dashboard');
  const { jobs, isLoading: jobsLoading } = useJobs();
  const [jobApplicants, setJobApplicants] = useState<JobApplicant[]>([]);
  const [isLoadingApplicants, setIsLoadingApplicants] = useState(true);
  const theme = useTheme();

  const jobTitlesMap = useMemo(() => {
    const map = new Map<string, string>();
    jobs.forEach(job => map.set(job.id, job.title));
    return map;
  }, [jobs]);

  useEffect(() => {
    const loadJobApplicants = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('job_applicants')
          .select('*')
          .order('applied_at', { ascending: false });

        if (!error && data) {
          setJobApplicants(data);
        }
      } catch (error) {
        console.error('Error loading job applicants:', error);
      } finally {
        setIsLoadingApplicants(false);
      }
    };

    loadJobApplicants();
  }, []);

  if (jobsLoading || isLoadingApplicants) {
    return <AdminTableSkeleton />;
  }

  const activeJobsCount = jobs.filter(j => j.status === 'active').length;
  const pendingApplicantsCount = jobApplicants.filter(a => a.status === 'pending').length;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
            Dashboard Overview
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back! Here's what's happening with your recruitment today.
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<Download size={18} />}
            sx={{ borderRadius: 2 }}
          >
            Export Report
          </Button>
          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            component={Link}
            href="/admin/careers"
            sx={{ borderRadius: 2, px: 3 }}
          >
            New Job Posting
          </Button>
        </Stack>
      </Box>

      {/* Stats */}
      <StatCards
        totalJobs={jobs.length}
        activeJobs={activeJobsCount}
        totalApplicants={jobApplicants.length}
        pendingApplicants={pendingApplicantsCount}
      />

      <Grid container spacing={3}>
        {/* Recent Applicants */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <ApplicantTable
            applicants={jobApplicants}
            jobTitlesMap={jobTitlesMap}
            title="Recent Applications"
            compact={false}
          />
        </Grid>

        {/* Active Jobs Summary */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <JobTable
            jobs={jobs.slice(0, 5)}
            title="Active Job Postings"
            compact={true}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
