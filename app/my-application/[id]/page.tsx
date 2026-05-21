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
  Grid,
  Stack,
} from '@mui/material';
import { JobDetailsSkeleton } from '@/components/loading';
import { usePageTitle } from '@/lib/usePageTitle';
import { PDFViewer } from '@/components/pdf-viewer';
import { formatStatus } from '@/lib/utils';
import { useRef } from 'react';
import jsPDF from 'jspdf';
import { PDFDocument } from 'pdf-lib';
import { Printer, Download as DownloadIcon } from 'lucide-react';


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
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const detailsRef = useRef<HTMLDivElement>(null);
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
    if (!id || id === 'null' || id === 'undefined') {
      setIsLoading(false);
      setError('Please provide a valid Application ID or Email Address');
      return;
    }

    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let isCancelled = false;

    const refreshApplicationsForEmail = async (email: string) => {
      const { data: refreshedApplications, error: refreshedError } = await supabase
        .from('job_applicants')
        .select('*, jobs(title)')
        .ilike('email', email)
        .order('applied_at', { ascending: false });

      if (isCancelled) return;

      if (refreshedError) {
        console.error('Error refreshing applications list:', refreshedError);
        return;
      }

      if (!refreshedApplications || refreshedApplications.length === 0) {
        setApplicationsList(null);
        setError('No applications found for this email address.');
        return;
      }

      if (refreshedApplications.length === 1) {
        router.replace(`/my-application/${refreshedApplications[0].id}`);
        return;
      }

      setError(null);
      setApplicationsList(refreshedApplications);
    };

    const refreshApplication = async (applicationId: string) => {
      const { data: refreshedApplication, error: refreshedError } = await supabase
        .from('job_applicants')
        .select('*')
        .eq('id', applicationId)
        .maybeSingle();

      if (isCancelled) return;

      if (refreshedError) {
        console.error('Error refreshing application:', refreshedError);
        return;
      }

      if (!refreshedApplication) {
        setApplication(null);
        setError('Application not found');
        return;
      }

      setError(null);
      setApplication(refreshedApplication);
    };

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
          const normalizedEmail = decodedId.toLowerCase();
          const { data: applicationsData, error: applicationsError } = await supabase
            .from('job_applicants')
            .select('*, jobs(title)')
            .ilike('email', normalizedEmail)
            .order('applied_at', { ascending: false });

          if (isCancelled) return;

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
            setError(null);
            setApplicationsList(applicationsData);
            const subscriptionEmail = applicationsData[0].email;

            // Set up realtime subscription for the list of applications
            channel = supabase
              .channel(`applications-email-${subscriptionEmail}-changes-${crypto.randomUUID()}`)
              .on(
                'postgres_changes',
                {
                  event: '*',
                  schema: 'public',
                  table: 'job_applicants',
                  filter: `email=eq.${subscriptionEmail}`,
                },
                async (payload: { eventType: string; new: JobApplicant; old: { id: string } | null; }) => {
                  console.log('Realtime event received for applications list:', payload);
                  await refreshApplicationsForEmail(subscriptionEmail);
                }
              )
              .subscribe();

            if (isCancelled && channel) {
              supabase.removeChannel(channel);
              return;
            }

            setIsLoading(false);
            return;
          }
        }

        // Load single application
        const { data: applicationData, error: applicationError } = await supabase
          .from('job_applicants')
          .select('*')
          .eq('id', decodedId)
          .maybeSingle();

        if (isCancelled) return;

        if (applicationError) {
          console.error('Error loading application:', applicationError);
          setError(applicationError?.message || 'Application not found');
          setIsLoading(false);
          return;
        }

        if (!applicationData) {
          setError('Application not found');
          setIsLoading(false);
          return;
        }

        setError(null);
        setApplication(applicationData);

        // Load job details
        // Only fetch job data if job_id is not null
        if (applicationData.job_id) {
          const { data: jobData, error: jobError } = await supabase
            .from('jobs')
            .select('id, title, department, location, type')
            .eq('id', applicationData.job_id)
            .maybeSingle();

          if (isCancelled) return;

          if (jobError) {
            console.error('Error loading job:', jobError);
          } else if (jobData) {
            setJob(jobData);
          }
        }

        // Set up realtime subscription for this specific application
        channel = supabase
          .channel(`application-${id}-changes-${crypto.randomUUID()}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'job_applicants',
              filter: `id=eq.${decodedId}`,
            },
            async (payload: { eventType: string; new: JobApplicant; old: { id: string } | null; }) => {
              console.log('Realtime event received for application:', payload);
              await refreshApplication(decodedId);
            }
          )
          .subscribe();

        if (isCancelled && channel) {
          supabase.removeChannel(channel);
          return;
        }

        setIsLoading(false);
      } catch (error) {
        if (isCancelled) return;
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
      isCancelled = true;
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

  const getStatusIndicatorColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'reviewing':
        return theme.palette.info.main;
      case 'interviewing':
        return theme.palette.warning.main;
      case 'offer':
      case 'hired':
        return theme.palette.success.main;
      case 'rejected':
        return theme.palette.error.main;
      case 'pending':
      case 'withdrawn':
      default:
        return theme.palette.text.disabled;
    }
  };

  const generateFullApplicationPDF = async () => {
    if (!application || !detailsRef.current) return;

    setIsGeneratingPdf(true);
    try {
      // 1. Generate Application Details Page manually using jsPDF (Document Format)
      const pdf = new jsPDF('p', 'mm', 'a4');
      const margin = 20;
      let y = 20;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const contentWidth = pageWidth - (margin * 2);

      // Helper for adding horizontal lines
      const addLine = (currY: number) => {
        pdf.setDrawColor(200, 200, 200);
        pdf.line(margin, currY, pageWidth - margin, currY);
      };

      // Header
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(24);
      pdf.text('Job Application', margin, y);
      y += 10;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Application ID: ${application.id}`, margin, y);
      y += 15;

      // Status
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('Current Status:', margin, y);
      pdf.setFont('helvetica', 'normal');
      pdf.text(formatStatus(application.status), margin + 35, y);
      y += 15;

      // Section: Personal Information
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.text('Personal Information', margin, y);
      y += 2;
      addLine(y);
      y += 8;

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Full Name: ${application.first_name} ${application.last_name}`, margin, y); y += 7;
      pdf.text(`Email: ${application.email}`, margin, y); y += 7;
      if (application.phone) {
        pdf.text(`Phone: ${application.phone}`, margin, y); y += 7;
      }
      y += 10;

      // Section: Job Information
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.text('Job Information', margin, y);
      y += 2;
      addLine(y);
      y += 8;

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      if (job) {
        pdf.setFont('helvetica', 'bold');
        pdf.text(job.title, margin, y); y += 6;
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(100, 100, 100);
        pdf.text(`${job.department} | ${job.location} | ${job.type}`, margin, y);
        pdf.setTextColor(0, 0, 0);
      } else {
        pdf.text('General Application', margin, y);
      }
      y += 12;

      // Section: Application Timeline
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.text('Application Timeline', margin, y);
      y += 2;
      addLine(y);
      y += 8;

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      if (application.applied_at) {
        pdf.text(`Applied On: ${new Date(application.applied_at).toLocaleString()}`, margin, y);
        y += 7;
      }
      if (application.updated_at && application.updated_at !== application.applied_at) {
        pdf.text(`Last Updated: ${new Date(application.updated_at).toLocaleString()}`, margin, y);
        y += 7;
      }
      y += 10;

      // Section: Cover Letter
      if (application.cover_letter) {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(14);
        pdf.text('Cover Letter', margin, y);
        y += 2;
        addLine(y);
        y += 8;

        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        const splitLines = pdf.splitTextToSize(application.cover_letter, contentWidth);
        pdf.text(splitLines, margin, y);
        y += (splitLines.length * 6);
      }

      const appPdfBytes = pdf.output('arraybuffer');

      // 2. Merge with Resume if it exists and is a PDF
      if (application.resume_url && isPDF(application.resume_url)) {
        try {
          let resumeUrl = application.resume_url;

          // If it's a storage path, we need to generate a signed URL
          if (isStoragePath(resumeUrl)) {
            const supabase = createClient();
            const filePath = resumeUrl.replace('applicant-files:', '');
            const { data, error: urlError } = await supabase.storage
              .from('applicant-files')
              .createSignedUrl(filePath, 60); // 60 seconds is enough for the fetch

            if (urlError || !data?.signedUrl) {
              throw new Error('Failed to generate signed URL for resume');
            }
            resumeUrl = data.signedUrl;
          }

          const response = await fetch(resumeUrl);
          if (!response.ok) throw new Error('Failed to fetch resume');
          const resumeBytes = await response.arrayBuffer();

          const mergedPdf = await PDFDocument.create();

          // Load application details PDF
          const appDoc = await PDFDocument.load(appPdfBytes);
          const copiedAppPages = await mergedPdf.copyPages(appDoc, appDoc.getPageIndices());
          copiedAppPages.forEach(page => mergedPdf.addPage(page));

          // Load resume PDF
          const resumeDoc = await PDFDocument.load(resumeBytes);
          const copiedResumePages = await mergedPdf.copyPages(resumeDoc, resumeDoc.getPageIndices());
          copiedResumePages.forEach(page => mergedPdf.addPage(page));

          const finalPdfBytes = await mergedPdf.save();

          // Create blob and download
          const blob = new Blob([finalPdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${application.first_name}_${application.last_name}_Application_Full.pdf`;
          link.click();
          URL.revokeObjectURL(url);
        } catch (mergeError) {
          console.error('Error merging PDFs:', mergeError);
          // Fallback: just download the application details
          pdf.save(`${application.first_name}_${application.last_name}_Application_Details.pdf`);
        }
      } else {
        // No resume or not a PDF, just save details
        pdf.save(`${application.first_name}_${application.last_name}_Application_Details.pdf`);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
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
          <Button component={Link} href="/#careers" variant="contained">
            Browse Jobs
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 8 }}>
      <Container maxWidth="md">
        {/* Header Section */}
        <Box sx={{ mb: 6, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'flex-end' }, gap: 3 }}>
          <Box>
            <Button
              component={Link}
              href="/#careers"
              startIcon={<ArrowLeft size={20} />}
              sx={{ mb: 2, color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
            >
              Back to Careers
            </Button>
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.02em' }}>
              Application Details
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Review your submission and tracking status
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              color="primary"
              startIcon={isGeneratingPdf ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon size={20} />}
              onClick={generateFullApplicationPDF}
              disabled={isGeneratingPdf}
              sx={{
                fontWeight: 600,
                px: 3,
                py: 1.5,
                borderRadius: '12px',
                boxShadow: theme.shadows[4],
                '&:hover': {
                  boxShadow: theme.shadows[8],
                }
              }}
            >
              {isGeneratingPdf ? 'Generating PDF...' : 'Download Full Application'}
            </Button>
          </Box>
        </Box>

        {/* Status Card */}
        <Card
          sx={{
            mb: 4,
            borderRadius: '16px',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            overflow: 'hidden',
            boxShadow: 'none',
            bgcolor: isDark ? alpha(theme.palette.primary.main, 0.05) : alpha(theme.palette.primary.main, 0.02),
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-start', sm: 'center' },
                justifyContent: 'space-between',
                gap: 1.5,
                mb: 2,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1.5, lineHeight: 1.3 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: getStatusIndicatorColor(application.status), flexShrink: 0 }} />
                Current Status
              </Typography>
              <Chip
                label={formatStatus(application.status)}
                color={getStatusColor(application.status) as any}
                sx={{ fontWeight: 700, px: 1, alignSelf: { xs: 'flex-start', sm: 'center' } }}
              />
            </Box>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 0, lineHeight: 1.7 }}>
              {getStatusMessage(application.status)}
            </Typography>
          </CardContent>
        </Card>

        {/* Application Details Grid */}
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Card sx={{ height: '100%', borderRadius: '16px', border: `1px solid ${alpha(theme.palette.divider, 0.1)}`, boxShadow: theme.shadows[1] }} ref={detailsRef}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ mb: 4, fontWeight: 700 }}>
                  Personal Information
                </Typography>

                <Stack spacing={3}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      Full Name
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {application.first_name} {application.last_name}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Box sx={{ p: 1, borderRadius: '8px', bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
                      <Mail size={20} />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        Email Address
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {application.email}
                      </Typography>
                    </Box>
                  </Box>

                  {application.phone && (
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Box sx={{ p: 1, borderRadius: '8px', bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
                        <Phone size={20} />
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                          Phone Number
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {application.phone}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {application.cover_letter && (
                    <Box sx={{ pt: 2 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', mb: 1, display: 'block' }}>
                        Cover Letter
                      </Typography>
                      <Paper variant="outlined" sx={{ p: 3, borderRadius: '12px', bgcolor: isDark ? 'action.hover' : 'grey.50', border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                        <Typography
                          variant="body2"
                          sx={{
                            whiteSpace: 'pre-wrap',
                            lineHeight: 1.7,
                            color: 'text.secondary',
                            overflowWrap: 'anywhere',
                            wordBreak: 'break-word',
                          }}
                        >
                          {application.cover_letter}
                        </Typography>
                      </Paper>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Stack spacing={4}>
              {/* Job Info */}
              <Card sx={{ borderRadius: '16px', border: `1px solid ${alpha(theme.palette.divider, 0.1)}`, boxShadow: theme.shadows[1] }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Briefcase size={20} />
                    Job Details
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: 'primary.main' }}>
                      {job?.title || 'General Application'}
                    </Typography>
                    {job ? (
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                        {job.department} • {job.location} • {job.type}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Submitted for future opportunities
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card sx={{ borderRadius: '16px', border: `1px solid ${alpha(theme.palette.divider, 0.1)}`, boxShadow: theme.shadows[1] }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Calendar size={20} />
                    Timeline
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  <Stack spacing={2}>
                    {application.applied_at && (
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                          Applied On
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {new Date(application.applied_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
                        </Typography>
                      </Box>
                    )}
                    {application.updated_at && application.updated_at !== application.applied_at && (
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                          Last Update
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {new Date(application.updated_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>

              {/* Links */}
              <Card sx={{ borderRadius: '16px', border: `1px solid ${alpha(theme.palette.divider, 0.1)}`, boxShadow: theme.shadows[1] }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <LinkIcon size={20} />
                    Documents
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  <Stack spacing={2}>
                    {application.resume_url && (
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', mb: 1, display: 'block' }}>
                          Resume
                        </Typography>
                        <Stack direction="row" spacing={1}>
                          {isPDF(application.resume_url) ? (
                            <>
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<Eye size={16} />}
                                onClick={() => setPdfViewerOpen(true)}
                                data-html2canvas-ignore
                                sx={{ 
                                  bgcolor: alpha(theme.palette.primary.main, 0.05), 
                                  borderColor: alpha(theme.palette.primary.main, 0.2),
                                  color: 'primary.main', 
                                  '&:hover': { 
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    borderColor: 'primary.main',
                                  } 
                                }}
                              >
                                View
                              </Button>
                              {resumeSignedUrl && (
                                <Button
                                  component="a"
                                  href={resumeSignedUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  variant="outlined"
                                  size="small"
                                  startIcon={<DownloadIcon size={16} />}
                                  data-html2canvas-ignore
                                  sx={{ 
                                    bgcolor: alpha(theme.palette.info.main, 0.05), 
                                    borderColor: alpha(theme.palette.info.main, 0.2),
                                    color: 'info.main', 
                                    '&:hover': { 
                                      bgcolor: alpha(theme.palette.info.main, 0.1),
                                      borderColor: 'info.main',
                                    } 
                                  }}
                                >
                                  Get File
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
                              data-html2canvas-ignore
                            >
                              Download Resume
                            </Button>
                          )}
                        </Stack>
                      </Box>
                    )}
                    {application.portfolio_url && (
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', mb: 1, display: 'block' }}>
                          Portfolio
                        </Typography>
                        <Box
                          component="a"
                          href={application.portfolio_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-html2canvas-ignore
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.25,
                            px: 1.5,
                            py: 1.25,
                            borderRadius: '10px',
                            border: `1px solid ${alpha(theme.palette.info.main, 0.25)}`,
                            bgcolor: alpha(theme.palette.info.main, 0.06),
                            color: 'info.main',
                            textDecoration: 'none',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              bgcolor: alpha(theme.palette.info.main, 0.12),
                              borderColor: 'info.main',
                            },
                          }}
                        >
                          <LinkIcon size={16} />
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {application.portfolio_url}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>

        {/* Footer ID */}
        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 500 }}>
            Application ID: {application.id}
          </Typography>
        </Box>
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

