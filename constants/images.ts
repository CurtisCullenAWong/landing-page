import HeroBackground from '@/assets/images/home/HERO_BACKGROUND.jpg';
import HomeLogisticsServices from '@/assets/images/home/HOME_LOGISTICS_SERVICES.jpg';
import JobsCareerGrowth from '@/assets/images/job-postings/JOBS_CAREER_GROWTH.jpg';
import HomeTeamCollaboration from '@/assets/images/home/HOME_TEAM_COLLABORATION.jpg';
/**
 * Image URL Constants
 * * Centralized image URLs for easy replacement and management.
 * Update these URLs to change images across the application.
 */
export const IMAGE_URLS = {
  // Hero & Landing Images
  HERO_BACKGROUND: HeroBackground,
  
  // About Us Page
  ABOUT_WAREHOUSE_TEAM: 'https://images.unsplash.com/photo-1739204618173-3e89def7140f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb2dpc3RpY3MlMjB3YXJlaG91c2UlMjB0ZWFtfGVufDF8fHx8MTc2NjI0NTAzN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  
  // History Page
  HISTORY_CARGO_TRUCK: 'https://images.unsplash.com/photo-1682033239487-30f076c82232?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJnbyUyMHRydWNrJTIwaGlnaHdheXxlbnwxfHx8fDE3NjYyMzgxODR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  
  // Partnerships Page
  PARTNERSHIPS_HANDSHAKE: 'https://images.unsplash.com/photo-1758599543152-a73184816eba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGhhbmRzaGFrZSUyMHBhcnRuZXJzaGlwfGVufDF8fHx8MTc2NjIzOTQ0MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  
  // Memberships & Accreditations
  MEMBERSHIP_SCMAP: 'https://cdn.prod.website-files.com/6835326349a54fd20d519406/68b1aea25a00d8c67b1781b0_scmap.png',
  MEMBERSHIP_PEZA: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/PEZA_logo.svg/1200px-PEZA_logo.svg.png',
  MEMBERSHIP_JCTRANS: 'https://www.bosscargo.express/wp-content/uploads/elementor/thumbs/Group-7-qwjw4kp80oqvhxxr88qo1vg0kljf7tsuwp8qjwhmea.png',
  
  // Home Page
  HOME_LOGISTICS_SERVICES: HomeLogisticsServices,
  HOME_TEAM_COLLABORATION: HomeTeamCollaboration,
  
  // Job Postings Page
  JOBS_CAREER_GROWTH: JobsCareerGrowth,
  JOBS_OFFICE_ENVIRONMENT: 'https://images.unsplash.com/photo-1497366216548-37526070297c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvZmZpY2UlMjB3b3Jrc3BhY2V8ZW58MXx8fHwxNzY2MjQ1MDM3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  
  // Job Details Page
  JOB_DETAILS_PROFESSIONAL: 'https://images.unsplash.com/photo-1551434678-e076c223a692?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b3JrfGVufDF8fHx8MTc2NjI0NTAzN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  
  // Why Us Page
  WHY_US_VALUES: 'https://images.unsplash.com/photo-1552664730-d307ca884978?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHZhbHVlc3xlbnwxfHx8fDE3NjYyNDUwMzd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  WHY_US_CULTURE: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwY3VsdHVyZXxlbnwxfHx8fDE3NjYyNDUwMzd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
} as const;

/**
 * Image metadata for better organization
 */
export const IMAGE_METADATA = {
  [IMAGE_URLS.HERO_BACKGROUND as any]: {
    alt: 'Cargo containers',
    description: 'Hero background image showing cargo shipping containers',
  },
  [IMAGE_URLS.ABOUT_WAREHOUSE_TEAM as any]: {
    alt: 'Logistics warehouse team',
    description: 'Team working in a logistics warehouse',
  },
  [IMAGE_URLS.HISTORY_CARGO_TRUCK as any]: {
    alt: 'Cargo truck on highway',
    description: 'Cargo truck traveling on highway',
  },
  [IMAGE_URLS.PARTNERSHIPS_HANDSHAKE as any]: {
    alt: 'Business partnership handshake',
    description: 'Business professionals shaking hands',
  },
  [IMAGE_URLS.HOME_LOGISTICS_SERVICES as any]: {
    alt: 'Logistics services',
    description: 'Modern logistics and supply chain services',
  },
  [IMAGE_URLS.HOME_TEAM_COLLABORATION as any]: {
    alt: 'Team collaboration',
    description: 'Team members working together',
  },
  [IMAGE_URLS.JOBS_CAREER_GROWTH as any]: {
    alt: 'Career growth opportunities',
    description: 'Professional development and career growth',
  },
  [IMAGE_URLS.JOBS_OFFICE_ENVIRONMENT as any]: {
    alt: 'Modern office workspace',
    description: 'Contemporary office work environment',
  },
  [IMAGE_URLS.JOB_DETAILS_PROFESSIONAL as any]: {
    alt: 'Professional workplace',
    description: 'Professional work environment',
  },
  [IMAGE_URLS.WHY_US_VALUES as any]: {
    alt: 'Company values',
    description: 'Core business values and principles',
  },
  [IMAGE_URLS.WHY_US_CULTURE as any]: {
    alt: 'Company culture',
    description: 'Team culture and collaboration',
  },
  [IMAGE_URLS.MEMBERSHIP_SCMAP as any]: {
    alt: 'SCMAP Logo',
    description: 'Supply Chain Management Association of the Philippines logo',
  },
  [IMAGE_URLS.MEMBERSHIP_PEZA as any]: {
    alt: 'PEZA Logo',
    description: 'Philippine Economic Zone Authority logo',
  },
  [IMAGE_URLS.MEMBERSHIP_JCTRANS as any]: {
    alt: 'JCtrans Logo',
    description: 'JCtrans Network-International Freight Forwarders Network logo',
  },
} as const;

/**
 * Helper function to get image metadata
 */
export function getImageMetadata(url: any) {
  // Cast to any for the lookup to handle both strings and StaticImage objects
  return (IMAGE_METADATA as any)[url] || { alt: 'Image', description: '' };
}