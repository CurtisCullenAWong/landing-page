'use client';

import { Box, Typography, TypographyProps } from '@mui/material';
import { TYPOGRAPHY_SPACING, SECTION_SPACING } from '@/constants/layout';

export interface PageHeaderProps {
  /**
   * Main heading text
   */
  title: string;
  /**
   * Subtitle or description text
   */
  subtitle?: string;
  /**
   * Title variant
   * @default 'h2'
   */
  titleVariant?: TypographyProps['variant'];
  /**
   * Subtitle variant
   * @default 'h6'
   */
  subtitleVariant?: TypographyProps['variant'];
  /**
   * Alignment
   * @default 'center'
   */
  align?: 'left' | 'center' | 'right';
  /**
   * Maximum width for subtitle
   * @default '800px'
   */
  subtitleMaxWidth?: string;
  /**
   * Bottom margin
   * @default SECTION_SPACING.large
   */
  bottomSpacing?: number;
  /**
   * Additional content to render after subtitle
   */
  children?: React.ReactNode;
}

/**
 * Standardized page header component
 * Provides consistent typography and spacing for page headers
 */
export function PageHeader({
  title,
  subtitle,
  titleVariant = 'h2',
  subtitleVariant = 'h6',
  align = 'center',
  subtitleMaxWidth = '800px',
  bottomSpacing = SECTION_SPACING.large,
  children,
}: PageHeaderProps) {
  return (
    <Box
      sx={{
        textAlign: align,
        mb: bottomSpacing,
      }}
    >
      <Typography
        variant={titleVariant}
        sx={{
          mb: subtitle ? TYPOGRAPHY_SPACING.heading.marginBottom : 0,
          fontWeight: 700,
        }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography
          variant={subtitleVariant}
          color="text.secondary"
          sx={{
            maxWidth: subtitleMaxWidth,
            mx: align === 'center' ? 'auto' : 0,
            mb: children ? TYPOGRAPHY_SPACING.paragraph.marginBottom : 0,
          }}
        >
          {subtitle}
        </Typography>
      )}
      {children}
    </Box>
  );
}

