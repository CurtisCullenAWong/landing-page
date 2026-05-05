# Boss Cargo Express

A modern, full-featured web application for Boss Cargo Express, a leading logistics and freight forwarding company in the Philippines. This platform provides company information, careers, application management, and administrative tools.

## 🚀 Features

### Public Features
- **Company Information**
  - Home page with company overview and mission
  - About Us page with company history and background
  - Why Us page showcasing mission, vision, and values
  - Company history timeline
  - Partnerships information

- **Career Portal**
  - Browse active careers with advanced filtering
  - Search by title, department, location, or job type
  - Sort by various criteria (title, department, location, type, posted date)
  - View detailed job descriptions
  - Apply for specific positions
  - Submit general applications (no specific job)
  - Track application status

- **Application Management**
  - Upload resume (PDF) or provide resume URL
  - Submit cover letters
  - Link LinkedIn and portfolio profiles
  - View application status and updates
  - Receive application ID for tracking

### Admin Features
- **Careers Management**
  - Create, edit, and manage careers
  - Bulk create multiple careers
  - Set job status (active/closed)
  - Manage job details (title, department, location, type, salary, description, requirements)

- **Application Management**
  - View all job applications
  - Filter by status (pending, reviewing, interviewing, offer, hired, rejected, withdrawn)
  - Search applicants by name, email, phone, or job title
  - Update application status
  - View applicant resumes (PDF viewer)
  - Delete applications
  - Real-time updates via Supabase subscriptions

- **Authentication**
  - Secure admin login
  - Password reset functionality
  - Session management

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Library**: [Material-UI (MUI)](https://mui.com/) v7
- **Styling**: 
  - Tailwind CSS
  - Emotion (CSS-in-JS)
- **Icons**: 
  - Lucide React
  - Material-UI Icons
- **File Upload**: React Dropzone
- **Theme**: next-themes (dark/light mode support)

### Backend & Database
- **Backend**: [Supabase](https://supabase.com/)
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (for resume files)
- **Real-time**: Supabase Realtime subscriptions

### Development Tools
- **Linting**: ESLint
- **Package Manager**: npm
- **Type Checking**: TypeScript

## 📁 Project Structure

```
boss-cargo/
├── app/                          # Next.js App Router pages
│   ├── about-us/                 # About Us page
│   ├── admin/                    # Admin dashboard
│   │   ├── job-applications/     # Application management
│   │   └── careers/         # Job posting management
│   ├── auth/                     # Authentication pages
│   │   ├── login/
│   │   ├── sign-up/
│   │   ├── forgot-password/
│   │   └── update-password/
│   ├── home/                     # Home page
│   ├── history/                  # Company history
│   ├── careers/             # Career portal
│   │   ├── apply/                # General application form
│   │   └── job-details/[id]/     # Job detail pages
│   │       └── apply/             # Job-specific application
│   ├── my-application/[id]/      # View application status
│   ├── partnerships/             # Partnerships page
│   └── why-us/                   # Mission, Vision, Values
├── components/                   # React components
│   ├── layout/                   # Layout components (Header, Footer)
│   ├── ui/                       # UI components
│   └── ...
├── contexts/                     # React contexts
│   └── JobContext.tsx            # Job data context
├── lib/                          # Utility libraries
│   ├── supabase/                 # Supabase client/server setup
│   └── utils.ts                  # Helper functions
├── constants/                    # App constants
│   ├── images.ts                 # Image URLs and metadata
│   ├── layout.ts                 # Layout constants
│   └── navigation.ts            # Navigation links
├── hooks/                        # Custom React hooks
└── assets/                       # Static assets (images, fonts)
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account and project
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd boss-cargo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   ```
   
   You can find these values in your [Supabase project settings](https://supabase.com/dashboard/project/_/settings/api).

4. **Set up Supabase Database**
   
   You'll need to create the following tables in your Supabase database:
   
   - `jobs` - careers
   - `job_applicants` - Job applications
   - User authentication tables (handled by Supabase Auth)
   
   See the [Database Schema](#database-schema) section below for details.

5. **Set up Supabase Storage**
   
   Create a storage bucket named `applicant-files` for storing resume files:
   ```sql
   -- In Supabase Dashboard > Storage, create a bucket:
   -- Name: applicant-files
   -- Public: false (private bucket)
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📊 Database Schema

### `jobs` Table
```sql
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  location TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  responsibilities TEXT[],
  requirements TEXT[],
  salary TEXT,
  posted_date DATE,
  status TEXT CHECK (status IN ('active', 'closed')) DEFAULT 'active',
  application_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### `job_applicants` Table
```sql
CREATE TABLE job_applicants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  cover_letter TEXT,
  resume_url TEXT NOT NULL,
  linkedin_url TEXT,
  portfolio_url TEXT,
  status TEXT CHECK (status IN ('pending', 'reviewing', 'interviewing', 'offer', 'hired', 'rejected', 'withdrawn')) DEFAULT 'pending',
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by TEXT
);

-- Index for faster queries
CREATE INDEX idx_job_applicants_job_id ON job_applicants(job_id);
CREATE INDEX idx_job_applicants_email ON job_applicants(email);
CREATE INDEX idx_job_applicants_status ON job_applicants(status);
```

### Row Level Security (RLS) Policies

Set up RLS policies in Supabase:

```sql
-- Jobs table: Public read access
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Jobs are viewable by everyone" ON jobs
  FOR SELECT USING (true);

-- Job applicants: Public insert, authenticated admin read/update/delete
ALTER TABLE job_applicants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit applications" ON job_applicants
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own applications" ON job_applicants
  FOR SELECT USING (true);

-- Admin policies (adjust based on your auth setup)
CREATE POLICY "Admins can manage all applications" ON job_applicants
  FOR ALL USING (auth.role() = 'admin');
```

## 🔐 Authentication Setup

The application uses Supabase Auth. To set up admin access:

1. Create admin users through Supabase Dashboard or your auth flow
2. Configure RLS policies to restrict admin routes
3. Update admin route protection in `lib/middleware.ts` if needed

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🎨 Features in Detail

### Dark Mode Support
- Automatic theme detection based on system preferences
- Manual theme toggle
- Persistent theme selection
- Smooth theme transitions

### Responsive Design
- Mobile-first approach
- Responsive layouts for all screen sizes
- Touch-friendly interfaces
- Optimized for tablets and desktops

### Real-time Updates
- Live updates for careers
- Real-time application status changes
- Instant notifications for admins

### File Upload
- PDF resume uploads
- File size validation (max 10MB)
- Progress indicators
- Alternative URL input option

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
4. Deploy!

### Environment Variables for Production

Make sure to set these in your deployment platform:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` - Your Supabase anon/publishable key

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary and confidential. All rights reserved.

## 📞 Contact

For inquiries about Boss Cargo Express:
- **General**: info@bosscargo.express
- **Careers**: people@bosscargo.express
- **Phone**: (02) 8805 2402

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Material-UI](https://mui.com/)
- Backend powered by [Supabase](https://supabase.com/)
- Icons from [Lucide](https://lucide.dev/)

---

**Boss Cargo Express** - Logistics Driven by People
