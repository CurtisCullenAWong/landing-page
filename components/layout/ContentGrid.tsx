'use client';

import { Grid, GridProps } from '@mui/material';
import { GRID_SPACING } from '@/constants/layout';

export interface ContentGridProps extends Omit<GridProps, 'container' | 'spacing'> {
  /**
   * Grid spacing
   * @default 'medium'
   */
  spacing?: 'small' | 'medium' | 'large' | number;
  /**
   * Number of columns on different breakpoints
   */
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

/**
 * Standardized grid component for content layout
 * Provides consistent spacing and responsive column configuration
 */
export function ContentGrid({
  children,
  spacing = 'medium',
  columns,
  sx,
  ...props
}: ContentGridProps) {
  const getSpacing = () => {
    if (typeof spacing === 'number') return spacing;
    return GRID_SPACING[spacing];
  };

  const gridSize = columns
    ? {
        xs: columns.xs ? { xs: 12 / columns.xs } : undefined,
        sm: columns.sm ? { sm: 12 / columns.sm } : undefined,
        md: columns.md ? { md: 12 / columns.md } : undefined,
        lg: columns.lg ? { lg: 12 / columns.lg } : undefined,
        xl: columns.xl ? { xl: 12 / columns.xl } : undefined,
      }
    : undefined;

  return (
    <Grid container spacing={getSpacing()} sx={sx} {...props}>
      {children}
    </Grid>
  );
}

