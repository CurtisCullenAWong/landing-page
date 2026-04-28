'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useJobs } from '../../contexts/JobContext';
import { createClient } from '@/lib/supabase/client';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  useTheme,
  Grid,
  TablePagination,
  CircularProgress,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  Button,
  Collapse,
  TableSortLabel,
} from '@mui/material';
import { AdminTableSkeleton } from '@/components/loading';
import { usePageTitle } from '@/lib/usePageTitle';
import { Search, ChevronDown, ChevronUp, X } from 'lucide-react';

interface JobApplicant {
  id: string;
  job_id: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  cover_letter: string | null;
  resume_url: string;
  linkedin_url: string | null;
  portfolio_url: string | null;
  status: 'pending' | 'reviewing' | 'interviewing' | 'offer' | 'hired' | 'rejected' | 'withdrawn';
  applied_at: string | null;
  updated_at: string | null;
  updated_by: string | null;
}

interface JobWithTitle {
  id: string;
  title: string;
}

export default function AdminDashboardPage() {
  usePageTitle('Admin Dashboard');
  const { jobs, isLoading: jobsLoading } = useJobs();
  const [jobApplicants, setJobApplicants] = useState<JobApplicant[]>([]);
  const [isLoadingApplicants, setIsLoadingApplicants] = useState(true);
  const [jobsPage, setJobsPage] = useState(0);
  const [applicantsPage, setApplicantsPage] = useState(0);
  const [jobsRowsPerPage, setJobsRowsPerPage] = useState(10);
  const [applicantsRowsPerPage, setApplicantsRowsPerPage] = useState(10);
  const [jobsSearchQuery, setJobsSearchQuery] = useState('');
  const [jobsFilterStatus, setJobsFilterStatus] = useState<string>('all');
  const [jobsFilterDepartment, setJobsFilterDepartment] = useState<string>('all');
  const [jobsFilterType, setJobsFilterType] = useState<string>('all');
  const [jobsFilterLocation, setJobsFilterLocation] = useState<string>('all');
  const [jobsFiltersExpanded, setJobsFiltersExpanded] = useState(false);
  const [applicantsSearchQuery, setApplicantsSearchQuery] = useState('');
  const [applicantsFilterStatus, setApplicantsFilterStatus] = useState<string>('all');
  const [applicantsFiltersExpanded, setApplicantsFiltersExpanded] = useState(false);
  const [jobsSortField, setJobsSortField] = useState<'title' | 'department' | 'location' | 'type' | 'status' | 'postedDate'>('postedDate');
  const [jobsSortDirection, setJobsSortDirection] = useState<'asc' | 'desc'>('desc');
  const [applicantsSortField, setApplicantsSortField] = useState<'name' | 'email' | 'phone' | 'job_title' | 'status' | 'applied_at'>('applied_at');
  const [applicantsSortDirection, setApplicantsSortDirection] = useState<'asc' | 'desc'>('desc');
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Create a map of job IDs to job titles
  const jobTitlesMap = useMemo(() => {
    const map = new Map<string, string>();
    jobs.forEach(job => {
      map.set(job.id, job.title);
    });
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

        if (error) {
          console.error('Error loading job applicants:', error);
          setJobApplicants([]);
        } else if (data) {
          setJobApplicants(data);
        } else {
          setJobApplicants([]);
        }
      } catch (error) {
        console.error('Error loading job applicants:', error);
        setJobApplicants([]);
      } finally {
        setIsLoadingApplicants(false);
      }
    };

    loadJobApplicants();

    // Set up realtime subscription for job_applicants table
    const supabase = createClient();
    const channel = supabase
      .channel('job-applicants-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'job_applicants',
        },
        (payload: RealtimePostgresChangesPayload<JobApplicant>) => {
          console.log('Realtime event received for job_applicants:', payload.eventType, payload);
          
          if (payload.eventType === 'INSERT') {
            const newApplicant = payload.new as JobApplicant;
            setJobApplicants((prevApplicants) => {
              // Check if applicant already exists (avoid duplicates)
              if (prevApplicants.find(applicant => applicant.id === newApplicant.id)) {
                return prevApplicants;
              }
              return [newApplicant, ...prevApplicants].sort((a, b) => {
                const dateA = a.applied_at ? new Date(a.applied_at).getTime() : 0;
                const dateB = b.applied_at ? new Date(b.applied_at).getTime() : 0;
                return dateB - dateA;
              });
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedApplicant = payload.new as JobApplicant;
            setJobApplicants((prevApplicants) =>
              prevApplicants.map((applicant) =>
                applicant.id === updatedApplicant.id ? updatedApplicant : applicant
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setJobApplicants((prevApplicants) =>
              prevApplicants.filter((applicant) => applicant.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getStatusColor = (status: JobApplicant['status']) => {
    switch (status) {
      case 'pending':
        return 'default';
      case 'reviewing':
        return 'info';
      case 'interviewing':
        return 'warning';
      case 'offer':
        return 'success';
      case 'hired':
        return 'success';
      case 'rejected':
        return 'error';
      case 'withdrawn':
        return 'default';
      default:
        return 'default';
    }
  };

  // Get unique values for job filters
  const uniqueDepartments = useMemo(() => {
    const depts = new Set(jobs.map(job => job.department));
    return Array.from(depts).sort();
  }, [jobs]);

  const uniqueTypes = useMemo(() => {
    const types = new Set(jobs.map(job => job.type));
    return Array.from(types).sort();
  }, [jobs]);

  const uniqueLocations = useMemo(() => {
    const locations = new Set(jobs.map(job => job.location));
    return Array.from(locations).sort();
  }, [jobs]);

  // Filter, search, and sort jobs
  const filteredJobs = useMemo(() => {
    let filtered = [...jobs];

    // Apply search
    if (jobsSearchQuery.trim()) {
      const query = jobsSearchQuery.toLowerCase();
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(query) ||
        job.department.toLowerCase().includes(query) ||
        job.location.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query)
      );
    }

    // Apply filters
    if (jobsFilterStatus !== 'all') {
      filtered = filtered.filter(job => job.status === jobsFilterStatus);
    }
    if (jobsFilterDepartment !== 'all') {
      filtered = filtered.filter(job => job.department === jobsFilterDepartment);
    }
    if (jobsFilterType !== 'all') {
      filtered = filtered.filter(job => job.type === jobsFilterType);
    }
    if (jobsFilterLocation !== 'all') {
      filtered = filtered.filter(job => job.location === jobsFilterLocation);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (jobsSortField) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'department':
          aValue = a.department.toLowerCase();
          bValue = b.department.toLowerCase();
          break;
        case 'location':
          aValue = a.location.toLowerCase();
          bValue = b.location.toLowerCase();
          break;
        case 'type':
          aValue = a.type.toLowerCase();
          bValue = b.type.toLowerCase();
          break;
        case 'status':
          aValue = a.status.toLowerCase();
          bValue = b.status.toLowerCase();
          break;
        case 'postedDate':
          aValue = new Date(a.postedDate).getTime();
          bValue = new Date(b.postedDate).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return jobsSortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return jobsSortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [jobs, jobsSearchQuery, jobsFilterStatus, jobsFilterDepartment, jobsFilterType, jobsFilterLocation, jobsSortField, jobsSortDirection]);

  // Filter, search, and sort applicants
  const filteredApplicants = useMemo(() => {
    let filtered = [...jobApplicants];

    // Apply search
    if (applicantsSearchQuery.trim()) {
      const query = applicantsSearchQuery.toLowerCase();
      filtered = filtered.filter(applicant =>
        applicant.first_name.toLowerCase().includes(query) ||
        applicant.last_name.toLowerCase().includes(query) ||
        applicant.email.toLowerCase().includes(query) ||
        (applicant.phone && applicant.phone.toLowerCase().includes(query)) ||
        (applicant.job_id ? jobTitlesMap.get(applicant.job_id)?.toLowerCase().includes(query) : 'general application'.includes(query))
      );
    }

    // Apply status filter
    if (applicantsFilterStatus !== 'all') {
      filtered = filtered.filter(applicant => applicant.status === applicantsFilterStatus);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (applicantsSortField) {
        case 'name':
          aValue = `${a.first_name} ${a.last_name}`.toLowerCase();
          bValue = `${b.first_name} ${b.last_name}`.toLowerCase();
          break;
        case 'email':
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case 'phone':
          aValue = (a.phone || '').toLowerCase();
          bValue = (b.phone || '').toLowerCase();
          break;
        case 'job_title':
          aValue = (a.job_id ? jobTitlesMap.get(a.job_id) || '' : 'General Application').toLowerCase();
          bValue = (b.job_id ? jobTitlesMap.get(b.job_id) || '' : 'General Application').toLowerCase();
          break;
        case 'status':
          aValue = a.status.toLowerCase();
          bValue = b.status.toLowerCase();
          break;
        case 'applied_at':
          aValue = a.applied_at ? new Date(a.applied_at).getTime() : 0;
          bValue = b.applied_at ? new Date(b.applied_at).getTime() : 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return applicantsSortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return applicantsSortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [jobApplicants, applicantsSearchQuery, applicantsFilterStatus, applicantsSortField, applicantsSortDirection, jobTitlesMap]);

  const paginatedJobs = useMemo(() => {
    const startIndex = jobsPage * jobsRowsPerPage;
    return filteredJobs.slice(startIndex, startIndex + jobsRowsPerPage);
  }, [filteredJobs, jobsPage, jobsRowsPerPage]);

  const paginatedApplicants = useMemo(() => {
    const startIndex = applicantsPage * applicantsRowsPerPage;
    return filteredApplicants.slice(startIndex, startIndex + applicantsRowsPerPage);
  }, [filteredApplicants, applicantsPage, applicantsRowsPerPage]);

  const handleResetJobsFilters = () => {
    setJobsSearchQuery('');
    setJobsFilterStatus('all');
    setJobsFilterDepartment('all');
    setJobsFilterType('all');
    setJobsFilterLocation('all');
    setJobsPage(0);
  };

  const handleResetApplicantsFilters = () => {
    setApplicantsSearchQuery('');
    setApplicantsFilterStatus('all');
    setApplicantsPage(0);
  };

  const handleJobsSort = (field: 'title' | 'department' | 'location' | 'type' | 'status' | 'postedDate') => {
    if (jobsSortField === field) {
      setJobsSortDirection(jobsSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setJobsSortField(field);
      setJobsSortDirection('asc');
    }
    setJobsPage(0);
  };

  const handleApplicantsSort = (field: 'name' | 'email' | 'phone' | 'job_title' | 'status' | 'applied_at') => {
    if (applicantsSortField === field) {
      setApplicantsSortDirection(applicantsSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setApplicantsSortField(field);
      setApplicantsSortDirection('asc');
    }
    setApplicantsPage(0);
  };

  const STATUS_OPTIONS: JobApplicant['status'][] = [
    'pending',
    'reviewing',
    'interviewing',
    'offer',
    'hired',
    'rejected',
    'withdrawn',
  ];

  if (jobsLoading || isLoadingApplicants) {
    return <AdminTableSkeleton />;
  }

  return (
    <Box sx={{ pt: { xs: 10, sm: 12 }, pb: 8 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 5, pb: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h3" sx={{ fontWeight: 700, fontSize: { xs: '1.75rem', sm: '2.125rem', md: '2.5rem' }, mb: 1.5 }}>
            Admin Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            Real-time overview of jobs and job applications
          </Typography>
        </Box>

        <Grid container spacing={4}>

          {/* Job Applicants Table */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <Box
                sx={{
                  px: 3,
                  py: 2,
                  bgcolor: isDark ? 'primary.dark' : 'primary.main',
                  color: isDark ? 'text.primary' : 'primary.contrastText',
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Job Applicants ({filteredApplicants.length} of {jobApplicants.length})
                </Typography>
              </Box>

              {/* Search and Filters */}
              {jobApplicants.length > 0 && (
                <Paper sx={{ p: 3, mb: 0, borderRadius: 0 }}>
                  {/* Expandable Header */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                    onClick={() => setApplicantsFiltersExpanded(!applicantsFiltersExpanded)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Search size={20} style={{ color: theme.palette.text.secondary }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 1 }}>
                        Search & Filter
                      </Typography>
                      {(applicantsSearchQuery || applicantsFilterStatus !== 'all') && (
                        <Typography
                          variant="caption"
                          sx={{
                            ml: 1,
                            px: 1,
                            py: 0.25,
                            borderRadius: 1,
                            bgcolor: 'primary.main',
                            color: 'primary.contrastText',
                            fontWeight: 600,
                          }}
                        >
                          {[
                            applicantsSearchQuery ? 'Search' : null,
                            applicantsFilterStatus !== 'all' ? 'Status' : null,
                          ].filter(Boolean).length} active
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {(applicantsSearchQuery || applicantsFilterStatus !== 'all') && (
                        <Button
                          variant="text"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResetApplicantsFilters();
                          }}
                          startIcon={<X size={16} />}
                          sx={{ mr: 1 }}
                        >
                          Reset
                        </Button>
                      )}
                      {applicantsFiltersExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </Box>
                  </Box>

                  {/* Expandable Content */}
                  <Collapse in={applicantsFiltersExpanded}>
                    <Box sx={{ mt: 3, pt: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
                      <Grid container spacing={2} alignItems="flex-end">
                        {/* Search */}
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField
                            fullWidth
                            placeholder="Search by name, email, phone, or job title..."
                            value={applicantsSearchQuery}
                            onChange={(e) => {
                              setApplicantsSearchQuery(e.target.value);
                              setApplicantsPage(0);
                            }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Search size={20} />
                                </InputAdornment>
                              ),
                            }}
                            size="small"
                          />
                        </Grid>

                        {/* Status Filter */}
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Status</InputLabel>
                            <Select
                              value={applicantsFilterStatus}
                              label="Status"
                              onChange={(e) => {
                                setApplicantsFilterStatus(e.target.value);
                                setApplicantsPage(0);
                              }}
                            >
                              <MenuItem value="all">All Statuses</MenuItem>
                              {STATUS_OPTIONS.map((status) => (
                                <MenuItem key={status} value={status}>
                                  {status.charAt(0).toUpperCase() + status.slice(1)}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                      </Grid>
                    </Box>
                  </Collapse>
                </Paper>
              )}

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                      <TableCell sx={{ fontWeight: 600 }}>
                        <TableSortLabel
                          active={applicantsSortField === 'name'}
                          direction={applicantsSortField === 'name' ? applicantsSortDirection : 'asc'}
                          onClick={() => handleApplicantsSort('name')}
                        >
                          Name
                        </TableSortLabel>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        <TableSortLabel
                          active={applicantsSortField === 'email'}
                          direction={applicantsSortField === 'email' ? applicantsSortDirection : 'asc'}
                          onClick={() => handleApplicantsSort('email')}
                        >
                          Email
                        </TableSortLabel>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        <TableSortLabel
                          active={applicantsSortField === 'phone'}
                          direction={applicantsSortField === 'phone' ? applicantsSortDirection : 'asc'}
                          onClick={() => handleApplicantsSort('phone')}
                        >
                          Phone
                        </TableSortLabel>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        <TableSortLabel
                          active={applicantsSortField === 'job_title'}
                          direction={applicantsSortField === 'job_title' ? applicantsSortDirection : 'asc'}
                          onClick={() => handleApplicantsSort('job_title')}
                        >
                          Job Title
                        </TableSortLabel>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        <TableSortLabel
                          active={applicantsSortField === 'status'}
                          direction={applicantsSortField === 'status' ? applicantsSortDirection : 'asc'}
                          onClick={() => handleApplicantsSort('status')}
                        >
                          Status
                        </TableSortLabel>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        <TableSortLabel
                          active={applicantsSortField === 'applied_at'}
                          direction={applicantsSortField === 'applied_at' ? applicantsSortDirection : 'asc'}
                          onClick={() => handleApplicantsSort('applied_at')}
                        >
                          Applied At
                        </TableSortLabel>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedApplicants.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                          <Typography variant="body1" color="text.secondary">
                            No job applicants found.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedApplicants.map((applicant) => (
                        <TableRow
                          key={applicant.id}
                          sx={{
                            '&:hover': { bgcolor: 'action.hover' },
                          }}
                        >
                          <TableCell>
                            {applicant.first_name} {applicant.last_name}
                          </TableCell>
                          <TableCell>{applicant.email}</TableCell>
                          <TableCell>{applicant.phone || 'N/A'}</TableCell>
                          <TableCell>
                            {applicant.job_id ? (jobTitlesMap.get(applicant.job_id) || 'Unknown Job') : 'General Application'}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={applicant.status}
                              size="small"
                              color={getStatusColor(applicant.status) as any}
                            />
                          </TableCell>
                          <TableCell>
                            {applicant.applied_at
                              ? new Date(applicant.applied_at).toLocaleDateString()
                              : 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={filteredApplicants.length}
                page={applicantsPage}
                onPageChange={(_, newPage) => setApplicantsPage(newPage)}
                rowsPerPage={applicantsRowsPerPage}
                onRowsPerPageChange={(e) => {
                  setApplicantsRowsPerPage(parseInt(e.target.value, 10));
                  setApplicantsPage(0);
                }}
                rowsPerPageOptions={[5, 10, 25, 50]}
                labelRowsPerPage="Rows per page:"
              />
            </Card>
          </Grid>

          {/* Jobs Table */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <Box
                sx={{
                  px: 3,
                  py: 2,
                  bgcolor: isDark ? 'primary.dark' : 'primary.main',
                  color: isDark ? 'text.primary' : 'primary.contrastText',
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Jobs ({filteredJobs.length} of {jobs.length})
                </Typography>
              </Box>

              {/* Search and Filters */}
              {jobs.length > 0 && (
                <Paper sx={{ p: 3, mb: 0, borderRadius: 0 }}>
                  {/* Expandable Header */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                    onClick={() => setJobsFiltersExpanded(!jobsFiltersExpanded)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Search size={20} style={{ color: theme.palette.text.secondary }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 1 }}>
                        Search & Filter
                      </Typography>
                      {(jobsSearchQuery || jobsFilterStatus !== 'all' || jobsFilterDepartment !== 'all' || jobsFilterType !== 'all' || jobsFilterLocation !== 'all') && (
                        <Typography
                          variant="caption"
                          sx={{
                            ml: 1,
                            px: 1,
                            py: 0.25,
                            borderRadius: 1,
                            bgcolor: 'primary.main',
                            color: 'primary.contrastText',
                            fontWeight: 600,
                          }}
                        >
                          {[
                            jobsSearchQuery ? 'Search' : null,
                            jobsFilterStatus !== 'all' ? 'Status' : null,
                            jobsFilterDepartment !== 'all' ? 'Dept' : null,
                            jobsFilterType !== 'all' ? 'Type' : null,
                            jobsFilterLocation !== 'all' ? 'Loc' : null,
                          ].filter(Boolean).length} active
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {(jobsSearchQuery || jobsFilterStatus !== 'all' || jobsFilterDepartment !== 'all' || jobsFilterType !== 'all' || jobsFilterLocation !== 'all') && (
                        <Button
                          variant="text"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResetJobsFilters();
                          }}
                          startIcon={<X size={16} />}
                          sx={{ mr: 1 }}
                        >
                          Reset
                        </Button>
                      )}
                      {jobsFiltersExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </Box>
                  </Box>

                  {/* Expandable Content */}
                  <Collapse in={jobsFiltersExpanded}>
                    <Box sx={{ mt: 3, pt: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
                      <Grid container spacing={2} alignItems="flex-end">
                        {/* Search */}
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField
                            fullWidth
                            placeholder="Search jobs by title, department, location..."
                            value={jobsSearchQuery}
                            onChange={(e) => {
                              setJobsSearchQuery(e.target.value);
                              setJobsPage(0);
                            }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Search size={20} />
                                </InputAdornment>
                              ),
                            }}
                            size="small"
                          />
                        </Grid>

                        {/* Status Filter */}
                        <Grid size={{ xs: 12, sm: 6, md: 1.5 }}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Status</InputLabel>
                            <Select
                              value={jobsFilterStatus}
                              label="Status"
                              onChange={(e) => {
                                setJobsFilterStatus(e.target.value);
                                setJobsPage(0);
                              }}
                            >
                              <MenuItem value="all">All</MenuItem>
                              <MenuItem value="active">Active</MenuItem>
                              <MenuItem value="closed">Closed</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>

                        {/* Department Filter */}
                        <Grid size={{ xs: 12, sm: 6, md: 1.5 }}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Department</InputLabel>
                            <Select
                              value={jobsFilterDepartment}
                              label="Department"
                              onChange={(e) => {
                                setJobsFilterDepartment(e.target.value);
                                setJobsPage(0);
                              }}
                            >
                              <MenuItem value="all">All</MenuItem>
                              {uniqueDepartments.map((dept) => (
                                <MenuItem key={dept} value={dept}>
                                  {dept}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>

                        {/* Type Filter */}
                        <Grid size={{ xs: 12, sm: 6, md: 1.5 }}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Type</InputLabel>
                            <Select
                              value={jobsFilterType}
                              label="Type"
                              onChange={(e) => {
                                setJobsFilterType(e.target.value);
                                setJobsPage(0);
                              }}
                            >
                              <MenuItem value="all">All</MenuItem>
                              {uniqueTypes.map((type) => (
                                <MenuItem key={type} value={type}>
                                  {type}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>

                        {/* Location Filter */}
                        <Grid size={{ xs: 12, sm: 6, md: 1.5 }}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Location</InputLabel>
                            <Select
                              value={jobsFilterLocation}
                              label="Location"
                              onChange={(e) => {
                                setJobsFilterLocation(e.target.value);
                                setJobsPage(0);
                              }}
                            >
                              <MenuItem value="all">All</MenuItem>
                              {uniqueLocations.map((location) => (
                                <MenuItem key={location} value={location}>
                                  {location}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                      </Grid>
                    </Box>
                  </Collapse>
                </Paper>
              )}

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                      <TableCell sx={{ fontWeight: 600 }}>
                        <TableSortLabel
                          active={jobsSortField === 'title'}
                          direction={jobsSortField === 'title' ? jobsSortDirection : 'asc'}
                          onClick={() => handleJobsSort('title')}
                        >
                          Title
                        </TableSortLabel>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        <TableSortLabel
                          active={jobsSortField === 'department'}
                          direction={jobsSortField === 'department' ? jobsSortDirection : 'asc'}
                          onClick={() => handleJobsSort('department')}
                        >
                          Department
                        </TableSortLabel>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        <TableSortLabel
                          active={jobsSortField === 'location'}
                          direction={jobsSortField === 'location' ? jobsSortDirection : 'asc'}
                          onClick={() => handleJobsSort('location')}
                        >
                          Location
                        </TableSortLabel>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        <TableSortLabel
                          active={jobsSortField === 'type'}
                          direction={jobsSortField === 'type' ? jobsSortDirection : 'asc'}
                          onClick={() => handleJobsSort('type')}
                        >
                          Type
                        </TableSortLabel>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        <TableSortLabel
                          active={jobsSortField === 'status'}
                          direction={jobsSortField === 'status' ? jobsSortDirection : 'asc'}
                          onClick={() => handleJobsSort('status')}
                        >
                          Status
                        </TableSortLabel>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        <TableSortLabel
                          active={jobsSortField === 'postedDate'}
                          direction={jobsSortField === 'postedDate' ? jobsSortDirection : 'asc'}
                          onClick={() => handleJobsSort('postedDate')}
                        >
                          Posted
                        </TableSortLabel>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedJobs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                          <Typography variant="body1" color="text.secondary">
                            No jobs found.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedJobs.map((job) => (
                        <TableRow
                          key={job.id}
                          sx={{
                            '&:hover': { bgcolor: 'action.hover' },
                          }}
                        >
                          <TableCell>{job.title}</TableCell>
                          <TableCell>{job.department}</TableCell>
                          <TableCell>{job.location}</TableCell>
                          <TableCell>{job.type}</TableCell>
                          <TableCell>
                            <Chip
                              label={job.status}
                              size="small"
                              color={job.status === 'active' ? 'success' : 'default'}
                            />
                          </TableCell>
                          <TableCell>
                            {new Date(job.postedDate).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={filteredJobs.length}
                page={jobsPage}
                onPageChange={(_, newPage) => setJobsPage(newPage)}
                rowsPerPage={jobsRowsPerPage}
                onRowsPerPageChange={(e) => {
                  setJobsRowsPerPage(parseInt(e.target.value, 10));
                  setJobsPage(0);
                }}
                rowsPerPageOptions={[5, 10, 25, 50]}
                labelRowsPerPage="Rows per page:"
              />
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

