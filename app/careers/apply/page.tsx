'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useState, useCallback, useEffect } from 'react';
import { ArrowLeft, Upload, FileText, Link as LinkIcon, X, ChevronRight, ShieldCheck, Info } from 'lucide-react';
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
  alpha,
  Breadcrumbs,
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

  // Defensive Theme Extraction
  const primaryMain = theme.palette.primary?.main || '#00A39D';
  const primaryDark = theme.palette.primary?.dark || '#007A76';
  const tertiaryMain = (theme.palette as any).tertiary?.main || '#FCE200';
  const bgColor = theme.palette.background?.default || '#ffffff';

  // Ensure page starts at the top on navigation
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

  usePageTitle('Employment Application');

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
      <Box sx={{ py: 12, minHeight: '100vh', bgcolor: bgColor }}>
        <Container maxWidth="md">
          <Card sx={{ position: 'relative', boxShadow: 12, borderRadius: 2 }}>
            <CornerBrackets color={tertiaryMain} radius={16} />
            <CardContent sx={{ p: 6, textAlign: 'center' }}>
              <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
                <Box sx={{ p: 2, bgcolor: alpha('success.main', 0.1), color: 'success.main', borderRadius: '50%' }}>
                  <ShieldCheck size={64} />
                </Box>
              </Box>
              <Typography variant="h3" sx={{ mb: 2, fontWeight: 900, color: 'success.main', letterSpacing: -1 }}>
                Submission Successful
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 4, fontWeight: 400 }}>
                Thank you for your interest in Boss Cargo Express. Your professional application has been formally received and queued for review by our talent acquisition team.
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, mb: 4, bgcolor: alpha(bgColor, 0.5), borderRadius: 2 }}>
                <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 800, color: 'text.disabled', display: 'block', mb: 0.5 }}>
                  Application Reference ID
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 800, fontFamily: 'monospace', letterSpacing: 1 }}>
                  {applicationId}
                </Typography>
              </Paper>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                <Button
                  component={Link}
                  href={`/my-application/${applicationId}`}
                  variant="contained"
                  size="large"
                  sx={{ px: 4, fontWeight: 700 }}
                >
                  View My Status
                </Button>
                <Button
                  component={Link}
                  href="/careers"
                  variant="outlined"
                  size="large"
                  sx={{ px: 4, fontWeight: 700 }}
                >
                  Return to Careers
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ py: { xs: 4, md: 8 }, minHeight: '100vh', bgcolor: bgColor }}>
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
          <Typography variant="caption" sx={{ fontWeight: 700, color: primaryMain }}>Employment Application</Typography>
        </Breadcrumbs>

        {/* Back Button */}
        <Button
          component={Link}
          href="/careers"
          variant="text"
          startIcon={<ArrowLeft size={18} />}
          sx={{ mb: 4, fontWeight: 700, color: 'text.secondary', '&:hover': { color: primaryMain } }}
        >
          Back to Career Listings
        </Button>

        {/* Formal Header Section */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h2" sx={{ fontWeight: 900, mb: 1, letterSpacing: -2, textTransform: 'uppercase', color: primaryMain }}>
            Employment Application
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
            Submit your professional credentials for future consideration at Boss Cargo Express.
          </Typography>
        </Box>

        {/* Formal Guidance Section */}
        <Paper
          variant="outlined"
          sx={{
            p: 3,
            mb: 4,
            bgcolor: alpha(primaryMain, 0.03),
            borderColor: alpha(primaryMain, 0.2),
            borderRadius: 2,
            display: 'flex',
            gap: 3,
            alignItems: 'flex-start'
          }}
        >
          <Box sx={{ p: 1, bgcolor: primaryMain, color: 'white', borderRadius: 1.5, display: 'flex' }}>
            <Info size={24} />
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: primaryDark, mb: 0.5 }}>
              Professional Consideration
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
              Our talent acquisition team carefully reviews every general submission. If your skills and professional experience align with future organizational requirements, a representative will contact you directly for a formal interview.
            </Typography>
          </Box>
        </Paper>

        {/* Application Form */}
        <Card sx={{ position: 'relative', boxShadow: 12, borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          <CornerBrackets color={tertiaryMain} radius={16} />
          <CardContent sx={{ p: { xs: 3, md: 5 } }}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, letterSpacing: -0.5 }}>
                Candidate Information
              </Typography>
              <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                Personal & Contact Details
              </Typography>
              <Divider sx={{ mt: 2, opacity: 0.4 }} />
            </Box>

            {submitError && (
              <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
                {submitError}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {/* Name Fields */}
                <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <TextField
                    fullWidth
                    label="First Name"
                    variant="outlined"
                    value={formData.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    required
                    disabled={isSubmitting}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                  <TextField
                    fullWidth
                    label="Last Name"
                    variant="outlined"
                    value={formData.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    required
                    disabled={isSubmitting}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Box>

                {/* Contact Fields */}
                <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    variant="outlined"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    disabled={isSubmitting}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                  <TextField
                    fullWidth
                    label="Phone Number"
                    type="tel"
                    variant="outlined"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={isSubmitting}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Box>

                {/* Resume Section Container */}
                <Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, letterSpacing: -0.2 }}>
                      Professional Credentials (Resume/CV) {!formData.resume_url.trim() && !resumeFile && <span style={{ color: 'red' }}>*</span>}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Please provide your professional history in PDF format or via a secure link.
                    </Typography>
                  </Box>

                  <Stack spacing={3}>
                    {/* Option A: File Upload */}
                    <Box sx={{ position: 'relative' }}>
                      {resumeFile ? (
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 3,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            bgcolor: alpha(primaryMain, 0.05),
                            borderColor: primaryMain,
                            borderRadius: 2
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: 'background.paper', color: primaryMain, display: 'flex', boxShadow: 1 }}>
                              <FileText size={24} />
                            </Box>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                {resumeFile.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Document Type: PDF • Size: {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                              </Typography>
                            </Box>
                          </Box>

                          <IconButton
                            size="small"
                            onClick={() => setResumeFile(null)}
                            disabled={isSubmitting || isUploading}
                            sx={{ color: 'error.main', '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1) } }}
                          >
                            <X size={20} />
                          </IconButton>
                        </Paper>
                      ) : (
                        <Paper
                          {...getRootProps()}
                          variant="outlined"
                          sx={{
                            p: 5,
                            borderStyle: 'dashed',
                            borderWidth: 2,
                            borderRadius: 2,
                            borderColor: isDragActive ? primaryMain : 'divider',
                            bgcolor: isDragActive ? alpha(primaryMain, 0.05) : 'transparent',
                            cursor: (isSubmitting || isUploading || formData.resume_url) ? 'not-allowed' : 'pointer',
                            textAlign: 'center',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            opacity: formData.resume_url ? 0.5 : 1,
                            '&:hover': {
                              borderColor: (isSubmitting || isUploading || formData.resume_url) ? 'divider' : primaryMain,
                              bgcolor: (isSubmitting || isUploading || formData.resume_url) ? 'transparent' : alpha(primaryMain, 0.02),
                            },
                          }}
                        >
                          <input {...getInputProps({ disabled: !!formData.resume_url })} />
                          <Box sx={{
                            mx: 'auto',
                            width: 56,
                            height: 56,
                            borderRadius: 2,
                            bgcolor: isDark ? 'action.hover' : 'grey.100',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 2,
                            color: isDragActive ? primaryMain : 'text.secondary'
                          }}>
                            <Upload size={28} />
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
                            {isDragActive ? 'Release to Upload PDF' : 'Upload Resume/CV'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            PDF format only • Maximum file size: 10MB
                          </Typography>
                        </Paper>
                      )}

                      {isUploading && (
                        <Box sx={{ mt: 2 }}>
                          <LinearProgress variant="determinate" value={uploadProgress} sx={{ borderRadius: 1, height: 6, bgcolor: alpha(primaryMain, 0.1) }} />
                          <Typography variant="caption" color="text.secondary" align="right" sx={{ display: 'block', mt: 1, fontWeight: 700 }}>
                            Transferring Data: {uploadProgress}%
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    <Divider sx={{ color: 'text.disabled', fontSize: '0.75rem', fontWeight: 800 }}>OR PROVIDE EXTERNAL LINK</Divider>

                    <TextField
                      fullWidth
                      label="Document URL"
                      placeholder="Enter a secure link to your resume (e.g., Google Drive, Dropbox)"
                      variant="outlined"
                      value={formData.resume_url}
                      onChange={(e) => handleInputChange('resume_url', e.target.value)}
                      disabled={isSubmitting || isUploading || !!resumeFile}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LinkIcon size={18} color={primaryMain} />
                          </InputAdornment>
                        ),
                        sx: { borderRadius: 2 }
                      }}
                      helperText={!!resumeFile ? "Remove the attached file to utilize a URL." : "Ensure the document has appropriate viewing permissions."}
                    />
                  </Stack>
                </Box>

                {/* Cover Letter */}
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
                    Professional Summary / Cover Letter
                  </Typography>
                  <TextField
                    fullWidth
                    label="Executive Summary"
                    variant="outlined"
                    value={formData.cover_letter}
                    onChange={(e) => handleInputChange('cover_letter', e.target.value)}
                    multiline
                    rows={8}
                    disabled={isSubmitting}
                    placeholder="Provide a brief overview of your professional background and motivation for joining Boss Cargo Express..."
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Box>

                {/* URLs Section */}
                <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <TextField
                    fullWidth
                    label="LinkedIn Profile"
                    variant="outlined"
                    value={formData.linkedin_url}
                    onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                    disabled={isSubmitting}
                    placeholder="https://linkedin.com/in/profile"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LinkIcon size={18} color={primaryMain} />
                        </InputAdornment>
                      ),
                      sx: { borderRadius: 2 }
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Professional Portfolio"
                    variant="outlined"
                    value={formData.portfolio_url}
                    onChange={(e) => handleInputChange('portfolio_url', e.target.value)}
                    disabled={isSubmitting}
                    placeholder="https://yourportfolio.com"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LinkIcon size={18} color={primaryMain} />
                        </InputAdornment>
                      ),
                      sx: { borderRadius: 2 }
                    }}
                  />
                </Box>

                {/* Submit Button */}
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 4, mt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                  <Button
                    component={Link}
                    href="/careers"
                    variant="text"
                    disabled={isSubmitting}
                    sx={{ fontWeight: 700, px: 3 }}
                  >
                    Discard
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                    size="large"
                    startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <Upload size={20} />}
                    sx={{ px: 5, fontWeight: 800, borderRadius: 2 }}
                  >
                    {isSubmitting ? 'Processing Submission...' : 'Submit Application'}
                  </Button>
                </Box>
              </Box>
            </form>
          </CardContent>
        </Card>

        <Typography variant="caption" color="text.disabled" sx={{ mt: 4, display: 'block', textAlign: 'center', fontWeight: 600 }}>
          By submitting this application, you authorize Boss Cargo Express to process your personal data for recruitment purposes in accordance with our Privacy Policy.
        </Typography>
      </Container>
    </Box>
  );
}

