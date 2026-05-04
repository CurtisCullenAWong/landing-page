'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TablePagination,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  Button,
  Collapse,
  TableSortLabel,
  useTheme
} from '@mui/material';
import { Search, ChevronDown, ChevronUp, X } from 'lucide-react';
import { formatStatus } from '@/lib/utils';

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

interface ApplicantTableProps {
  applicants: JobApplicant[];
  jobTitlesMap: Map<string, string>;
  title?: string;
  compact?: boolean;
}

const STATUS_OPTIONS: JobApplicant['status'][] = [
  'pending', 'reviewing', 'interviewing', 'offer', 'hired', 'rejected', 'withdrawn'
];

export default function ApplicantTable({
  applicants,
  jobTitlesMap,
  title = "Job Applicants",
  compact = false
}: ApplicantTableProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(compact ? 5 : 10);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [sortField, setSortField] = useState<'name' | 'email' | 'job_title' | 'status' | 'applied_at'>('applied_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const filteredApplicants = useMemo(() => {
    let filtered = [...applicants];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(applicant =>
        applicant.first_name.toLowerCase().includes(query) ||
        applicant.last_name.toLowerCase().includes(query) ||
        applicant.email.toLowerCase().includes(query) ||
        (applicant.job_id ? jobTitlesMap.get(applicant.job_id)?.toLowerCase().includes(query) : 'general application'.includes(query))
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(applicant => applicant.status === filterStatus);
    }

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

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [applicants, searchQuery, filterStatus, sortField, sortDirection, jobTitlesMap]);

  const paginatedApplicants = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredApplicants.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredApplicants, page, rowsPerPage]);

  const handleSort = (field: any) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setPage(0);
  };

  const getStatusColor = (status: JobApplicant['status']) => {
    switch (status) {
      case 'pending': return 'default';
      case 'reviewing': return 'info';
      case 'interviewing': return 'warning';
      case 'offer': return 'success';
      case 'hired': return 'success';
      case 'rejected': return 'error';
      case 'withdrawn': return 'default';
      default: return 'default';
    }
  };

  return (
    <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3 }}>
      <Box sx={{ px: 3, py: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        {!compact && (
          <Button
            size="small"
            startIcon={filtersExpanded ? <ChevronUp size={18} /> : <Search size={18} />}
            onClick={() => setFiltersExpanded(!filtersExpanded)}
          >
            {filtersExpanded ? 'Hide Filters' : 'Search & Filter'}
          </Button>
        )}
      </Box>

      <Collapse in={filtersExpanded}>
        <Box sx={{ px: 3, pb: 3, pt: 1 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 8 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search applicants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Search size={18} /></InputAdornment>,
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  label="Status"
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  {STATUS_OPTIONS.map(status => (
                    <MenuItem key={status} value={status}>{formatStatus(status)}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      </Collapse>

      <TableContainer>
        <Table size={compact ? "small" : "medium"}>
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'name'}
                  direction={sortField === 'name' ? sortDirection : 'asc'}
                  onClick={() => handleSort('name')}
                >
                  Name
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'job_title'}
                  direction={sortField === 'job_title' ? sortDirection : 'asc'}
                  onClick={() => handleSort('job_title')}
                >
                  Job Title
                </TableSortLabel>
              </TableCell>
              {!compact && (
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'email'}
                    direction={sortField === 'email' ? sortDirection : 'asc'}
                    onClick={() => handleSort('email')}
                  >
                    Email
                  </TableSortLabel>
                </TableCell>
              )}
              <TableCell>
                <TableSortLabel
                  active={sortField === 'status'}
                  direction={sortField === 'status' ? sortDirection : 'asc'}
                  onClick={() => handleSort('status')}
                >
                  Status
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={sortField === 'applied_at'}
                  direction={sortField === 'applied_at' ? sortDirection : 'asc'}
                  onClick={() => handleSort('applied_at')}
                >
                  Date
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedApplicants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={compact ? 4 : 5} align="center" sx={{ py: 8 }}>
                  <Typography variant="body2" color="text.secondary">No applicants found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedApplicants.map((applicant) => (
                <TableRow key={applicant.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{applicant.first_name} {applicant.last_name}</TableCell>
                  <TableCell>{applicant.job_id ? (jobTitlesMap.get(applicant.job_id) || 'Unknown') : 'General'}</TableCell>
                  {!compact && <TableCell>{applicant.email}</TableCell>}
                  <TableCell>
                    <Chip
                      label={formatStatus(applicant.status)}
                      size="small"
                      color={getStatusColor(applicant.status) as any}
                      sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                    {applicant.applied_at ? new Date(applicant.applied_at).toLocaleDateString() : 'N/A'}
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
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={compact ? [5] : [5, 10, 25]}
      />
    </Card>
  );
}

// Fixed Grid import for MUI v6 or similar if needed
import { Grid } from '@mui/material';
