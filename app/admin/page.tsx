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
  useTheme,
  Card,
  CardContent,
  Divider,
  Avatar,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { AdminTableSkeleton } from '@/components/loading';
import { usePageTitle } from '@/lib/usePageTitle';
import { Plus, Download, Filter, Newspaper, BarChart3, Eye, Users, TrendingUp, LinkIcon } from 'lucide-react';
import StatCards from '@/components/admin/StatCards';
import ApplicantTable from '@/components/admin/ApplicantTable';
import JobTable from '@/components/admin/JobTable';
import AnalyticsCharts from '@/components/admin/AnalyticsCharts';
import { fetchAnalyticsMetrics, type AnalyticsMetrics } from './actions';
import Link from 'next/link';

interface JobApplicant {
  id: string; // This is the UUID
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
  const [analyticsMetrics, setAnalyticsMetrics] = useState<AnalyticsMetrics | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
  const [showAnalyticsDetails, setShowAnalyticsDetails] = useState(false);
  const theme = useTheme();

  const jobTitlesMap = useMemo(() => {
    const map = new Map<string, string>();
    jobs.forEach(job => map.set(job.id, job.title));
    return map;
  }, [jobs]);

  const analyticsHeaderBg = theme.palette.mode === 'dark'
    ? theme.palette.grey[900]
    : theme.palette.grey[100];

  const analyticsHeaderText = theme.palette.mode === 'dark'
    ? theme.palette.grey[200]
    : theme.palette.text.primary;

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

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const metrics = await fetchAnalyticsMetrics(30);
        setAnalyticsMetrics(metrics);
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setIsLoadingAnalytics(false);
      }
    };

    loadAnalytics();
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
            startIcon={<Newspaper size={18} />}
            component={Link}
            href="/admin/content-manager"
            sx={{ borderRadius: 2 }}
          >
            Manage Content
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

      {/* Site Analytics (compact) */}
      {!isLoadingAnalytics && analyticsMetrics && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <BarChart3 size={20} style={{ marginRight: 10 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Site Visit Analytics
              </Typography>
              <Box sx={{ ml: 'auto' }}>
                <Button size="small" onClick={() => setShowAnalyticsDetails(s => !s)}>
                  {showAnalyticsDetails ? 'Hide details' : 'Show details'}
                </Button>
              </Box>
            </Box>
            <Divider sx={{ mb: 2 }} />

            {/* Compact metric row */}
            <Grid container spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', border: 1, borderColor: 'divider', borderRadius: 2, px: 1.25, py: 1, bgcolor: 'background.paper' }}>
                  <Avatar sx={{ bgcolor: theme.palette.primary.main, color: 'white', width: 36, height: 36, mr: 1 }}>
                    <Eye size={18} />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Total</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{analyticsMetrics.totalVisits}</Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid size={{ xs: 6, sm: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', border: 1, borderColor: 'divider', borderRadius: 2, px: 1.25, py: 1, bgcolor: 'background.paper' }}>
                  <Avatar sx={{ bgcolor: theme.palette.info.main, color: 'white', width: 36, height: 36, mr: 1 }}>
                    <Users size={18} />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Unique</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{analyticsMetrics.uniqueVisitors}</Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid size={{ xs: 6, sm: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', border: 1, borderColor: 'divider', borderRadius: 2, px: 1.25, py: 1, bgcolor: 'background.paper' }}>
                  <Avatar sx={{ bgcolor: theme.palette.success.main, color: 'white', width: 36, height: 36, mr: 1 }}>
                    <TrendingUp size={18} />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Top pages</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{analyticsMetrics.topPages.length}</Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid size={{ xs: 6, sm: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', border: 1, borderColor: 'divider', borderRadius: 2, px: 1.25, py: 1, bgcolor: 'background.paper' }}>
                  <Avatar sx={{ bgcolor: theme.palette.warning.main, color: 'white', width: 36, height: 36, mr: 1 }}>
                    <LinkIcon size={18} />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Referrers</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{analyticsMetrics.topReferrers.length}</Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>

            {/* Collapsible details */}
            <Collapse in={showAnalyticsDetails}>
              <AnalyticsCharts metrics={analyticsMetrics} />
            </Collapse>
          </CardContent>
        </Card>
      )}

      <Grid container spacing={3}>
        {/* Recent Applicants */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <ApplicantTable
            applicants={jobApplicants}
            jobTitlesMap={jobTitlesMap}
            title="Recent Applications"
            compact={false}
          />
        </Grid>

        {/* Active Jobs Summary */}
        <Grid size={{ xs: 12, lg: 6 }}>
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
