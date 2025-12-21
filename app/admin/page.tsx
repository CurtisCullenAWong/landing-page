'use client';

import React, { useState, useMemo } from 'react';
import { useJobs, Job } from '../../contexts/JobContext';
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
} from '@mui/material';
import { AdminTableSkeleton } from '@/components/loading';
import { usePageTitle } from '../../lib/usePageTitle';

type SortField = 'title' | 'department' | 'location' | 'postedDate' | 'status';
type SortDirection = 'asc' | 'desc';

const MAX_JOB_ENTRIES = 25;

type JobFormData = {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  responsibilities: string;
  requirements: string;
  salary: string;
  status: 'active' | 'closed';
  expanded: boolean;
};

export default function AdminPage() {
  usePageTitle('Admin');
  const { jobs, isLoading, addJobs, updateJob, deleteJob } = useJobs();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  const [jobEntries, setJobEntries] = useState<JobFormData[]>([
    {
      id: `job-${Date.now()}`,
      title: '',
      department: '',
      location: '',
      type: 'Full-time',
      description: '',
      responsibilities: '',
      requirements: '',
      salary: '',
      status: 'active',
      expanded: false,
    }
  ]);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

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

  // Filter out any null jobs
  const validJobs = jobs.filter(job => job !== null && job !== undefined);

  // Get unique values for filter dropdowns
  const uniqueDepartments = useMemo(() => {
    const depts = new Set(validJobs.map(job => job.department));
    return Array.from(depts).sort();
  }, [validJobs]);

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

  const handleInputChange = (id: string, field: keyof JobFormData, value: string) => {
    setJobEntries(entries =>
      entries.map(entry =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
  };

  const handleSelectChange = (id: string, field: keyof JobFormData, value: string) => {
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
      salary: '',
      status: 'active',
      expanded: false,
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
    
    if (editingJob) {
      // Single edit mode (keep existing behavior)
      const entry = jobEntries[0];
      const jobData = {
        title: entry.title,
        department: entry.department,
        location: entry.location,
        type: entry.type,
        description: entry.description,
        responsibilities: entry.responsibilities.split('\n').filter(r => r.trim()),
        requirements: entry.requirements.split('\n').filter(r => r.trim()),
        salary: entry.salary,
        status: entry.status
      };
      updateJob(editingJob.id, jobData);
      setEditingJob(null);
      resetForm();
    } else {
      // Bulk create mode
      const jobsToAdd = jobEntries
        .filter(entry => entry.title.trim() && entry.department.trim() && entry.location.trim())
        .map(entry => ({
          title: entry.title,
          department: entry.department,
          location: entry.location,
          type: entry.type,
          description: entry.description,
          responsibilities: entry.responsibilities.split('\n').filter(r => r.trim()),
          requirements: entry.requirements.split('\n').filter(r => r.trim()),
          salary: entry.salary,
          status: 'active' as 'active' | 'closed'
        }));

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
      salary: job.salary,
      status: job.status,
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
      salary: '',
      status: 'active',
      expanded: false,
    }]);
    setIsFormOpen(false);
    setEditingJob(null);
  };

  return (
    <Box sx={{ py: 8 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: { xs: 3, sm: 4 },
          mb: 5,
          pb: 3,
          borderBottom: 1,
          borderColor: 'divider'
        }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h3" sx={{ fontWeight: 700, fontSize: { xs: '1.75rem', sm: '2.125rem', md: '2.5rem' }, mb: 1.5 }}>
              Job Postings Admin
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
              Manage job postings and applications
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
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {editingJob ? 'Edit Job Posting' : `Create Job Postings (${jobEntries.length})`}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  {!editingJob && (
                    <>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Plus size={16} />}
                        onClick={handleAddEntry}
                        disabled={jobEntries.length >= MAX_JOB_ENTRIES}
                      >
                        Add Row
                      </Button>
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        ({jobEntries.length}/{MAX_JOB_ENTRIES})
                      </Typography>
                    </>
                  )}
                  <IconButton onClick={resetForm} size="small">
                    <X size={20} />
                  </IconButton>
                </Box>
              </Box>

              <form onSubmit={handleSubmit}>
                <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'action.hover' }}>
                        <TableCell sx={{ width: 40, p: 1 }}></TableCell>
                        <TableCell sx={{ fontWeight: 600, p: 1 }}>Title</TableCell>
                        <TableCell sx={{ fontWeight: 600, p: 1 }}>Department</TableCell>
                        <TableCell sx={{ fontWeight: 600, p: 1 }}>Location</TableCell>
                        <TableCell sx={{ fontWeight: 600, p: 1 }}>Type</TableCell>
                        <TableCell sx={{ fontWeight: 600, p: 1 }}>Salary</TableCell>
                        {editingJob && <TableCell sx={{ fontWeight: 600, p: 1 }}>Status</TableCell>}
                        <TableCell sx={{ width: 50, p: 1 }}></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {jobEntries.map((entry, index) => (
                        <React.Fragment key={entry.id}>
                          <TableRow>
                            <TableCell sx={{ p: 0.5 }}>
                              <IconButton
                                size="small"
                                onClick={() => handleToggleExpand(entry.id)}
                                sx={{ p: 0.5 }}
                              >
                                {entry.expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </IconButton>
                            </TableCell>
                            <TableCell sx={{ p: 0.5 }}>
                              <TextField
                                fullWidth
                                size="small"
                                placeholder="Job Title"
                                value={entry.title}
                                onChange={(e) => handleInputChange(entry.id, 'title', e.target.value)}
                                required
                                sx={{ '& .MuiInputBase-root': { fontSize: '0.875rem' } }}
                              />
                            </TableCell>
                            <TableCell sx={{ p: 0.5 }}>
                              <TextField
                                fullWidth
                                size="small"
                                placeholder="Department"
                                value={entry.department}
                                onChange={(e) => handleInputChange(entry.id, 'department', e.target.value)}
                                required
                                sx={{ '& .MuiInputBase-root': { fontSize: '0.875rem' } }}
                              />
                            </TableCell>
                            <TableCell sx={{ p: 0.5 }}>
                              <TextField
                                fullWidth
                                size="small"
                                placeholder="Location"
                                value={entry.location}
                                onChange={(e) => handleInputChange(entry.id, 'location', e.target.value)}
                                required
                                sx={{ '& .MuiInputBase-root': { fontSize: '0.875rem' } }}
                              />
                            </TableCell>
                            <TableCell sx={{ p: 0.5 }}>
                              <FormControl fullWidth size="small" required>
                                <Select
                                  value={entry.type}
                                  onChange={(e) => handleSelectChange(entry.id, 'type', e.target.value)}
                                  sx={{ fontSize: '0.875rem' }}
                                >
                                  <MenuItem value="Full-time">Full-time</MenuItem>
                                  <MenuItem value="Part-time">Part-time</MenuItem>
                                  <MenuItem value="Contract">Contract</MenuItem>
                                  <MenuItem value="Temporary">Temporary</MenuItem>
                                </Select>
                              </FormControl>
                            </TableCell>
                            <TableCell sx={{ p: 0.5 }}>
                              <TextField
                                fullWidth
                                size="small"
                                placeholder="₱50k - ₱70k"
                                value={entry.salary}
                                onChange={(e) => handleInputChange(entry.id, 'salary', e.target.value)}
                                required
                                sx={{ '& .MuiInputBase-root': { fontSize: '0.875rem' } }}
                              />
                            </TableCell>
                            {editingJob && (
                              <TableCell sx={{ p: 0.5 }}>
                                <FormControl fullWidth size="small" required>
                                  <Select
                                    value={entry.status}
                                    onChange={(e) => handleSelectChange(entry.id, 'status', e.target.value as 'active' | 'closed')}
                                    sx={{ fontSize: '0.875rem' }}
                                  >
                                    <MenuItem value="active">Active</MenuItem>
                                    <MenuItem value="closed">Closed</MenuItem>
                                  </Select>
                                </FormControl>
                              </TableCell>
                            )}
                            <TableCell sx={{ p: 0.5 }}>
                              {jobEntries.length > 1 && !editingJob && (
                                <IconButton
                                  size="small"
                                  onClick={() => handleRemoveEntry(entry.id)}
                                  color="error"
                                  sx={{ p: 0.5 }}
                                >
                                  <Trash2 size={16} />
                                </IconButton>
                              )}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell colSpan={editingJob ? 8 : 7} sx={{ py: 0, px: 1, border: 0 }}>
                              <Collapse in={entry.expanded} timeout="auto" unmountOnExit>
                                <Box sx={{ py: 2, px: 1 }}>
                                  <Grid container spacing={2}>
                                    <Grid size={{ xs: 12 }}>
                                      <TextField
                                        fullWidth
                                        size="small"
                                        label="Job Description"
                                        value={entry.description}
                                        onChange={(e) => handleInputChange(entry.id, 'description', e.target.value)}
                                        required
                                        multiline
                                        rows={3}
                                        sx={{ '& .MuiInputBase-root': { fontSize: '0.875rem' } }}
                                      />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                      <TextField
                                        fullWidth
                                        size="small"
                                        label="Responsibilities (one per line)"
                                        value={entry.responsibilities}
                                        onChange={(e) => handleInputChange(entry.id, 'responsibilities', e.target.value)}
                                        required
                                        multiline
                                        rows={4}
                                        placeholder="Enter each responsibility on a new line"
                                        sx={{ '& .MuiInputBase-root': { fontSize: '0.875rem' } }}
                                      />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                      <TextField
                                        fullWidth
                                        size="small"
                                        label="Requirements (one per line)"
                                        value={entry.requirements}
                                        onChange={(e) => handleInputChange(entry.id, 'requirements', e.target.value)}
                                        required
                                        multiline
                                        rows={4}
                                        placeholder="Enter each requirement on a new line"
                                        sx={{ '& .MuiInputBase-root': { fontSize: '0.875rem' } }}
                                      />
                                    </Grid>
                                  </Grid>
                                </Box>
                              </Collapse>
                            </TableCell>
                          </TableRow>
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={resetForm}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Save size={20} />}
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
              All Job Postings ({filteredAndSortedJobs.length} of {validJobs.length})
            </Typography>
          </Box>

          {/* Search and Filters */}
          <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
            <Grid container spacing={2} alignItems="center">
              {/* Search */}
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  placeholder="Search jobs..."
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
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
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
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
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
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
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
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
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

              {/* Reset Filters Button */}
              {(searchQuery || filterStatus !== 'all' || filterDepartment !== 'all' || filterType !== 'all' || filterLocation !== 'all') && (
                <Grid size={{ xs: 12, md: 12 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleResetFilters}
                    startIcon={<X size={16} />}
                  >
                    Reset Filters
                  </Button>
                </Grid>
              )}
            </Grid>
          </Box>

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
                  <TableCell sx={{ fontWeight: 600 }}>
                    <TableSortLabel
                      active={sortField === 'postedDate'}
                      direction={sortField === 'postedDate' ? sortDirection : 'asc'}
                      onClick={() => handleSort('postedDate')}
                    >
                      Posted
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedJobs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        No job postings found matching your criteria.
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
                          label={job.status}
                          size="small"
                          color={job.status === 'active' ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(job.postedDate).toLocaleDateString()}
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
