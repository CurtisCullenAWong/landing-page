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
            salary: data.salary,
            postedDate,
            status: data.status,
            application_url: data.application_url || undefined,
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
        (payload: { eventType: string; new: { posted_date: string | number | Date; id: any; title: any; department: any; location: any; type: any; description: any; responsibilities: any; requirements: any; salary: any; status: any; application_url: any; }; }) => {
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
              salary: payload.new.salary,
              postedDate,
              status: payload.new.status,
              application_url: payload.new.application_url || undefined,
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
          <Button component={Link} href="/careers" variant="contained" size="large" sx={{ px: 4, fontWeight: 700 }}>
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
          <Link href="/careers" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Typography variant="caption" sx={{ fontWeight: 600, '&:hover': { color: primaryMain } }}>Careers</Typography>
          </Link>
          <Typography variant="caption" sx={{ fontWeight: 700, color: primaryMain }}>Position Specification</Typography>
        </Breadcrumbs>

        <Button 
          component={Link} 
          href="/careers" 
          variant="text"
          startIcon={<ArrowLeft size={18} />} 
          sx={{ mb: 4, fontWeight: 700, color: 'text.secondary', '&:hover': { color: primaryMain } }}
        >
          Back to Career Listings
        </Button>

        {/* formal header section */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h2" sx={{ fontWeight: 900, mb: 2, letterSpacing: -2, textTransform: 'uppercase', color: primaryMain }}>
            {job.title}
          </Typography>
          
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ color: 'text.secondary' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Briefcase size={18} color={primaryMain} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{job.department}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MapPin size={18} color={primaryMain} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{job.location}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Clock size={18} color={primaryMain} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{job.type}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Calendar size={18} color={primaryMain} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Posted: {job.postedDate}</Typography>
            </Box>
          </Stack>
        </Box>

        <Card sx={{ position: 'relative', boxShadow: 12, borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          <CornerBrackets color={tertiaryMain} radius={16} />
          <CardContent sx={{ p: { xs: 3, md: 5 } }}>
            
            {/* Overview Section */}
            <Box sx={{ mb: 6 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 3, letterSpacing: -0.5 }}>
                Position Overview
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8, color: 'text.secondary', whiteSpace: 'pre-wrap' }}>
                {job.description}
              </Typography>
            </Box>

            <Divider sx={{ mb: 6, opacity: 0.5 }} />

            {/* Responsibilities Section */}
            <Box sx={{ mb: 6 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 3, letterSpacing: -0.5 }}>
                Key Responsibilities
              </Typography>
              <List sx={{ p: 0 }}>
                {job.responsibilities.map((responsibility, index) => (
                  <ListItem key={index} sx={{ py: 1.5, px: 0, alignItems: 'flex-start' }}>
                    <Box sx={{ mt: 1, mr: 2, width: 6, height: 6, borderRadius: '50%', bgcolor: primaryMain, flexShrink: 0 }} />
                    <ListItemText 
                      primary={responsibility} 
                      primaryTypographyProps={{ variant: 'body1', sx: { fontWeight: 500, color: 'text.primary' } }} 
                    />
                  </ListItem>
                ))}
              </List>
            </Box>

            <Divider sx={{ mb: 6, opacity: 0.5 }} />

            {/* Requirements Section */}
            <Box sx={{ mb: 6 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 3, letterSpacing: -0.5 }}>
                Professional Requirements
              </Typography>
              <List sx={{ p: 0 }}>
                {job.requirements.map((requirement, index) => (
                  <ListItem key={index} sx={{ py: 1.5, px: 0, alignItems: 'flex-start' }}>
                    <Box sx={{ mt: 1, mr: 2, width: 6, height: 6, borderRadius: '50%', bgcolor: primaryMain, flexShrink: 0 }} />
                    <ListItemText 
                      primary={requirement} 
                      primaryTypographyProps={{ variant: 'body1', sx: { fontWeight: 500, color: 'text.primary' } }} 
                    />
                  </ListItem>
                ))}
              </List>
            </Box>

            {job.salary && (
              <>
                <Divider sx={{ mb: 6, opacity: 0.5 }} />
                <Box sx={{ mb: 6 }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, mb: 2, letterSpacing: -0.5 }}>
                    Compensation
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, display: 'inline-flex', alignItems: 'center', gap: 1.5, bgcolor: alpha(primaryMain, 0.03), borderColor: alpha(primaryMain, 0.2) }}>
                    <Banknote size={24} color={primaryMain} />
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{job.salary}</Typography>
                  </Paper>
                </Box>
              </>
            )}

            <Box sx={{ pt: 4, mt: 4, borderTop: `1px solid ${theme.palette.divider}`, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Button
                component={Link}
                href={job.application_url || `/careers/apply?jobId=${job.id}`}
                variant="contained"
                size="large"
                fullWidth={false}
                sx={{ px: 6, py: 1.5, fontWeight: 800, borderRadius: 2 }}
                startIcon={<FileText size={20} />}
                target={job.application_url ? "_blank" : undefined}
                rel={job.application_url ? "noopener noreferrer" : undefined}
              >
                Submit Application
              </Button>
              <Button
                component={Link}
                href="/careers"
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