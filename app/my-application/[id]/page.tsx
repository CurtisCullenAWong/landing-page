'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { ArrowLeft, FileText, Link as LinkIcon, Mail, Phone, Calendar, Briefcase, Eye } from 'lucide-react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  useTheme,
  Chip,
  Divider,
  Paper,
  Alert,
  CircularProgress,
  alpha,
} from '@mui/material';
import { JobDetailsSkeleton } from '@/components/loading';
import { usePageTitle } from '@/lib/usePageTitle';
import { PDFViewer } from '@/components/pdf-viewer';
import { formatStatus } from '@/lib/utils';


interface JobApplicant {
  id: string;
  job_id: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  cover_letter: string | null;
  resume_url: string;
  portfolio_url: string | null;
  status: 'pending' | 'reviewing' | 'interviewing' | 'offer' | 'hired' | 'rejected' | 'withdrawn';
  applied_at: string | null;
  updated_at: string | null;
}

interface JobWithTitle {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
}

export default function MyApplicationPage() {
  const params = useParams();
  const id = params?.id as string;
  const [application, setApplication] = useState<JobApplicant | null>(null);
  const [applicationsList, setApplicationsList] = useState<JobApplicant[] | null>(null);
  const [job, setJob] = useState<JobWithTitle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [resumeSignedUrl, setResumeSignedUrl] = useState<string | null>(null);
  const router = useRouter();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';



  // Check if URL is a PDF
  const isPDF = (url: string) => {
    return url.toLowerCase().endsWith('.pdf') || url.toLowerCase().includes('.pdf') || url.toLowerCase().includes('application/pdf');
  };

  // Check if URL is a storage path
  const isStoragePath = (url: string) => {
    return url.startsWith('applicant-files:');
  };

  // Generate signed URL for storage paths
  useEffect(() => {
    if (application?.resume_url && isStoragePath(application.resume_url) && pdfViewerOpen) {
      const generateSignedUrl = async () => {
        try {
          const supabase = createClient();
          const filePath = application.resume_url.replace('applicant-files:', '');
          const { data, error } = await supabase.storage
            .from('applicant-files')
            .createSignedUrl(filePath, 3600);

          if (error || !data?.signedUrl) {
            console.error('Error generating signed URL:', error);
          } else {
            setResumeSignedUrl(data.signedUrl);
          }
        } catch (error) {
          console.error('Error generating signed URL:', error);
        }
      };

      generateSignedUrl();
    } else if (application?.resume_url && !isStoragePath(application.resume_url)) {
      setResumeSignedUrl(application.resume_url);
    }
  }, [application?.resume_url, pdfViewerOpen]);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      setError('Application ID is required');
      return;
    }

    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const loadApplication = async () => {
      const decodedId = decodeURIComponent(id);
      // Validate UUID or Email format before querying Supabase
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      const isUuid = uuidRegex.test(decodedId);
      const isEmail = emailRegex.test(decodedId);

      if (!isUuid && !isEmail) {
        console.error('Invalid ID format:', decodedId);
        setError('Invalid format. Please enter a valid Application ID (UUID) or Email Address.');
        setIsLoading(false);
        return;
      }

      try {
        if (isEmail) {
          const { data: applicationsData, error: applicationsError } = await supabase
            .from('job_applicants')
            .select('*, jobs(title)')
            .ilike('email', decodedId)
            .order('applied_at', { ascending: false });

          if (applicationsError) throw applicationsError;

          if (!applicationsData || applicationsData.length === 0) {
            setError('No applications found for this email address.');
            setIsLoading(false);
            return;
          }

          if (applicationsData.length === 1) {
            router.replace(`/my-application/${applicationsData[0].id}`);
            return;
          } else {
            setApplicationsList(applicationsData);
            
            // Set up realtime subscription for the list of applications
            channel = supabase
              .channel(`applications-email-${decodedId}-changes`)
              .on(
                'postgres_changes',
                {
                  event: 'UPDATE',
                  schema: 'public',
                  table: 'job_applicants',
                  filter: `email=eq.${decodedId}`,
                },
                (payload: { new: JobApplicant; }) => {
                  console.log('Realtime event received for applications list:', payload);
                  if (payload.new) {
                    setApplicationsList((prev) => 
                      prev ? prev.map(app => 
                        app.id === payload.new.id ? { ...app, ...payload.new } : app
                      ) : null
                    );
                  }
                }
              )
              .subscribe();

            setIsLoading(false);
            return;
          }
        }

        // Load single application
        const { data: applicationData, error: applicationError } = await supabase
          .from('job_applicants')
          .select('*')
          .eq('id', decodedId)
          .single();

        if (applicationError) {
          console.error('Error loading application:', {
            message: applicationError?.message || 'Unknown error',
            details: applicationError?.details || null,
            hint: applicationError?.hint || null,
            code: applicationError?.code || null,
            fullError: applicationError,
          });
          setError(applicationError?.message || 'Application not found');
          setIsLoading(false);
          return;
        }

        if (!applicationData) {
          setError('Application not found');
          setIsLoading(false);
          return;
        }

        setApplication(applicationData);

        // Load job details
        // Only fetch job data if job_id is not null
        if (applicationData.job_id) {
          const { data: jobData, error: jobError } = await supabase
            .from('jobs')
            .select('id, title, department, location, type')
            .eq('id', applicationData.job_id)
            .single();

          if (jobError) {
            console.error('Error loading job:', {
              message: jobError?.message || 'Unknown error',
              details: jobError?.details || null,
              code: jobError?.code || null,
              fullError: jobError,
            });
          } else if (jobData) {
            setJob(jobData);
          }
        }

        // Set up realtime subscription for this specific application
        channel = supabase
          .channel(`application-${id}-changes`)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'job_applicants',
              filter: `id=eq.${decodedId}`,
            },
            (payload: { new: JobApplicant; }) => {
              console.log('Realtime event received for application:', payload);
              if (payload.new) {
                setApplication(payload.new as JobApplicant);
              }
            }
          )
          .subscribe();

        setIsLoading(false);
      } catch (error) {
        console.error('Error loading application:', {
          error,
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
        const errorMessage = error instanceof Error ? error.message : 'An error occurred while loading the application';
        setError(errorMessage);
        setIsLoading(false);
      }
    };

    loadApplication();

    // Cleanup subscription on unmount
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [id]);

  usePageTitle(application ? `Application - ${application.first_name} ${application.last_name}` : 'My Application');

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'default';
      case 'reviewing':
        return 'info';
      case 'interviewing':
        return 'warning';
      case 'offer':
        return 'success';
      case 'hired':
        return 'success';
      case 'rejected':
        return 'error';
      case 'withdrawn':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'Your application has been received and is pending review.';
      case 'reviewing':
        return 'Your application is currently being reviewed by our team.';
      case 'interviewing':
        return 'You have been selected for an interview. We will contact you soon.';
      case 'offer':
        return 'Congratulations! You have received an offer. Our team will contact you with details.';
      case 'hired':
        return 'Congratulations! You have been hired. Welcome to the team!';
      case 'rejected':
        return 'Thank you for your interest. Unfortunately, we have decided to move forward with other candidates.';
      case 'withdrawn':
        return 'Your application has been withdrawn.';
      default:
        return '';
    }
  };

  if (isLoading) {
    return <JobDetailsSkeleton />;
  }

  if (applicationsList) {
    return (
      <Box sx={{ py: 8 }}>
        <Container maxWidth="md">
          <Button
            component={Link}
            href="/my-application"
            startIcon={<ArrowLeft size={20} />}
            sx={{ mb: 4 }}
          >
            Back to Search
          </Button>
          <Typography variant="h4" sx={{ mb: 4, fontWeight: 700 }}>
            Your Applications
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {applicationsList.map((app) => (
              <Card 
                key={app.id} 
                variant="outlined" 
                onClick={() => router.push(`/my-application/${app.id}`)}
                sx={{ 
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': { 
                    borderColor: 'primary.main', 
                    bgcolor: isDark ? 'action.hover' : alpha(theme.palette.primary.main, 0.04) 
                  }
                }}
              >
                <CardContent sx={{ p: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {(app as any).jobs?.title || 'General Application'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Applied on {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : 'Unknown'}
                    </Typography>
                  </Box>
                  <Chip label={formatStatus(app.status)} size="small" color={getStatusColor(app.status) as any} sx={{ fontWeight: 600 }} />
                </CardContent>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>
    );
  }

  if (error || !application) {
    return (
      <Box sx={{ py: 8 }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 4 }}>
            {error || 'Application not found'}
          </Alert>
          <Button component={Link} href="/careers" variant="contained">
            Browse Jobs
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
          href="/careers"
          startIcon={<ArrowLeft size={20} />}
          sx={{ mb: 4 }}
        >
          Back to Careers
        </Button>

        {/* Status Alert */}
        <Alert
          severity={
            application.status?.toLowerCase() === 'hired' || application.status?.toLowerCase() === 'offer'
              ? 'success'
              : application.status?.toLowerCase() === 'rejected'
                ? 'error'
                : 'info'
          }
          sx={{ mb: 4 }}
        >
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
            Status: <Chip label={formatStatus(application.status)} size="small" color={getStatusColor(application.status) as any} sx={{ ml: 1 }} />
          </Typography>
          <Typography variant="body2">{getStatusMessage(application.status)}</Typography>
        </Alert>

        {/* Application Details Card */}
        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
              Application Details
            </Typography>

            {/* Personal Information */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Briefcase size={20} />
                Personal Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Full Name
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {application.first_name} {application.last_name}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Mail size={16} style={{ color: theme.palette.text.secondary }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {application.email}
                    </Typography>
                  </Box>
                </Box>
                {application.phone && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Phone size={16} style={{ color: theme.palette.text.secondary }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Phone
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {application.phone}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Job Information */}
            {job ? (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Briefcase size={20} />
                  Job Applied For
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                    {job.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {job.department} • {job.location} • {job.type}
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Briefcase size={20} />
                  Application Type
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                    General Application
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    You submitted a general application for future opportunities.
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Application Dates */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Calendar size={20} />
                Application Timeline
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {application.applied_at && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Applied At
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {new Date(application.applied_at).toLocaleString()}
                    </Typography>
                  </Box>
                )}
                {application.updated_at && application.updated_at !== application.applied_at && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Last Updated
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {new Date(application.updated_at).toLocaleString()}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Cover Letter */}
            {application.cover_letter && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FileText size={20} />
                  Cover Letter
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Paper sx={{ p: 2, bgcolor: isDark ? 'action.hover' : 'grey.50' }}>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                    {application.cover_letter}
                  </Typography>
                </Paper>
              </Box>
            )}

            {/* Links */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <LinkIcon size={20} />
                Links & Documents
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {application.resume_url && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Resume
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {isPDF(application.resume_url) ? (
                        <>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Eye size={16} />}
                            onClick={() => setPdfViewerOpen(true)}
                          >
                            View PDF
                          </Button>
                          {resumeSignedUrl && (
                            <Button
                              component="a"
                              href={resumeSignedUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              variant="outlined"
                              size="small"
                              startIcon={<FileText size={16} />}
                            >
                              Download
                            </Button>
                          )}
                        </>
                      ) : (
                        <Button
                          component="a"
                          href={application.resume_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          variant="outlined"
                          size="small"
                          startIcon={<FileText size={16} />}
                        >
                          View Resume
                        </Button>
                      )}
                    </Box>
                  </Box>
                )}
                {application.portfolio_url && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Portfolio
                    </Typography>
                    <Button
                      component="a"
                      href={application.portfolio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="outlined"
                      size="small"
                      startIcon={<LinkIcon size={16} />}
                    >
                      View Portfolio
                    </Button>
                  </Box>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Application ID */}
        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: isDark ? 'action.hover' : 'grey.50' }}>
          <Typography variant="body2" color="text.secondary">
            Application ID: <strong>{application.id}</strong>
          </Typography>
        </Paper>
      </Container>

      {/* PDF Viewer */}
      {application.resume_url && isPDF(application.resume_url) && resumeSignedUrl && (
        <PDFViewer
          url={application.resume_url}
          fileName={`${application.first_name}_${application.last_name}_Resume.pdf`}
          open={pdfViewerOpen}
          onClose={() => {
            setPdfViewerOpen(false);
            setResumeSignedUrl(null);
          }}
        />
      )}
    </Box>
  );
}

