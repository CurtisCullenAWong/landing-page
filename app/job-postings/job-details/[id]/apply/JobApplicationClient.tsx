'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
    IconButton,
    Divider,
    Stack,
} from '@mui/material';

import { JobDetailsSkeleton } from '@/components/loading';
import { usePageTitle } from '@/lib/usePageTitle';
import type { Job } from '../../../../../contexts/JobContext';

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

interface Props {
    id: string;
}

export default function JobApplicationClient({ id }: Props) {
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
        linkedin_url: '',
        portfolio_url: '',
    });

    usePageTitle(job ? `Apply for ${job.title}` : 'Job Application');

    useEffect(() => {
        const checkExistingApplication = async () => {
            if (!id || !formData.email.trim()) {
                setExistingApplicationId(null);
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(formData.email.trim())) {
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

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(formData.email)) {
            setSubmitError('Please enter a valid email address.');

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
                linkedin_url: '',
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
                        href="/job-postings"
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
                                    href="/job-postings"
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
                    href={`/job-postings/job-details/${id}`}
                    startIcon={<ArrowLeft size={20} />}
                    sx={{ mb: 4 }}
                >
                    Back to Job Details
                </Button>

                {/* KEEP THE REST OF YOUR JSX HERE */}
            </Container>
        </Box>
    );
}