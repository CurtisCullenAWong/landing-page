'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useJobs } from '../../../../../contexts/JobContext';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState, useCallback } from 'react';
import {
  ArrowLeft,
  Upload,
  FileText,
  Link as LinkIcon,
  X,
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  useTheme,
  Alert,
  CircularProgress,
  Paper,
  InputAdornment,
  LinearProgress,
  Divider,
  Stack,
  Grid,
  alpha,
  IconButton,
} from '@mui/material';



import { JobDetailsSkeleton } from '@/components/loading';
import { usePageTitle } from '@/lib/usePageTitle';
import {
  sanitizeString,
  formatName,
  normalizeEmail,
  formatPhone,
  isValidUrl,
  isValidEmail,
  INPUT_LIMITS
} from '@/lib/input-utils';

import type { Job } from '../../../../../contexts/JobContext';


interface ApplicationFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  cover_letter: string;
  resume_url: string;
  portfolio_url: string;
}

interface Props {
}

export default function JobApplicationClient() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';
  const router = useRouter();

  const { getJobById, isLoading: contextLoading } = useJobs();

  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [submitError, setSubmitError] = useState<string | null>(null);

  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [applicationId, setApplicationId] = useState<string | null>(null);

  const [existingApplicationId, setExistingApplicationId] = useState<
    string | null
  >(null);

  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const [uploadProgress, setUploadProgress] = useState(0);

  const [isUploading, setIsUploading] = useState(false);

  const theme = useTheme();

  const isDark = theme.palette.mode === 'dark';

  const [formData, setFormData] = useState<ApplicationFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    cover_letter: '',
    resume_url: '',
    portfolio_url: '',
  });

  usePageTitle(job ? `Apply for ${job.title}` : 'Job Application');

  useEffect(() => {
    const checkExistingApplication = async () => {
      if (!id || !formData.email.trim()) {
        setExistingApplicationId(null);
        return;
      }

      if (!isValidEmail(formData.email.trim())) {
        setExistingApplicationId(null);
        return;
      }


      try {
        const supabase = createClient();

        const { data, error } = await supabase
          .from('job_applicants')
          .select('id')
          .eq('job_id', id)
          .eq('email', formData.email.trim().toLowerCase())
          .maybeSingle();

        if (error) {
          console.error(error);
          return;
        }

        setExistingApplicationId(data?.id || null);
      } catch (error) {
        console.error(error);
      }
    };

    const timeoutId = setTimeout(checkExistingApplication, 500);

    return () => clearTimeout(timeoutId);
  }, [id, formData.email]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];

    if (!file) return;

    if (file.type !== 'application/pdf') {
      setSubmitError('Please upload a PDF file only.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setSubmitError('File size must be less than 10MB.');
      return;
    }

    setResumeFile(file);
    setSubmitError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    disabled: isSubmitting || isUploading,
  });

  const uploadResume = async (
    file: File,
    applicationId: string,
  ): Promise<string> => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const supabase = createClient();

      const fileExt = file.name.split('.').pop();

      const fileName = `${applicationId}.${fileExt}`;

      const filePath = `resumes/${fileName}`;

      const { data, error } = await supabase.storage
        .from('applicant-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        if (
          error.message?.includes('Bucket not found') ||
          (error as any)?.statusCode === 404
        ) {
          throw new Error(
            'Storage bucket not configured. Please use a resume URL instead.',
          );
        }

        throw error;
      }

      if (!data) {
        throw new Error('Upload failed.');
      }

      setUploadProgress(100);

      setIsUploading(false);

      return `applicant-files:${filePath}`;
    } catch (error) {
      setIsUploading(false);
      setUploadProgress(0);

      throw error instanceof Error
        ? error
        : new Error('Failed to upload resume.');
    }
  };

  useEffect(() => {
    if (!id) {
      setJob(null);
      setIsLoading(false);
      return;
    }

    const loadJob = async () => {
      try {
        const contextJob = getJobById(id);

        if (contextJob) {
          setJob(contextJob);
          setIsLoading(false);
          return;
        }

        if (contextLoading) {
          return;
        }

        const supabase = createClient();

        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error(error);
          setJob(null);
          return;
        }

        if (!data) {
          setJob(null);
          return;
        }

        let postedDate = new Date().toISOString().split('T')[0];

        if (data.posted_date) {
          try {
            postedDate = new Date(data.posted_date)
              .toISOString()
              .split('T')[0];
          } catch (e) {
            console.warn(e);
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
          benefits: []
        };

        setJob(mappedJob);
      } catch (error) {
        console.error(error);
        setJob(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadJob();
  }, [id, getJobById, contextLoading]);

  const handleInputChange = (
    field: keyof ApplicationFormData,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    setSubmitError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitError(null);

    setIsSubmitting(true);

    if (existingApplicationId) {
      setSubmitError(
        'You have already applied for this position. Please check your application status.',
      );

      setIsSubmitting(false);

      return;
    }

    if (
      !formData.first_name.trim() ||
      !formData.last_name.trim() ||
      !formData.email.trim()
    ) {
      setSubmitError(
        'Please fill in all required fields (First Name, Last Name, and Email).',
      );

      setIsSubmitting(false);

      return;
    }

    if (!resumeFile && !formData.resume_url.trim()) {
      setSubmitError(
        'Please upload a resume PDF or provide a resume URL.',
      );

      setIsSubmitting(false);

      return;
    }

    if (!isValidEmail(formData.email)) {
      setSubmitError('Please enter a valid email address.');
      setIsSubmitting(false);
      return;
    }

    if (formData.portfolio_url && !isValidUrl(formData.portfolio_url)) {
      setSubmitError('Please enter a valid Portfolio URL.');
      setIsSubmitting(false);
      return;
    }
    if (formData.resume_url && !isValidUrl(formData.resume_url)) {
      setSubmitError('Please enter a valid Resume URL.');
      setIsSubmitting(false);
      return;
    }


    try {
      const applicationId = crypto.randomUUID();

      let resumeUrl = formData.resume_url.trim();

      if (resumeFile) {
        resumeUrl = await uploadResume(
          resumeFile,
          applicationId,
        );
      }

      const supabase = createClient();

      const { data: existingData } = await supabase
        .from('job_applicants')
        .select('id')
        .eq('job_id', id)
        .eq('email', formData.email.trim().toLowerCase())
        .maybeSingle();

      if (existingData) {
        setExistingApplicationId(existingData.id);

        setSubmitError(
          'You have already applied for this position.',
        );

        setIsSubmitting(false);

        return;
      }

      const { data, error } = await supabase
        .from('job_applicants')
        .insert({
          id: applicationId,
          job_id: id,
          first_name: formatName(formData.first_name),
          last_name: formatName(formData.last_name),
          email: normalizeEmail(formData.email),
          phone: formatPhone(formData.phone) || null,
          cover_letter: sanitizeString(formData.cover_letter) || null,
          resume_url: resumeUrl,
          portfolio_url: formData.portfolio_url.trim() || null,
          status: 'pending',
          applied_at: new Date().toISOString(),
        })
        .select()
        .single();


      if (error) {
        throw error;
      }

      setApplicationId(data.id);

      setSubmitSuccess(true);

      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        cover_letter: '',
        resume_url: '',
        portfolio_url: '',
      });

      setResumeFile(null);
    } catch (error) {
      console.error(error);

      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Failed to submit application.',
      );
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  if (isLoading || contextLoading) {
    return <JobDetailsSkeleton />;
  }

  if (!job) {
    return (
      <Box sx={{ py: 8 }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography
            variant="h3"
            sx={{ mb: 2, fontWeight: 600 }}
          >
            Job Not Found
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 4 }}
          >
            The position you're looking for doesn't exist.
          </Typography>

          <Button
            component={Link}
            href="/#careers"
            variant="contained"
          >
            View All Positions
          </Button>
        </Container>
      </Box>
    );
  }

  if (submitSuccess && applicationId) {
    return (
      <Box sx={{ py: 8 }}>
        <Container maxWidth="md">
          <Card>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Typography
                variant="h4"
                sx={{
                  mb: 2,
                  fontWeight: 600,
                  color: 'success.main',
                }}
              >
                Application Submitted Successfully!
              </Typography>

              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mb: 4 }}
              >
                Thank you for applying to {job.title}.
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 4 }}
              >
                Your application ID:{' '}
                <strong>{applicationId}</strong>
              </Typography>

              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <Button
                  component={Link}
                  href={`/my-application/${applicationId}`}
                  variant="contained"
                >
                  View My Application
                </Button>

                <Button
                  component={Link}
                  href="/#careers"
                  variant="outlined"
                >
                  Browse More Jobs
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 8 }}>
      <Container maxWidth="md">
        <Button
          component={Link}
          href={`/careers/job-details/${id}`}
          startIcon={<ArrowLeft size={20} />}
          sx={{ mb: 4 }}
        >
          Back to Job Details
        </Button>

        <Card sx={{ position: 'relative', boxShadow: 12, borderRadius: 2 }}>
          <CardContent sx={{ p: { xs: 3, md: 5 } }}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                Apply for {job.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {job.department} • {job.location}
              </Typography>
              <Divider sx={{ mt: 2, opacity: 0.4 }} />
            </Box>

            {submitError && (
              <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
                {submitError}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Stack spacing={4}>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="First Name"
                      variant="outlined"
                      value={formData.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      required
                      disabled={isSubmitting}
                      inputProps={{ maxLength: INPUT_LIMITS.NAME }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      variant="outlined"
                      value={formData.last_name}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                      required
                      disabled={isSubmitting}
                      inputProps={{ maxLength: INPUT_LIMITS.NAME }}
                    />
                  </Grid>
                </Grid>


                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      type="email"
                      variant="outlined"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                      disabled={isSubmitting}
                      inputProps={{ maxLength: INPUT_LIMITS.EMAIL }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      variant="outlined"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={isSubmitting}
                      placeholder="+63 XXX XXX XXXX"
                      inputProps={{ maxLength: INPUT_LIMITS.PHONE }}
                    />
                  </Grid>
                </Grid>


                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                    Resume / CV (PDF preferred)
                  </Typography>
                  <Stack spacing={3}>
                    <Paper
                      {...getRootProps()}
                      variant="outlined"
                      sx={{
                        p: 4,
                        borderStyle: 'dashed',
                        borderWidth: 2,
                        borderColor: isDragActive ? 'primary.main' : 'divider',
                        bgcolor: isDragActive ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                        cursor: (isSubmitting || isUploading || formData.resume_url) ? 'not-allowed' : 'pointer',
                        textAlign: 'center',
                        opacity: formData.resume_url ? 0.5 : 1,
                      }}
                    >
                      <input {...getInputProps({ disabled: !!formData.resume_url })} />
                      {resumeFile ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                          <FileText size={24} color={theme.palette.primary.main} />
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {resumeFile.name}
                          </Typography>
                          <IconButton size="small" onClick={(e) => { e.stopPropagation(); setResumeFile(null); }}>
                            <X size={16} />
                          </IconButton>
                        </Box>
                      ) : (
                        <>
                          <Upload size={32} style={{ marginBottom: 8, opacity: 0.5 }} />
                          <Typography variant="body2">
                            {isDragActive ? 'Drop your file here' : 'Drag & drop your resume or click to upload'}
                          </Typography>
                        </>
                      )}
                    </Paper>

                    <Divider>OR</Divider>

                    <TextField
                      fullWidth
                      label="Resume URL"
                      placeholder="Link to your resume (Google Drive, Dropbox, etc.)"
                      value={formData.resume_url}
                      onChange={(e) => handleInputChange('resume_url', e.target.value)}
                      disabled={isSubmitting || isUploading || !!resumeFile}
                      inputProps={{ maxLength: INPUT_LIMITS.URL }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LinkIcon size={18} />
                          </InputAdornment>
                        ),
                      }}
                      helperText={`${formData.resume_url.length}/${INPUT_LIMITS.URL}`}
                    />
                  </Stack>
                </Box>

                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Cover Letter
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={6}
                    placeholder="Tell us why you're a great fit for this role..."
                    value={formData.cover_letter}
                    onChange={(e) => handleInputChange('cover_letter', e.target.value)}
                    disabled={isSubmitting}
                    inputProps={{ maxLength: INPUT_LIMITS.COVER_LETTER }}
                    helperText={`${formData.cover_letter.length}/${INPUT_LIMITS.COVER_LETTER}`}
                  />
                </Box>

                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Portfolio URL"
                      placeholder="https://yourportfolio.com"
                      value={formData.portfolio_url}
                      onChange={(e) => handleInputChange('portfolio_url', e.target.value)}
                      disabled={isSubmitting}
                      inputProps={{ maxLength: INPUT_LIMITS.URL }}
                      helperText={`${formData.portfolio_url.length}/${INPUT_LIMITS.URL}`}
                    />
                  </Grid>
                </Grid>


                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 2 }}>
                  <Button
                    component={Link}
                    href="/#careers"
                    variant="outlined"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting || isUploading}
                    startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <Upload size={20} />}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                  </Button>
                </Box>
              </Stack>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
