"use client"

import React, { useState } from 'react'
import Image from 'next/image'
import { Box, Skeleton, useTheme } from '@mui/material'

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg=='

export type ImageLayout = 'fill' | 'responsive' | 'fixed' | 'intrinsic'
export type ImageAspectRatio = '16:9' | '4:3' | '1:1' | '21:9' | 'auto'

export interface ImageWithFallbackProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: any
  /**
   * Layout mode for the image
   * - fill: Fills parent container
   * - responsive: Responsive width, maintains aspect ratio
   * - fixed: Fixed dimensions
   * - intrinsic: Natural image size
   */
  layout?: ImageLayout
  /**
   * Aspect ratio to maintain (only applies to fill and responsive layouts)
   */
  aspectRatio?: ImageAspectRatio
  /**
   * Enable rounded corners
   */
  rounded?: boolean | number
  /**
   * Enable shadow effect
   */
  shadow?: boolean | number
  /**
   * Enable hover zoom effect
   */
  hoverZoom?: boolean
  /**
   * Enable lazy loading (default: true)
   */
  lazy?: boolean
  /**
   * Object fit style
   */
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
  /**
   * Priority loading (for above-the-fold images)
   */
  priority?: boolean
}

const ASPECT_RATIO_MAP: Record<ImageAspectRatio, number> = {
  '16:9': 16 / 9,
  '4:3': 4 / 3,
  '1:1': 1,
  '21:9': 21 / 9,
  'auto': 0,
}

export function ImageWithFallback({
  layout = 'responsive',
  aspectRatio = 'auto',
  rounded = false,
  shadow = false,
  hoverZoom = false,
  lazy = true,
  objectFit = 'cover',
  priority = false,
  ...props
}: ImageWithFallbackProps) {
  const theme = useTheme()
  const [didError, setDidError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const handleError = () => {
    setDidError(true)
    setIsLoading(false)
  }

  const handleLoad = () => {
    setIsLoading(false)
  }

  const { src, alt, style, className, ...rest } = props
  const normalizedSrc = typeof src === 'string' ? src : (src as any)?.src || src
  const intrinsicWidth = typeof src === 'object' ? (src as any)?.width : undefined
  const intrinsicHeight = typeof src === 'object' ? (src as any)?.height : undefined
  const hasIntrinsicDimensions = !!(intrinsicWidth && intrinsicHeight)
  const useFill = layout === 'fill' || (layout === 'responsive' && !hasIntrinsicDimensions)

  // Calculate aspect ratio padding
  const aspectRatioValue =
    aspectRatio !== 'auto'
      ? ASPECT_RATIO_MAP[aspectRatio]
      : intrinsicWidth && intrinsicHeight
        ? intrinsicWidth / intrinsicHeight
        : 0
  const paddingBottom = aspectRatioValue > 0 ? `${(1 / aspectRatioValue) * 100}%` : undefined

  // Rounded corners
  const borderRadius = typeof rounded === 'number' ? rounded : rounded ? 8 : 0

  // Shadow
  const boxShadow: React.CSSProperties['boxShadow'] = shadow
  ? typeof shadow === 'number'
    ? theme.shadows[Math.min(shadow, theme.shadows.length - 1)]
    : theme.shadows[4]
  : 'none'

  // Container styles based on layout
  const getContainerStyles = () => {
    const baseStyles: React.CSSProperties = {
      position: 'relative',
      overflow: 'hidden',
      borderRadius,
      boxShadow,
    }

    switch (layout) {
      case 'fill':
        // Keep container as positioning context for Next/Image fill
        return {
          ...baseStyles,
          width: '100%',
          height: '100%',
          position: 'relative',
        }
      case 'responsive':
        return {
          ...baseStyles,
          width: style?.width || '100%',
          ...(useFill && aspectRatioValue > 0 && { paddingBottom }),
        }
      case 'fixed':
        return {
          ...baseStyles,
          width: style?.width || '100%',
          height: style?.height || 'auto',
        }
      case 'intrinsic':
        return {
          ...baseStyles,
          display: 'inline-block',
          maxWidth: '100%',
        }
      default:
        return baseStyles
    }
  }

  // Image styles
  const getImageStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      opacity: isLoading ? 0 : 1,
      transition: 'opacity 0.4s ease-in-out, transform 0.3s ease-in-out',
      objectFit,
      ...(layout === 'fill' && {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
      }),
      ...(layout === 'responsive' && useFill && aspectRatioValue > 0 && {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
      }),
      ...(layout === 'responsive' && !useFill && {
        width: '100%',
        height: 'auto',
        display: 'block',
      }),
      ...(layout === 'fixed' && {
        width: style?.width || '100%',
        height: style?.height || 'auto',
      }),
      ...(layout === 'intrinsic' && {
        width: '100%',
        height: 'auto',
        display: 'block',
      }),
      ...style,
    }

    return baseStyles
  }

  if (didError) {
    return (
      <Box
        sx={{
          ...getContainerStyles(),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: theme.palette.mode === 'dark' ? 'action.hover' : 'grey.100',
          minHeight: aspectRatioValue > 0 ? 0 : 200,
        }}
        className={className}
      >
        <Box
          component="img"
          src={ERROR_IMG_SRC}
          alt={alt || 'Error loading image'}
          sx={{
            opacity: 0.5,
            maxWidth: '50%',
            maxHeight: '50%',
          }}
          data-original-url={src}
        />
      </Box>
    )
  }

  return (
    <Box
      sx={{
        ...getContainerStyles(),
        ...(hoverZoom && {
          '&:hover img': {
            transform: 'scale(1.05)',
          },
        }),
      }}
      className={className}
    >
      {isLoading && (
        <Skeleton
          variant="rectangular"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: aspectRatioValue > 0 ? '100%' : '100%',
            zIndex: 1,
            borderRadius,
          }}
          animation="wave"
        />
      )}
      {/* Use Next.js Image to leverage built-in optimization when possible */}
      {(() => {
        try {
          const sizes = useFill ? (rest['sizes'] as string | undefined) || '100vw' : (rest['sizes'] as string | undefined)

          // Prepare styles for Next/Image. When using `fill`, Next/Image manages width/height.
          const rawStyles = getImageStyles()
          const cleanedStyles: React.CSSProperties = { ...rawStyles }
          if (useFill) {
            // Remove properties that conflict with fill
            delete (cleanedStyles as any).width
            delete (cleanedStyles as any).height
            delete (cleanedStyles as any).position
            delete (cleanedStyles as any).top
            delete (cleanedStyles as any).left
          }

          // Next/Image expects numeric width/height when not using fill.
          const widthProp = !useFill && hasIntrinsicDimensions ? { width: intrinsicWidth as number } : (!useFill && typeof rawStyles.width === 'number' ? { width: rawStyles.width } : {})
          const heightProp = !useFill && hasIntrinsicDimensions ? { height: intrinsicHeight as number } : (!useFill && typeof rawStyles.height === 'number' ? { height: rawStyles.height } : {})

          return (
            <Image
              src={normalizedSrc}
              alt={alt || 'Image'}
              {...(useFill ? { fill: true } : { ...widthProp, ...heightProp })}
              style={{ objectFit, ...cleanedStyles }}
              sizes={sizes}
              priority={!!priority}
              onLoad={handleLoad}
              onError={handleError}
            />
          )
        } catch (e) {
          // Fallback to native img if Next/Image can't handle src
          return (
            <Box
              component="img"
              src={typeof src === 'string' ? src : (src as any)?.src}
              alt={alt || 'Image'}
              loading={lazy && !priority ? 'lazy' : 'eager'}
              sx={getImageStyles()}
              onError={handleError}
              onLoad={handleLoad}
              {...rest}
            />
          )
        }
      })()}
    </Box>
  )
}
