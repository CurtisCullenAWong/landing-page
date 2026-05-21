"use client"

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

// ── Edge function helper ─────────────────────────────────────────────────────
async function invokeRecruitmentFunction(action: string, params?: Record<string, unknown>) {
  const supabase = createClient();
  const { data, error } = await supabase.functions.invoke('manage-recruitment', {
    body: { action, params },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
}

export interface Job {
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
  salary_min?: number | null;
  salary_max?: number | null;
  salary_frequency?: string | null;
  postedDate: string;
  status: 'active' | 'closed';
  employment_type?: string | null;
  work_setup?: string | null;
  job_level?: string | null;
  schedule?: string | null;
  views_count?: number;
  applications_count?: number;
  featured?: boolean;
}

export interface Department {
  id: string;
  name: string;
}

// Database job type (snake_case)
interface DatabaseJob {
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
  salary_min: number | null;
  salary_max: number | null;
  salary_frequency: string | null;
  posted_date: string | null;
  status: 'active' | 'closed';
  employment_type: string | null;
  work_setup: string | null;
  job_level: string | null;
  schedule: string | null;
  views_count: number | null;
  applications_count: number | null;
  featured: boolean | null;
  created_at?: string;
}

interface JobContextType {
  jobs: Job[];
  departments: Department[];
  isLoading: boolean;
  addJob: (job: Omit<Job, 'id' | 'postedDate'>) => Promise<void>;
  addJobs: (jobs: Omit<Job, 'id' | 'postedDate'>[]) => Promise<void>;
  updateJob: (id: string, job: Partial<Job>) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  getJobById: (id: string) => Job | undefined;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

// Helper function to convert database job to app job format
function mapDatabaseJobToJob(dbJob: DatabaseJob): Job {
  // Convert posted_date timestamp to date string (YYYY-MM-DD)
  let postedDate = new Date().toISOString().split('T')[0];
  if (dbJob.posted_date) {
    try {
      postedDate = new Date(dbJob.posted_date).toISOString().split('T')[0];
    } catch (e) {
      console.warn('Error parsing posted_date:', e);
    }
  }

  return {
    id: dbJob.id,
    title: dbJob.title,
    department: dbJob.department,
    location: dbJob.location,
    type: dbJob.type,
    description: dbJob.description,
    responsibilities: dbJob.responsibilities || [],
    requirements: dbJob.requirements || [],
    benefits: dbJob.benefits || [],
    salary: dbJob.salary,
    salary_min: dbJob.salary_min ?? undefined,
    salary_max: dbJob.salary_max ?? undefined,
    salary_frequency: dbJob.salary_frequency ?? undefined,
    postedDate,
    status: dbJob.status,
    employment_type: dbJob.employment_type ?? undefined,
    work_setup: dbJob.work_setup ?? undefined,
    job_level: dbJob.job_level ?? undefined,
    schedule: dbJob.schedule ?? undefined,
    views_count: dbJob.views_count ?? undefined,
    applications_count: dbJob.applications_count ?? undefined,
    featured: dbJob.featured ?? undefined,
  };
}

export function JobProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load jobs and departments from database on mount and set up realtime subscription
  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      await Promise.all([loadJobs(), loadDepartments()]);
      setIsLoading(false);
    };
    initData();

    // Set up realtime subscription for jobs and departments
    const supabase = createClient();

    const jobsChannel = supabase
      .channel(`jobs-realtime-${crypto.randomUUID()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs',
        },
        (payload: any) => {
          console.log('Jobs Realtime event:', payload.eventType, payload);

          if (payload.eventType === 'INSERT') {
            const newJob = mapDatabaseJobToJob(payload.new as DatabaseJob);
            setJobs((prevJobs) => {
              if (prevJobs.find(job => job.id === newJob.id)) return prevJobs;
              return [newJob, ...prevJobs].sort((a, b) =>
                new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
              );
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedJob = mapDatabaseJobToJob(payload.new as DatabaseJob);
            setJobs((prevJobs) =>
              prevJobs.map((job) => (job.id === updatedJob.id ? updatedJob : job))
            );
          } else if (payload.eventType === 'DELETE') {
            setJobs((prevJobs) => prevJobs.filter((job) => job.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    const departmentsChannel = supabase
      .channel(`departments-realtime-${crypto.randomUUID()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'departments',
        },
        (payload: any) => {
          console.log('Departments Realtime event:', payload.eventType, payload);
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            loadDepartments(); // Refresh departments list
          } else if (payload.eventType === 'DELETE') {
            setDepartments((prev) => prev.filter(d => d.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(jobsChannel);
      supabase.removeChannel(departmentsChannel);
    };
  }, []);

  const loadJobs = async () => {
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

      if (!url || !key) {
        console.error('Error loading jobs: Supabase environment variables are missing');
        setJobs([]);
        setIsLoading(false);
        return;
      }

      const supabase = createClient();
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('posted_date', { ascending: false });

      if (error) {
        console.error('Error loading jobs (PostgrestError):', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        setJobs([]);
      } else if (data && data.length > 0) {
        const mappedJobs = data.map(mapDatabaseJobToJob);
        setJobs(mappedJobs);
      } else {
        setJobs([]);
      }
    } catch (error) {
      console.error('Error loading jobs (Catch):', error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error);
      setJobs([]);
    }
  };

  const loadDepartments = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error loading departments:', error);
        setDepartments([]);
      } else if (data) {
        setDepartments(data);
      }
    } catch (error) {
      console.error('Error loading departments:', error);
      setDepartments([]);
    }
  };

  const addJob = async (job: Omit<Job, 'id' | 'postedDate'>) => {
    try {
      const result = await invokeRecruitmentFunction('create-job', { jobs: [job] });
      if (result.jobs && result.jobs.length > 0) {
        const newJob = mapDatabaseJobToJob(result.jobs[0] as DatabaseJob);
        setJobs(prev => [newJob, ...prev]);
      }
    } catch (error) {
      console.error('Error adding job:', error);
      throw error;
    }
  };

  const addJobs = async (jobsToAdd: Omit<Job, 'id' | 'postedDate'>[]) => {
    try {
      if (jobsToAdd.length === 0) return;

      const result = await invokeRecruitmentFunction('create-job', { jobs: jobsToAdd });
      if (result.jobs && result.jobs.length > 0) {
        const newJobs = (result.jobs as DatabaseJob[]).map(mapDatabaseJobToJob);
        setJobs(prev => [...newJobs, ...prev]);
      }
    } catch (error) {
      console.error('Error adding jobs:', error);
      throw error;
    }
  };

  const updateJob = async (id: string, updatedJob: Partial<Job>) => {
    try {
      const result = await invokeRecruitmentFunction('update-job', { id, ...updatedJob });
      if (result.job) {
        const updated = mapDatabaseJobToJob(result.job as DatabaseJob);
        setJobs(prevJobs => prevJobs.map(job => job.id === id ? updated : job));
      }
    } catch (error) {
      console.error('Error updating job:', error);
      throw error;
    }
  };

  const deleteJob = async (id: string) => {
    try {
      await invokeRecruitmentFunction('delete-job', { id });
      setJobs(prevJobs => prevJobs.filter((job) => job.id !== id));
    } catch (error) {
      console.error('Error deleting job:', error);
      throw error;
    }
  };

  const getJobById = (id: string) => {
    return jobs.find(job => job && job.id === id);
  };

  // Don't block rendering - let children handle their own loading states
  return (
    <JobContext.Provider value={{ jobs, departments, isLoading, addJob, addJobs, updateJob, deleteJob, getJobById }}>
      {children}
    </JobContext.Provider>
  );
}

export function useJobs() {
  const context = useContext(JobContext);
  if (context === undefined) {
    throw new Error('useJobs must be used within a JobProvider');
  }
  return context;
}