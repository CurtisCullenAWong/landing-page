import HeroBackground from '@/assets/images/home/HERO_BACKGROUND.jpg';
import Logo from '@/assets/images/logo.png';

import HomeLogisticsServices from '@/assets/images/home/HOME_LOGISTICS_SERVICES.jpg';
import HomeTeamCollaboration from '@/assets/images/home/HOME_TEAM_COLLABORATION.jpg';

import AboutWarehouseTeam from '@/assets/images/about-us/ABOUT_WAREHOUSE_TEAM.jpg';

import HistoryCargoTruck from '@/assets/images/history/HISTORY_CARGO_TRUCK.jpg';

import PartnershipsHandshake from '@/assets/images/partnerships/PARTNERSHIPS_HANDSHAKE.jpg';

import JobsCareerGrowth from '@/assets/images/careers/JOBS_CAREER_GROWTH.jpg';
import JobsOfficeEnvironment from '@/assets/images/careers/JOBS_OFFICE_ENVIRONMENT.jpg';

import WhyUsValues from '@/assets/images/why-us/WHY_US_VALUES.jpg';
import WhyUsCulture from '@/assets/images/why-us/WHY_US_CULTURE.jpg';

import JobDetailsProfessional from '@/assets/images/job-details/JOB_DETAILS_PROFESSIONAL.jpg';

/**
 * Imports
 * * Import all images from the assets folder.
 * * Update these images to change images across the application.
 */
export const IMAGE_URLS = {
  // Branding
  LOGO: Logo,

  // Hero & Landing Images

  HERO_BACKGROUND: HeroBackground,

  // About Us Page
  ABOUT_WAREHOUSE_TEAM: AboutWarehouseTeam,

  // History Page
  HISTORY_CARGO_TRUCK: HistoryCargoTruck,

  // Partnerships Page
  PARTNERSHIPS_HANDSHAKE: PartnershipsHandshake,

  // Memberships & Accreditations
  MEMBERSHIP_SCMAP: 'https://cdn.prod.website-files.com/6835326349a54fd20d519406/68b1aea25a00d8c67b1781b0_scmap.png',
  MEMBERSHIP_PEZA: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/PEZA_logo.svg',
  MEMBERSHIP_JCTRANS: 'https://www.bosscargo.express/wp-content/uploads/elementor/thumbs/Group-7-qwjw4kp80oqvhxxr88qo1vg0kljf7tsuwp8qjwhmea.png',

  // Home Page
  HOME_LOGISTICS_SERVICES: HomeLogisticsServices,
  HOME_TEAM_COLLABORATION: HomeTeamCollaboration,

  // Careers Page
  JOBS_CAREER_GROWTH: JobsCareerGrowth,
  JOBS_OFFICE_ENVIRONMENT: JobsOfficeEnvironment,

  // Job Details Page
  JOB_DETAILS_PROFESSIONAL: JobDetailsProfessional,

  // Why Us Page
  WHY_US_VALUES: WhyUsValues,
  WHY_US_CULTURE: WhyUsCulture,
} as const;

/**
 * Image metadata for better organization
 */
export const IMAGE_METADATA = {
  [(IMAGE_URLS.HERO_BACKGROUND as any).src || IMAGE_URLS.HERO_BACKGROUND]: {
    alt: 'Cargo containers',
    description: 'Hero background image showing cargo shipping containers',
  },
  [(IMAGE_URLS.ABOUT_WAREHOUSE_TEAM as any).src || IMAGE_URLS.ABOUT_WAREHOUSE_TEAM]: {
    alt: 'Logistics warehouse team',
    description: 'Team working in a logistics warehouse',
  },
  [(IMAGE_URLS.HISTORY_CARGO_TRUCK as any).src || IMAGE_URLS.HISTORY_CARGO_TRUCK]: {
    alt: 'Cargo truck on highway',
    description: 'Cargo truck traveling on highway',
  },
  [(IMAGE_URLS.PARTNERSHIPS_HANDSHAKE as any).src || IMAGE_URLS.PARTNERSHIPS_HANDSHAKE]: {
    alt: 'Business partnership handshake',
    description: 'Business professionals shaking hands',
  },
  [(IMAGE_URLS.HOME_LOGISTICS_SERVICES as any).src || IMAGE_URLS.HOME_LOGISTICS_SERVICES]: {
    alt: 'Logistics services',
    description: 'Modern logistics and supply chain services',
  },
  [(IMAGE_URLS.HOME_TEAM_COLLABORATION as any).src || IMAGE_URLS.HOME_TEAM_COLLABORATION]: {
    alt: 'Team collaboration',
    description: 'Team members working together',
  },
  [(IMAGE_URLS.JOBS_CAREER_GROWTH as any).src || IMAGE_URLS.JOBS_CAREER_GROWTH]: {
    alt: 'Career growth opportunities',
    description: 'Professional development and career growth',
  },
  [(IMAGE_URLS.JOBS_OFFICE_ENVIRONMENT as any).src || IMAGE_URLS.JOBS_OFFICE_ENVIRONMENT]: {
    alt: 'Modern office workspace',
    description: 'Contemporary office work environment',
  },
  [(IMAGE_URLS.JOB_DETAILS_PROFESSIONAL as any).src || IMAGE_URLS.JOB_DETAILS_PROFESSIONAL]: {
    alt: 'Professional workplace',
    description: 'Professional work environment',
  },
  [(IMAGE_URLS.WHY_US_VALUES as any).src || IMAGE_URLS.WHY_US_VALUES]: {
    alt: 'Company values',
    description: 'Core business values and principles',
  },
  [(IMAGE_URLS.WHY_US_CULTURE as any).src || IMAGE_URLS.WHY_US_CULTURE]: {
    alt: 'Company culture',
    description: 'Team culture and collaboration',
  },
  [IMAGE_URLS.MEMBERSHIP_SCMAP]: {
    alt: 'SCMAP Logo',
    description: 'Supply Chain Management Association of the Philippines logo',
  },
  [IMAGE_URLS.MEMBERSHIP_PEZA]: {
    alt: 'PEZA Logo',
    description: 'Philippine Economic Zone Authority logo',
  },
  [IMAGE_URLS.MEMBERSHIP_JCTRANS]: {
    alt: 'JCtrans Logo',
    description: 'JCtrans Network-International Freight Forwarders Network logo',
  },
} as const;

/**
 * Helper function to get image metadata
 */
export function getImageMetadata(url: any) {
  // Extract the actual URL string from StaticImage objects if necessary
  const key = typeof url === 'string' ? url : url?.src;
  return (IMAGE_METADATA as any)[key] || { alt: 'Image', description: '' };
}