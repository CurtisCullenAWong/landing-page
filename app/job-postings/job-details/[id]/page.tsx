'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useJobs, Job } from '../../../../contexts/JobContext';
import { MapPin, Briefcase, Clock, Calendar, ArrowLeft, Banknote } from 'lucide-react';
import { ImageWithFallback } from '../../../../components/ImageWithFallback';
import { IMAGE_URLS, getImageMetadata } from '../../../../constants/images';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Paper,
  useTheme,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { JobDetailsSkeleton } from '@/components/loading';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { usePageTitle } from '../../../../lib/usePageTitle';

export default function JobDetailsPage() {
  const params = useParams();
  const id = params?.id as string;
  const { getJobById, isLoading: contextLoading } = useJobs();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      setJob(null);
      return;
    }

    const loadJob = async () => {
      // First try to get from context
      const contextJob = getJobById(id);
      if (contextJob) {
        setJob(contextJob);
        setIsLoading(false);
        return;
      }

      // If not in context and context is still loading, wait a bit
      if (contextLoading) {
        return;
      }

      // If not in context, fetch directly from Supabase
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
          // Map database job to app job format
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

    // Set up realtime subscription for this specific job
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
        (payload) => {
          console.log('Realtime event received for job:', payload.eventType, payload);
          
          if (payload.eventType === 'UPDATE' && payload.new) {
            // Map database job to app job format
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
            };
            setJob(updatedJob);
          } else if (payload.eventType === 'DELETE') {
            setJob(null);
          }
        }
      )
      .subscribe();

    // Cleanup subscription on unmount or when id changes
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
      <Box sx={{ py: 8 }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h3" sx={{ mb: 2, fontWeight: 600 }}>
            Job Not Found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            The position you're looking for doesn't exist.
          </Typography>
          <Button component={Link} href="/job-postings" variant="contained">
            View All Positions
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 8 }}>
      <Container maxWidth="md">
        {/* Back Button */}
        <Button
          component={Link}
          href="/job-postings"
          startIcon={<ArrowLeft size={20} />}
          sx={{ mb: 4 }}
        >
          Back to All Positions
        </Button>
        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h3" sx={{ mb: 3, fontWeight: 700 }}>
              {job.title}
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Briefcase size={20} style={{ color: theme.palette.text.secondary }} />
                <Typography variant="body1">{job.department}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MapPin size={20} style={{ color: theme.palette.text.secondary }} />
                <Typography variant="body1">{job.location}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Clock size={20} style={{ color: theme.palette.text.secondary }} />
                <Typography variant="body1">{job.type}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Banknote size={20} style={{ color: theme.palette.text.secondary }} />
                <Typography variant="body1">{job.salary}</Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Calendar size={16} style={{ color: theme.palette.text.secondary }} />
              <Typography variant="body2" color="text.secondary">
                Posted on {new Date(job.postedDate).toLocaleDateString()}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Job Description */}
        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
              Job Description
            </Typography>
            <Typography variant="body1" color="text.primary" sx={{ whiteSpace: 'pre-line' }}>
              {job.description}
            </Typography>
          </CardContent>
        </Card>

        {/* Responsibilities */}
        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
              Key Responsibilities
            </Typography>
            <List>
              {job.responsibilities.map((responsibility, index) => (
                <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Typography component="span" sx={{ color: 'primary.main' }}>
                          •
                        </Typography>
                        <Typography component="span">{responsibility}</Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>

        {/* Requirements */}
        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
              Requirements
            </Typography>
            <List>
              {job.requirements.map((requirement, index) => (
                <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Typography component="span" sx={{ color: 'primary.main' }}>
                          •
                        </Typography>
                        <Typography component="span">{requirement}</Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>

        {/* Apply Section */}
        <Paper
          sx={{
            p: 4,
            textAlign: 'center',
            mb: 4,
            background: isDark
              ? `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.primary.dark} 100%)`
              : 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
            color: isDark ? 'text.primary' : 'primary.contrastText',
          }}
        >
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
            Ready to Apply?
          </Typography>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Join the Boss Cargo team and be part of something great. We look forward to hearing from you!
          </Typography>
        <Box sx={{ mb: 4 }}>
          <ImageWithFallback
            src={IMAGE_URLS.JOB_DETAILS_PROFESSIONAL}
            alt={getImageMetadata(IMAGE_URLS.JOB_DETAILS_PROFESSIONAL).alt}
            layout="responsive"
            aspectRatio="21:9"
            rounded={8}
            shadow={2}
          />
        </Box>
          <Button
            component="a"
            href={`mailto:people@bosscargo.express?subject=Job Application for ${encodeURIComponent(job.title)}&body=I am interested in applying for the ${encodeURIComponent(job.title)} position.`}
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
            Apply Now
          </Button>
        </Paper>

        {/* Additional Info */}
        <Paper
          sx={{
            p: 3,
            bgcolor: isDark ? 'action.hover' : 'action.selected',
          }}
        >
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            Application Process
          </Typography>
          <List dense>
            <ListItem sx={{ px: 0, py: 0.5 }}>
              <ListItemText primary="1. Submit your application via email with your resume and cover letter" />
            </ListItem>
            <ListItem sx={{ px: 0, py: 0.5 }}>
              <ListItemText primary="2. Our HR team will review your application within 5-7 business days" />
            </ListItem>
            <ListItem sx={{ px: 0, py: 0.5 }}>
              <ListItemText primary="3. Qualified candidates will be contacted for an initial phone screening" />
            </ListItem>
            <ListItem sx={{ px: 0, py: 0.5 }}>
              <ListItemText primary="4. Selected candidates will be invited for in-person or virtual interviews" />
            </ListItem>
            <ListItem sx={{ px: 0, py: 0.5 }}>
              <ListItemText primary="5. Final candidates may be asked to complete additional assessments" />
            </ListItem>
          </List>
        </Paper>
      </Container>
    </Box>
  );
}
