"use client"

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

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
      .channel('jobs-realtime')
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
      .channel('departments-realtime')
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
      const supabase = createClient();
      const { data, error } = await supabase
        .from('jobs')
        .insert({
          title: job.title,
          department: job.department,
          location: job.location,
          type: job.type,
          description: job.description,
          responsibilities: job.responsibilities,
          requirements: job.requirements,
          benefits: job.benefits || [],
          salary: job.salary,
          salary_min: job.salary_min || null,
          salary_max: job.salary_max || null,
          salary_frequency: job.salary_frequency || null,
          status: job.status || 'active',
          posted_date: new Date().toISOString(),
          employment_type: job.employment_type || null,
          work_setup: job.work_setup || null,
          job_level: job.job_level || null,
          schedule: job.schedule || null,
          views_count: job.views_count || 0,
          applications_count: job.applications_count || 0,
          featured: job.featured || false,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding job:', error);
        throw error;
      }

      if (data) {
        const newJob = mapDatabaseJobToJob(data);
        setJobs([...jobs, newJob]);
      }
    } catch (error) {
      console.error('Error adding job:', error);
      throw error;
    }
  };

  const addJobs = async (jobsToAdd: Omit<Job, 'id' | 'postedDate'>[]) => {
    try {
      if (jobsToAdd.length === 0) return;

      const supabase = createClient();
      const now = new Date().toISOString();

      const jobsData = jobsToAdd.map(job => ({
        title: job.title,
        department: job.department,
        location: job.location,
        type: job.type,
        description: job.description,
        responsibilities: job.responsibilities,
        requirements: job.requirements,
        benefits: job.benefits || [],
        salary: job.salary,
        salary_min: job.salary_min || null,
        salary_max: job.salary_max || null,
        salary_frequency: job.salary_frequency || null,
        status: job.status || 'active',
        posted_date: now,
        employment_type: job.employment_type || null,
        work_setup: job.work_setup || null,
        job_level: job.job_level || null,
        schedule: job.schedule || null,
        views_count: job.views_count || 0,
        applications_count: job.applications_count || 0,
        featured: job.featured || false,
      }));

      const { data, error } = await supabase
        .from('jobs')
        .insert(jobsData)
        .select();

      if (error) {
        console.error('Error adding jobs:', error);
        throw error;
      }

      if (data && data.length > 0) {
        const newJobs = data.map(mapDatabaseJobToJob);
        setJobs([...jobs, ...newJobs]);
      }
    } catch (error) {
      console.error('Error adding jobs:', error);
      throw error;
    }
  };

  const updateJob = async (id: string, updatedJob: Partial<Job>) => {
    try {
      const supabase = createClient();
      const updateData: Partial<DatabaseJob> = {};

      if (updatedJob.title !== undefined) updateData.title = updatedJob.title;
      if (updatedJob.department !== undefined) updateData.department = updatedJob.department;
      if (updatedJob.location !== undefined) updateData.location = updatedJob.location;
      if (updatedJob.type !== undefined) updateData.type = updatedJob.type;
      if (updatedJob.description !== undefined) updateData.description = updatedJob.description;
      if (updatedJob.responsibilities !== undefined) updateData.responsibilities = updatedJob.responsibilities;
      if (updatedJob.requirements !== undefined) updateData.requirements = updatedJob.requirements;
      if (updatedJob.benefits !== undefined) updateData.benefits = updatedJob.benefits;
      if (updatedJob.salary !== undefined) updateData.salary = updatedJob.salary;
      if (updatedJob.salary_min !== undefined) updateData.salary_min = updatedJob.salary_min;
      if (updatedJob.salary_max !== undefined) updateData.salary_max = updatedJob.salary_max;
      if (updatedJob.salary_frequency !== undefined) updateData.salary_frequency = updatedJob.salary_frequency;
      if (updatedJob.status !== undefined) updateData.status = updatedJob.status;
      if (updatedJob.postedDate !== undefined) updateData.posted_date = updatedJob.postedDate;
      if (updatedJob.employment_type !== undefined) updateData.employment_type = updatedJob.employment_type || null;
      if (updatedJob.work_setup !== undefined) updateData.work_setup = updatedJob.work_setup || null;
      if (updatedJob.job_level !== undefined) updateData.job_level = updatedJob.job_level || null;
      if (updatedJob.schedule !== undefined) updateData.schedule = updatedJob.schedule || null;
      if (updatedJob.views_count !== undefined) updateData.views_count = updatedJob.views_count;
      if (updatedJob.applications_count !== undefined) updateData.applications_count = updatedJob.applications_count;
      if (updatedJob.featured !== undefined) updateData.featured = updatedJob.featured;

      const { data, error } = await supabase
        .from('jobs')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating job:', error);
        throw error;
      }

      if (data) {
        const updated = mapDatabaseJobToJob(data);
        setJobs(prevJobs => prevJobs.map(job => job.id === id ? updated : job));
      }
    } catch (error) {
      console.error('Error updating job:', error);
      throw error;
    }
  };

  const deleteJob = async (id: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting job:', error);
        throw error;
      }

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