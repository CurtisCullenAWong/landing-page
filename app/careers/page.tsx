'use client';

import { useState, useMemo } from 'react';
import { useJobs } from '../../contexts/JobContext';
import { MapPin, Briefcase, Clock, Calendar, Search, X, ChevronDown, ChevronUp } from 'lucide-react';
import { ImageWithFallback } from '../../components/layout/ImageWithFallback';
import { IMAGE_URLS, getImageMetadata } from '../../constants/images';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Card,
  CardContent,
  useTheme,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TablePagination,
  TableSortLabel,
  InputAdornment,
  Collapse,
} from '@mui/material';
import Link from 'next/link';
import { JobListingsSkeleton } from '@/components/loading';
import { usePageTitle } from '../../lib/usePageTitle';

type SortField = 'title' | 'department' | 'location' | 'type' | 'postedDate';
type SortDirection = 'asc' | 'desc';

export default function JobPostingsPage() {
  usePageTitle('Careers');
  const { jobs, isLoading } = useJobs();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Filter out null jobs and only show active ones
  const activeJobs = jobs.filter(job => job && job.status === 'active');

  // Search, filter, sort, and pagination state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterLocation, setFilterLocation] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('postedDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  // Get unique values for filter dropdowns
  const uniqueDepartments = useMemo(() => {
    const depts = new Set(activeJobs.map(job => job.department));
    return Array.from(depts).sort();
  }, [activeJobs]);

  const uniqueTypes = useMemo(() => {
    const types = new Set(activeJobs.map(job => job.type));
    return Array.from(types).sort();
  }, [activeJobs]);

  const uniqueLocations = useMemo(() => {
    const locations = new Set(activeJobs.map(job => job.location));
    return Array.from(locations).sort();
  }, [activeJobs]);

  // Filter, search, and sort jobs
  const filteredAndSortedJobs = useMemo(() => {
    let filtered = [...activeJobs];

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(query) ||
        job.department.toLowerCase().includes(query) ||
        job.location.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query) ||
        job.salary.toLowerCase().includes(query)
      );
    }

    // Apply filters
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
        case 'type':
          aValue = a.type.toLowerCase();
          bValue = b.type.toLowerCase();
          break;
        case 'postedDate':
          aValue = new Date(a.postedDate).getTime();
          bValue = new Date(b.postedDate).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [activeJobs, searchQuery, filterDepartment, filterType, filterLocation, sortField, sortDirection]);

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
    setFilterDepartment('all');
    setFilterType('all');
    setFilterLocation('all');
    setPage(0);
  };

  if (isLoading) {
    return <JobListingsSkeleton />;
  }

  return (
    <Box>
      {/* Slide 1: Professional Development (Boss Cargo University) */}
      <Box
        sx={{
          minHeight: 'calc(100vh - 80px)',
          display: 'flex',
          alignItems: 'center',
          scrollSnapAlign: 'start',
          scrollSnapStop: 'always',
          py: { xs: 8, md: 0 }
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h3" sx={{ mb: 6, fontWeight: 700, textAlign: 'center', color: 'primary.main' }}>
            Professional Development
          </Typography>
          <Grid container spacing={6} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <ImageWithFallback
                src={IMAGE_URLS.JOBS_OFFICE_ENVIRONMENT}
                alt={getImageMetadata(IMAGE_URLS.JOBS_OFFICE_ENVIRONMENT).alt}
                layout="responsive"
                aspectRatio="4:3"
                rounded={12}
                shadow={4}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                sx={{
                  p: 5,
                  bgcolor: isDark ? 'action.hover' : 'action.selected',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  borderRadius: 3,
                  boxShadow: 2
                }}
              >
                <Typography variant="h4" sx={{ mb: 3, fontWeight: 700, color: 'primary.main' }}>
                  Boss Cargo University
                </Typography>
                <Typography variant="body1" color="text.primary" sx={{ mb: 3, lineHeight: 1.8, fontSize: '1.1rem' }}>
                  Our aspiration to continually empower and educate our employees has led us to establish the Boss Cargo University. Its primary mission is to provide the highest freight and logistic education to our employees continuously mastering our craft.
                </Typography>
                <Typography variant="body1" color="text.primary" sx={{ lineHeight: 1.8, fontSize: '1.1rem' }}>
                  The program is designed for existing and onboarding employees to understand Boss Cargo's Brand DNA, culture, and equip them with the right skills for smart and sustainable operations.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '15vh',
            background: isDark 
              ? `linear-gradient(to bottom, transparent, ${theme.palette.background.default})`
              : `linear-gradient(to bottom, transparent, ${theme.palette.action.selected})`,
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      </Box>

      {/* Slide 2: Career Opportunities (Conditional) */}
      {activeJobs.length > 0 && (
        <Box
          sx={{
            minHeight: 'calc(100vh - 80px)',
            display: 'flex',
            alignItems: 'center',
            scrollSnapAlign: 'start',
            scrollSnapStop: 'always',
            bgcolor: isDark ? 'background.default' : 'action.selected',
            py: { xs: 8, md: 4 },
            position: 'relative'
          }}
        >
          <Container maxWidth="lg">
            <Card sx={{ boxShadow: 8, borderRadius: 3 }}>
              {/* Table Title */}
              <Box
                sx={{
                  px: 4,
                  py: 3,
                  bgcolor: isDark ? 'primary.dark' : 'primary.main',
                  color: isDark ? 'text.primary' : 'primary.contrastText',
                }}
              >
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  Active Opportunities
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                  Showing {filteredAndSortedJobs.length} position(s)
                </Typography>
              </Box>

              {/* Search and Filters */}
              <Paper sx={{ p: 3, mb: 0, borderRadius: 0, borderBottom: `1px solid ${theme.palette.divider}` }}>
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
                    <Search size={22} style={{ color: theme.palette.text.secondary }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: 1.5 }}>
                      Refine Your Search
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {(searchQuery || filterDepartment !== 'all' || filterType !== 'all' || filterLocation !== 'all') && (
                      <Button
                        variant="text"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleResetFilters();
                        }}
                        startIcon={<X size={18} />}
                        sx={{ mr: 1, fontWeight: 700 }}
                      >
                        Clear All
                      </Button>
                    )}
                    {filtersExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                  </Box>
                </Box>

                <Collapse in={filtersExpanded}>
                  <Box sx={{ mt: 3, pt: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          placeholder="Search positions..."
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
                      <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Dept</InputLabel>
                          <Select value={filterDepartment} label="Dept" onChange={(e) => { setFilterDepartment(e.target.value); setPage(0); }}>
                            <MenuItem value="all">All</MenuItem>
                            {uniqueDepartments.map((dept) => <MenuItem key={dept} value={dept}>{dept}</MenuItem>)}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Type</InputLabel>
                          <Select value={filterType} label="Type" onChange={(e) => { setFilterType(e.target.value); setPage(0); }}>
                            <MenuItem value="all">All</MenuItem>
                            {uniqueTypes.map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Location</InputLabel>
                          <Select value={filterLocation} label="Location" onChange={(e) => { setFilterLocation(e.target.value); setPage(0); }}>
                            <MenuItem value="all">All</MenuItem>
                            {uniqueLocations.map((loc) => <MenuItem key={loc} value={loc}>{loc}</MenuItem>)}
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </Box>
                </Collapse>
              </Paper>

              <TableContainer sx={{ display: { xs: 'none', md: 'block' }, maxHeight: '50vh' }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, bgcolor: 'action.hover' }}>
                        <TableSortLabel active={sortField === 'title'} direction={sortField === 'title' ? sortDirection : 'asc'} onClick={() => handleSort('title')}>Position</TableSortLabel>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, bgcolor: 'action.hover' }}>
                        <TableSortLabel active={sortField === 'department'} direction={sortField === 'department' ? sortDirection : 'asc'} onClick={() => handleSort('department')}>Department</TableSortLabel>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, bgcolor: 'action.hover' }}>Location</TableCell>
                      <TableCell sx={{ fontWeight: 700, bgcolor: 'action.hover' }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 700, bgcolor: 'action.hover' }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedJobs.length === 0 ? (
                      <TableRow><TableCell colSpan={5} align="center" sx={{ py: 8 }}><Typography color="text.secondary">No matching careers found.</Typography></TableCell></TableRow>
                    ) : (
                      paginatedJobs.map((job) => (
                        <TableRow key={job.id} hover>
                          <TableCell><Typography variant="body1" fontWeight={600}>{job.title}</Typography><Typography variant="caption" color="text.secondary">{job.salary}</Typography></TableCell>
                          <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Briefcase size={16} />{job.department}</Box></TableCell>
                          <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><MapPin size={16} />{job.location}</Box></TableCell>
                          <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Clock size={16} />{job.type}</Box></TableCell>
                          <TableCell><Button component={Link} href={`/careers/job-details/${job.id}`} variant="contained" size="small">Details</Button></TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                <TablePagination component="div" count={filteredAndSortedJobs.length} page={page} onPageChange={handleChangePage} rowsPerPage={rowsPerPage} onRowsPerPageChange={handleChangeRowsPerPage} rowsPerPageOptions={[5, 10, 25]} />
              </TableContainer>

              <Box sx={{ display: { xs: 'block', md: 'none' }, p: 2 }}>
                {paginatedJobs.map((job) => (
                  <Card key={job.id} sx={{ mb: 2, border: `1px solid ${theme.palette.divider}` }}>
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>{job.title}</Typography>
                      <Grid container spacing={1} sx={{ mb: 2 }}>
                        <Grid size={6}><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.75rem' }}><Briefcase size={14} />{job.department}</Box></Grid>
                        <Grid size={6}><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.75rem' }}><MapPin size={14} />{job.location}</Box></Grid>
                      </Grid>
                      <Button component={Link} href={`/careers/job-details/${job.id}`} variant="contained" fullWidth size="small">View Details</Button>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Card>
          </Container>
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '15vh',
              background: `linear-gradient(to bottom, transparent, ${theme.palette.background.default})`,
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />
        </Box>
      )}

      {/* Slide 3: Final Overview & CTA (The Last Section) */}
      <Box
        sx={{
          minHeight: 'calc(100vh - 80px)',
          display: 'flex',
          alignItems: 'center',
          scrollSnapAlign: 'start',
          scrollSnapStop: 'always',
          py: { xs: 8, md: 0 }
        }}
      >
        <Container maxWidth="lg">
          {/* Header Combined Section */}
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h2" sx={{ mb: 2, fontWeight: 800, color: 'primary.main' }}>
              Join Our Team
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '800px', mx: 'auto' }}>
              Explore exciting career opportunities at Boss Cargo Express. We're looking for talented
              individuals to help us shape the future of logistics.
            </Typography>
          </Box>

          <Grid container spacing={4} alignItems="stretch">
            {/* Left Column: Status Card */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Paper
                sx={{
                  p: 4,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  bgcolor: isDark ? 'action.hover' : 'action.selected',
                  borderRadius: 4,
                  textAlign: 'center',
                  border: `2px solid ${theme.palette.primary.main}`,
                  boxShadow: 4
                }}
              >
                <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
                  Current Status
                </Typography>
                <Box sx={{ my: 2 }}>
                  <Typography variant="h6" sx={{ display: 'inline', color: 'text.secondary' }}>
                    Open Position(s):
                  </Typography>
                  <Typography variant="h2" sx={{ display: 'inline', ml: 2, fontWeight: 800, color: 'primary.main' }}>
                    {activeJobs.length}
                  </Typography>
                </Box>
                {activeJobs.length === 0 && (
                  <Paper sx={{ p: 2, mt: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                      No open positions at the moment. Please check back later!
                    </Typography>
                  </Paper>
                )}
                <Typography variant="caption" sx={{ mt: 3, display: 'block', color: 'text.secondary', fontStyle: 'italic' }}>
                  For Job and Intern Inquiries: please write to people@bosscargo.express
                </Typography>
              </Paper>
            </Grid>

            {/* Right Column: CTA Combined Card */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Paper
                sx={{
                  p: 4,
                  height: '100%',
                  background: isDark
                    ? `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.primary.dark} 100%)`
                    : `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                  color: isDark ? 'text.primary' : 'primary.contrastText',
                  borderRadius: 4,
                  boxShadow: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
              >
                <Grid container spacing={3} alignItems="center">
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <ImageWithFallback
                      src={IMAGE_URLS.JOBS_CAREER_GROWTH.src}
                      alt={getImageMetadata(IMAGE_URLS.JOBS_CAREER_GROWTH.src).alt}
                      layout="responsive"
                      rounded={4}
                      shadow={2}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 8 }}>
                    <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
                      Don't See the Right Position?
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 4, opacity: 0.9, lineHeight: 1.6 }}>
                      We're always interested in hearing from talented professionals. Send us your resume
                      and we'll keep you in mind for future opportunities.
                    </Typography>
                    <Button
                      component={Link}
                      href="/careers/apply"
                      variant="contained"
                      size="large"
                      sx={{
                        bgcolor: 'background.paper',
                        color: isDark ? 'text.primary' : 'primary.main',
                        fontWeight: 800,
                        px: 4,
                        '&:hover': {
                          bgcolor: 'action.hover',
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.3s'
                      }}
                    >
                      General Application
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}
