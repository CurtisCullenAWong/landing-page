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
  useTheme,
  Grid,
  alpha
} from '@mui/material';
import { Search, ChevronDown, ChevronUp, X, MapPin, Briefcase } from 'lucide-react';
import { formatStatus } from '@/lib/utils';
import { Job } from '@/contexts/JobContext';

interface JobTableProps {
  jobs: Job[];
  title?: string;
  compact?: boolean;
}

export default function JobTable({
  jobs,
  title = "Job Postings",
  compact = false
}: JobTableProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(compact ? 5 : 10);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [sortField, setSortField] = useState<'title' | 'department' | 'location' | 'status' | 'postedDate'>('postedDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const filteredJobs = useMemo(() => {
    let filtered = [...jobs];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(job =>
        (job.title || '').toLowerCase().includes(query) ||
        (job.department || '').toLowerCase().includes(query) ||
        (job.location || '').toLowerCase().includes(query)
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(job => job.status === filterStatus);
    }

    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case 'title':
          aValue = (a.title || '').toLowerCase();
          bValue = (b.title || '').toLowerCase();
          break;
        case 'department':
          aValue = (a.department || '').toLowerCase();
          bValue = (b.department || '').toLowerCase();
          break;
        case 'location':
          aValue = (a.location || '').toLowerCase();
          bValue = (b.location || '').toLowerCase();
          break;
        case 'status':
          aValue = (a.status || '').toLowerCase();
          bValue = (b.status || '').toLowerCase();
          break;
        case 'postedDate':
          const timeA = a.postedDate ? new Date(a.postedDate).getTime() : 0;
          const timeB = b.postedDate ? new Date(b.postedDate).getTime() : 0;
          aValue = isNaN(timeA) ? 0 : timeA;
          bValue = isNaN(timeB) ? 0 : timeB;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [jobs, searchQuery, filterStatus, sortField, sortDirection]);

  const paginatedJobs = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredJobs.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredJobs, page, rowsPerPage]);

  const handleSort = (field: any) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setPage(0);
  };

  return (
    <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3, overflow: 'hidden' }}>
      <Box sx={{ px: 3, py: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        {!compact && (
          <Button
            size="small"
            startIcon={filtersExpanded ? <ChevronUp size={18} /> : <Search size={18} />}
            onClick={() => setFiltersExpanded(!filtersExpanded)}
            sx={{ fontWeight: 600 }}
          >
            {filtersExpanded ? 'Hide Filters' : 'Search & Filter'}
          </Button>
        )}
      </Box>

      <Collapse in={filtersExpanded}>
        <Box sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${theme.palette.divider}`, bgcolor: alpha(theme.palette.primary.main, 0.01) }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 8 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search jobs..."
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
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="closed">Closed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      </Collapse>

      <TableContainer>
        <Table size={compact ? "small" : "medium"}>
          <TableHead>
            <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
              <TableCell sx={{ fontWeight: 700, py: 2 }}>
                <TableSortLabel
                  active={sortField === 'title'}
                  direction={sortField === 'title' ? sortDirection : 'asc'}
                  onClick={() => handleSort('title')}
                  sx={{ fontWeight: 700 }}
                >
                  Job Title
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 700, py: 2 }}>
                <TableSortLabel
                  active={sortField === 'department'}
                  direction={sortField === 'department' ? sortDirection : 'asc'}
                  onClick={() => handleSort('department')}
                  sx={{ fontWeight: 700 }}
                >
                  Department
                </TableSortLabel>
              </TableCell>
              {!compact && (
                <TableCell sx={{ fontWeight: 700, py: 2 }}>
                  <TableSortLabel
                    active={sortField === 'location'}
                    direction={sortField === 'location' ? sortDirection : 'asc'}
                    onClick={() => handleSort('location')}
                    sx={{ fontWeight: 700 }}
                  >
                    Location
                  </TableSortLabel>
                </TableCell>
              )}
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
              {!compact && (
                <TableCell sx={{ fontWeight: 700, py: 2 }}>
                  UUID
                </TableCell>
              )}
              <TableCell align="right" sx={{ fontWeight: 700, py: 2 }}>
                <TableSortLabel
                  active={sortField === 'postedDate'}
                  direction={sortField === 'postedDate' ? sortDirection : 'asc'}
                  onClick={() => handleSort('postedDate')}
                  sx={{ fontWeight: 700 }}
                >
                  Posted
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedJobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={compact ? 4 : 5} align="center" sx={{ py: 8 }}>
                  <Typography variant="body2" color="text.secondary">No jobs found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedJobs.map((job) => (
                <TableRow key={job.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{job.title}</TableCell>
                  <TableCell>{job.department}</TableCell>
                  {!compact && (
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <MapPin size={14} />
                        {job.location}
                      </Box>
                    </TableCell>
                  )}
                  <TableCell>
                    <Chip
                      label={job.status}
                      size="small"
                      color={job.status === 'active' ? 'success' : 'default'}
                      variant={job.status === 'active' ? 'filled' : 'outlined'}
                      sx={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'capitalize' }}
                    />
                  </TableCell>
                  {!compact && (
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'text.secondary' }}>
                      {job.id}
                    </TableCell>
                  )}
                  <TableCell align="right" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
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
