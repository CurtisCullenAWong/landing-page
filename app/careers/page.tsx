'use client';

import { useState, useMemo, useEffect } from 'react';

import { useJobs } from '../../contexts/JobContext';
import { MapPin, Briefcase, Clock, Search, X, ChevronDown, ChevronUp, GraduationCap, Target, Users, Sparkles, ArrowRight } from 'lucide-react';
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
  alpha,
  Stack,
  Divider,
  Chip,
} from '@mui/material';
import Link from 'next/link';
import { JobListingsSkeleton } from '@/components/loading';
import { usePageTitle } from '../../lib/usePageTitle';
import { SITE_CONTENT } from '../../constants/site-content';
import { motion } from 'framer-motion';

const SectionTransition = ({ toColor, position = 'bottom' }: { toColor: string; position?: 'top' | 'bottom' }) => (
  <Box
    sx={{
      position: 'absolute',
      [position]: 0,
      left: 0,
      right: 0,
      height: '15dvh',
      background: `linear-gradient(to ${position === 'bottom' ? 'bottom' : 'top'}, transparent, ${toColor})`,
      pointerEvents: 'none',
      zIndex: 1,
    }}
  />
);

type SortField = 'title' | 'department' | 'location' | 'type' | 'postedDate';
type SortDirection = 'asc' | 'desc';

// Shared "Corner Brackets" component for architectural emphasis
const CornerBrackets = ({
  color,
  size = 24,
  radius = 16,
  hideTopLeft = false,
  hideBottomRight = false
}: {
  color: string,
  size?: number,
  radius?: number,
  hideTopLeft?: boolean,
  hideBottomRight?: boolean
}) => (
  <>
    {!hideTopLeft && (
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: size,
        height: size,
        borderTop: `3px solid ${color}`,
        borderLeft: `3px solid ${color}`,
        borderTopLeftRadius: radius,
        zIndex: 1
      }} />
    )}
    {!hideBottomRight && (
      <Box sx={{
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: size,
        height: size,
        borderBottom: `3px solid ${color}`,
        borderRight: `3px solid ${color}`,
        borderBottomRightRadius: radius,
        zIndex: 1
      }} />
    )}
  </>
);

// Helper function to format date relatively
const getRelativeTimeString = (dateStr: string) => {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    // Reset hours to get exact day differences
    const dateMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffTime = nowMidnight.getTime() - dateMidnight.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 'Posted today';
    if (diffDays === 1) return 'Posted yesterday';
    if (diffDays <= 7) return `Posted ${diffDays} days ago`;
    return `Posted on ${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
  } catch (e) {
    return 'Recently posted';
  }
};

export default function JobPostingsPage() {
  usePageTitle('Careers');
  const { jobs, departments, isLoading } = useJobs();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';



  // Defensive Theme Extraction
  const primaryMain = theme.palette.primary?.main || '#00A39D';
  const primaryDark = theme.palette.primary?.dark || '#007A76';
  const secondaryMain = theme.palette.secondary?.main || '#202945';
  const secondaryDark = theme.palette.secondary?.dark || '#111626';
  const tertiaryMain = (theme.palette as any).tertiary?.main || '#FCE200';
  const tertiaryDark = (theme.palette as any).tertiary?.dark || '#C9B400';
  const bgColor = theme.palette.background?.default || '#ffffff';
  const paperColor = theme.palette.background?.paper || '#F8FAFC';

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
  const [sortOption, setSortOption] = useState<string>('postedDate_desc');

  const handleSortChange = (value: string) => {
    setSortOption(value);
    const [field, direction] = value.split('_') as [SortField, SortDirection];
    setSortField(field);
    setSortDirection(direction);
    setPage(0);
  };



  // Get values for filter dropdowns from context
  const uniqueDepartments = useMemo(() => {
    return departments.map(d => d.name);
  }, [departments]);

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
      const aFeatured = !!a.featured;
      const bFeatured = !!b.featured;

      if (aFeatured !== bFeatured) {
        return aFeatured ? -1 : 1;
      }

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
    setSortOption('postedDate_desc');
    setSortField('postedDate');
    setSortDirection('desc');
    setPage(0);
  };

  return (
    <Box sx={{
      bgcolor: bgColor,
      minHeight: 'calc(100dvh - 80px)',
      overflowX: 'hidden'
    }}>
      {isLoading ? (
        <Box sx={{ minHeight: 'calc(100dvh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <JobListingsSkeleton />
        </Box>
      ) : (
        <>
          {/* Slide 1: Professional Development */}
          <Box
            sx={{
              minHeight: 'calc(100dvh - 80px)',
              py: { xs: 8, md: 10 },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: { xs: 'flex-start', md: 'center' },
              alignItems: 'center',
              scrollSnapAlign: 'start',
              scrollSnapStop: 'always',
              position: 'relative'
            }}
          >
            {/* Background Architectural Elements */}
            <Box sx={{
              position: 'absolute',
              inset: 0,
              zIndex: 0,
              pointerEvents: 'none',
              overflow: 'hidden',
              maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
            }}>
              {/* Massive Squiggly Shape (Teal Gradient) */}
              <Box
                component={motion.div}
                animate={{
                  borderRadius: [
                    '40% 60% 70% 30% / 40% 40% 60% 60%',
                    '50% 50% 60% 40% / 45% 55% 45% 55%',
                    '40% 60% 70% 30% / 40% 40% 60% 60%'
                  ],
                  scale: [1, 1.05, 0.98, 1],
                  rotate: [-12, -8, -15, -12],
                  x: [0, 10, -10, 0],
                  y: [0, -15, 15, 0]
                }}
                transition={{
                  duration: 25 + Math.random() * 10,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                sx={{
                  position: 'absolute',
                  top: '-15%',
                  right: '-10%',
                  width: { xs: '150%', md: '1400px' },
                  height: { xs: '80%', md: '1000px' },
                  background: `linear-gradient(135deg, ${alpha(primaryMain, 0.15)}, ${alpha(tertiaryMain, 0.05)})`,
                  borderRadius: '40% 60% 70% 30% / 40% 40% 60% 60%',
                  transform: 'rotate(-12deg)',
                  filter: 'blur(60px)',
                }} />
              {/* Technical Grid Overlay */}
              <Box sx={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `radial-gradient(${alpha(primaryMain, 0.12)} 1.5px, transparent 1.5px)`,
                backgroundSize: '30px 30px',
                opacity: 0.8,
              }} />
              {/* Floating Architectural Square */}
              <Box sx={{
                position: 'absolute',
                top: '20%',
                left: '5%',
                width: { xs: '200px', md: '300px' },
                height: { xs: '200px', md: '300px' },
                border: `1px solid ${alpha(tertiaryMain, 0.2)}`,
                borderRadius: '20px',
                transform: 'rotate(45deg)',
                opacity: 0.5,
              }} />
            </Box>

            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
              <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center">
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ position: 'relative' }}>
                    {/* Decorative Offset Frame - Sharp & Bold */}
                    <Box sx={{
                      position: 'absolute',
                      inset: { xs: '-10px 10px 10px -10px', md: '-20px 20px 20px -20px' },
                      border: { xs: '4px solid', md: '6px solid' },
                      borderColor: tertiaryMain,
                      borderRadius: '40% 60% 70% 30% / 40% 40% 60% 60%',
                      zIndex: 0,
                      opacity: 0.9,
                      boxShadow: `0 0 30px ${alpha(tertiaryMain, 0.3)}, ${alpha(tertiaryMain, 0.2)} 10px 10px 0px`,
                    }} />
                    {/* Secondary Tertiary Support Frame */}
                    <Box sx={{
                      position: 'absolute',
                      inset: { xs: '5px -5px -5px 5px', md: '10px -10px -10px 10px' },
                      bgcolor: alpha(tertiaryMain, 0.1),
                      backdropFilter: 'blur(4px)',
                      border: `1px solid ${alpha(tertiaryMain, 0.3)}`,
                      borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
                      zIndex: 0,
                    }} />
                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                      <ImageWithFallback
                        src={IMAGE_URLS.JOBS_OFFICE_ENVIRONMENT}
                        alt={getImageMetadata(IMAGE_URLS.JOBS_OFFICE_ENVIRONMENT).alt}
                        layout="responsive"
                        aspectRatio="4:3"
                        sizes="(max-width: 900px) 100vw, 50vw"
                        rounded={4}
                        shadow={20}
                      />
                    </Box>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper
                    sx={{
                      p: { xs: 2.5, md: 3 },
                      bgcolor: alpha(isDark ? primaryDark : primaryMain, 0.05),
                      backdropFilter: 'blur(12px)',
                      border: `1px solid ${alpha(primaryMain, 0.2)}`,
                      borderRadius: 2, // 16px
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: 8
                    }}
                  >
                    <CornerBrackets color={tertiaryMain} radius={16} hideTopLeft={true} />
                    <Stack spacing={3}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          px: { xs: 1, md: 2 },
                          py: { xs: 1.5, md: 2 },
                          borderRadius: 3,
                          bgcolor: '#F7F3EC',
                          border: `1px solid ${alpha('#000', 0.08)}`,
                        }}
                      >
                        <Box sx={{ width: '100%', maxWidth: 520 }}>
                          <ImageWithFallback
                            src={IMAGE_URLS.JOBS_BCU}
                            alt="Boss Cargo University logo"
                            layout="responsive"
                            aspectRatio="21:9"
                            objectFit="contain"
                            rounded={0}
                            priority
                            style={{ width: '100%' }}
                          />
                        </Box>
                      </Box>

                      <Typography variant="body1" color="text.primary" sx={{ lineHeight: 1.8, fontSize: { xs: '1rem', md: '1.125rem' }, fontWeight: 500 }}>
                        {SITE_CONTENT.careers.university.description}
                      </Typography>

                      <Divider sx={{ opacity: 0.2 }} />

                      <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, fontSize: '1rem' }}>
                        {SITE_CONTENT.careers.university.details}
                      </Typography>

                      <Box sx={{ display: 'flex', gap: { xs: 1.5, md: 2 }, mt: 1 }}>
                        <Box sx={{ textAlign: 'center', flex: 1, p: { xs: 1.5, md: 2 }, bgcolor: alpha(tertiaryMain, 0.1), borderRadius: 2 }}>
                          <Typography variant="h5" sx={{ fontWeight: 800, color: primaryMain, fontSize: { xs: '1.25rem', md: '1.5rem' } }}>100%</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary', fontSize: '0.65rem' }}>Internal Training</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center', flex: 1, p: { xs: 1.5, md: 2 }, bgcolor: alpha(primaryMain, 0.1), borderRadius: 2 }}>
                          <Typography variant="h5" sx={{ fontWeight: 800, color: primaryMain, fontSize: { xs: '1.25rem', md: '1.5rem' } }}>Elite</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary', fontSize: '0.65rem' }}>Mastery Program</Typography>
                        </Box>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>
              </Grid>
            </Container>

          </Box>
          {/* Slide 3: Final Overview & CTA */}
          <Box
            sx={{
              minHeight: 'calc(100dvh - 80px)',
              py: { xs: 8, md: 10 },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: { xs: 'flex-start', md: 'center' },
              alignItems: 'center',
              scrollSnapAlign: 'start',
              scrollSnapStop: 'always',
              position: 'relative',
              bgcolor: 'background.default',
              mb: { xs: 4, md: 0 },
              background: `linear-gradient(180deg, ${bgColor} 0%, ${alpha(tertiaryMain, 0.02)} 15%, ${bgColor} 100%)`
            }}
          >


            {/* Background Architectural Elements */}
            <Box sx={{
              position: 'absolute',
              inset: 0,
              zIndex: 0,
              pointerEvents: 'none',
              overflow: 'hidden',
              maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
            }}>
              {/* Massive Organic Shape (Yellow Gradient) */}
              <Box
                component={motion.div}
                animate={{
                  borderRadius: [
                    '40% 60% 30% 70% / 60% 30% 70% 40%',
                    '60% 40% 70% 30% / 30% 70% 40% 60%',
                    '40% 60% 30% 70% / 60% 30% 70% 40%'
                  ],
                  scale: [1, 1.08, 0.95, 1],
                  rotate: [20, 25, 15, 20],
                  x: [0, -20, 20, 0],
                  y: [0, 30, -30, 0]
                }}
                transition={{
                  duration: 30 + Math.random() * 10,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                sx={{
                  position: 'absolute',
                  top: '-25%',
                  left: '-15%',
                  width: { xs: '150%', md: '1200px' },
                  height: { xs: '100%', md: '1200px' },
                  background: `linear-gradient(135deg, ${alpha(tertiaryMain, 0.18)}, ${alpha(primaryMain, 0.05)})`,
                  borderRadius: '40% 60% 30% 70% / 60% 30% 70% 40%',
                  transform: 'rotate(20deg)',
                  filter: 'blur(80px)',
                }} />
              {/* Architectural Lines Overlay */}
              <Box sx={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `radial-gradient(${alpha(tertiaryMain, 0.15)} 2px, transparent 2px)`,
                backgroundSize: '60px 60px',
                opacity: 0.6,
              }} />
              {/* Technical Circle Outline (Vibrant) */}
              <Box sx={{
                position: 'absolute',
                bottom: '-20%',
                right: '-15%',
                width: { xs: '300px', md: '800px' },
                height: { xs: '300px', md: '800px' },
                border: `3px dashed ${alpha(primaryMain, 0.25)}`,
                borderRadius: '50%',
                opacity: 0.4,
              }} />
            </Box>

            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, minHeight: '100%', display: 'flex', flexDirection: 'column', justifyContent: { xs: 'flex-start', md: 'center' }, py: { xs: 2, md: 0 } }}>
              {/* Workforce Status Summary Bar - Optimized for large view */}
              <Box sx={{ mb: { xs: 1.5, md: 2 }, display: 'flex', justifyContent: 'center', width: '100%' }}>
                <Paper
                  variant="outlined"
                  sx={{
                    px: { xs: 2, md: 4 },
                    py: { xs: 2, md: 2 },
                    borderRadius: { xs: 4, md: 10 },
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: 'center',
                    gap: { xs: 1.5, md: 5 },
                    bgcolor: alpha(primaryMain, 0.05),
                    borderColor: alpha(primaryMain, 0.2),
                    backdropFilter: 'blur(12px)',
                    width: { xs: '100%', md: 'auto' },
                    textAlign: 'center'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Users size={20} color={primaryMain} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      Workforce: <span style={{ color: primaryMain }}>ACTIVE</span>
                    </Typography>
                  </Box>
                  <Divider orientation="vertical" flexItem sx={{ height: 24, my: 'auto', display: { xs: 'none', md: 'block' } }} />
                  <Divider sx={{ width: '80%', display: { xs: 'block', md: 'none' }, opacity: 0.1 }} />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Target size={20} color={tertiaryMain} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      Open Positions: <span style={{ color: primaryMain }}>{activeJobs.length}</span>
                    </Typography>
                  </Box>
                  <Divider orientation="vertical" flexItem sx={{ height: 24, my: 'auto', display: { xs: 'none', md: 'block' } }} />
                  <Divider sx={{ width: '80%', display: { xs: 'block', md: 'none' }, opacity: 0.1 }} />
                  <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: 0.5, fontSize: { xs: '0.7rem', sm: '0.875rem', md: '1rem' }, wordBreak: { xs: 'break-all', sm: 'normal' } }}>
                    {SITE_CONTENT.careers.application.email}
                  </Typography>
                </Paper>
              </Box>

              <Grid container spacing={0}>
                {/* Massive Hero CTA Card - Maximized View */}
                <Grid size={{ xs: 12 }}>
                  <Paper
                    sx={{
                      p: { xs: 2.5, md: 3 },
                      background: isDark
                        ? `linear-gradient(135deg, ${secondaryDark} 0%, ${primaryDark} 100%)`
                        : `linear-gradient(135deg, ${primaryDark} 0%, ${primaryMain} 100%)`,
                      color: 'white',
                      borderRadius: 2,
                      boxShadow: 24,
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <CornerBrackets color={tertiaryMain} radius={16} size={48} hideTopLeft={true} />
                    {/* Decorative Pattern overlay */}
                    <Box sx={{
                      position: 'absolute',
                      inset: 0,
                      opacity: 0.1,
                      backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                      backgroundSize: '32px 32px',
                      pointerEvents: 'none'
                    }} />

                    <Grid container spacing={{ xs: 3, md: 6 }} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
                      <Grid size={{ xs: 12, md: 7 }}>
                        <Box sx={{
                          position: 'relative',
                          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': { transform: { xs: 'none', md: 'scale(1.04) rotate(-0.5deg)' } },
                          mx: { xs: 2, md: 0 }
                        }}>
                          {/* Bold Architectural Frame - Expanded */}
                          <Box sx={{
                            position: 'absolute',
                            inset: { xs: '-12px', md: '-20px' },
                            border: { xs: '4px solid', md: '6px solid' },
                            borderColor: tertiaryMain,
                            borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
                            zIndex: 0,
                            boxShadow: `0 0 40px ${alpha(tertiaryMain, 0.4)}, 15px 15px 0px ${alpha(secondaryDark, 0.6)}`
                          }} />
                          {/* Secondary Tertiary Glass Backing */}
                          <Box sx={{
                            position: 'absolute',
                            inset: { xs: '10px -10px -10px 10px', md: '20px -20px -20px 20px' },
                            bgcolor: alpha(tertiaryMain, 0.15),
                            backdropFilter: 'blur(12px)',
                            borderRadius: '40% 60% 70% 30% / 40% 40% 60% 60%',
                            zIndex: 0,
                          }} />
                          <Box sx={{ position: 'relative', zIndex: 1 }}>
                            <ImageWithFallback
                              src={IMAGE_URLS.JOBS_CAREER_GROWTH.src}
                              alt={getImageMetadata(IMAGE_URLS.JOBS_CAREER_GROWTH.src).alt}
                              layout="responsive"
                              aspectRatio="21:9"
                              sizes="(max-width: 900px) 90vw, 400px"
                              rounded={2}
                              shadow={24}
                            />
                          </Box>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, md: 5 }} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                        <Typography variant="h1" sx={{ mb: { xs: 1, md: 1.5 }, fontWeight: 900, letterSpacing: { xs: -1, md: -3 }, lineHeight: 1, textTransform: 'uppercase', fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3.75rem', lg: '5rem' } }}>
                          Join Our <span style={{ color: tertiaryMain }}>Elite Team</span>
                        </Typography>
                        <Typography variant="h5" sx={{ mb: { xs: 2, md: 3 }, opacity: 0.9, lineHeight: 1.5, fontWeight: 400, fontSize: { xs: '0.9rem', md: '1.15rem' } }}>
                          We are constantly expanding our global team. Submit your professional credentials for future consideration.
                        </Typography>
                        <Button
                          component={Link}
                          href="/careers/apply"
                          variant="contained"
                          size="large"
                          sx={{
                            bgcolor: tertiaryMain,
                            color: secondaryDark,
                            fontWeight: 900,
                            px: { xs: 4, md: 6 },
                            py: 2,
                            fontSize: { xs: '0.9rem', md: '1.1rem' },
                            borderRadius: 2,
                            boxShadow: `0 8px 24px ${alpha(tertiaryMain, 0.4)}`,
                            '&:hover': {
                              bgcolor: alpha(tertiaryMain, 1),
                              transform: 'translateY(-4px) scale(1.0)',
                              boxShadow: `0 16px 48px ${alpha(tertiaryMain, 0.6)}`,
                            },
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            width: { xs: '100%', sm: 'auto' }
                          }}
                        >
                          Submit General Application
                        </Button>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
            </Container>
            {activeJobs.length === 0 && (
              <SectionTransition toColor={theme.palette.mode === 'dark' ? theme.palette.background.default : '#0B0F14'} />
            )}
          </Box>
          {/* Slide 2: Career Opportunities */}
          {activeJobs.length > 0 && (
            <Box
              sx={{
                minHeight: 'calc(100dvh - 80px)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: { xs: 'flex-start', md: 'center' },
                alignItems: 'center',
                scrollSnapAlign: 'start',
                scrollSnapStop: { xs: 'normal', md: 'always' },
                bgcolor: paperColor,
                background: `linear-gradient(180deg, ${bgColor} 0%, ${paperColor} 100%)`,
                py: { xs: 10, md: 15 }, // Increased padding
                pb: { xs: 24, md: 20 }, // Extra bottom margin/padding
                position: 'relative',
                overflow: 'visible', // Allow content to flow
                isolation: 'isolate'
              }}
            >

              {/* Background Elements */}
              <Box sx={{
                position: 'absolute',
                inset: 0,
                zIndex: 0,
                pointerEvents: 'none',
                overflow: 'hidden', // Contain background elements
                mixBlendMode: isDark ? 'screen' : 'multiply',
                maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
                WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
              }}>
                {/* Gradient Glow */}
                <Box sx={{
                  position: 'absolute',
                  bottom: '-20%',
                  left: '-15%',
                  width: { xs: '120%', md: '1000px' },
                  height: { xs: '80%', md: '1000px' },
                  background: `radial-gradient(circle, ${alpha(tertiaryMain, 0.15)} 0%, transparent 70%)`,
                  borderRadius: '50%',
                  filter: 'blur(100px)'
                }} />
                {/* Technical Detail: Rotating Frame */}
                <Box sx={{
                  position: 'absolute',
                  top: '5%',
                  right: '2%',
                  width: { xs: '300px', md: '500px' },
                  height: { xs: '300px', md: '500px' },
                  border: `2px dashed ${alpha(primaryMain, 0.15)}`,
                  borderRadius: '60px',
                  transform: 'rotate(25deg)',
                  animation: 'spin 120s linear infinite',
                  '@keyframes spin': {
                    from: { transform: 'rotate(25deg)' },
                    to: { transform: 'rotate(385deg)' }
                  }
                }} />
                {/* Secondary Grid */}
                <Box sx={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `linear-gradient(${alpha(theme.palette.divider, 0.05)} 1px, transparent 1px), linear-gradient(90deg, ${alpha(theme.palette.divider, 0.05)} 1px, transparent 1px)`,
                  backgroundSize: '100px 100px',
                }} />
              </Box>

              <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                <Card sx={{
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: 15,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  position: 'relative'
                }}>
                  <CornerBrackets color={tertiaryMain} radius={16} hideTopLeft={true} />

                  {/* Table Header */}
                  <Box
                    sx={{
                      px: 4,
                      py: 4,
                      background: isDark
                        ? `linear-gradient(135deg, ${secondaryDark} 0%, ${primaryDark} 100%)`
                        : `linear-gradient(135deg, ${primaryMain} 0%, ${primaryDark} 100%)`,
                      color: 'white',
                      position: 'relative'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Target size={32} color={tertiaryMain} />
                      <Typography variant="h3" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: -1, fontSize: { xs: '1.5rem', sm: '2rem', md: '3rem' } }}>
                        Active Opportunities
                      </Typography>
                    </Box>
                    <Typography variant="h6" sx={{ opacity: 0.8, fontWeight: 400 }}>
                      Join our elite team of {filteredAndSortedJobs.length} active professional role(s)
                    </Typography>
                  </Box>

                  {/* Search and Filters */}
                  <Paper sx={{ p: 3, borderRadius: 0, borderBottom: `1px solid ${theme.palette.divider}`, bgcolor: alpha(bgColor, 0.8), backdropFilter: 'blur(10px)' }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                      }}
                      onClick={() => setFiltersExpanded(!filtersExpanded)}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Search size={20} color={primaryMain} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2, color: 'text.secondary' }}>
                          Search
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {(searchQuery || filterDepartment !== 'all' || filterType !== 'all' || filterLocation !== 'all' || sortOption !== 'postedDate_desc') && (
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={(e) => { e.stopPropagation(); handleResetFilters(); }}
                            startIcon={<X size={14} />}
                            sx={{ borderRadius: 2, fontWeight: 700 }}
                          >
                            Reset
                          </Button>
                        )}
                        <Box sx={{ p: 0.5, bgcolor: alpha(primaryMain, 0.1), borderRadius: 1, color: primaryMain }}>
                          {filtersExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </Box>
                      </Box>
                    </Box>

                    <Collapse in={filtersExpanded}>
                      <Box sx={{ mt: 3, pt: 3, borderTop: `1px dashed ${theme.palette.divider}` }}>
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                              fullWidth
                              placeholder="Search job titles, skills, or keywords..."
                              value={searchQuery}
                              onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <Search size={18} color={primaryMain} />
                                  </InputAdornment>
                                ),
                                sx: { borderRadius: 2 }
                              }}
                              size="small"
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                            <FormControl fullWidth size="small">
                              <InputLabel>Department</InputLabel>
                              <Select value={filterDepartment} label="Department" onChange={(e) => { setFilterDepartment(e.target.value); setPage(0); }} sx={{ borderRadius: 2 }}>
                                <MenuItem value="all">All Departments</MenuItem>
                                {uniqueDepartments.map((dept) => <MenuItem key={dept} value={dept}>{dept}</MenuItem>)}
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                            <FormControl fullWidth size="small">
                              <InputLabel>Employment</InputLabel>
                              <Select value={filterType} label="Employment" onChange={(e) => { setFilterType(e.target.value); setPage(0); }} sx={{ borderRadius: 2 }}>
                                <MenuItem value="all">All Types</MenuItem>
                                {uniqueTypes.map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                            <FormControl fullWidth size="small">
                              <InputLabel>Location</InputLabel>
                              <Select value={filterLocation} label="Location" onChange={(e) => { setFilterLocation(e.target.value); setPage(0); }} sx={{ borderRadius: 2 }}>
                                <MenuItem value="all">All Areas</MenuItem>
                                {uniqueLocations.map((loc) => <MenuItem key={loc} value={loc}>{loc}</MenuItem>)}
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                            <FormControl fullWidth size="small">
                              <InputLabel>Sort By</InputLabel>
                              <Select value={sortOption} label="Sort By" onChange={(e) => handleSortChange(e.target.value as string)} sx={{ borderRadius: 2 }}>
                                <MenuItem value="postedDate_desc">Date (Newest)</MenuItem>
                                <MenuItem value="postedDate_asc">Date (Oldest)</MenuItem>
                                <MenuItem value="title_asc">Title (A-Z)</MenuItem>
                                <MenuItem value="title_desc">Title (Z-A)</MenuItem>
                                <MenuItem value="department_asc">Department (A-Z)</MenuItem>
                                <MenuItem value="location_asc">Location (A-Z)</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                        </Grid>
                      </Box>
                    </Collapse>
                  </Paper>

                  {/* Card-Based Job List */}
                  <Box sx={{ bgcolor: 'background.paper' }}>
                    {paginatedJobs.length === 0 ? (
                      <Box sx={{ py: 8, textAlign: 'center' }}>
                        <Stack alignItems="center" spacing={2}>
                          <Search size={40} color={theme.palette.text.disabled} />
                          <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                            No matching opportunities found.
                          </Typography>
                          <Button onClick={handleResetFilters} variant="text" size="small" color="primary" sx={{ fontWeight: 700 }}>
                            Clear all filters
                          </Button>
                        </Stack>
                      </Box>
                    ) : (
                      <Stack divider={<Divider />} sx={{ width: '100%' }}>
                        {paginatedJobs.map((job) => (
                          <Box
                            key={job.id}
                            component={motion.div}
                            whileHover={{ x: 4 }}
                            transition={{ duration: 0.2 }}
                            sx={{
                              position: 'relative',
                              px: { xs: 3, md: 4 },
                              py: { xs: 2.5, md: 3 },
                              transition: 'background-color 0.2s',
                              ...(job.featured ? {
                                bgcolor: alpha(tertiaryMain, 0.03),
                                '&:hover': {
                                  bgcolor: alpha(tertiaryMain, 0.07),
                                }
                              } : {
                                '&:hover': {
                                  bgcolor: alpha(primaryMain, 0.02),
                                }
                              })
                            }}
                          >
                            {/* Left accent border for featured jobs */}
                            {job.featured && (
                              <Box sx={{
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                bottom: 0,
                                width: '4px',
                                background: `linear-gradient(to bottom, ${tertiaryMain}, ${primaryMain})`
                              }} />
                            )}

                            <Grid container spacing={2} alignItems="center">
                              <Grid size={{ xs: 12, md: 8.5 }}>
                                <Stack spacing={1.5}>
                                  {/* Tags / Metadata Row */}
                                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ gap: 1, alignItems: 'center' }}>
                                    {job.featured && (
                                      <Chip
                                        icon={<Sparkles size={12} />}
                                        label="Featured"
                                        size="small"
                                        sx={{
                                          height: 20,
                                          fontWeight: 800,
                                          bgcolor: tertiaryMain,
                                          color: secondaryDark,
                                          border: `1px solid ${alpha(secondaryDark, 0.1)}`,
                                          fontSize: '0.7rem',
                                          '& .MuiChip-icon': { color: secondaryDark }
                                        }}
                                      />
                                    )}
                                    <Chip
                                      icon={<Briefcase size={12} />}
                                      label={job.department}
                                      size="small"
                                      variant="outlined"
                                      sx={{
                                        height: 20,
                                        fontWeight: 600,
                                        fontSize: '0.7rem',
                                        borderColor: alpha(primaryMain, 0.25),
                                        color: primaryMain,
                                        bgcolor: alpha(primaryMain, 0.02),
                                        '& .MuiChip-icon': { color: primaryMain }
                                      }}
                                    />
                                    <Chip
                                      icon={<MapPin size={12} />}
                                      label={job.location}
                                      size="small"
                                      variant="outlined"
                                      sx={{
                                        height: 20,
                                        fontWeight: 600,
                                        fontSize: '0.7rem',
                                        borderColor: alpha(theme.palette.text.secondary, 0.15),
                                        color: 'text.secondary',
                                        '& .MuiChip-icon': { color: 'text.secondary' }
                                      }}
                                    />
                                    <Chip
                                      label={job.type}
                                      size="small"
                                      sx={{
                                        height: 20,
                                        fontWeight: 700,
                                        fontSize: '0.7rem',
                                        bgcolor: alpha(primaryMain, 0.08),
                                        color: isDark ? '#fff' : primaryMain,
                                        border: `1px solid ${alpha(primaryMain, 0.15)}`
                                      }}
                                    />
                                  </Stack>

                                  {/* Title and Salary */}
                                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0.5, sm: 2 }} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                                    <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.3 }}>
                                      {job.title}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: primaryMain, fontWeight: 700, bgcolor: alpha(primaryMain, 0.06), px: 1.2, py: 0.3, borderRadius: 1 }}>
                                      {job.salary}
                                    </Typography>
                                  </Stack>

                                  {/* Description Snippet */}
                                  <Typography variant="body2" color="text.secondary" sx={{
                                    lineHeight: 1.5,
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    fontSize: '0.875rem'
                                  }}>
                                    {job.description}
                                  </Typography>
                                </Stack>
                              </Grid>

                              <Grid size={{ xs: 12, md: 3.5 }}>
                                <Stack
                                  spacing={1.5}
                                  alignItems={{ xs: 'flex-start', md: 'flex-end' }}
                                  justifyContent="center"
                                  sx={{
                                    height: '100%',
                                    pt: { xs: 1.5, md: 0 },
                                    borderTop: { xs: `1px dashed ${theme.palette.divider}`, md: 'none' }
                                  }}
                                >
                                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                                    {getRelativeTimeString(job.postedDate)}
                                  </Typography>
                                  
                                  <Button
                                    component={Link}
                                    href={`/careers/job-details/${job.id}`}
                                    variant="contained"
                                    size="small"
                                    endIcon={<ArrowRight size={14} />}
                                    sx={{
                                      borderRadius: 1.5,
                                      fontWeight: 700,
                                      px: 3,
                                      py: 0.75,
                                      width: { xs: '100%', md: 'auto' },
                                      boxShadow: 'none',
                                      '&:hover': {
                                        boxShadow: `0 4px 12px ${alpha(primaryMain, 0.15)}`,
                                        '& .MuiButton-endIcon': {
                                          transform: 'translateX(3px)'
                                        }
                                      },
                                      '& .MuiButton-endIcon': {
                                        transition: 'transform 0.2s'
                                      },
                                      transition: 'all 0.2s ease-in-out'
                                    }}
                                  >
                                    View Details
                                  </Button>
                                </Stack>
                              </Grid>
                            </Grid>
                          </Box>
                        ))}
                      </Stack>
                    )}
                  </Box>

                  <TablePagination
                    component="div"
                    count={filteredAndSortedJobs.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25]}
                    sx={{
                      borderTop: `1px solid ${theme.palette.divider}`,
                      bgcolor: alpha(theme.palette.background.paper, 0.8),
                      backdropFilter: 'blur(10px)',
                      position: 'relative',
                      zIndex: 2
                    }}
                  />
                </Card>
              </Container>


              <SectionTransition toColor={theme.palette.mode === 'dark' ? theme.palette.background.default : '#0B0F14'} />
            </Box>
          )}</>
      )}
    </Box>
  );
}
