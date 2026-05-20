# Boss Cargo Express Landing Page

## Ownership and Copyright Notice

This project and its entire source code, design assets, database structures, documentation, and operational configurations are rightfully, legally, and consensually owned by Curtis Cullen A. Wong ("SHOULD BE CONSENSUALLY MINE").

All rights are reserved. No portion of this software, code, or assets may be copied, reproduced, distributed, modified, mirrored, or transmitted in any form or by any means, including copying, recording, or other electronic or mechanical methods, without the prior, explicit, and consensual written consent of Curtis Cullen A. Wong. Any unauthorized access, utilization, or distribution of this proprietary property is strictly prohibited and will be prosecuted under applicable civil and criminal laws.

---

## Project Overview

The Boss Cargo Express Landing Page is a premium, high-performance web application designed for a leading logistics and freight forwarding company in the Philippines. The platform provides a modern online presence featuring corporate branding, an interactive service coverage map, a content management publishing engine, and an integrated Applicant Tracking System (ATS) to manage career opportunities and applications.

---

## Features for Normal Users and Visitors

### Corporate Profile and History
Visitors can learn about the company history, mission, vision, and core corporate values. An interactive timeline charts the development of Boss Cargo Express from its founding in Puerto Princesa City, Palawan in 2014, through its expansion phases, to its current technology-driven logistics operations.

### Interactive Coverage Map
An interactive map of the Philippines visualizes branches and service coverage points. Users can hover over and click on markers across major regions (North Luzon, Central Luzon, Metro Manila, South Luzon, Visayas, and Mindanao) to view descriptions and location summaries.

### Careers Portal
Job seekers can search and filter open positions by department, job level, work setup (onsite, remote, hybrid), and employment type (such as full-time or part-time). Detailed descriptions outline the responsibilities, requirements, and benefits of each opening.

### Job Application and Tracking
Candidates can submit applications directly on the website. The application form allows them to upload a PDF resume, provide links to their portfolio or LinkedIn profile, and submit a cover letter. Upon submission, they receive a unique Application Tracking ID which they can use to check their review status in real-time.

### Company News and Content Hub
Users can browse published news articles, announcements, event listings, and gallery updates of company milestones and activities.

---

## Features for Administrators and Recruiters

### Candidate Application Management (ATS)
A secure admin panel provides a comprehensive dashboard of all applicants. Administrators can search applications by applicant name, email, phone number, or target job, and filter candidates by hiring status. The interface includes a built-in PDF viewer so recruiters can review resumes directly on the page without needing to download files locally.

### Vacancy Control and Posting
Recruiters can create new job openings, edit existing descriptions, update job statuses (active or closed), and manage requirements. The portal supports bulk creation tools to publish multiple career opportunities at the same time.

### News and Content Publishing
Administrators can publish news, announcement, and gallery updates, complete with markdown rendering support and media uploads.

### Real-Time Synchronization
All changes to applications, candidates, and job postings sync in real-time. This ensures that any update made by one recruiter is immediately reflected on all active admin screens without requiring manual browser reloads.

### Traffic and Site Analytics
The admin panel includes page view analytics and session tracking metrics, helping the operations team monitor website traffic trends across different pages (excluding admin and private user routes).

---

## Technical Stack

* **Frontend Framework**: Next.js 16 (utilizing App Router and React Server Components)
* **Language**: TypeScript for static type-safety
* **User Interface**: Material-UI (MUI) v7 components combined with Framer Motion for animations
* **Styling**: Tailwind CSS and Emotion (CSS-in-JS)
* **Theme Engine**: next-themes with support for system-matching light and dark mode toggles
* **Backend Database**: PostgreSQL hosted on Supabase
* **Authentication**: Supabase Auth for admin sessions
* **File Storage**: Supabase Storage Buckets
* **Real-time Sync**: Supabase Realtime logical replication subscriptions

---

## Project Directory Structure

```
boss-cargo/
├── app/                          # Next.js App Router pages
│   ├── about-us/                 # About Us profile page
│   ├── admin/                    # Administrative dashboard routes
│   ├── auth/                     # Supabase Authentication routes
│   ├── careers/                  # Public careers portal and application forms
│   ├── history/                  # Interactive history timeline page
│   ├── partnerships/             # Partners and memberships grid
│   └── why-us/                   # Corporate values page
├── components/                   # Reusable React components
│   ├── layout/                   # Global header, footer, and navigation
│   └── ui/                       # Shared design system elements
├── contexts/                     # Global React state contexts
├── docs/                         # SQL Schemas and technical documentation
├── hooks/                        # Custom React hooks
├── lib/                          # SDK initialization and helpers
└── assets/                       # Static images, icons, and logos
```

---

## Developer Setup and Configuration Guide

This section guides developers through setting up the local development environment.

### Prerequisites

Verify that the following tools are installed:
* **Node.js**: Version 18.0.0 or higher (Version 20.0.0+ is recommended)
* **Package Manager**: npm
* **Git**
* A **Supabase** account and project

### Step-by-Step Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/CurtisCullenAWong/landing-page.git
cd landing-page
```

#### 2. Install Dependencies
Run the npm installer to load all required packages specified in [package.json](file:///d:/Apps%20and%20Tools/GitHub/landing-page/package.json):
```bash
npm install
```

#### 3. Set Up Environment Variables
Create a file named `.env.local` in the root directory of the project and add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
```
You can locate these keys in your Supabase Dashboard under Project Settings > API.

#### 4. Configure the Database Schema
* Open your project dashboard in Supabase and navigate to the **SQL Editor**.
* Open the [supabase_full_schema.sql](file:///d:/Apps%20and%20Tools/GitHub/landing-page/docs/supabase_full_schema.sql) file in your editor.
* Copy the SQL commands and run them in the Supabase SQL editor. This script is fully idempotent and configures:
  * Database extensions (`pgcrypto`).
  * Custom database ENUMs (`job_status`, `application_status`, `post_type`).
  * Tables (`profiles`, `departments`, `jobs`, `job_applicants`, `posts`, `site_visits`, `partners`, `milestones`, `coverage_points`).
  * Speed indexes.
  * Row-Level Security (RLS) policies.
  * Core seed data (default departments, partners, milestones, coverage points).
  * Storage buckets (`applicant-files` and `posts`).

#### 5. Verify Storage Bucket Configuration
Check the **Storage** tab in your Supabase Dashboard to confirm that the buckets are correctly configured:
* **`applicant-files`**:
  * Public: Disabled (private bucket for candidate resumes)
  * Allowed MIME Types: `application/pdf`
  * Size Limit: `10485760` bytes (10MB)
* **`posts`**:
  * Public: Enabled (public bucket for news and events images)
  * Allowed MIME Types: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
  * Size Limit: `5242880` bytes (5MB)

#### 6. Enable Logical Replication for Real-time Updates
Ensure that logical replication publishes changes to the frontend client. The schema script sets up a publication named `supabase_realtime`. You can verify that logical replication is listening to the required tables by running this SQL query in Supabase:
```sql
SELECT schemaname, tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
```
The result must list: `jobs`, `job_applicants`, `posts`, `departments`, `milestones`, and `coverage_points`. More details can be found in [supabase-realtime.md](file:///d:/Apps%20and%20Tools/GitHub/landing-page/docs/supabase-realtime.md).

#### 7. Set Up an Administrator Account
Create your admin user under the **Authentication** > **Users** tab in your Supabase dashboard. Any authenticated user profile in the database is granted administrative privileges. The signup trigger will automatically create an entry in the `public.profiles` table.

#### 8. Start the Local Server
Run the development command to start the Next.js local server with Turbo Pack enabled:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## Available Development Scripts

The following commands are configured in [package.json](file:///d:/Apps%20and%20Tools/GitHub/landing-page/package.json):
* `npm run dev`: Runs the application in development mode.
* `npm run build`: Compiles the application for production deployment.
* `npm run start`: Starts the compiled production application.
* `npm run lint`: Runs ESLint to verify codebase formatting and quality.
