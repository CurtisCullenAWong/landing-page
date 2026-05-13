'use client';

import { useState, useMemo, useEffect } from 'react';

import { useJobs } from '../../contexts/JobContext';
import { MapPin, Briefcase, Clock, Search, X, ChevronDown, ChevronUp, GraduationCap, Target, Users, Sparkles } from 'lucide-react';
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
import { Footer } from '@/components/layout';
import { usePageTitle } from '../../lib/usePageTitle';
import { SITE_CONTENT } from '../../constants/site-content';
import { motion } from 'framer-motion';

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
    setPage(0);
  };

  useEffect(() => {
    // Hide global footer to use local one in snap sequence
    const globalFooter = document.querySelector('footer');
    if (globalFooter) globalFooter.style.display = 'none';
    return () => {
      if (globalFooter) globalFooter.style.display = 'block';
    };
  }, []);

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
              maskImage: 'radial-gradient(ellipse at center, black 60%, transparent 95%), linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
              WebkitMaskImage: 'radial-gradient(ellipse at center, black 60%, transparent 95%), linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ p: 1.5, bgcolor: primaryMain, color: 'white', borderRadius: 2, display: 'flex' }}>
                          <GraduationCap size={28} />
                        </Box>
                        <Typography variant="h3" sx={{ fontWeight: 800, color: primaryMain, letterSpacing: { xs: -0.5, md: -1 }, fontSize: { xs: '1.5rem', sm: '2.25rem', md: '3rem' } }}>
                          Boss Cargo University
                        </Typography>
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
              maskImage: 'radial-gradient(ellipse at center, black 60%, transparent 95%), linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
              WebkitMaskImage: 'radial-gradient(ellipse at center, black 60%, transparent 95%), linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
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
                scrollSnapStop: 'always',
                bgcolor: paperColor,
                background: `linear-gradient(180deg, ${bgColor} 0%, ${paperColor} 100%)`,
                py: { xs: 10, md: 15 }, // Increased padding
                pb: { xs: 12, md: 20 }, // Extra bottom margin/padding
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
                mixBlendMode: 'multiply',
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
                          Refine Search Parameters
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {(searchQuery || filterDepartment !== 'all' || filterType !== 'all' || filterLocation !== 'all') && (
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
                          <Grid size={{ xs: 12, md: 6 }}>
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
                          <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                            <FormControl fullWidth size="small">
                              <InputLabel>Department</InputLabel>
                              <Select value={filterDepartment} label="Department" onChange={(e) => { setFilterDepartment(e.target.value); setPage(0); }} sx={{ borderRadius: 2 }}>
                                <MenuItem value="all">All Departments</MenuItem>
                                {uniqueDepartments.map((dept) => <MenuItem key={dept} value={dept}>{dept}</MenuItem>)}
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                            <FormControl fullWidth size="small">
                              <InputLabel>Employment</InputLabel>
                              <Select value={filterType} label="Employment" onChange={(e) => { setFilterType(e.target.value); setPage(0); }} sx={{ borderRadius: 2 }}>
                                <MenuItem value="all">All Types</MenuItem>
                                {uniqueTypes.map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                            <FormControl fullWidth size="small">
                              <InputLabel>Location</InputLabel>
                              <Select value={filterLocation} label="Location" onChange={(e) => { setFilterLocation(e.target.value); setPage(0); }} sx={{ borderRadius: 2 }}>
                                <MenuItem value="all">All Areas</MenuItem>
                                {uniqueLocations.map((loc) => <MenuItem key={loc} value={loc}>{loc}</MenuItem>)}
                              </Select>
                            </FormControl>
                          </Grid>
                        </Grid>
                      </Box>
                    </Collapse>
                  </Paper>

                  <TableContainer sx={{ display: { xs: 'none', md: 'block' }, maxHeight: { xs: '40vh', lg: '50vh' } }}>
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{
                            fontWeight: 800,
                            bgcolor: alpha(theme.palette.background.paper, 0.9),
                            backdropFilter: 'blur(8px)',
                            py: 2,
                            zIndex: 3
                          }}>
                            <TableSortLabel active={sortField === 'title'} direction={sortField === 'title' ? sortDirection : 'asc'} onClick={() => handleSort('title')}>
                              Position Title
                            </TableSortLabel>
                          </TableCell>
                          <TableCell sx={{
                            fontWeight: 800,
                            bgcolor: alpha(theme.palette.background.paper, 0.9),
                            backdropFilter: 'blur(8px)',
                            zIndex: 3
                          }}>
                            <TableSortLabel active={sortField === 'department'} direction={sortField === 'department' ? sortDirection : 'asc'} onClick={() => handleSort('department')}>
                              Department
                            </TableSortLabel>
                          </TableCell>
                          <TableCell sx={{
                            fontWeight: 800,
                            bgcolor: alpha(theme.palette.background.paper, 0.9),
                            backdropFilter: 'blur(8px)',
                            zIndex: 3
                          }}>Work Location</TableCell>
                          <TableCell sx={{
                            fontWeight: 800,
                            bgcolor: alpha(theme.palette.background.paper, 0.9),
                            backdropFilter: 'blur(8px)',
                            zIndex: 3
                          }}>Contract</TableCell>
                          <TableCell sx={{
                            fontWeight: 800,
                            bgcolor: alpha(theme.palette.background.paper, 0.9),
                            backdropFilter: 'blur(8px)',
                            textAlign: 'right',
                            zIndex: 3
                          }}>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedJobs.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} align="center" sx={{ py: 10 }}>
                              <Stack alignItems="center" spacing={2}>
                                <Search size={48} color={theme.palette.text.disabled} />
                                <Typography variant="h6" color="text.secondary">No matching opportunities found.</Typography>
                                <Button onClick={handleResetFilters} variant="text" color="primary">Clear all filters</Button>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginatedJobs.map((job) => (
                            <TableRow
                              key={job.id}
                              hover
                              sx={{
                                ...(job.featured && {
                                  bgcolor: alpha(tertiaryMain, 0.08),
                                  '& td': { borderColor: alpha(tertiaryDark, 0.22) }
                                }),
                                '&:hover': {
                                  bgcolor: job.featured ? alpha(tertiaryMain, 0.16) : alpha(primaryMain, 0.02)
                                }
                              }}
                            >
                              <TableCell>
                                <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.primary' }}>{job.title}</Typography>
                                {job.featured && (
                                  <Chip
                                    icon={<Sparkles size={12} />}
                                    label="Featured"
                                    size="small"
                                    sx={{
                                      mt: 0.5,
                                      mb: 0.5,
                                      height: 20,
                                      fontWeight: 700,
                                      bgcolor: tertiaryMain,
                                      color: secondaryDark,
                                      border: `1px solid ${alpha(secondaryDark, 0.2)}`,
                                      '& .MuiChip-icon': { color: secondaryDark }
                                    }}
                                  />
                                )}
                                <Typography variant="caption" sx={{ color: primaryMain, fontWeight: 700 }}>{job.salary}</Typography>
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                                  <Briefcase size={16} color={primaryMain} />
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{job.department}</Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                                  <MapPin size={16} color={primaryMain} />
                                  <Typography variant="body2">{job.location}</Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography variant="caption" sx={{
                                  px: 1.5, py: 0.5, borderRadius: 1,
                                  bgcolor: alpha(primaryMain, 0.1),
                                  color: isDark ? '#fff' : primaryMain,
                                  fontWeight: 800,
                                  textTransform: 'uppercase',
                                  border: `1px solid ${alpha(primaryMain, 0.2)}`
                                }}>
                                  {job.type}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Button component={Link} href={`/careers/job-details/${job.id}`} variant="contained" size="small" sx={{ borderRadius: 2, fontWeight: 700 }}>
                                  Apply Now
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
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

                  {/* Mobile Card View */}
                  <Box sx={{ display: { xs: 'block', md: 'none' }, p: 2, bgcolor: alpha(paperColor, 0.9), backdropFilter: 'blur(10px)' }}>
                    {paginatedJobs.map((job) => (
                      <Card
                        key={job.id}
                        sx={{
                          mb: 2,
                          border: `1px solid ${job.featured ? alpha(tertiaryDark, 0.35) : alpha(theme.palette.divider, 0.1)}`,
                          position: 'relative',
                          borderRadius: 2,
                          ...(job.featured && {
                            bgcolor: alpha(tertiaryMain, 0.07),
                            boxShadow: `0 8px 24px ${alpha(tertiaryMain, 0.2)}`
                          })
                        }}
                      >
                        <CornerBrackets color={tertiaryMain} radius={16} size={16} hideTopLeft={true} />
                        <CardContent sx={{ p: 2.5 }}>
                          <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.75, color: primaryMain }}>{job.title}</Typography>
                          {job.featured && (
                            <Chip
                              icon={<Sparkles size={12} />}
                              label="Featured"
                              size="small"
                              sx={{
                                mb: 1.5,
                                height: 20,
                                fontWeight: 700,
                                bgcolor: tertiaryMain,
                                color: secondaryDark,
                                border: `1px solid ${alpha(secondaryDark, 0.2)}`,
                                '& .MuiChip-icon': { color: secondaryDark }
                              }}
                            />
                          )}
                          <Stack spacing={1.5} sx={{ mb: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Briefcase size={16} color={primaryMain} />
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>{job.department}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <MapPin size={16} color={primaryMain} />
                              <Typography variant="body2">{job.location}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Clock size={16} color={primaryMain} />
                              <Typography variant="caption" sx={{
                                px: 1.2, py: 0.3, borderRadius: 1,
                                bgcolor: alpha(primaryMain, 0.1),
                                color: isDark ? '#fff' : primaryMain,
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                border: `1px solid ${alpha(primaryMain, 0.2)}`
                              }}>
                                {job.type}
                              </Typography>
                            </Box>
                          </Stack>
                          <Button component={Link} href={`/careers/job-details/${job.id}`} variant="contained" fullWidth sx={{ borderRadius: 2, fontWeight: 700 }}>
                            View Details
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                </Card>
              </Container>


            </Box>
          )}</>
      )}
    </Box>
  );
}
