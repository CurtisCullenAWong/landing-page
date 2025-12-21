'use client';

import { Box, BoxProps } from '@mui/material';
import { SECTION_SPACING } from '@/constants/layout';

export interface SectionProps extends BoxProps {
  /**
   * Bottom margin spacing
   * @default SECTION_SPACING.medium
   */
  bottomSpacing?: 'small' | 'medium' | 'large' | 'xlarge' | number;
  /**
   * Top margin spacing
   */
  topSpacing?: 'small' | 'medium' | 'large' | 'xlarge' | number;
  /**
   * Background color variant
   */
  background?: 'default' | 'paper' | 'primary' | 'gradient';
  /**
   * Disable bottom spacing
   */
  disableBottomSpacing?: boolean;
}

/**
 * Standardized section component
 * Provides consistent spacing and background options for content sections
 */
export function Section({
  children,
  bottomSpacing = 'medium',
  topSpacing,
  background = 'default',
  disableBottomSpacing = false,
  sx,
  ...props
}: SectionProps) {
  const getSpacing = (spacing: 'small' | 'medium' | 'large' | 'xlarge' | number | undefined) => {
    if (typeof spacing === 'number') return spacing;
    if (!spacing) return undefined;
    return SECTION_SPACING[spacing];
  };

  const getBackground = () => {
    switch (background) {
      case 'paper':
        return 'background.paper';
      case 'primary':
        return 'primary.main';
      case 'gradient':
        return (theme: any) =>
          theme.palette.mode === 'dark'
            ? `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.primary.dark} 100%)`
            : 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)';
      default:
        return 'background.default';
    }
  };

  return (
    <Box
      sx={{
        mb: disableBottomSpacing ? 0 : getSpacing(bottomSpacing),
        mt: getSpacing(topSpacing),
        bgcolor: background !== 'gradient' ? getBackground() : undefined,
        background: background === 'gradient' ? getBackground() : undefined,
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
}

