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
            href="/admin/posts"
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

      {/* Site Analytics */}
      {!isLoadingAnalytics && analyticsMetrics && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <BarChart3 size={24} style={{ marginRight: 12 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Site Visit Analytics
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />

            {/* Metric Cards */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: theme.palette.primary.main, color: 'white', width: 48, height: 48 }}>
                        <Eye size={24} />
                      </Avatar>
                    </Box>
                    <Typography color="textSecondary" variant="body2" sx={{ mb: 1 }}>
                      Total Visits
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                      {analyticsMetrics.totalVisits}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Last 30 days
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: theme.palette.info.main, color: 'white', width: 48, height: 48 }}>
                        <Users size={24} />
                      </Avatar>
                    </Box>
                    <Typography color="textSecondary" variant="body2" sx={{ mb: 1 }}>
                      Unique Visitors
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                      {analyticsMetrics.uniqueVisitors}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Unique sessions
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: theme.palette.success.main, color: 'white', width: 48, height: 48 }}>
                        <TrendingUp size={24} />
                      </Avatar>
                    </Box>
                    <Typography color="textSecondary" variant="body2" sx={{ mb: 1 }}>
                      Top Pages
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                      {analyticsMetrics.topPages.length}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Most visited pages
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: theme.palette.warning.main, color: 'white', width: 48, height: 48 }}>
                        <LinkIcon size={24} />
                      </Avatar>
                    </Box>
                    <Typography color="textSecondary" variant="body2" sx={{ mb: 1 }}>
                      Referrers
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                      {analyticsMetrics.topReferrers.length}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Traffic sources
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Top Pages Table */}
            {analyticsMetrics.topPages.length > 0 && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                    Top Pages
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                          <TableCell sx={{ fontWeight: 700 }}>Page</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>
                            Visits
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {analyticsMetrics.topPages.map((page, idx) => (
                          <TableRow key={idx} hover>
                            <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              <code style={{ fontSize: '0.85em' }}>{page.path}</code>
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 500 }}>
                              {page.visits}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            )}

            {/* Top Referrers Table */}
            {analyticsMetrics.topReferrers.length > 0 && (
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                    Top Referrers
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                          <TableCell sx={{ fontWeight: 700 }}>Source</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>
                            Visits
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {analyticsMetrics.topReferrers.map((ref, idx) => (
                          <TableRow key={idx} hover>
                            <TableCell>
                              <code style={{ fontSize: '0.85em' }}>{ref.referrer || 'Direct'}</code>
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 500 }}>
                              {ref.visits}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      )}

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
