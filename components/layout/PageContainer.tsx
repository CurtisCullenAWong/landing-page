'use client';

import { Box, Container, ContainerProps } from '@mui/material';
import { DEFAULT_CONTAINER_WIDTH, PAGE_PADDING } from '@/constants/layout';

export interface PageContainerProps extends Omit<ContainerProps, 'maxWidth'> {
  /**
   * Maximum width of the container
   * @default 'lg'
   */
  maxWidth?: ContainerProps['maxWidth'];
  /**
   * Vertical padding
   * @default PAGE_PADDING.vertical
   */
  verticalPadding?: number;
  /**
   * Disable default vertical padding
   */
  disableVerticalPadding?: boolean;
  /**
   * Additional content to render before children
   */
  header?: React.ReactNode;
  /**
   * Additional content to render after children
   */
  footer?: React.ReactNode;
}

/**
 * Standardized page container component
 * Provides consistent spacing and container width across all pages
 */
export function PageContainer({
  children,
  maxWidth = DEFAULT_CONTAINER_WIDTH,
  verticalPadding = PAGE_PADDING.vertical,
  disableVerticalPadding = false,
  header,
  footer,
  sx,
  ...props
}: PageContainerProps) {
  return (
    <Box
      sx={{
        py: disableVerticalPadding ? 0 : verticalPadding,
        ...sx,
      }}
    >
      <Container maxWidth={maxWidth} {...props}>
        {header}
        {children}
        {footer}
      </Container>
    </Box>
  );
}

