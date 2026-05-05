'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useJobs, Job } from '../../../../contexts/JobContext';
import { MapPin, Briefcase, Clock, ArrowLeft, Banknote, FileText } from 'lucide-react';
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
} from '@mui/material';
import { JobDetailsSkeleton } from '@/components/loading';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { usePageTitle } from '../../../../lib/usePageTitle';

interface Props {
}

export default function JobDetailsClient() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';
  const { getJobById, isLoading: contextLoading } = useJobs();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const theme = useTheme();

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
      <Box sx={{ py: 8 }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h3" sx={{ mb: 2, fontWeight: 600 }}>
            Job Not Found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            The position you're looking for doesn't exist.
          </Typography>
          <Button component={Link} href="/careers" variant="contained">
            View All Positions
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 8 }}>
      <Container maxWidth="md">
        <Button component={Link} href="/careers" startIcon={<ArrowLeft size={20} />} sx={{ mb: 4 }}>
          Back to All Positions
        </Button>
        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h3" sx={{ mb: 3, fontWeight: 700 }}>
              {job.title}
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Briefcase size={18} color={theme.palette.primary.main} />
                <Typography variant="body2">{job.department}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MapPin size={18} color={theme.palette.primary.main} />
                <Typography variant="body2">{job.location}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Clock size={18} color={theme.palette.primary.main} />
                <Typography variant="body2">{job.type}</Typography>
              </Box>
              {job.salary && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Banknote size={18} color={theme.palette.primary.main} />
                  <Typography variant="body2">{job.salary}</Typography>
                </Box>
              )}
            </Box>

            <Typography variant="body1" sx={{ mb: 4, whiteSpace: 'pre-wrap' }}>
              {job.description}
            </Typography>

            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                Responsibilities
              </Typography>
              <List>
                {job.responsibilities.map((responsibility, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemText primary={responsibility} />
                  </ListItem>
                ))}
              </List>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                Requirements
              </Typography>
              <List>
                {job.requirements.map((requirement, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemText primary={requirement} />
                  </ListItem>
                ))}
              </List>
            </Box>

            {job.application_url && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                  Apply Now
                </Typography>
                <Button
                  variant="contained"
                  href={job.application_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<FileText size={18} />}
                >
                  External Application
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}