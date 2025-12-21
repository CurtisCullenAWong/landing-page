/**
 * Layout Constants
 * 
 * Centralized layout configuration for consistent spacing, containers, and breakpoints
 * across the entire application.
 */

/**
 * Standard spacing units (based on 8px grid system)
 */
export const SPACING = {
  xs: 1,      // 8px
  sm: 2,      // 16px
  md: 3,      // 24px
  lg: 4,      // 32px
  xl: 5,      // 40px
  '2xl': 6,   // 48px
  '3xl': 8,   // 64px
  '4xl': 10,  // 80px
  '5xl': 12,  // 96px
} as const;

/**
 * Standard page padding
 */
export const PAGE_PADDING = {
  vertical: SPACING['3xl'],  // 64px
  horizontal: SPACING.md,    // 24px (handled by Container)
} as const;

/**
 * Standard section spacing
 */
export const SECTION_SPACING = {
  small: SPACING.lg,   // 32px
  medium: SPACING['2xl'], // 48px
  large: SPACING['3xl'],  // 64px
  xlarge: SPACING['4xl'], // 80px
} as const;

/**
 * Container max widths
 */
export const CONTAINER_WIDTHS = {
  xs: 'xs',
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: 'xl',
} as const;

/**
 * Standard container width for most pages
 */
export const DEFAULT_CONTAINER_WIDTH: typeof CONTAINER_WIDTHS.lg = CONTAINER_WIDTHS.lg;

/**
 * Hero section configuration
 */
export const HERO_CONFIG = {
  padding: {
    mobile: { vertical: SPACING['2xl'] },  // 48px
    desktop: { vertical: SPACING['4xl'] },  // 80px
  },
  minHeight: {
    mobile: '60vh',
    desktop: '70vh',
  },
} as const;

/**
 * Card configuration
 */
export const CARD_CONFIG = {
  padding: {
    small: SPACING.md,   // 24px
    medium: SPACING.lg,  // 32px
    large: SPACING.xl,   // 40px
  },
  borderRadius: 8,
  shadow: {
    none: 0,
    small: 2,
    medium: 4,
    large: 8,
  },
} as const;

/**
 * Grid spacing
 */
export const GRID_SPACING = {
  small: SPACING.md,   // 24px
  medium: SPACING.lg,  // 32px
  large: SPACING.xl,   // 40px
} as const;

/**
 * Typography spacing
 */
export const TYPOGRAPHY_SPACING = {
  heading: {
    marginBottom: SPACING.md,  // 24px
  },
  subheading: {
    marginBottom: SPACING.sm, // 16px
  },
  paragraph: {
    marginBottom: SPACING.sm, // 16px
  },
} as const;

/**
 * Image configuration
 */
export const IMAGE_CONFIG = {
  borderRadius: {
    none: 0,
    small: 4,
    medium: 8,
    large: 12,
    xlarge: 16,
  },
  shadow: {
    none: 0,
    small: 2,
    medium: 3,
    large: 4,
  },
} as const;

/**
 * Breakpoint configuration (matches MUI breakpoints)
 */
export const BREAKPOINTS = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
} as const;

