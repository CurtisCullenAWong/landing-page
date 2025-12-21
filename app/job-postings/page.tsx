'use client';

import { useState, useMemo } from 'react';
import { useJobs } from '../../contexts/JobContext';
import { MapPin, Briefcase, Clock, Calendar, Search, X } from 'lucide-react';
import { ImageWithFallback } from '../../components/ImageWithFallback';
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
    <Box sx={{ py: 8 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h2" sx={{ mb: 2, fontWeight: 700 }}>
            Join Our Team
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '800px', mx: 'auto', mb: 4 }}>
            Explore exciting career opportunities at Boss Cargo Express. We're looking for talented 
            individuals to help us shape the future of logistics. For Job and Intern Inquiries: please write to people@bosscargo.express
          </Typography>
        </Box>

        {/* Jobs Count */}
        <Paper
          sx={{
            p: 3,
            mb: 4,
            bgcolor: isDark ? 'action.hover' : 'action.selected',
            textAlign: 'center',
          }}
        >
          <Typography
            variant="h5"
            sx={{ ml: 1, mr: 1, display: 'inline', color: 'text.primary' }}
          >
            Open Position(s):
          </Typography>
          <Typography
            variant="h3"
            sx={{ color: 'primary.main', fontWeight: 700, display: 'inline' }}
          >
            {filteredAndSortedJobs.length}
          </Typography>
        </Paper>

        {/* Search and Filters */}
        {activeJobs.length > 0 && (
          <Paper sx={{ p: 3, mb: 4 }}>
            <Grid container spacing={2} alignItems="center">
              {/* Search */}
              <Grid size={{ xs: 12, md: 6 }}>
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
              {(searchQuery || filterDepartment !== 'all' || filterType !== 'all' || filterLocation !== 'all') && (
                <Grid size={{ xs: 12 }}>
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
          </Paper>
        )}

        {/* Job Listings */}
        {activeJobs.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <TableContainer component={Paper} sx={{ display: { xs: 'none', md: 'block' }, mb: 4 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: isDark ? 'primary.dark' : 'primary.main' }}>
                    <TableCell sx={{ color: isDark ? 'text.primary' : 'primary.contrastText', fontWeight: 600 }}>
                      <TableSortLabel
                        active={sortField === 'title'}
                        direction={sortField === 'title' ? sortDirection : 'asc'}
                        onClick={() => handleSort('title')}
                        sx={{ color: isDark ? 'text.primary' : 'primary.contrastText', '& .MuiTableSortLabel-icon': { color: isDark ? 'text.primary' : 'primary.contrastText !important' } }}
                      >
                        Position
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ color: isDark ? 'text.primary' : 'primary.contrastText', fontWeight: 600 }}>
                      <TableSortLabel
                        active={sortField === 'department'}
                        direction={sortField === 'department' ? sortDirection : 'asc'}
                        onClick={() => handleSort('department')}
                        sx={{ color: isDark ? 'text.primary' : 'primary.contrastText', '& .MuiTableSortLabel-icon': { color: isDark ? 'text.primary' : 'primary.contrastText !important' } }}
                      >
                        Department
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ color: isDark ? 'text.primary' : 'primary.contrastText', fontWeight: 600 }}>
                      <TableSortLabel
                        active={sortField === 'location'}
                        direction={sortField === 'location' ? sortDirection : 'asc'}
                        onClick={() => handleSort('location')}
                        sx={{ color: isDark ? 'text.primary' : 'primary.contrastText', '& .MuiTableSortLabel-icon': { color: isDark ? 'text.primary' : 'primary.contrastText !important' } }}
                      >
                        Location
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ color: isDark ? 'text.primary' : 'primary.contrastText', fontWeight: 600 }}>
                      <TableSortLabel
                        active={sortField === 'type'}
                        direction={sortField === 'type' ? sortDirection : 'asc'}
                        onClick={() => handleSort('type')}
                        sx={{ color: isDark ? 'text.primary' : 'primary.contrastText', '& .MuiTableSortLabel-icon': { color: isDark ? 'text.primary' : 'primary.contrastText !important' } }}
                      >
                        Type
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ color: isDark ? 'text.primary' : 'primary.contrastText', fontWeight: 600 }}>
                      <TableSortLabel
                        active={sortField === 'postedDate'}
                        direction={sortField === 'postedDate' ? sortDirection : 'asc'}
                        onClick={() => handleSort('postedDate')}
                        sx={{ color: isDark ? 'text.primary' : 'primary.contrastText', '& .MuiTableSortLabel-icon': { color: isDark ? 'text.primary' : 'primary.contrastText !important' } }}
                      >
                        Posted
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ color: isDark ? 'text.primary' : 'primary.contrastText', fontWeight: 600 }}>Action</TableCell>
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
                        <TableCell>
                          <Box>
                            <Typography variant="body1" fontWeight={500}>
                              {job.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {job.salary}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Briefcase size={16} style={{ color: theme.palette.text.secondary }} />
                            <Typography variant="body2">{job.department}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <MapPin size={16} style={{ color: theme.palette.text.secondary }} />
                            <Typography variant="body2">{job.location}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Clock size={16} style={{ color: theme.palette.text.secondary }} />
                            <Typography variant="body2">{job.type}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Calendar size={16} style={{ color: theme.palette.text.secondary }} />
                            <Typography variant="body2">
                              {new Date(job.postedDate).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Button
                            component={Link}
                            href={`/job-postings/job-details/${job.id}`}
                            variant="contained"
                            size="small"
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
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
            </TableContainer>

            {/* Mobile Card View */}
            <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 4 }}>
              {paginatedJobs.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    No job postings found matching your criteria.
                  </Typography>
                </Paper>
              ) : (
                <>
                  {paginatedJobs.map((job) => (
                    <Card key={job.id} sx={{ mb: 2 }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                          {job.title}
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Briefcase size={16} style={{ color: theme.palette.text.secondary }} />
                            <Typography variant="body2" color="text.secondary">
                              {job.department}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <MapPin size={16} style={{ color: theme.palette.text.secondary }} />
                            <Typography variant="body2" color="text.secondary">
                              {job.location}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Clock size={16} style={{ color: theme.palette.text.secondary }} />
                            <Typography variant="body2" color="text.secondary">
                              {job.type}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Calendar size={16} style={{ color: theme.palette.text.secondary }} />
                            <Typography variant="body2" color="text.secondary">
                              {new Date(job.postedDate).toLocaleDateString()}
                            </Typography>
                          </Box>
                          <Typography variant="body2" fontWeight={500}>
                            {job.salary}
                          </Typography>
                        </Box>
                        <Button
                          component={Link}
                          href={`/job-postings/job-details/${job.id}`}
                          variant="contained"
                          fullWidth
                        >
                          View Details
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                  {/* Pagination for Mobile */}
                  <Paper sx={{ mt: 2, p: 2 }}>
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
                  </Paper>
                </>
              )}
            </Box>
          </>
        ) : (
          <Paper sx={{ p: 6, textAlign: 'center', mb: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No open positions at the moment. Please check back later!
            </Typography>
          </Paper>
        )}
        {/* Boss Cargo University */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <ImageWithFallback
              src={IMAGE_URLS.JOBS_OFFICE_ENVIRONMENT}
              alt={getImageMetadata(IMAGE_URLS.JOBS_OFFICE_ENVIRONMENT).alt}
              layout="responsive"
              aspectRatio="4:3"
              rounded={8}
              shadow={2}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              sx={{
                p: 4,
                height: '100%',
                bgcolor: isDark ? 'action.hover' : 'action.selected',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <Typography variant="h3" sx={{ mb: 3, fontWeight: 600 }}>
                Boss Cargo University
              </Typography>
              <Typography variant="body1" color="text.primary" sx={{ mb: 2, fontSize: '1.1rem', lineHeight: 1.8 }}>
                Our aspiration to continually empower and educate our employees has led us to establish the Boss Cargo University. Its primary mission is to provide the highest freight and logistic education to our employees continuously mastering our craft. All classes in the freight and logistics management certificate program are taught by Boss Cargo University faculty members who have a combination of academic and professional expertise.
              </Typography>
              <Typography variant="body1" color="text.primary" sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                The program is designed for existing and onboarding employees to understand Boss Cargo's Brand DNA, culture, and equip them with the right skills for smart and sustainable operations.
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Additional Info */}
        <Paper
          sx={{
            p: 4,
            background: isDark
              ? `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.primary.dark} 100%)`
              : 'linear-gradient(135deg,rgb(15, 106, 103) 0%,rgb(50, 139, 139) 100%)',
            color: isDark ? 'text.primary' : 'primary.contrastText',
          }}
        >
          <Box sx={{ mb: 4 }}>
            <ImageWithFallback
              src={IMAGE_URLS.JOBS_CAREER_GROWTH}
              alt={getImageMetadata(IMAGE_URLS.JOBS_CAREER_GROWTH).alt}
              layout="responsive"
              aspectRatio="21:9"
              rounded={8}
              shadow={2}
            />
          </Box>
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
            Don't See the Right Position?
          </Typography>
          <Typography variant="h6" sx={{ mb: 3 }}>
            We're always interested in hearing from talented professionals. Send us your resume 
            and we'll keep you in mind for future opportunities.
          </Typography>
          <Button
            component="a"
            href="mailto:people@bosscargo.express?subject=Job Application"
            variant="contained"
            size="large"
            sx={{
              bgcolor: 'background.paper',
              color: isDark ? 'text.primary' : 'primary.main',
              '&:hover': {
                bgcolor: isDark ? 'action.hover' : 'action.selected',
                color: isDark ? 'text.primary' : 'primary.main',
              },
            }}
          >
            Submit Job Application
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}
