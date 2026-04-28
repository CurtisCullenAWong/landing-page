'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import {
  Box,
  Container,
  Typography,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  useTheme,
  TablePagination,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputAdornment,
  Stack,
  Menu,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Collapse,
  Grid,
  TableSortLabel,
  useMediaQuery,
  Divider,
  CardActions,
} from '@mui/material';
import { AdminTableSkeleton } from '@/components/loading';
import { usePageTitle } from '@/lib/usePageTitle';
import { Search, Edit, Eye, FileText, MoreVertical, Trash2, ChevronDown, ChevronUp, X } from 'lucide-react';
import { PDFViewer } from '@/components/pdf-viewer';

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

const STATUS_OPTIONS: JobApplicant['status'][] = [
  'pending',
  'reviewing',
  'interviewing',
  'offer',
  'hired',
  'rejected',
  'withdrawn',
];

export default function JobApplicationsPage() {
  usePageTitle('Job Applications');
  const [jobApplicants, setJobApplicants] = useState<JobApplicant[]>([]);
  const [jobs, setJobs] = useState<JobWithTitle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [sortField, setSortField] = useState<'name' | 'email' | 'phone' | 'job_title' | 'status' | 'applied_at' | 'updated_by'>('applied_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [editingApplicant, setEditingApplicant] = useState<JobApplicant | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<JobApplicant['status']>('pending');
  const [viewingPdfUrl, setViewingPdfUrl] = useState<string | null>(null);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedApplicant, setSelectedApplicant] = useState<JobApplicant | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [applicantToDelete, setApplicantToDelete] = useState<JobApplicant | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const isPDF = (url: string) => {
    return url.toLowerCase().endsWith('.pdf') || url.toLowerCase().includes('.pdf');
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, applicant: JobApplicant) => {
    setMenuAnchor(event.currentTarget);
    setSelectedApplicant(applicant);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedApplicant(null);
  };

  const handleViewPDF = (url: string) => {
    setViewingPdfUrl(url);
    setPdfViewerOpen(true);
    handleMenuClose();
  };

  const handleEditStatus = (applicant: JobApplicant) => {
    handleStatusClick(applicant);
    handleMenuClose();
  };

  const handleDeleteClick = (applicant: JobApplicant) => {
    setApplicantToDelete(applicant);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (!applicantToDelete) return;

    setIsDeleting(true);
    try {
      const supabase = createClient();
      
      // Delete file from storage if it's a storage path
      if (applicantToDelete.resume_url?.startsWith('applicant-files:')) {
        const filePath = applicantToDelete.resume_url.replace('applicant-files:', '');
        const { error: storageError } = await supabase.storage
          .from('applicant-files')
          .remove([filePath]);
        
        if (storageError) {
          console.error('Error deleting file from storage:', storageError);
          // Continue with database deletion even if file deletion fails
        }
      }

      // Delete application record
      const { error } = await supabase
        .from('job_applicants')
        .delete()
        .eq('id', applicantToDelete.id);

      if (error) {
        console.error('Error deleting application:', error);
        alert('Failed to delete application. Please try again.');
      } else {
        setDeleteDialogOpen(false);
        setApplicantToDelete(null);
        // The realtime subscription will update the list automatically
      }
    } catch (error) {
      console.error('Error deleting application:', error);
      alert('An error occurred while deleting the application.');
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const supabase = createClient();
        
        // Load jobs for job title mapping
        const { data: jobsData, error: jobsError } = await supabase
          .from('jobs')
          .select('id, title');

        if (jobsError) {
          console.error('Error loading jobs:', jobsError);
        } else if (jobsData) {
          setJobs(jobsData);
        }

        // Load job applicants
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
        console.error('Error loading data:', error);
        setJobApplicants([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    // Set up realtime subscriptions
    const supabase = createClient();
    
    // Realtime subscription for job_applicants table
    const applicantsChannel = supabase
      .channel('job-applicants-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'job_applicants',
        },
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          console.log('Realtime event received for job_applicants:', payload.eventType, payload);
          
          if (payload.eventType === 'INSERT') {
            const newApplicant = payload.new as unknown as JobApplicant;
            setJobApplicants((prevApplicants) => {
              // Check if applicant already exists (avoid duplicates)
              if (prevApplicants.find(applicant => applicant.id === newApplicant.id)) {
                return prevApplicants;
              }
              // Add new applicant and sort by applied_at descending
              return [newApplicant, ...prevApplicants].sort((a, b) => {
                const dateA = a.applied_at ? new Date(a.applied_at).getTime() : 0;
                const dateB = b.applied_at ? new Date(b.applied_at).getTime() : 0;
                return dateB - dateA;
              });
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedApplicant = payload.new as unknown as JobApplicant;
            setJobApplicants((prevApplicants) =>
              prevApplicants.map((applicant) =>
                applicant.id === updatedApplicant.id ? updatedApplicant : applicant
              )
            );
            // Update editing applicant if it's the one being edited
            setEditingApplicant((prev) => 
              prev && prev.id === updatedApplicant.id ? updatedApplicant : prev
            );
          } else if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as { id: string }).id;
            setJobApplicants((prevApplicants) =>
              prevApplicants.filter((applicant) => applicant.id !== deletedId)
            );
            // Clear editing applicant if it was deleted
            setEditingApplicant((prev) => 
              prev && prev.id === deletedId ? null : prev
            );
          }
        }
      )
      .subscribe();

    // Realtime subscription for jobs table (to update job titles)
    const jobsChannel = supabase
      .channel('jobs-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs',
        },
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          console.log('Realtime event received for jobs:', payload.eventType, payload);
          
          if (payload.eventType === 'INSERT') {
            const newJob = payload.new as { id: string; title: string };
            setJobs((prevJobs) => {
              if (prevJobs.find(job => job.id === newJob.id)) {
                return prevJobs;
              }
              return [...prevJobs, newJob];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedJob = payload.new as { id: string; title: string };
            setJobs((prevJobs) =>
              prevJobs.map((job) =>
                job.id === updatedJob.id ? updatedJob : job
              )
            );
          } else if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as { id: string }).id;
            setJobs((prevJobs) =>
              prevJobs.filter((job) => job.id !== deletedId)
            );
          }
        }
      )
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      supabase.removeChannel(applicantsChannel);
      supabase.removeChannel(jobsChannel);
    };
  }, []); // Empty dependency array - only run once on mount

  // Create a map of job IDs to job titles
  const jobTitlesMap = useMemo(() => {
    const map = new Map<string, string>();
    jobs.forEach(job => {
      map.set(job.id, job.title);
    });
    return map;
  }, [jobs]);

  // Filter, search, and sort applicants
  const filteredApplicants = useMemo(() => {
    let filtered = [...jobApplicants];

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(applicant =>
        applicant.first_name.toLowerCase().includes(query) ||
        applicant.last_name.toLowerCase().includes(query) ||
        applicant.email.toLowerCase().includes(query) ||
        (applicant.phone && applicant.phone.toLowerCase().includes(query)) ||
        (applicant.job_id ? jobTitlesMap.get(applicant.job_id)?.toLowerCase().includes(query) : 'general application'.includes(query))
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(applicant => applicant.status === filterStatus);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
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
        case 'updated_by':
          aValue = (a.updated_by || '').toLowerCase();
          bValue = (b.updated_by || '').toLowerCase();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [jobApplicants, searchQuery, filterStatus, sortField, sortDirection, jobTitlesMap]);

  // Paginate applicants
  const paginatedApplicants = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredApplicants.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredApplicants, page, rowsPerPage]);

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

  const handleStatusClick = (applicant: JobApplicant) => {
    setEditingApplicant(applicant);
    setNewStatus(applicant.status);
    setStatusDialogOpen(true);
  };

  const handleStatusUpdate = async () => {
    if (!editingApplicant) return;

    try {
      const supabase = createClient();
      
      // Step 1: Get current user UUID
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('Error getting current user:', userError);
        alert('Failed to get current user information. Please try again.');
        return;
      }

      // Step 2: Get the UUID of the current user
      const userId = user.id;
      
      // Step 3: Fetch email from auth based on that user UUID
      // The getUser() already returns the email in the user object
      let updatedBy: string | null = null;
      
      if (user.email) {
        updatedBy = user.email;
      } else {
        // If email is not available, use UUID as fallback
        console.warn('Email not available for user, using UUID:', userId);
        updatedBy = userId;
      }

      if (!updatedBy) {
        alert('Unable to identify current user. Please try again.');
        return;
      }

      // Update the application status with the email
      console.log('Updating application:', {
        id: editingApplicant.id,
        status: newStatus,
        updated_by: updatedBy,
      });

      const { data, error } = await supabase
        .from('job_applicants')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
          updated_by: updatedBy,
        })
        .eq('id', editingApplicant.id)
        .select();

      if (error) {
        console.error('Error updating status:', {
          error,
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        
        // Check if it's an RLS policy error or column doesn't exist
        if (error.code === '42501' || error.message?.includes('row-level security')) {
          alert('Permission denied. Please check your database permissions.');
        } else if (error.code === '42703' || error.message?.includes('updated_by')) {
          alert('The updated_by column may not exist in the database. Please run the migration script.');
        } else {
          alert(`Failed to update status: ${error.message || 'Unknown error'}`);
        }
        return;
      }

      if (data && data.length > 0) {
        console.log('Status updated successfully:', data[0]);
        setStatusDialogOpen(false);
        setEditingApplicant(null);
      } else {
        console.warn('Update succeeded but no data returned');
        setStatusDialogOpen(false);
        setEditingApplicant(null);
      }
    } catch (error) {
      console.error('Error updating status (catch block):', {
        error,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to update status: ${errorMessage}`);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterStatus('all');
    setSortField('applied_at');
    setSortDirection('desc');
    setPage(0);
  };

  const handleSort = (field: 'name' | 'email' | 'phone' | 'job_title' | 'status' | 'applied_at' | 'updated_by') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setPage(0);
  };

  if (isLoading) {
    return <AdminTableSkeleton />;
  }

  return (
    <Box sx={{ pt: { xs: 10, sm: 12 }, pb: 8 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 5, pb: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h3" sx={{ fontWeight: 700, fontSize: { xs: '1.75rem', sm: '2.125rem', md: '2.5rem' }, mb: 1.5 }}>
            Job Applications
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            Manage and update job application statuses
          </Typography>
        </Box>

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
              All Applications ({filteredApplicants.length} of {jobApplicants.length})
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
                onClick={() => setFiltersExpanded(!filtersExpanded)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Search size={20} style={{ color: theme.palette.text.secondary }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 1 }}>
                    Search & Filter
                  </Typography>
                  {(searchQuery || filterStatus !== 'all') && (
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
                      ].filter(Boolean).length} active
                    </Typography>
                  )}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {(searchQuery || filterStatus !== 'all') && (
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
                        placeholder="Search by name, email, phone, or job title..."
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
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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

          {/* Desktop Table View */}
          {!isMobile ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'action.hover' }}>
                    <TableCell sx={{ fontWeight: 600 }}>
                      <TableSortLabel
                        active={sortField === 'name'}
                        direction={sortField === 'name' ? sortDirection : 'asc'}
                        onClick={() => handleSort('name')}
                      >
                        Name
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      <TableSortLabel
                        active={sortField === 'email'}
                        direction={sortField === 'email' ? sortDirection : 'asc'}
                        onClick={() => handleSort('email')}
                      >
                        Email
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      <TableSortLabel
                        active={sortField === 'phone'}
                        direction={sortField === 'phone' ? sortDirection : 'asc'}
                        onClick={() => handleSort('phone')}
                      >
                        Phone
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      <TableSortLabel
                        active={sortField === 'job_title'}
                        direction={sortField === 'job_title' ? sortDirection : 'asc'}
                        onClick={() => handleSort('job_title')}
                      >
                        Job Title
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
                        active={sortField === 'applied_at'}
                        direction={sortField === 'applied_at' ? sortDirection : 'asc'}
                        onClick={() => handleSort('applied_at')}
                      >
                        Applied At
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      <TableSortLabel
                        active={sortField === 'updated_by'}
                        direction={sortField === 'updated_by' ? sortDirection : 'asc'}
                        onClick={() => handleSort('updated_by')}
                      >
                        Updated By
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedApplicants.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                          No job applicants found matching your criteria.
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
                        <TableCell>
                          {applicant.updated_by || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            onClick={(e) => handleMenuOpen(e, applicant)}
                            size="small"
                            title="Actions"
                          >
                            <MoreVertical size={18} />
                          </IconButton>
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
                      setSortField(field as 'name' | 'email' | 'phone' | 'job_title' | 'status' | 'applied_at' | 'updated_by');
                      setSortDirection(direction as 'asc' | 'desc');
                      setPage(0);
                    }}
                  >
                    <MenuItem value="name-asc">Name (A-Z)</MenuItem>
                    <MenuItem value="name-desc">Name (Z-A)</MenuItem>
                    <MenuItem value="email-asc">Email (A-Z)</MenuItem>
                    <MenuItem value="email-desc">Email (Z-A)</MenuItem>
                    <MenuItem value="status-asc">Status (A-Z)</MenuItem>
                    <MenuItem value="status-desc">Status (Z-A)</MenuItem>
                    <MenuItem value="applied_at-desc">Applied At (Newest)</MenuItem>
                    <MenuItem value="applied_at-asc">Applied At (Oldest)</MenuItem>
                    <MenuItem value="updated_by-asc">Updated By (A-Z)</MenuItem>
                    <MenuItem value="updated_by-desc">Updated By (Z-A)</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              {paginatedApplicants.length === 0 ? (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    No job applicants found matching your criteria.
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={2}>
                  {paginatedApplicants.map((applicant) => (
                    <Card key={applicant.id} variant="outlined" sx={{ borderRadius: 2 }}>
                      <Box sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                          <Box sx={{ flex: 1, mr: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem', mb: 0.5 }}>
                              {applicant.first_name} {applicant.last_name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {applicant.email}
                            </Typography>
                          </Box>
                          <Chip
                            label={applicant.status}
                            size="small"
                            color={getStatusColor(applicant.status) as any}
                            sx={{ minWidth: 80 }}
                          />
                        </Box>
                        <Divider sx={{ my: 1.5 }} />
                        <Stack spacing={1.5}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 90, fontWeight: 500 }}>
                              Phone:
                            </Typography>
                            <Typography variant="body2">{applicant.phone || 'N/A'}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 90, fontWeight: 500 }}>
                              Job Title:
                            </Typography>
                            <Typography variant="body2">{applicant.job_id ? (jobTitlesMap.get(applicant.job_id) || 'Unknown Job') : 'General Application'}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 90, fontWeight: 500 }}>
                              Applied:
                            </Typography>
                            <Typography variant="body2">
                              {applicant.applied_at
                                ? new Date(applicant.applied_at).toLocaleDateString()
                                : 'N/A'}
                            </Typography>
                          </Box>
                          {applicant.updated_by && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 90, fontWeight: 500 }}>
                                Updated By:
                              </Typography>
                              <Typography variant="body2">{applicant.updated_by}</Typography>
                            </Box>
                          )}
                        </Stack>
                      </Box>
                      <CardActions sx={{ px: 2, pb: 2, pt: 0, justifyContent: 'flex-end' }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Edit size={16} />}
                          onClick={() => handleEditStatus(applicant)}
                          sx={{ minWidth: 100 }}
                        >
                          Edit Status
                        </Button>
                        {applicant.resume_url && (
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={isPDF(applicant.resume_url) ? <Eye size={16} /> : <FileText size={16} />}
                            onClick={() => handleViewPDF(applicant.resume_url)}
                            sx={{ minWidth: 100 }}
                          >
                            {isPDF(applicant.resume_url) ? 'View PDF' : 'View Resume'}
                          </Button>
                        )}
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<Trash2 size={16} />}
                          onClick={() => handleDeleteClick(applicant)}
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
          <TablePagination
            component="div"
            count={filteredApplicants.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="Rows per page:"
          />
        </Card>

        {/* Actions Menu */}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          {selectedApplicant?.resume_url && (
            <MenuItem
              onClick={() => {
                if (selectedApplicant.resume_url) {
                  handleViewPDF(selectedApplicant.resume_url);
                }
              }}
            >
              <ListItemIcon>
                {isPDF(selectedApplicant.resume_url) ? <Eye size={18} /> : <FileText size={18} />}
              </ListItemIcon>
              <ListItemText>
                {isPDF(selectedApplicant.resume_url) ? 'View PDF' : 'View Resume'}
              </ListItemText>
            </MenuItem>
          )}
          <MenuItem onClick={() => selectedApplicant && handleEditStatus(selectedApplicant)}>
            <ListItemIcon>
              <Edit size={18} />
            </ListItemIcon>
            <ListItemText>Edit Status</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => selectedApplicant && handleDeleteClick(selectedApplicant)}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon>
              <Trash2 size={18} />
            </ListItemIcon>
            <ListItemText>Delete Application</ListItemText>
          </MenuItem>
        </Menu>

        {/* Status Update Dialog */}
        <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Update Application Status</DialogTitle>
          <DialogContent>
            {editingApplicant && (
              <Box sx={{ pt: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Applicant: {editingApplicant.first_name} {editingApplicant.last_name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Job: {editingApplicant.job_id ? (jobTitlesMap.get(editingApplicant.job_id) || 'Unknown Job') : 'General Application'}
                </Typography>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={newStatus}
                    label="Status"
                    onChange={(e) => setNewStatus(e.target.value as JobApplicant['status'])}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleStatusUpdate} variant="contained">
              Update Status
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => !isDeleting && setDeleteDialogOpen(false)}>
          <DialogTitle>Delete Application</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete the application for{' '}
              <strong>
                {applicantToDelete?.first_name} {applicantToDelete?.last_name}
              </strong>?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              This action cannot be undone. All application data including the resume will be permanently deleted.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              color="error"
              variant="contained"
              disabled={isDeleting}
              startIcon={isDeleting ? <CircularProgress size={16} /> : <Trash2 size={16} />}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* PDF Viewer */}
        {viewingPdfUrl && (
          <PDFViewer
            url={viewingPdfUrl}
            fileName="Resume.pdf"
            open={pdfViewerOpen}
            onClose={() => {
              setPdfViewerOpen(false);
              setViewingPdfUrl(null);
            }}
          />
        )}
      </Container>
    </Box>
  );
}

