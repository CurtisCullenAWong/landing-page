'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useJobs, Job } from '../../../../contexts/JobContext';
import { MapPin, Briefcase, Clock, ArrowLeft, Banknote, FileText, ChevronRight, Calendar } from 'lucide-react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  useTheme,
  List,
  ListItem,
  ListItemText,
  Breadcrumbs,
  alpha,
  Divider,
  Stack,
  Paper,
} from '@mui/material';
import { JobDetailsSkeleton } from '@/components/loading';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { usePageTitle } from '../../../../lib/usePageTitle';

// Shared "Corner Brackets" component for architectural emphasis
const CornerBrackets = ({ color, size = 24, radius = 16 }: { color: string, size?: number, radius?: number }) => (
  <>
    <Box sx={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: size,
      height: size,
      borderTop: `3px solid ${color}`,
      borderLeft: `3px solid ${color}`,
      borderTopLeftRadius: radius,
      zIndex: 2
    }} />
    <Box sx={{
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: size,
      height: size,
      borderBottom: `3px solid ${color}`,
      borderRight: `3px solid ${color}`,
      borderBottomRightRadius: radius,
      zIndex: 2
    }} />
  </>
);

export default function JobDetailsClient() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';
  const { getJobById, isLoading: contextLoading } = useJobs();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const theme = useTheme();


  const primaryMain = theme.palette.primary?.main || '#00A39D';
  const tertiaryMain = (theme.palette as any).tertiary?.main || '#FCE200';
  const bgColor = theme.palette.background?.default || '#ffffff';

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      setJob(null);
      return;
    }

    const loadJob = async () => {
      const contextJob = getJobById(id);
      if (contextJob) {
        setJob(contextJob);
        setIsLoading(false);
        return;
      }

      if (contextLoading) {
        return;
      }

      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error loading job:', error);
          setJob(null);
        } else if (data) {
          let postedDate = new Date().toISOString().split('T')[0];
          if (data.posted_date) {
            try {
              postedDate = new Date(data.posted_date).toISOString().split('T')[0];
            } catch (e) {
              console.warn('Error parsing posted_date:', e);
            }
          }

          const mappedJob: Job = {
            id: data.id,
            title: data.title,
            department: data.department,
            location: data.location,
            type: data.type,
            description: data.description,
            responsibilities: data.responsibilities || [],
            requirements: data.requirements || [],
            benefits: data.benefits || [],
            salary: data.salary,
            postedDate,
            status: data.status,
            application_url: data.application_url || undefined,
            employment_type: data.employment_type || undefined,
            work_setup: data.work_setup || undefined,
            job_level: data.job_level || undefined,
            schedule: data.schedule || undefined,
          };

          setJob(mappedJob);
        } else {
          setJob(null);
        }
      } catch (error) {
        console.error('Error loading job:', error);
        setJob(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadJob();

    const supabase = createClient();
    const channel = supabase
      .channel(`job-${id}-changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs',
          filter: `id=eq.${id}`,
        },
        (payload: { eventType: string; new: { 
          id: string;
          title: string;
          department: string;
          location: string;
          type: string;
          description: string;
          responsibilities: string[];
          requirements: string[];
          benefits: string[];
          salary: string;
          status: 'active' | 'closed';
          posted_date: string | number | Date;
          application_url: string | null;
          employment_type: string | null;
          work_setup: string | null;
          job_level: string | null;
          schedule: string | null;
          application_email: string | null;
          external_application_url: string | null;
          views_count: number | null;
          applications_count: number | null;
          featured: boolean | null;
          published_at: string | null;
          expires_at: string | null;
        }; }) => {
          if (payload.eventType === 'UPDATE' && payload.new) {
            let postedDate = new Date().toISOString().split('T')[0];
            if (payload.new.posted_date) {
              try {
                postedDate = new Date(payload.new.posted_date).toISOString().split('T')[0];
              } catch (e) {
                console.warn('Error parsing posted_date:', e);
              }
            }

            const updatedJob: Job = {
              id: payload.new.id,
              title: payload.new.title,
              department: payload.new.department,
              location: payload.new.location,
              type: payload.new.type,
              description: payload.new.description,
              responsibilities: payload.new.responsibilities || [],
              requirements: payload.new.requirements || [],
              benefits: payload.new.benefits || [],
              salary: payload.new.salary,
              postedDate,
              status: payload.new.status,
              application_url: payload.new.application_url || undefined,
              employment_type: payload.new.employment_type || undefined,
              work_setup: payload.new.work_setup || undefined,
              job_level: payload.new.job_level || undefined,
              schedule: payload.new.schedule || undefined,
              application_email: payload.new.application_email || undefined,
              external_application_url: payload.new.external_application_url || undefined,
              views_count: payload.new.views_count || undefined,
              applications_count: payload.new.applications_count || undefined,
              featured: payload.new.featured || undefined,
              published_at: payload.new.published_at || undefined,
              expires_at: payload.new.expires_at || undefined,
            };
            setJob(updatedJob);
          } else if (payload.eventType === 'DELETE') {
            setJob(null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, getJobById, contextLoading]);

  usePageTitle(job ? job.title : 'Job Details');

  if (isLoading || contextLoading) {
    return <JobDetailsSkeleton />;
  }

  if (!job) {
    return (
      <Box sx={{ py: 12, minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
        <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
          <Typography variant="h3" sx={{ mb: 2, fontWeight: 900, letterSpacing: -1 }}>
            Position Not Found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            The career opportunity you are seeking is either no longer available or has been relocated.
          </Typography>
          <Button component={Link} href="/#careers" variant="contained" size="large" sx={{ px: 4, fontWeight: 700 }}>
            Return to Career Listings
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ py: { xs: 4, md: 8 }, bgcolor: bgColor, minHeight: '100vh' }}>
      <Container maxWidth="md">
        {/* Navigation Breadcrumbs */}
        <Breadcrumbs 
          separator={<ChevronRight size={14} />} 
          sx={{ mb: 4, '& .MuiBreadcrumbs-li': { color: 'text.secondary' } }}
        >
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Typography variant="caption" sx={{ fontWeight: 600, '&:hover': { color: primaryMain } }}>Home</Typography>
          </Link>
          <Link href="/#careers" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Typography variant="caption" sx={{ fontWeight: 600, '&:hover': { color: primaryMain } }}>Careers</Typography>
          </Link>
          <Typography variant="caption" sx={{ fontWeight: 700, color: primaryMain }}>Position Specification</Typography>
        </Breadcrumbs>

        <Button 
          component={Link} 
          href="/#careers" 
          variant="text"
          startIcon={<ArrowLeft size={18} />} 
          sx={{ 
            mb: 4, 
            fontWeight: 700, 
            color: 'text.secondary', 
            transition: 'all 0.3s ease',
            '&:hover': { 
              color: primaryMain,
              transform: 'translateX(-4px)'
            } 
          }}
        >
          Back to Career Listings
        </Button>

        {/* formal header section */}
        <Box sx={{ mb: 6 }}>
          <Typography 
            variant="h2" 
            sx={{ 
              fontWeight: 900, 
              mb: 3, 
              letterSpacing: -2, 
              textTransform: 'uppercase', 
              background: `linear-gradient(135deg, ${primaryMain} 0%, ${alpha(primaryMain, 0.7)} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1.1,
              wordWrap: 'break-word',
              overflowWrap: 'break-word'
            }}
          >
            {job.title}
          </Typography>
          
          <Stack 
            direction="row" 
            spacing={2} 
            sx={{ 
              color: 'text.secondary', 
              flexWrap: 'wrap', 
              rowGap: 1.5,
              '& > *': {
                flexShrink: 0
              }
            }}
          >
            <Paper 
              elevation={0}
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1, 
                px: 1.5, 
                py: 0.75, 
                borderRadius: 2,
                bgcolor: alpha(primaryMain, 0.05),
                border: `1px solid ${alpha(primaryMain, 0.1)}`
              }}
            >
              <Briefcase size={16} color={primaryMain} />
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary' }}>{job.department}</Typography>
            </Paper>

            <Paper 
              elevation={0}
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1, 
                px: 1.5, 
                py: 0.75, 
                borderRadius: 2,
                bgcolor: alpha(primaryMain, 0.05),
                border: `1px solid ${alpha(primaryMain, 0.1)}`
              }}
            >
              <MapPin size={16} color={primaryMain} />
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary' }}>
                {job.location} {job.work_setup && <Box component="span" sx={{ opacity: 0.7, fontWeight: 500 }}>• {job.work_setup}</Box>}
              </Typography>
            </Paper>

            <Paper 
              elevation={0}
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1, 
                px: 1.5, 
                py: 0.75, 
                borderRadius: 2,
                bgcolor: alpha(primaryMain, 0.05),
                border: `1px solid ${alpha(primaryMain, 0.1)}`
              }}
            >
              <Clock size={16} color={primaryMain} />
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary' }}>
                {job.type} {job.schedule && <Box component="span" sx={{ opacity: 0.7, fontWeight: 500 }}>• {job.schedule}</Box>}
              </Typography>
            </Paper>

            <Paper 
              elevation={0}
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1, 
                px: 1.5, 
                py: 0.75, 
                borderRadius: 2,
                bgcolor: alpha(theme.palette.text.secondary, 0.05),
                border: `1px solid ${alpha(theme.palette.text.secondary, 0.1)}`
              }}
            >
              <Calendar size={16} color={theme.palette.text.secondary} />
              <Typography variant="caption" sx={{ fontWeight: 700 }}>Posted {job.postedDate}</Typography>
            </Paper>
          </Stack>
        </Box>

        <Card sx={{ position: 'relative', boxShadow: 12, borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          <CornerBrackets color={tertiaryMain} radius={16} />
          <CardContent sx={{ p: { xs: 3, md: 5 } }}>
            
            {/* Overview Section */}
            <Box sx={{ mb: 6 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 3, letterSpacing: -0.5, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 4, height: 24, bgcolor: primaryMain, borderRadius: 1 }} />
                Position Overview
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  lineHeight: 1.8, 
                  color: 'text.secondary', 
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word'
                }} 
              >
                {job.description}
              </Typography>
            </Box>

            <Divider sx={{ mb: 6, opacity: 0.5 }} />

            {/* Responsibilities Section */}
            <Box sx={{ mb: 6 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 3, letterSpacing: -0.5, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 4, height: 24, bgcolor: primaryMain, borderRadius: 1 }} />
                Key Responsibilities
              </Typography>
              <List sx={{ p: 0 }}>
                {job.responsibilities.map((responsibility, index) => (
                  <ListItem key={index} sx={{ py: 1.25, px: 0, alignItems: 'flex-start' }}>
                    <Box sx={{ mt: 1, mr: 2, width: 6, height: 6, borderRadius: '50%', bgcolor: primaryMain, flexShrink: 0 }} />
                    <ListItemText 
                      primary={responsibility} 
                      primaryTypographyProps={{ 
                        variant: 'body1', 
                        sx: { 
                          fontWeight: 500, 
                          color: 'text.primary',
                          lineHeight: 1.6,
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word'
                        } 
                      }} 
                    />
                  </ListItem>
                ))}
              </List>
            </Box>

            <Divider sx={{ mb: 6, opacity: 0.5 }} />

            {/* Requirements Section */}
            <Box sx={{ mb: 6 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 3, letterSpacing: -0.5, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 4, height: 24, bgcolor: primaryMain, borderRadius: 1 }} />
                Professional Requirements
              </Typography>
              <List sx={{ p: 0 }}>
                {job.requirements.map((requirement, index) => (
                  <ListItem key={index} sx={{ py: 1.25, px: 0, alignItems: 'flex-start' }}>
                    <Box sx={{ mt: 1, mr: 2, width: 6, height: 6, borderRadius: '50%', bgcolor: primaryMain, flexShrink: 0 }} />
                    <ListItemText 
                      primary={requirement} 
                      primaryTypographyProps={{ 
                        variant: 'body1', 
                        sx: { 
                          fontWeight: 500, 
                          color: 'text.primary',
                          lineHeight: 1.6,
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word'
                        } 
                      }} 
                    />
                  </ListItem>
                ))}
              </List>
            </Box>

            {job.benefits && job.benefits.length > 0 && (
              <>
                <Divider sx={{ mb: 6, opacity: 0.5 }} />
                <Box sx={{ mb: 6 }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, mb: 3, letterSpacing: -0.5, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 4, height: 24, bgcolor: tertiaryMain, borderRadius: 1 }} />
                    Benefits & Perks
                  </Typography>
                  <List sx={{ p: 0 }}>
                    {job.benefits.map((benefit, index) => (
                      <ListItem key={index} sx={{ py: 1.25, px: 0, alignItems: 'flex-start' }}>
                        <Box sx={{ mt: 1, mr: 2, width: 6, height: 6, borderRadius: '50%', bgcolor: tertiaryMain, flexShrink: 0 }} />
                        <ListItemText 
                          primary={benefit} 
                          primaryTypographyProps={{ 
                            variant: 'body1', 
                            sx: { 
                              fontWeight: 500, 
                              color: 'text.primary',
                              lineHeight: 1.6,
                              wordWrap: 'break-word',
                              overflowWrap: 'break-word'
                            } 
                          }} 
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </>
            )}

            {job.salary && (
              <>
                <Divider sx={{ mb: 6, opacity: 0.5 }} />
                <Box sx={{ mb: 6 }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, mb: 3, letterSpacing: -0.5, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 4, height: 24, bgcolor: primaryMain, borderRadius: 1 }} />
                    Compensation
                  </Typography>
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 2.5, 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: 2, 
                      bgcolor: alpha(primaryMain, 0.05), 
                      border: `1px solid ${alpha(primaryMain, 0.1)}`,
                      borderRadius: 3
                    }}
                  >
                    <Box 
                      sx={{ 
                        p: 1, 
                        borderRadius: 1.5, 
                        bgcolor: primaryMain, 
                        color: 'white',
                        display: 'flex'
                      }}
                    >
                      <Banknote size={24} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
                      {job.salary}
                    </Typography>
                  </Paper>
                </Box>
              </>
            )}

            <Box sx={{ pt: 4, mt: 4, borderTop: `1px solid ${theme.palette.divider}`, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Button
                component={Link}
                href={job.external_application_url || job.application_url || `/careers/job-details/${job.id}/apply`}
                variant="contained"
                size="large"
                fullWidth={false}
                sx={{ px: 6, py: 1.5, fontWeight: 800, borderRadius: 2 }}
                startIcon={<FileText size={20} />}
                target={(job.external_application_url || job.application_url) ? "_blank" : undefined}
                rel={(job.external_application_url || job.application_url) ? "noopener noreferrer" : undefined}
              >
                Submit Application
              </Button>
              <Button
                component={Link}
                href="/#careers"
                variant="outlined"
                size="large"
                sx={{ px: 4, py: 1.5, fontWeight: 700, borderRadius: 2 }}
              >
                Return to Listings
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Typography variant="caption" color="text.disabled" sx={{ mt: 4, display: 'block', textAlign: 'center', fontWeight: 600 }}>
          Boss Cargo Express is an equal opportunity employer. We value diversity and are committed to creating an inclusive environment for all employees.
        </Typography>
      </Container>
    </Box>
  );
}