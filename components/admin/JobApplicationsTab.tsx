'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

// ── Edge function helper ─────────────────────────────────────────────────────
async function invokeRecruitmentFunction(action: string, params?: Record<string, unknown>) {
  const supabase = createClient();
  const { data, error } = await supabase.functions.invoke('manage-recruitment', {
    body: { action, params },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
}
import {
  Box,
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
  alpha,
} from '@mui/material';
import { Search, Edit, Eye, FileText, MoreVertical, Trash2, ChevronDown, ChevronUp, X } from 'lucide-react';
import { PDFViewer } from '@/components/pdf-viewer';
import { formatStatus } from '@/lib/utils';

export interface JobApplicant {
  id: string;
  job_id: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  cover_letter: string | null;
  resume_url: string;
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

interface JobApplicationsTabProps {
  jobs: JobWithTitle[];
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

export default function JobApplicationsTab({ jobs }: JobApplicationsTabProps) {
  const [jobApplicants, setJobApplicants] = useState<JobApplicant[]>([]);
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
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const router = useRouter();

  const isPDF = (url: string) => {
    return url.toLowerCase().endsWith('.pdf') || url.toLowerCase().includes('.pdf');
  };

  const formatLinkPreview = (url: string) => {
    const cleanUrl = url.replace(/^https?:\/\//i, '');
    const maxLength = 52;
    return cleanUrl.length > maxLength ? `${cleanUrl.slice(0, maxLength)}...` : cleanUrl;
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, applicant: JobApplicant) => {
    setMenuAnchor(event.currentTarget);
    setSelectedApplicant(applicant);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedApplicant(null);
  };

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
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

  const handleViewApplication = (applicantId: string) => {
    router.push(`/my-application/${applicantId}`);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (!applicantToDelete) return;

    setIsDeleting(true);
    try {
      await invokeRecruitmentFunction('delete-applicant', {
        id: applicantToDelete.id,
        resume_url: applicantToDelete.resume_url,
      });

      setDeleteDialogOpen(false);
      setApplicantToDelete(null);
    } catch (error) {
      console.error('Error deleting application:', error);
      alert('Failed to delete application. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    const loadData = async (showLoading = false) => {
      if (showLoading) {
        setIsLoading(true);
      }

      try {
        const supabase = createClient();

        // Load job applicants
        const { data, error } = await supabase
          .from('job_applicants')
          .select('*')
          .order('applied_at', { ascending: false });

        if (error) {
          console.error('Error loading job applicants:', error);
          if (showLoading) {
            setJobApplicants([]);
          }
        } else if (data) {
          setJobApplicants(data);
          setEditingApplicant((prev) => {
            if (!prev) return prev;
            return data.find((applicant: { id: string; }) => applicant.id === prev.id) ?? null;
          });
        } else {
          if (showLoading) {
            setJobApplicants([]);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        if (showLoading) {
          setJobApplicants([]);
        }
      } finally {
        if (showLoading) {
          setIsLoading(false);
        }
      }
    };

    loadData(true);

    // Set up realtime subscription for job_applicants table
    const supabase = createClient();
    const applicantsChannel = supabase
      .channel(`job-applicants-realtime-${crypto.randomUUID()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'job_applicants',
        },
        async (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          console.log('Realtime event received for job_applicants:', payload.eventType, payload);
          await loadData(false);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(applicantsChannel);
    };
  }, []);

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
        (applicant.first_name || '').toLowerCase().includes(query) ||
        (applicant.last_name || '').toLowerCase().includes(query) ||
        (applicant.email || '').toLowerCase().includes(query) ||
        (applicant.phone && applicant.phone.toLowerCase().includes(query)) ||
        (applicant.job_id ? (jobTitlesMap.get(applicant.job_id) || '').toLowerCase().includes(query) : 'general application'.includes(query))
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
          aValue = `${a.first_name || ''} ${a.last_name || ''}`.toLowerCase();
          bValue = `${b.first_name || ''} ${b.last_name || ''}`.toLowerCase();
          break;
        case 'email':
          aValue = (a.email || '').toLowerCase();
          bValue = (b.email || '').toLowerCase();
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
          aValue = (a.status || '').toLowerCase();
          bValue = (b.status || '').toLowerCase();
          break;
        case 'applied_at':
          const timeA = a.applied_at ? new Date(a.applied_at).getTime() : 0;
          const timeB = b.applied_at ? new Date(b.applied_at).getTime() : 0;
          aValue = isNaN(timeA) ? 0 : timeA;
          bValue = isNaN(timeB) ? 0 : timeB;
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
      const result = await invokeRecruitmentFunction('update-applicant', {
        id: editingApplicant.id,
        status: newStatus,
      });

      if (result.applicant) {
        setStatusDialogOpen(false);
        setEditingApplicant(null);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert(`Failed to update status: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    return (
      <Box sx={{ py: 5, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ px: 3, py: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            All Applications ({filteredApplicants.length} of {jobApplicants.length})
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {(searchQuery || filterStatus !== 'all') && (
              <Button
                variant="text"
                size="small"
                onClick={handleResetFilters}
                startIcon={<X size={16} />}
                sx={{ mr: 1, fontWeight: 600 }}
              >
                Reset
              </Button>
            )}
            <Button
              size="small"
              startIcon={filtersExpanded ? <ChevronUp size={18} /> : <Search size={18} />}
              onClick={() => setFiltersExpanded(!filtersExpanded)}
              sx={{ fontWeight: 600 }}
            >
              {filtersExpanded ? 'Hide Filters' : 'Search & Filter'}
            </Button>
          </Box>
        </Box>

        {/* Search and Filters */}
        <Collapse in={filtersExpanded}>
          <Box sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${theme.palette.divider}`, bgcolor: alpha(theme.palette.primary.main, 0.01) }}>
            <Grid container spacing={2}>
              {/* Search */}
              <Grid size={{ xs: 12, md: 8 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search by name, email, phone, or job title..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(0);
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search size={18} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Status Filter */}
              <Grid size={{ xs: 12, md: 4 }}>
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

        {/* Desktop Table View */}
        {!isMobile ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                  <TableCell sx={{ width: 40 }} />
                  <TableCell sx={{ fontWeight: 700, py: 2 }}>
                    <TableSortLabel
                      active={sortField === 'name'}
                      direction={sortField === 'name' ? sortDirection : 'asc'}
                      onClick={() => handleSort('name')}
                      sx={{ fontWeight: 700 }}
                    >
                      Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 2 }}>
                    <TableSortLabel
                      active={sortField === 'email'}
                      direction={sortField === 'email' ? sortDirection : 'asc'}
                      onClick={() => handleSort('email')}
                      sx={{ fontWeight: 700 }}
                    >
                      Email
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 2 }}>
                    <TableSortLabel
                      active={sortField === 'phone'}
                      direction={sortField === 'phone' ? sortDirection : 'asc'}
                      onClick={() => handleSort('phone')}
                      sx={{ fontWeight: 700 }}
                    >
                      Phone
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 2 }}>
                    <TableSortLabel
                      active={sortField === 'job_title'}
                      direction={sortField === 'job_title' ? sortDirection : 'asc'}
                      onClick={() => handleSort('job_title')}
                      sx={{ fontWeight: 700 }}
                    >
                      Job Title
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 2 }}>
                    <TableSortLabel
                      active={sortField === 'status'}
                      direction={sortField === 'status' ? sortDirection : 'asc'}
                      onClick={() => handleSort('status')}
                      sx={{ fontWeight: 700 }}
                    >
                      Status
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 2 }}>
                    <TableSortLabel
                      active={sortField === 'applied_at'}
                      direction={sortField === 'applied_at' ? sortDirection : 'asc'}
                      onClick={() => handleSort('applied_at')}
                      sx={{ fontWeight: 700 }}
                    >
                      Applied At
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 2 }}>
                    <TableSortLabel
                      active={sortField === 'updated_by'}
                      direction={sortField === 'updated_by' ? sortDirection : 'asc'}
                      onClick={() => handleSort('updated_by')}
                      sx={{ fontWeight: 700 }}
                    >
                      Updated By
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 2 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedApplicants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        No job applicants found matching your criteria.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedApplicants.map((applicant) => (
                    <React.Fragment key={applicant.id}>
                      <TableRow
                        sx={{
                          '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.5) },
                          borderBottom: expandedRows.has(applicant.id) ? 'none' : undefined,
                        }}
                      >
                        <TableCell sx={{ width: 40, py: 2 }}>
                          <IconButton
                            size="small"
                            onClick={() => toggleRow(applicant.id)}
                          >
                            {expandedRows.has(applicant.id) ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </IconButton>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          {applicant.first_name} {applicant.last_name}
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>{applicant.email}</TableCell>
                        <TableCell sx={{ py: 2 }}>{applicant.phone || 'N/A'}</TableCell>
                        <TableCell sx={{ py: 2 }}>
                          {applicant.job_id ? (jobTitlesMap.get(applicant.job_id) || 'Unknown Job') : 'General Application'}
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Chip
                            label={formatStatus(applicant.status)}
                            size="small"
                            color={getStatusColor(applicant.status) as any}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          {applicant.applied_at
                            ? new Date(applicant.applied_at).toLocaleDateString()
                            : 'N/A'}
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          {applicant.updated_by || 'N/A'}
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <IconButton
                            onClick={(e) => handleMenuOpen(e, applicant)}
                            size="small"
                            title="Actions"
                          >
                            <MoreVertical size={18} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={9} sx={{ py: 0, borderBottom: expandedRows.has(applicant.id) ? undefined : 'none' }}>
                          <Collapse in={expandedRows.has(applicant.id)} timeout="auto" unmountOnExit>
                            <Box sx={{ py: 1.5, px: 1.5, bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}>
                              <Grid container spacing={2}>
                                <Grid size={{ xs: 12, md: 7 }}>
                                  <Typography variant="caption" sx={{ mb: 0.75, display: 'block', fontWeight: 700, color: 'primary.main', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                                    Cover Letter
                                  </Typography>
                                  <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'background.paper', whiteSpace: 'pre-wrap' }}>
                                    <Typography variant="body2" sx={{ fontSize: '0.85rem', lineHeight: 1.55, overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                                      {applicant.cover_letter || 'No cover letter provided.'}
                                    </Typography>
                                  </Paper>
                                </Grid>
                                <Grid size={{ xs: 12, md: 5 }}>
                                  <Stack spacing={1.5}>
                                    <Box>
                                      <Typography variant="caption" sx={{ mb: 0.75, display: 'block', fontWeight: 700, color: 'primary.main', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                                        Portfolio / Links
                                      </Typography>
                                      {applicant.portfolio_url ? (
                                        <Typography
                                          variant="body2"
                                          component="a"
                                          href={applicant.portfolio_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          title={applicant.portfolio_url}
                                          sx={{
                                            display: 'block',
                                            textDecoration: 'none',
                                            color: 'primary.main',
                                            fontWeight: 500,
                                            fontSize: '0.85rem',
                                            wordBreak: 'break-all',
                                            '&:hover': { textDecoration: 'underline' },
                                          }}
                                        >
                                          {formatLinkPreview(applicant.portfolio_url)}
                                        </Typography>
                                      ) : (
                                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>No portfolio link provided.</Typography>
                                      )}
                                    </Box>
                                    <Box>
                                      <Typography variant="caption" sx={{ mb: 0.75, display: 'block', fontWeight: 700, color: 'primary.main', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                                        Documents
                                      </Typography>
                                      {applicant.resume_url && (
                                        <Button
                                          variant="outlined"
                                          size="small"
                                          onClick={() => handleViewPDF(applicant.resume_url)}
                                          startIcon={<Eye size={16} />}
                                          sx={{ py: 0.5, minHeight: 30 }}
                                        >
                                          View Resume
                                        </Button>
                                      )}
                                    </Box>
                                  </Stack>
                                </Grid>
                              </Grid>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          /* Mobile Card View */
          <Box sx={{ p: 2 }}>
            <Box sx={{ mb: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={`${sortField}-${sortDirection}`}
                  label="Sort By"
                  onChange={(e) => {
                    const [field, direction] = e.target.value.split('-');
                    setSortField(field as any);
                    setSortDirection(direction as any);
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
                          label={formatStatus(applicant.status)}
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
                        {applicant.portfolio_url && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 90, fontWeight: 500 }}>
                              Portfolio:
                            </Typography>
                            <Typography
                              variant="body2"
                              component="a"
                              href={applicant.portfolio_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={applicant.portfolio_url}
                              sx={{
                                color: 'primary.main',
                                textDecoration: 'none',
                                fontWeight: 500,
                                wordBreak: 'break-all',
                                '&:hover': { textDecoration: 'underline' },
                              }}
                            >
                              {formatLinkPreview(applicant.portfolio_url)}
                            </Typography>
                          </Box>
                        )}
                        {applicant.cover_letter && (
                          <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 500 }}>
                              Cover Letter:
                            </Typography>
                            <Paper variant="outlined" sx={{ p: 1, bgcolor: 'action.hover' }}>
                              <Typography variant="caption" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                                {applicant.cover_letter}
                              </Typography>
                            </Paper>
                          </Box>
                        )}
                      </Stack>
                    </Box>
                    <CardActions sx={{ px: 2, pb: 2, pt: 0, justifyContent: 'flex-end' }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Eye size={16} />}
                        onClick={() => handleViewApplication(applicant.id)}
                        sx={{ minWidth: 100 }}
                      >
                        View
                      </Button>
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
        <MenuItem onClick={() => selectedApplicant && handleViewApplication(selectedApplicant.id)}>
          <ListItemIcon>
            <Eye size={18} />
          </ListItemIcon>
          <ListItemText>View Application</ListItemText>
        </MenuItem>
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
        <DialogTitle>
          Update Application Status
          {editingApplicant && (
            <Chip
              label={formatStatus(editingApplicant.status)}
              size="small"
              color={getStatusColor(editingApplicant.status) as any}
              sx={{ ml: 2, verticalAlign: 'middle' }}
            />
          )}
        </DialogTitle>
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
    </Box>
  );
}
