'use client';

import React, { useState, useMemo } from 'react';
import { useJobs, Job } from '../../../contexts/JobContext';
import { Plus, Edit2, Trash2, Save, X, Search, ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  TablePagination,
  TableSortLabel,
  InputAdornment,
  Collapse,
  useMediaQuery,
  Stack,
  Divider,
  CardActions,
  Alert,
  FormControlLabel,
  alpha,
  Checkbox,
} from '@mui/material';

import { AdminTableSkeleton } from '@/components/loading';
import { usePageTitle } from '../../../lib/usePageTitle';
import { formatStatus } from '@/lib/utils';
import { sanitizeString, cleanList, formatName, isValidUrl, INPUT_LIMITS } from '@/lib/input-utils';

const formatSalaryRange = (min: string, max: string, freq: string) => {
  if (!min && !max) return 'Negotiable';
  const format = (val: string) => {
    const num = Number(val);
    if (isNaN(num) || !val) return '';
    if (num >= 1000000) return `₱${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `₱${(num / 1000).toFixed(0)}k`;
    return `₱${num}`;
  };

  const minFmt = format(min);
  const maxFmt = format(max);
  const freqFmt = freq ? ` / ${freq.toLowerCase()}` : '';

  if (minFmt && maxFmt) return `${minFmt} - ${maxFmt}${freqFmt}`;
  if (minFmt) return `${minFmt}+${freqFmt}`;
  if (maxFmt) return `Up to ${maxFmt}${freqFmt}`;
  return 'Negotiable';
};




type SortField = 'title' | 'department' | 'location' | 'postedDate' | 'status';
type SortDirection = 'asc' | 'desc';

const MAX_JOB_ENTRIES = 10;

type JobFormState = {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  responsibilities: string;
  requirements: string;
  benefits: string;
  salary: string;
  salary_min: string;
  salary_max: string;
  salary_frequency: string;
  status: 'active' | 'closed';
  application_url: string;
  employment_type: string;
  work_setup: string;
  job_level: string;
  schedule: string;
  application_email: string;
  external_application_url: string;
  featured: boolean;
  published_at: string;
  expires_at: string;
  expanded: boolean;
};

export default function AdminPage() {
  usePageTitle('Admin');
  const { jobs, departments, isLoading, addJobs, updateJob, deleteJob } = useJobs();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  const [jobEntries, setJobEntries] = useState<JobFormState[]>([
    {
      id: `job-${Date.now()}`,
      title: '',
      department: '',
      location: '',
      type: 'Full-time',
      description: '',
      responsibilities: '',
      requirements: '',
      benefits: '',
      salary: '',
      salary_min: '',
      salary_max: '',
      salary_frequency: 'Monthly',
      status: 'active',
      application_url: '',
      employment_type: '',
      work_setup: 'In person',
      job_level: '',
      schedule: '',
      application_email: '',
      external_application_url: '',
      featured: false,
      published_at: new Date().toISOString().split('T')[0],
      expires_at: '',
      expanded: true,
    }
  ]);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Search, filter, sort, and pagination state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterLocation, setFilterLocation] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('postedDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  // Filter out any null jobs
  const validJobs = jobs.filter(job => job !== null && job !== undefined);

  // Use departments from context for filters
  const uniqueDepartments = useMemo(() => {
    return departments.map(d => d.name);
  }, [departments]);

  const uniqueTypes = useMemo(() => {
    const types = new Set(validJobs.map(job => job.type));
    return Array.from(types).sort();
  }, [validJobs]);

  const uniqueLocations = useMemo(() => {
    const locations = new Set(validJobs.map(job => job.location));
    return Array.from(locations).sort();
  }, [validJobs]);

  // Filter, search, and sort jobs
  const filteredAndSortedJobs = useMemo(() => {
    let filtered = [...validJobs];

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(query) ||
        job.department.toLowerCase().includes(query) ||
        job.location.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query)
      );
    }

    // Apply filters
    if (filterStatus !== 'all') {
      filtered = filtered.filter(job => job.status === filterStatus);
    }
    if (filterDepartment !== 'all') {
      filtered = filtered.filter(job => job.department === filterDepartment);
    }
    if (filterType !== 'all') {
      filtered = filtered.filter(job => job.type === filterType);
    }
    if (filterLocation !== 'all') {
      filtered = filtered.filter(job => job.location === filterLocation);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
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
        case 'postedDate':
          aValue = new Date(a.postedDate).getTime();
          bValue = new Date(b.postedDate).getTime();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [validJobs, searchQuery, filterStatus, filterDepartment, filterType, filterLocation, sortField, sortDirection]);

  // Paginate jobs
  const paginatedJobs = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredAndSortedJobs.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredAndSortedJobs, page, rowsPerPage]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setPage(0); // Reset to first page when sorting
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterStatus('all');
    setFilterDepartment('all');
    setFilterType('all');
    setFilterLocation('all');
    setPage(0);
  };

  if (isLoading) {
    return <AdminTableSkeleton />;
  }

  const handleInputChange = (id: string, field: keyof JobFormState, value: string | boolean) => {
    setJobEntries(entries =>
      entries.map(entry =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
  };

  const handleSelectChange = (id: string, field: keyof JobFormState, value: string) => {
    setJobEntries(entries =>
      entries.map(entry =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
  };

  const handleAddEntry = () => {
    if (jobEntries.length >= MAX_JOB_ENTRIES) {
      return; // Don't add if limit reached
    }
    setJobEntries([...jobEntries, {
      id: `job-${Date.now()}-${Math.random()}`,
      title: '',
      department: '',
      location: '',
      type: 'Full-time',
      description: '',
      responsibilities: '',
      requirements: '',
      benefits: '',
      salary: '',
      salary_min: '',
      salary_max: '',
      salary_frequency: 'Monthly',
      status: 'active',
      application_url: '',
      employment_type: '',
      work_setup: 'In person',
      job_level: '',
      schedule: '',
      application_email: '',
      external_application_url: '',
      featured: false,
      published_at: new Date().toISOString().split('T')[0],
      expires_at: '',
      expanded: true,
    }]);
  };

  const handleRemoveEntry = (id: string) => {
    if (jobEntries.length > 1) {
      setJobEntries(entries => entries.filter(entry => entry.id !== id));
    }
  };

  const handleToggleExpand = (id: string) => {
    setJobEntries(entries =>
      entries.map(entry =>
        entry.id === id ? { ...entry, expanded: !entry.expanded } : entry
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (editingJob) {
      // Single edit mode
      const entry = jobEntries[0];

      // Validate URLs if provided
      if (entry.application_url && !isValidUrl(entry.application_url)) {
        setFormError('Please enter a valid Application URL');
        return;
      }

      const jobData = {
        title: sanitizeString(entry.title),
        department: entry.department,
        location: formatName(entry.location),
        type: entry.type,
        description: sanitizeString(entry.description),
        responsibilities: cleanList(entry.responsibilities),
        requirements: cleanList(entry.requirements),
        benefits: cleanList(entry.benefits),
        salary: formatSalaryRange(entry.salary_min, entry.salary_max, entry.salary_frequency),
        salary_min: entry.salary_min ? Number(entry.salary_min) : undefined,
        salary_max: entry.salary_max ? Number(entry.salary_max) : undefined,
        salary_frequency: entry.salary_frequency,
        status: entry.status,
        application_url: entry.application_url.trim() || undefined,
        employment_type: sanitizeString(entry.employment_type) || undefined,
        work_setup: sanitizeString(entry.work_setup) || undefined,
        job_level: sanitizeString(entry.job_level) || undefined,
        schedule: sanitizeString(entry.schedule) || undefined,
        application_email: sanitizeString(entry.application_email) || undefined,
        external_application_url: entry.external_application_url.trim() || undefined,
        featured: entry.featured,
        published_at: entry.published_at ? new Date(entry.published_at).toISOString() : undefined,
        expires_at: entry.expires_at ? new Date(entry.expires_at).toISOString() : undefined,
      };
      updateJob(editingJob.id, jobData);
      setEditingJob(null);
      resetForm();
    } else {
      // Bulk create mode
      const jobsToAdd = jobEntries
        .filter(entry => entry.title.trim() && entry.department.trim() && entry.location.trim())
        .map(entry => {
          // Internal validation
          if (entry.application_url && !isValidUrl(entry.application_url)) {
            // In bulk mode, we might want to skip or alert
          }

          return {
            title: sanitizeString(entry.title),
            department: entry.department,
            location: formatName(entry.location),
            type: entry.type,
            description: sanitizeString(entry.description),
            responsibilities: cleanList(entry.responsibilities),
            requirements: cleanList(entry.requirements),
            benefits: cleanList(entry.benefits),
            salary: formatSalaryRange(entry.salary_min, entry.salary_max, entry.salary_frequency),
            salary_min: entry.salary_min ? Number(entry.salary_min) : undefined,
            salary_max: entry.salary_max ? Number(entry.salary_max) : undefined,
            salary_frequency: entry.salary_frequency,
            status: entry.status,
            application_url: entry.application_url.trim() || undefined,
            employment_type: sanitizeString(entry.employment_type) || undefined,
            work_setup: sanitizeString(entry.work_setup) || undefined,
            job_level: sanitizeString(entry.job_level) || undefined,
            schedule: sanitizeString(entry.schedule) || undefined,
            application_email: sanitizeString(entry.application_email) || undefined,
            external_application_url: entry.external_application_url.trim() || undefined,
            featured: entry.featured,
            published_at: entry.published_at ? new Date(entry.published_at).toISOString() : undefined,
            expires_at: entry.expires_at ? new Date(entry.expires_at).toISOString() : undefined,
          };
        });

      if (jobsToAdd.length > 0) {
        await addJobs(jobsToAdd);
        resetForm();
      }
    }
  };



  const handleEdit = (job: Job) => {
    setEditingJob(job);
    setJobEntries([{
      id: `job-${Date.now()}`,
      title: job.title,
      department: job.department,
      location: job.location,
      type: job.type,
      description: job.description,
      responsibilities: job.responsibilities.join('\n'),
      requirements: job.requirements.join('\n'),
      benefits: job.benefits.join('\n'),
      salary: job.salary,
      salary_min: job.salary_min?.toString() || '',
      salary_max: job.salary_max?.toString() || '',
      salary_frequency: job.salary_frequency || 'Monthly',
      status: job.status,
      application_url: job.application_url || '',
      employment_type: job.employment_type || '',
      work_setup: job.work_setup || '',
      job_level: job.job_level || '',
      schedule: job.schedule || '',
      application_email: job.application_email || '',
      external_application_url: job.external_application_url || '',
      featured: job.featured || false,
      published_at: job.published_at ? new Date(job.published_at).toISOString().split('T')[0] : '',
      expires_at: job.expires_at ? new Date(job.expires_at).toISOString().split('T')[0] : '',
      expanded: true,
    }]);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setJobToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (jobToDelete) {
      deleteJob(jobToDelete);
      setJobToDelete(null);
    }
    setDeleteConfirmOpen(false);
  };

  const resetForm = () => {
    setJobEntries([{
      id: `job-${Date.now()}`,
      title: '',
      department: '',
      location: '',
      type: 'Full-time',
      description: '',
      responsibilities: '',
      requirements: '',
      benefits: '',
      salary: '',
      salary_min: '',
      salary_max: '',
      salary_frequency: 'Monthly',
      status: 'active',
      application_url: '',
      employment_type: '',
      work_setup: 'In person',
      job_level: '',
      schedule: '',
      application_email: '',
      external_application_url: '',
      featured: false,
      published_at: new Date().toISOString().split('T')[0],
      expires_at: '',
      expanded: true,
    }]);
    setIsFormOpen(false);
    setEditingJob(null);
    setFormError(null);
  };


  return (
    <Box>
      <Container maxWidth="xl" sx={{ px: 0 }}>
        {/* Header */}
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: { xs: 3, sm: 4 },
          mb: 4,
          pb: 3,
          borderBottom: 1,
          borderColor: 'divider'
        }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
              Careers Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Create, edit, and manage your company's job postings.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Plus size={20} />}
            onClick={() => setIsFormOpen(true)}
            sx={{
              alignSelf: { xs: 'stretch', sm: 'auto' },
              minWidth: { xs: '100%', sm: 'auto' },
              px: { xs: 2, sm: 3 },
              py: 1.5,
              fontSize: '0.9375rem',
              fontWeight: 600
            }}
          >
            Add New Job
          </Button>
        </Box>

        {/* Job Form */}
        {isFormOpen && (
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: { xs: 2, sm: 0 },
                mb: 2
              }}>
                <Typography variant="h5" sx={{ fontWeight: 600, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                  {editingJob ? 'Edit Job Posting' : `Create Job Postings (${jobEntries.length})`}
                </Typography>
                <Box sx={{
                  display: 'flex',
                  gap: 1,
                  alignItems: 'center',
                  width: { xs: '100%', sm: 'auto' },
                  justifyContent: { xs: 'space-between', sm: 'flex-end' }
                }}>
                  {!editingJob && (
                    <>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Plus size={16} />}
                        onClick={handleAddEntry}
                        disabled={jobEntries.length >= MAX_JOB_ENTRIES}
                        sx={{ flex: { xs: 1, sm: 'none' } }}
                      >
                        {isMobile ? 'Add' : 'Add Row'}
                      </Button>
                      <Typography variant="caption" color="text.secondary" sx={{
                        ml: { xs: 0, sm: 1 },
                        display: { xs: 'none', sm: 'block' }
                      }}>
                        ({jobEntries.length}/{MAX_JOB_ENTRIES})
                      </Typography>
                      {isMobile && (
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                          {jobEntries.length}/{MAX_JOB_ENTRIES}
                        </Typography>
                      )}
                    </>
                  )}
                  <IconButton onClick={resetForm} size="small" sx={{ ml: { xs: 0, sm: 'auto' } }}>
                    <X size={20} />
                  </IconButton>
                </Box>
              </Box>

              {formError && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {formError}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <Stack spacing={3} sx={{ mb: 3 }}>
                  {jobEntries.map((entry, index) => (
                    <Card key={entry.id} variant="outlined" sx={{ borderRadius: 2, border: 1, borderColor: 'divider', overflow: 'hidden' }}>
                      <Box sx={{ 
                        p: 2, 
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.03),
                        borderBottom: 1,
                        borderColor: 'divider',
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center' 
                      }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ 
                            width: 24, 
                            height: 24, 
                            borderRadius: '50%', 
                            bgcolor: 'primary.main', 
                            color: 'white', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            fontSize: '0.75rem'
                          }}>
                            {index + 1}
                          </Box>
                          {entry.title || 'Untitled Job Posting'}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {jobEntries.length > 1 && !editingJob && (
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveEntry(entry.id)}
                              color="error"
                              title="Remove this job"
                            >
                              <Trash2 size={18} />
                            </IconButton>
                          )}
                          <IconButton
                            size="small"
                            onClick={() => handleToggleExpand(entry.id)}
                            title={entry.expanded ? "Collapse" : "Expand"}
                          >
                            {entry.expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </IconButton>
                        </Box>
                      </Box>
                      
                      <Collapse in={entry.expanded} timeout="auto" unmountOnExit>
                        <CardContent sx={{ p: 3 }}>
                          <Grid container spacing={3}>
                            {/* Basic Information Section */}
                            <Grid size={{ xs: 12 }}>
                              <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 1 }}>
                                Basic Information
                              </Typography>
                              <Divider sx={{ mb: 2, mt: 0.5 }} />
                              <Grid container spacing={2}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                  <TextField
                                    fullWidth
                                    size="small"
                                    label="Job Title"
                                    placeholder="e.g. Software Engineer"
                                    value={entry.title}
                                    onChange={(e) => handleInputChange(entry.id, 'title', e.target.value)}
                                    required
                                    inputProps={{ maxLength: INPUT_LIMITS.TITLE }}
                                  />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                  <FormControl fullWidth size="small" required>
                                    <InputLabel>Department</InputLabel>
                                    <Select
                                      value={entry.department}
                                      label="Department"
                                      onChange={(e) => handleSelectChange(entry.id, 'department', e.target.value)}
                                    >
                                      {departments.map((dept) => (
                                        <MenuItem key={dept.id} value={dept.name}>{dept.name}</MenuItem>
                                      ))}
                                    </Select>
                                  </FormControl>
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                  <TextField
                                    fullWidth
                                    size="small"
                                    label="Location"
                                    placeholder="e.g. Remote / Manila, Philippines"
                                    value={entry.location}
                                    onChange={(e) => handleInputChange(entry.id, 'location', e.target.value)}
                                    required
                                    inputProps={{ maxLength: INPUT_LIMITS.LOCATION }}
                                  />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                  <FormControl fullWidth size="small" required>
                                    <InputLabel>Type</InputLabel>
                                    <Select
                                      value={entry.type}
                                      label="Type"
                                      onChange={(e) => handleSelectChange(entry.id, 'type', e.target.value)}
                                    >
                                      <MenuItem value="Full-time">Full-time</MenuItem>
                                      <MenuItem value="Part-time">Part-time</MenuItem>
                                      <MenuItem value="Contract">Contract</MenuItem>
                                      <MenuItem value="Temporary">Temporary</MenuItem>
                                    </Select>
                                  </FormControl>
                                </Grid>
                              </Grid>
                            </Grid>

                            {/* Compensation Section */}
                            <Grid size={{ xs: 12 }}>
                              <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 1, mt: 2, display: 'block' }}>
                                Compensation & Benefits
                              </Typography>
                              <Divider sx={{ mb: 2, mt: 0.5 }} />
                              <Grid container spacing={2}>
                                <Grid size={{ xs: 12, md: 4 }}>
                                  <TextField
                                    fullWidth
                                    size="small"
                                    label="Min Salary"
                                    type="number"
                                    value={entry.salary_min}
                                    onChange={(e) => handleInputChange(entry.id, 'salary_min', e.target.value)}
                                    placeholder="e.g. 50000"
                                  />
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                  <TextField
                                    fullWidth
                                    size="small"
                                    label="Max Salary"
                                    type="number"
                                    value={entry.salary_max}
                                    onChange={(e) => handleInputChange(entry.id, 'salary_max', e.target.value)}
                                    placeholder="e.g. 80000"
                                  />
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                  <FormControl fullWidth size="small">
                                    <InputLabel>Frequency</InputLabel>
                                    <Select
                                      value={entry.salary_frequency}
                                      label="Frequency"
                                      onChange={(e) => handleSelectChange(entry.id, 'salary_frequency', e.target.value)}
                                    >
                                      <MenuItem value="Monthly">Monthly</MenuItem>
                                      <MenuItem value="Weekly">Weekly</MenuItem>
                                      <MenuItem value="Hourly">Hourly</MenuItem>
                                      <MenuItem value="Yearly">Yearly</MenuItem>
                                    </Select>
                                  </FormControl>
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                  <Box sx={{ p: 1, bgcolor: 'action.hover', borderRadius: 1, border: '1px dashed', borderColor: 'divider' }}>
                                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                      Preview Display: {formatSalaryRange(entry.salary_min, entry.salary_max, entry.salary_frequency)}
                                    </Typography>
                                  </Box>
                                </Grid>
                              </Grid>
                            </Grid>

                            {/* Details Section */}
                            <Grid size={{ xs: 12 }}>
                              <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 1, mt: 2, display: 'block' }}>
                                Job Details & Requirements
                              </Typography>
                              <Divider sx={{ mb: 2, mt: 0.5 }} />
                              <Grid container spacing={2}>
                                <Grid size={{ xs: 12 }}>
                                  <TextField
                                    fullWidth
                                    size="small"
                                    label="Description"
                                    placeholder="Provide a brief overview of the role..."
                                    value={entry.description}
                                    onChange={(e) => handleInputChange(entry.id, 'description', e.target.value)}
                                    required
                                    multiline
                                    rows={3}
                                    helperText={`${entry.description.length}/${INPUT_LIMITS.DESCRIPTION}`}
                                  />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                  <TextField
                                    fullWidth
                                    size="small"
                                    label="Responsibilities (one per line)"
                                    placeholder="Enter each responsibility on a new line"
                                    value={entry.responsibilities}
                                    onChange={(e) => handleInputChange(entry.id, 'responsibilities', e.target.value)}
                                    required
                                    multiline
                                    rows={4}
                                    helperText={`${entry.responsibilities.length}/${INPUT_LIMITS.DESCRIPTION}`}
                                  />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                  <TextField
                                    fullWidth
                                    size="small"
                                    label="Requirements (one per line)"
                                    placeholder="Enter each requirement on a new line"
                                    value={entry.requirements}
                                    onChange={(e) => handleInputChange(entry.id, 'requirements', e.target.value)}
                                    required
                                    multiline
                                    rows={4}
                                    helperText={`${entry.requirements.length}/${INPUT_LIMITS.DESCRIPTION}`}
                                  />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                  <TextField
                                    fullWidth
                                    size="small"
                                    label="Benefits (one per line)"
                                    placeholder="Enter each benefit on a new line"
                                    value={entry.benefits}
                                    onChange={(e) => handleInputChange(entry.id, 'benefits', e.target.value)}
                                    multiline
                                    rows={3}
                                    helperText={`${entry.benefits.length}/${INPUT_LIMITS.DESCRIPTION}`}
                                  />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                  <Grid container spacing={2}>
                                    <Grid size={{ xs: 6 }}>
                                      <TextField fullWidth size="small" label="Schedule" placeholder="Mon-Fri, 8AM-5PM" value={entry.schedule} onChange={(e) => handleInputChange(entry.id, 'schedule', e.target.value)} />
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                      <TextField fullWidth size="small" label="Work Setup" placeholder="In person / Hybrid / Remote" value={entry.work_setup} onChange={(e) => handleInputChange(entry.id, 'work_setup', e.target.value)} />
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                      <TextField fullWidth size="small" label="Employment Type" placeholder="Permanent / Full-time" value={entry.employment_type} onChange={(e) => handleInputChange(entry.id, 'employment_type', e.target.value)} />
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                      <TextField fullWidth size="small" label="Job Level" placeholder="Junior / Senior" value={entry.job_level} onChange={(e) => handleInputChange(entry.id, 'job_level', e.target.value)} />
                                    </Grid>
                                  </Grid>
                                </Grid>
                              </Grid>
                            </Grid>

                            {/* Admin Section */}
                            <Grid size={{ xs: 12 }}>
                              <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 1, mt: 2, display: 'block' }}>
                                Admin & Routing Settings
                              </Typography>
                              <Divider sx={{ mb: 2, mt: 0.5 }} />
                              <Grid container spacing={2}>
                                <Grid size={{ xs: 12, md: 4 }}>
                                  <TextField fullWidth size="small" label="Application Email" value={entry.application_email} onChange={(e) => handleInputChange(entry.id, 'application_email', e.target.value)} placeholder="hr@example.com" />
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                  <TextField fullWidth size="small" label="External URL" value={entry.external_application_url || entry.application_url} onChange={(e) => handleInputChange(entry.id, 'external_application_url', e.target.value)} placeholder="https://careers.example.com/job-123" />
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                  <FormControl fullWidth size="small">
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                      value={entry.status}
                                      label="Status"
                                      onChange={(e) => handleSelectChange(entry.id, 'status', e.target.value as 'active' | 'closed')}
                                    >
                                      <MenuItem value="active">Active</MenuItem>
                                      <MenuItem value="closed">Closed</MenuItem>
                                    </Select>
                                  </FormControl>
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                  <TextField fullWidth size="small" label="Published Date" type="date" value={entry.published_at} onChange={(e) => handleInputChange(entry.id, 'published_at', e.target.value)} InputLabelProps={{ shrink: true }} />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                  <TextField fullWidth size="small" label="Expiry Date" type="date" value={entry.expires_at} onChange={(e) => handleInputChange(entry.id, 'expires_at', e.target.value)} InputLabelProps={{ shrink: true }} />
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                  <FormControlLabel
                                    control={<Checkbox checked={entry.featured} onChange={(e) => handleInputChange(entry.id, 'featured', e.target.checked)} color="primary" />}
                                    label="Featured Job (Highlight in Client View)"
                                  />
                                </Grid>
                              </Grid>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Collapse>
                    </Card>
                  ))}
                </Stack>

                <Box sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column-reverse', sm: 'row' },
                  gap: 2,
                  justifyContent: 'flex-end'
                }}>
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={resetForm}
                    fullWidth={isMobile}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Save size={20} />}
                    fullWidth={isMobile}
                  >
                    {editingJob ? 'Update Job' : `Create ${jobEntries.length} Job${jobEntries.length > 1 ? 's' : ''}`}
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Jobs List */}
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
              All Careers ({filteredAndSortedJobs.length} of {validJobs.length})
            </Typography>
          </Box>

          {/* Search and Filters */}
          {validJobs.length > 0 && (
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
                onClick={() => setFiltersExpanded(!filtersExpanded)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Search size={20} style={{ color: theme.palette.text.secondary }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 1 }}>
                    Search & Filter
                  </Typography>
                  {(searchQuery || filterStatus !== 'all' || filterDepartment !== 'all' || filterType !== 'all' || filterLocation !== 'all') && (
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
                        searchQuery ? 'Search' : null,
                        filterStatus !== 'all' ? 'Status' : null,
                        filterDepartment !== 'all' ? 'Dept' : null,
                        filterType !== 'all' ? 'Type' : null,
                        filterLocation !== 'all' ? 'Loc' : null,
                      ].filter(Boolean).length} active
                    </Typography>
                  )}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {(searchQuery || filterStatus !== 'all' || filterDepartment !== 'all' || filterType !== 'all' || filterLocation !== 'all') && (
                    <Button
                      variant="text"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleResetFilters();
                      }}
                      startIcon={<X size={16} />}
                      sx={{ mr: 1 }}
                    >
                      Reset
                    </Button>
                  )}
                  {filtersExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </Box>
              </Box>

              {/* Expandable Content */}
              <Collapse in={filtersExpanded}>
                <Box sx={{ mt: 3, pt: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
                  <Grid container spacing={2} alignItems="flex-end">
                    {/* Search */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        placeholder="Search jobs by title, department, location..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setPage(0);
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
                          value={filterStatus}
                          label="Status"
                          onChange={(e) => {
                            setFilterStatus(e.target.value);
                            setPage(0);
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
                          value={filterDepartment}
                          label="Department"
                          onChange={(e) => {
                            setFilterDepartment(e.target.value);
                            setPage(0);
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
                          value={filterType}
                          label="Type"
                          onChange={(e) => {
                            setFilterType(e.target.value);
                            setPage(0);
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
                          value={filterLocation}
                          label="Location"
                          onChange={(e) => {
                            setFilterLocation(e.target.value);
                            setPage(0);
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

          {/* Desktop Table View */}
          {!isMobile ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'action.hover' }}>
                    <TableCell sx={{ fontWeight: 600 }}>
                      <TableSortLabel
                        active={sortField === 'title'}
                        direction={sortField === 'title' ? sortDirection : 'asc'}
                        onClick={() => handleSort('title')}
                      >
                        Title
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      <TableSortLabel
                        active={sortField === 'department'}
                        direction={sortField === 'department' ? sortDirection : 'asc'}
                        onClick={() => handleSort('department')}
                      >
                        Department
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      <TableSortLabel
                        active={sortField === 'location'}
                        direction={sortField === 'location' ? sortDirection : 'asc'}
                        onClick={() => handleSort('location')}
                      >
                        Location
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      <TableSortLabel
                        active={sortField === 'status'}
                        direction={sortField === 'status' ? sortDirection : 'asc'}
                        onClick={() => handleSort('status')}
                      >
                        Status
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Posted</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Analytics</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>UUID</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedJobs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                          No careers found matching your criteria.
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
                        <TableCell>
                          <Chip
                            label={formatStatus(job.status)}
                            size="small"
                            color={job.status === 'active' ? 'success' : 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(job.postedDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Chip label={`👁 ${job.views_count || 0}`} size="small" variant="outlined" />
                            <Chip label={`📝 ${job.applications_count || 0}`} size="small" variant="outlined" />
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'text.secondary' }}>
                          {job.id}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                              onClick={() => handleEdit(job)}
                              size="small"
                              color="primary"
                              title="Edit"
                            >
                              <Edit2 size={18} />
                            </IconButton>
                            <IconButton
                              onClick={() => handleDeleteClick(job.id)}
                              size="small"
                              color="error"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            /* Mobile Card View */
            <Box sx={{ p: 2 }}>
              {/* Mobile Sort Selector */}
              <Box sx={{ mb: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={`${sortField}-${sortDirection}`}
                    label="Sort By"
                    onChange={(e) => {
                      const [field, direction] = e.target.value.split('-');
                      setSortField(field as SortField);
                      setSortDirection(direction as SortDirection);
                      setPage(0);
                    }}
                  >
                    <MenuItem value="title-asc">Title (A-Z)</MenuItem>
                    <MenuItem value="title-desc">Title (Z-A)</MenuItem>
                    <MenuItem value="department-asc">Department (A-Z)</MenuItem>
                    <MenuItem value="department-desc">Department (Z-A)</MenuItem>
                    <MenuItem value="location-asc">Location (A-Z)</MenuItem>
                    <MenuItem value="location-desc">Location (Z-A)</MenuItem>
                    <MenuItem value="status-asc">Status (A-Z)</MenuItem>
                    <MenuItem value="status-desc">Status (Z-A)</MenuItem>
                    <MenuItem value="postedDate-desc">Posted (Newest)</MenuItem>
                    <MenuItem value="postedDate-asc">Posted (Oldest)</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              {paginatedJobs.length === 0 ? (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    No careers found matching your criteria.
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={2}>
                  {paginatedJobs.map((job) => (
                    <Card key={job.id} variant="outlined" sx={{ borderRadius: 2 }}>
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem', flex: 1, mr: 1 }}>
                            {job.title}
                          </Typography>
                          <Chip
                            label={formatStatus(job.status)}
                            size="small"
                            color={job.status === 'active' ? 'success' : 'default'}
                            sx={{ minWidth: 70 }}
                          />
                        </Box>
                        <Divider sx={{ my: 1.5 }} />
                        <Stack spacing={1.5}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 90, fontWeight: 500 }}>
                              Department:
                            </Typography>
                            <Typography variant="body2">{job.department}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 90, fontWeight: 500 }}>
                              Location:
                            </Typography>
                            <Typography variant="body2">{job.location}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 90, fontWeight: 500 }}>
                              Posted:
                            </Typography>
                            <Typography variant="body2">
                              {new Date(job.postedDate).toLocaleDateString()}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 90, fontWeight: 500 }}>
                              UUID:
                            </Typography>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                              {job.id}
                            </Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                      <CardActions sx={{ px: 2, pb: 2, pt: 0, justifyContent: 'flex-end', gap: 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Edit2 size={16} />}
                          onClick={() => handleEdit(job)}
                          sx={{ minWidth: 100 }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<Trash2 size={16} />}
                          onClick={() => handleDeleteClick(job.id)}
                          sx={{ minWidth: 100 }}
                        >
                          Delete
                        </Button>
                      </CardActions>
                    </Card>
                  ))}
                </Stack>
              )}
            </Box>
          )}

          {/* Pagination */}
          <TablePagination
            component="div"
            count={filteredAndSortedJobs.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50, 100]}
            labelRowsPerPage="Rows per page:"
          />
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this job posting? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
