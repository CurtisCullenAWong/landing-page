'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useState, useCallback } from 'react';
import { ArrowLeft, Upload, FileText, Link as LinkIcon, X } from 'lucide-react';
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
  IconButton,
  Divider,
  Stack,
} from '@mui/material';
import { usePageTitle } from '@/lib/usePageTitle';

interface ApplicationFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  cover_letter: string;
  resume_url: string;
  linkedin_url: string;
  portfolio_url: string;
}

export default function GeneralApplicationPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);
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
    linkedin_url: '',
    portfolio_url: '',
  });

  // File upload handler
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      // Check if file is PDF
      if (file.type !== 'application/pdf') {
        setSubmitError('Please upload a PDF file only.');
        return;
      }
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setSubmitError('File size must be less than 10MB.');
        return;
      }
      setResumeFile(file);
      setSubmitError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    disabled: isSubmitting || isUploading,
  });

  // Upload file to Supabase Storage - returns file path for signed URL generation
  const uploadResume = async (file: File, applicationId: string): Promise<string> => {
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
        if (error.message?.includes('Bucket not found') || (error as any)?.statusCode === 404) {
          throw new Error('Storage bucket not configured. Please use a resume URL instead.');
        }
        throw error;
      }

      if (!data) {
        throw new Error('Upload failed.');
      }

      // Store file path - signed URLs will be generated when viewing
      setUploadProgress(100);
      setIsUploading(false);
      return `applicant-files:${filePath}`;
    } catch (error) {
      setIsUploading(false);
      setUploadProgress(0);
      throw error instanceof Error ? error : new Error('Failed to upload resume.');
    }
  };

  usePageTitle('General Application');

  const handleInputChange = (field: keyof ApplicationFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSubmitError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    // Validate required fields
    if (!formData.first_name.trim() || !formData.last_name.trim() || !formData.email.trim()) {
      setSubmitError('Please fill in all required fields (First Name, Last Name, and Email).');
      setIsSubmitting(false);
      return;
    }

    // Check if resume is uploaded or URL is provided
    if (!resumeFile && !formData.resume_url.trim()) {
      setSubmitError('Please upload a resume PDF or provide a resume URL.');
      setIsSubmitting(false);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setSubmitError('Please enter a valid email address.');
      setIsSubmitting(false);
      return;
    }

    try {
      // Generate UUID for the application
      const applicationId = crypto.randomUUID();
      let resumeUrl = formData.resume_url.trim();

      // Upload file if provided (using the UUID as filename)
      if (resumeFile) {
        resumeUrl = await uploadResume(resumeFile, applicationId);
      }

      const supabase = createClient();
      const { data, error } = await supabase
        .from('job_applicants')
        .insert({
          id: applicationId, // Use the generated UUID
          job_id: null, // General application - no specific job
          first_name: formData.first_name.trim(),
          last_name: formData.last_name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim() || null,
          cover_letter: formData.cover_letter.trim() || null,
          resume_url: resumeUrl,
          linkedin_url: formData.linkedin_url.trim() || null,
          portfolio_url: formData.portfolio_url.trim() || null,
          status: 'pending',
          applied_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error submitting application:', error);
        setSubmitError(error.message || 'Failed to submit application. Please try again.');
      } else if (data) {
        setApplicationId(data.id);
        setSubmitSuccess(true);
        // Reset form
        setFormData({
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          cover_letter: '',
          resume_url: '',
          linkedin_url: '',
          portfolio_url: '',
        });
        setResumeFile(null);
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.';
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  if (submitSuccess && applicationId) {
    return (
      <Box sx={{ py: 8 }}>
        <Container maxWidth="md">
          <Card>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h4" sx={{ mb: 2, fontWeight: 600, color: 'success.main' }}>
                Application Submitted Successfully!
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Thank you for your interest in Boss Cargo Express. Your general application has been received and is under review.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Your application ID: <strong>{applicationId}</strong>
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  component={Link}
                  href={`/my-application/${applicationId}`}
                  variant="contained"
                >
                  View My Application
                </Button>
                <Button
                  component={Link}
                  href="/careers"
                  variant="outlined"
                >
                  Browse Job Postings
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
        {/* Back Button */}
        <Button
          component={Link}
          href="/careers"
          startIcon={<ArrowLeft size={20} />}
          sx={{ mb: 4 }}
        >
          Back to Job Postings
        </Button>

        {/* General Application Info Card */}
        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
              General Application
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Don't see the right position? Submit a general application and we'll keep you in mind for future opportunities.
            </Typography>
          </CardContent>
        </Card>

        {/* Application Form */}
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
              Application Form
            </Typography>

            {submitError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {submitError}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Name Fields */}
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={formData.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={formData.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </Box>

                {/* Contact Fields */}
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  disabled={isSubmitting}
                />
                <TextField
                  fullWidth
                  label="Phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={isSubmitting}
                />

                {/* Resume Section Container */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                    Resume Upload {!formData.resume_url.trim() && !resumeFile && <span style={{ color: 'red' }}>*</span>}
                  </Typography>

                  <Stack spacing={2}>
                    
                    {/* Option A: File Upload */}
                    <Box sx={{ position: 'relative' }}>
                      {resumeFile ? (
                        /* 1. Selected File View */
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            bgcolor: isDark ? 'action.selected' : 'primary.50',
                            borderColor: 'primary.main',
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box
                              sx={{
                                p: 1,
                                borderRadius: 1,
                                bgcolor: 'background.paper',
                                color: 'primary.main',
                                display: 'flex'
                              }}
                            >
                              <FileText size={24} />
                            </Box>
                            <Box>
                              <Typography variant="body2" fontWeight={500} noWrap sx={{ maxWidth: 200 }}>
                                {resumeFile.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                              </Typography>
                            </Box>
                          </Box>
                          
                          <IconButton
                            size="small"
                            onClick={() => setResumeFile(null)}
                            disabled={isSubmitting || isUploading}
                            color="error"
                          >
                            <X size={18} />
                          </IconButton>
                        </Paper>
                      ) : (
                        /* 2. Dropzone View */
                        <Paper
                          {...getRootProps()}
                          variant="outlined"
                          sx={{
                            p: 4,
                            borderStyle: 'dashed',
                            borderWidth: 2,
                            borderColor: isDragActive ? 'primary.main' : 'divider',
                            bgcolor: isDragActive 
                              ? (isDark ? 'rgba(25, 118, 210, 0.08)' : 'rgba(25, 118, 210, 0.04)') 
                              : 'transparent',
                            cursor: (isSubmitting || isUploading || formData.resume_url) ? 'not-allowed' : 'pointer',
                            textAlign: 'center',
                            transition: 'all 0.2s ease-in-out',
                            opacity: formData.resume_url ? 0.5 : 1, // Dim if URL is present
                            '&:hover': {
                              borderColor: (isSubmitting || isUploading || formData.resume_url) 
                                ? 'divider' 
                                : 'primary.main',
                              bgcolor: (isSubmitting || isUploading || formData.resume_url) 
                                ? 'transparent' 
                                : (isDark ? 'action.hover' : 'grey.50'),
                            },
                          }}
                        >
                          <input {...getInputProps({ disabled: !!formData.resume_url })} />
                          <Box sx={{ 
                            mx: 'auto', 
                            width: 48, 
                            height: 48, 
                            borderRadius: '50%', 
                            bgcolor: isDark ? 'action.hover' : 'grey.100',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 2,
                            color: isDragActive ? 'primary.main' : 'text.secondary'
                          }}>
                            <Upload size={24} />
                          </Box>
                          
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {isDragActive ? 'Drop PDF here' : 'Click to upload or drag and drop'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            PDF (max 10MB)
                          </Typography>
                        </Paper>
                      )}

                      {/* Progress Bar (Absolute positioned or integrated) */}
                      {isUploading && (
                        <Box sx={{ mt: 1 }}>
                          <LinearProgress variant="determinate" value={uploadProgress} sx={{ borderRadius: 1, height: 6 }} />
                          <Typography variant="caption" color="text.secondary" align="right" sx={{ display: 'block', mt: 0.5 }}>
                            {uploadProgress}%
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Clear "OR" Divider */}
                    <Divider sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>OR</Divider>

                    {/* Option B: URL Input */}
                    <TextField
                      fullWidth
                      size="small"
                      label="Link to Resume"
                      placeholder="https://drive.google.com/file/..."
                      value={formData.resume_url}
                      onChange={(e) => handleInputChange('resume_url', e.target.value)}
                      disabled={isSubmitting || isUploading || !!resumeFile} // Disable if file selected
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LinkIcon size={18} />
                          </InputAdornment>
                        ),
                      }}
                      helperText={
                        !!resumeFile 
                          ? "Remove the uploaded file above to use a URL." 
                          : "Useful for Google Drive, Dropbox, or Portfolio links."
                      }
                    />
                  </Stack>
                </Box>

                {/* Cover Letter */}
                <TextField
                  fullWidth
                  label="Cover Letter"
                  value={formData.cover_letter}
                  onChange={(e) => handleInputChange('cover_letter', e.target.value)}
                  multiline
                  rows={6}
                  disabled={isSubmitting}
                  placeholder="Tell us about yourself and why you're interested in joining Boss Cargo Express..."
                />

                {/* LinkedIn URL */}
                <TextField
                  fullWidth
                  label="LinkedIn Profile URL (Optional)"
                  value={formData.linkedin_url}
                  onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                  disabled={isSubmitting}
                  placeholder="https://linkedin.com/in/yourprofile"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LinkIcon size={20} />
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Portfolio URL */}
                <TextField
                  fullWidth
                  label="Portfolio URL (Optional)"
                  value={formData.portfolio_url}
                  onChange={(e) => handleInputChange('portfolio_url', e.target.value)}
                  disabled={isSubmitting}
                  placeholder="https://yourportfolio.com"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LinkIcon size={20} />
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Submit Button */}
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 2 }}>
                  <Button
                    component={Link}
                    href="/careers"
                    variant="outlined"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                    startIcon={isSubmitting ? <CircularProgress size={20} /> : <Upload size={20} />}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                  </Button>
                </Box>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

