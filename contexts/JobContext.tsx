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
  salary: string;
  postedDate: string;
  status: 'active' | 'closed';
  application_url?: string;
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
  salary: string;
  posted_date: string | null;
  status: 'active' | 'closed';
  application_url?: string | null;
  created_at?: string;
}

interface JobContextType {
  jobs: Job[];
  isLoading: boolean;
  addJob: (job: Omit<Job, 'id' | 'postedDate'>) => Promise<void>;
  addJobs: (jobs: Omit<Job, 'id' | 'postedDate'>[]) => Promise<void>;
  updateJob: (id: string, job: Partial<Job>) => void;
  deleteJob: (id: string) => void;
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
    salary: dbJob.salary,
    postedDate,
    status: dbJob.status,
    application_url: dbJob.application_url || undefined,
  };
}

export function JobProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load jobs from database on mount and set up realtime subscription
  useEffect(() => {
    loadJobs();

    // Set up realtime subscription for jobs table
    const supabase = createClient();
    const channel = supabase
      .channel('jobs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs',
        },
        (payload: { eventType: string; new: DatabaseJob; old: { id: string; }; }) => {
          console.log('Realtime event received:', payload.eventType, payload);
          
          if (payload.eventType === 'INSERT') {
            const newJob = mapDatabaseJobToJob(payload.new as DatabaseJob);
            setJobs((prevJobs) => {
              // Check if job already exists (avoid duplicates)
              if (prevJobs.find(job => job.id === newJob.id)) {
                return prevJobs;
              }
              return [...prevJobs, newJob].sort((a, b) => 
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

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadJobs = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('posted_date', { ascending: false });

      if (error) {
        console.error('Error loading jobs:', error);
        setJobs([]);
      } else if (data && data.length > 0) {
        const mappedJobs = data.map(mapDatabaseJobToJob);
        setJobs(mappedJobs);
      } else {
        setJobs([]);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
      setJobs([]);
    } finally {
      setIsLoading(false);
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
          salary: job.salary,
          status: job.status || 'active',
          posted_date: new Date().toISOString(),
          application_url: job.application_url || null,
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
        salary: job.salary,
        status: job.status || 'active',
        posted_date: now,
        application_url: job.application_url || null,
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
      if (updatedJob.salary !== undefined) updateData.salary = updatedJob.salary;
      if (updatedJob.status !== undefined) updateData.status = updatedJob.status;
      if (updatedJob.postedDate !== undefined) updateData.posted_date = updatedJob.postedDate;
      if (updatedJob.application_url !== undefined) updateData.application_url = updatedJob.application_url || null;

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
        setJobs(jobs.map(job => job.id === id ? updated : job));
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

      setJobs(jobs.filter(job => job.id !== id));
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
    <JobContext.Provider value={{ jobs, isLoading, addJob, addJobs, updateJob, deleteJob, getJobById }}>
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