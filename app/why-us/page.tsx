'use client';

import { useState, useEffect, memo, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  useTheme,
  Stack,
  alpha,
} from '@mui/material';
import { ImageWithFallback } from '../../components/layout/ImageWithFallback';
import { IMAGE_URLS, getImageMetadata } from '../../constants/images';
import { createClient } from '../../lib/supabase/client';
import { PageContainer } from '../../components/layout';
import { usePageTitle } from '../../lib/usePageTitle';
import { SITE_CONTENT } from '../../constants/site-content';
import { themeColors } from '../../lib/mui-theme';
import { motion } from 'framer-motion';

// ─── Reduced to 2 blobs per section (was 9+). After blur(100px) the SVG path
//     is invisible anyway – simplified to a plain Box with radial-gradient.
const AbstractBlob = memo(({
  color,
  top, left, right, bottom,
  size = '700px',
  opacity = 0.12,
}: {
  color: string;
  top?: string | object; left?: string | object;
  right?: string | object; bottom?: string | object;
  size?: string | object;
  opacity?: number;
}) => (
  <Box
    sx={{
      position: 'absolute',
      ...(top !== undefined ? { top } : {}),
      ...(left !== undefined ? { left } : {}),
      ...(right !== undefined ? { right } : {}),
      ...(bottom !== undefined ? { bottom } : {}),
      width: size,
      height: size,
      zIndex: 0,
      pointerEvents: 'none',
      borderRadius: '50%',
      background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      opacity,
    }}
  />
));
AbstractBlob.displayName = 'AbstractBlob';

const SectionTransition = ({ toColor, position = 'bottom' }: { toColor: string; position?: 'top' | 'bottom' }) => (
  <Box
    sx={{
      position: 'absolute',
      [position]: 0,
      left: 0,
      right: 0,
      height: '15dvh',
      background: `linear-gradient(to ${position === 'bottom' ? 'bottom' : 'top'}, transparent, ${toColor})`,
      pointerEvents: 'none',
      zIndex: 1,
    }}
  />
);

// ─── Dot pattern is now a CSS background-image on a pseudo-element to avoid
//     repeated radial-gradient layout thrash. opacity & mask kept identical.
const BackgroundTexture = memo(({ opacity = 0.5 }: { opacity?: number }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <Box sx={{
      position: 'absolute',
      inset: 0,
      zIndex: 0,
      pointerEvents: 'none',
      backgroundImage: `radial-gradient(${alpha(isDark ? '#fff' : '#000', 0.07)} 1px, transparent 1px)`,
      backgroundSize: '32px 32px',
      opacity,
      maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
      WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
    }} />
  );
});
BackgroundTexture.displayName = 'BackgroundTexture';

// ─── Removed two inner repeating motion.divs. Accent border uses CSS
//     animation (GPU-only transform) instead of Framer's JS-driven loop.
const DecorativeImageFrame = memo(({ children, theme }: any) => {
  const tertiaryMain = (theme.palette as any).tertiary?.main || theme.palette.primary.main;
  const secondaryMain = theme.palette.secondary?.main || '#202945';

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, scale: 0.95, x: 16 }}
      whileInView={{ opacity: 1, scale: 1, x: 0 }}
      viewport={{ once: true, amount: 0.3 }}  // once:true – no re-trigger on scroll back
      transition={{ duration: 0.7, ease: 'easeOut' }}
      sx={{ position: 'relative', p: 1 }}
    >
      {/* Accent border – CSS keyframe, no JS ticker */}
      <Box sx={{
        position: 'absolute',
        inset: -8,
        border: '2px solid',
        borderColor: tertiaryMain,
        borderRadius: 6,
        opacity: 0.28,
        zIndex: 0,
        clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 50%, 5% 50%, 5% 95%, 95% 95%, 95% 5%, 5% 5%, 5% 50%, 0% 50%)',
      }} />
      {/* Offset shadow box – static, no animation needed */}
      <Box sx={{
        position: 'absolute',
        top: 20,
        right: -16,
        width: '100%',
        height: '100%',
        bgcolor: secondaryMain,
        opacity: 0.06,
        borderRadius: 8,
        zIndex: 0,
        transform: 'rotate(2deg)',
      }} />
      {/* Glow */}
      <Box sx={{
        position: 'absolute',
        inset: 20,
        bgcolor: 'primary.main',
        filter: 'blur(50px)',
        opacity: 0.08,
        zIndex: -1,
      }} />
      <Box sx={{ position: 'relative', zIndex: 1, borderRadius: 6, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
        {children}
      </Box>
    </Box>
  );
});
DecorativeImageFrame.displayName = 'DecorativeImageFrame';

// ─── Slide-in variants defined once outside render to avoid object recreation
const fadeLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.75 } },
};
const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay } },
});
const fadeRight = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.75, delay: 0.15 } },
};

interface CoveragePoint {
  id?: string;
  name: string;
  x: number;
  y: number;
  description: string;
  delay?: number;
}

// ─── Ocean exclusion: points whose (x, y) fall entirely outside the PH
//     landmass SVG mask. Coordinates are percentages of the map container.
//     These were identified visually from the COVERAGE_POINTS list – any dot
//     that would render over open water is listed here by name so it is
//     skipped during render rather than appearing in the ocean.
//
//     NOTE: Palawan sits far west (x≈32) and is a real province; it IS on land.
//     Only add names here if a coordinate genuinely falls in open water after
//     visual QA against the PH_MAP mask image.
const OCEAN_POINTS = new Set<string>([
  // Add any confirmed ocean-coordinate point names here after visual QA.
]);

// ─── Map dot extracted to its own memoised component so only the active dot
//     re-renders when selectedPoint changes (not the entire dot list).
const MapDot = memo(({
  point,
  isSelected,
  isZoomedOut,
  isDark,
  primaryMain,
  tertiaryMain,
  secondaryMain,
  onSelect,
}: {
  point: CoveragePoint;
  isSelected: boolean;
  isZoomedOut: boolean;
  isDark: boolean;
  primaryMain: string;
  tertiaryMain: string;
  secondaryMain: string;
  onSelect: (p: CoveragePoint | null) => void;
}) => {
  // Render tooltip below if dot is in upper half to avoid clipping top viewport; above if in lower half.
  // If selected, the point is pushed to the top of the viewport, so always render tooltip below.
  const anchorAbove = isSelected ? false : point.y >= 50;

  // Scale variants for zoom-in/out when another point is selected.
  // We decrease the visual scale (0.5 and 0.8) so dots appear smaller upon zooming.
  const wrapVariants = useMemo(() => ({
    normal: { scale: 1 },
    zoomedOut: { scale: 0.5 / 3 },
    selected: { scale: 0.8 / 3 },
  }), []);



  // Badge slide-in/out.
  const badgeVariants = useMemo(() => ({
    hidden: { opacity: 0, scale: 0.7, y: anchorAbove ? -10 : 10 },
    visible: {
      opacity: 1, scale: 1, y: 0,
      transition: { type: 'spring' as const, stiffness: 380, damping: 22 },
    },
  }), [anchorAbove]);

  const [isHovered, setIsHovered] = useState(false);
  const showBadge = isSelected || (isHovered && !isZoomedOut); // Hide icon badge on hover while map is zoomed

  return (
    <Box
      component={motion.div}
      // whileInView drives the dot entrance
      initial={{ scale: 0, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1, transition: { delay: point.delay, duration: 0.4 } }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      viewport={{ once: false, amount: 0.1 }}
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation();
        onSelect(isSelected ? null : point);
      }}
      // Zoom variant is applied on top via a separate `animate` key.
      animate={isSelected ? 'selected' : isZoomedOut ? 'zoomedOut' : 'normal'}
      variants={wrapVariants}
      transition={{ type: 'spring', stiffness: 150, damping: 20 }}
      sx={{
        position: 'absolute',
        left: `${point.x}%`,
        top: `${point.y}%`,
        zIndex: isHovered ? 150 : isSelected ? 100 : 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pointerEvents: 'auto',
        transform: 'translate(-50%, -50%)',
        width: 24,
        height: 24,
        justifyContent: 'center',
        cursor: 'pointer',
      }}
    >
      {/* Map dot */}
      <Box
        component={motion.div}
        animate={{
          scale: isHovered && isZoomedOut ? 1.5 : 1, // Scaled down highlighting to 1.5
          backgroundColor: isSelected 
            ? tertiaryMain 
            : isHovered && isZoomedOut 
              ? tertiaryMain 
              : primaryMain,
          boxShadow: isSelected
            ? `0 0 10px ${tertiaryMain}`
            : isHovered && isZoomedOut
              ? `0 0 10px ${tertiaryMain}, 0 0 2px ${tertiaryMain}`
              : `0 0 4px ${primaryMain}`,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        sx={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.9)',
          flexShrink: 0,
        }}
      />

      {/* Badge: visible on hover (via Framer whileHover="hovered") OR when selected */}
      <Box
        component={motion.div}
        variants={badgeVariants}
        // Framer merges `animate` (from parent whileHover propagation) with
        // our explicit `animate` prop; we drive it directly here instead.
        animate={showBadge ? 'visible' : 'hidden'}
        initial="hidden"
        sx={{
          position: 'absolute',
          // Anchor above for northern points, below for southern.
          ...(anchorAbove
            ? { bottom: '100%', mb: 0.5, flexDirection: 'column-reverse' }
            : { top: '100%', mt: 0.5, flexDirection: 'column' }),
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          zIndex: 20,
          pointerEvents: 'none',
          // Keep badge visible when parent is in `selected` state even without hover.
          // Decrease scale to avoid overlapping and visual bloat.
          ...(isSelected ? { 
            opacity: '1 !important', 
            transform: 'scale(0.4) !important',
            transformOrigin: anchorAbove ? 'bottom center' : 'top center'
          } : isHovered ? {
            transform: `scale(${isZoomedOut ? 0.64 : 0.75}) !important`,
            transformOrigin: anchorAbove ? 'bottom center' : 'top center'
          } : {}),
        }}
      >
        {/* Icon circle - scaled down to 32px to look cleaner */}
        <Box sx={{
          width: 32,
          height: 32,
          bgcolor: primaryMain,
          borderRadius: '50%',
          p: 0.5,
          boxShadow: `0 3px 8px rgba(0,0,0,0.3)`,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          flexShrink: 0,
        }}>
          <ImageWithFallback
            src={IMAGE_URLS.BOSS_CARGO_ICON}
            alt={point.name}
            layout="fill"
            objectFit="contain"
            sizes="32px"
            style={{ padding: '3px' }}
          />
        </Box>

        {/* Name + description card */}
        <Box sx={{
          backgroundColor: secondaryMain,
          borderRadius: 1.5,
          px: 1.5,
          py: 1,
          boxShadow: '0 4px 16px rgba(0,0,0,0.45)',
          border: `1px solid ${tertiaryMain}44`,
          backdropFilter: 'blur(10px)',
          maxWidth: 200,
          width: 'max-content',
          textAlign: 'center',
        }}>
          <Typography sx={{
            whiteSpace: 'normal',
            color: isDark ? tertiaryMain : 'white',
            fontWeight: 900,
            fontSize: '0.65rem',
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            lineHeight: 1.2,
            mb: isSelected ? 0.5 : 0,
          }}>
            {point.name}
          </Typography>
          {isSelected && (
            <Typography sx={{
              color: 'rgba(255,255,255,0.7)',
              fontSize: '0.6rem',
              lineHeight: 1.4,
              whiteSpace: 'normal',
            }}>
              {point.description}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Simple Text Tooltip: visible ONLY on hover while zoomed */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, scale: 0.8, y: -4 }}
        animate={{
          opacity: isHovered && isZoomedOut ? 1 : 0,
          scale: isHovered && isZoomedOut ? 1 : 0.8,
          y: isHovered && isZoomedOut ? 0 : -4
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        sx={{
          position: 'absolute',
          bottom: '70%', // Moved closer to the dot center (was bottom: 130%)
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 30,
          pointerEvents: 'none',
          transform: 'scale(0.5) !important', // Keep it very compact on zoomed 3x map
          transformOrigin: 'bottom center',
        }}
      >
        <Box sx={{
          backgroundColor: 'rgba(32, 41, 69, 0.95)',
          borderRadius: 1,
          px: 1.25,
          py: 0.75,
          border: `1px solid ${tertiaryMain}88`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          whiteSpace: 'nowrap',
        }}>
          <Typography sx={{
            color: 'white',
            fontWeight: 800,
            fontSize: '0.6rem',
            letterSpacing: 1,
            textTransform: 'uppercase',
            lineHeight: 1,
          }}>
            {point.name}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
});
MapDot.displayName = 'MapDot';

export default function WhyBossCargo() {
  usePageTitle('Why Us');
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [points, setPoints] = useState<CoveragePoint[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<CoveragePoint | null>(null);

  const loadPoints = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('coverage_points')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      if (data) {
        const mappedPoints = data.map((p: any, i: number) => ({
          id: p.id as string,
          name: p.name as string,
          x: Number(p.x),
          y: Number(p.y),
          description: p.description as string,
          delay: (i % 30) * 0.03
        }));
        setPoints(mappedPoints);
        
        setSelectedPoint((prevSelected) => {
          if (!prevSelected) return null;
          const match = mappedPoints.find((p: any) => p.name === prevSelected.name || p.id === (prevSelected as any).id);
          return match || null;
        });
      } else {
        setPoints([]);
      }
    } catch (e) {
      console.error('Error fetching coverage points:', e);
    }
  };

  useEffect(() => {
    loadPoints();

    const supabase = createClient();
    const channel = supabase
      .channel('coverage-points-client-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'coverage_points',
        },
        () => {
          loadPoints();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const primaryMain = theme.palette.primary?.main || '#00A39D';
  const secondaryMain = theme.palette.secondary?.main || '#202945';
  const tertiaryMain = (theme.palette as any).tertiary?.main || primaryMain;
  const currentColors = themeColors[isDark ? 'dark' : 'light'];

  const values = SITE_CONTENT.missionVision.values;

  // Map pan/zoom spring config defined once
  const mapSpring = useMemo(() => ({ type: 'spring' as const, stiffness: 120, damping: 22 }), []);
  const mapAnimate = useMemo(() => selectedPoint
    ? { scale: 3, x: `${-3 * (selectedPoint.x - 50)}%`, y: `${-3 * (selectedPoint.y - 50) - 4}%` } // Shifted camera downwards slightly to center the tooltip perfectly
    : { scale: 1, x: '0%', y: '0%' },
    [selectedPoint]);

  return (
    <Box sx={{ minHeight: 'calc(100dvh - 80px)', overflowX: 'hidden' }}>

      {/* ── Hero: Nationwide Presence ─────────────────────────────────────── */}
      <Box sx={{
        minHeight: 'calc(100dvh - 80px)',
        display: 'flex',
        alignItems: 'center',
        scrollSnapAlign: 'start',
        scrollSnapStop: 'always',
        py: { xs: 8, md: 0 },
        px: { xs: 2, md: 6 },
        position: 'relative',
        bgcolor: 'background.default',
        overflow: 'hidden',
      }}>
        <BackgroundTexture />
        {/* 2 blobs instead of 9 */}
        <AbstractBlob color={primaryMain} top="-10%" right="-5%" size="700px" opacity={isDark ? 0.07 : 0.1} />
        <AbstractBlob color={tertiaryMain} bottom="0%" left="-10%" size="600px" opacity={isDark ? 0.05 : 0.08} />

        <PageContainer maxWidth="lg" disableVerticalPadding sx={{ position: 'relative', zIndex: 2 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 7 }}>
              <Box
                component={motion.div}
                variants={fadeLeft}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
              >
                <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: 4, display: 'block', mb: 2 }}>
                  Our Reach
                </Typography>
                <Typography variant="h1" sx={{
                  fontWeight: 900, mb: 3,
                  fontSize: { xs: '3rem', md: '5rem' },
                  lineHeight: 1,
                  textTransform: 'uppercase',
                }}>
                  Nationwide <br />
                  <Box component="span" sx={{ color: 'primary.main' }}>Archipelago</Box>
                </Typography>
                <Typography variant="h5" sx={{ mb: 4, maxWidth: '600px', opacity: 0.8, fontWeight: 400 }}>
                  We bridge the gap across the 7,641 islands of the Philippines with a robust logistics network designed for the modern era.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  {[
                    { value: '50+', label: 'Service Points', color: primaryMain },
                    { value: '81', label: 'Provinces Reached', color: tertiaryMain },
                  ].map(({ value, label, color }) => (
                    <Paper key={label} elevation={0} sx={{
                      p: 2,
                      bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                      borderLeft: `4px solid ${color}`,
                      borderRadius: '0 8px 8px 0',
                    }}>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main' }}>{value}</Typography>
                      <Typography variant="caption" sx={{ opacity: 0.7, fontWeight: 700 }}>{label}</Typography>
                    </Paper>
                  ))}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </PageContainer>

        {/* Map */}
        <Box sx={{
          position: 'absolute',
          top: { xs: '15dvh', md: '5dvh' },
          bottom: { xs: '25dvh', md: '5dvh' },
          right: { xs: 'auto', md: '3%' },
          left: { xs: '0', md: 'auto' },
          width: { xs: '100%', md: '65%' },
          opacity: { xs: 0.3, md: 1 },
          pointerEvents: 'none',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 4,
          transform: { xs: 'scale(1.24)', md: 'scale(1.42)' },
          // Removed overflow: hidden to prevent tooltips from clipping when map is zoomed
        }}>
          <Box
            component={motion.div}
            animate={mapAnimate}
            transition={mapSpring}
            onClick={() => setSelectedPoint(null)}
            sx={{
              width: '100%',
              height: 'auto',
              maxWidth: '100%',
              maxHeight: '100%',
              aspectRatio: '1/1',
              position: 'relative',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              pointerEvents: 'auto',
              cursor: selectedPoint ? 'zoom-out' : 'default',
            }}
          >
            {/* Map landmass */}
            <Box
              onClick={(e) => { e.stopPropagation(); setSelectedPoint(null); }}
              sx={{
                width: '100%',
                height: '100%',
                maskImage: `url(${(IMAGE_URLS.PH_MAP as any).src || IMAGE_URLS.PH_MAP})`,
                WebkitMaskImage: `url(${(IMAGE_URLS.PH_MAP as any).src || IMAGE_URLS.PH_MAP})`,
                maskSize: 'contain',
                maskRepeat: 'no-repeat',
                maskPosition: 'center',
                backgroundColor: secondaryMain,
                zIndex: 1,
                position: 'absolute',
                top: 0,
                left: 0,
                cursor: selectedPoint ? 'zoom-out' : 'default',
                // Strobe animate map colors using mui-theme colors
                animation: 'colorStrobe 12s infinite',
                '@keyframes colorStrobe': {
                  '0%, 100%': { 
                    backgroundColor: secondaryMain, 
                    filter: `drop-shadow(0 0 30px ${primaryMain}33) brightness(1)` 
                  },
                  '16%': { 
                    backgroundColor: currentColors.primary.main, 
                    filter: `drop-shadow(0 0 40px ${currentColors.primary.main}55) brightness(1.2)` 
                  },
                  '33%': { 
                    backgroundColor: currentColors.info.main, 
                    filter: `drop-shadow(0 0 40px ${currentColors.info.main}55) brightness(1.2)` 
                  },
                  '50%': { 
                    backgroundColor: currentColors.success.main, 
                    filter: `drop-shadow(0 0 40px ${currentColors.success.main}55) brightness(1.2)` 
                  },
                  '66%': { 
                    backgroundColor: currentColors.warning.main, 
                    filter: `drop-shadow(0 0 40px ${currentColors.warning.main}55) brightness(1.2)` 
                  },
                  '83%': { 
                    backgroundColor: currentColors.tertiary.main, 
                    filter: `drop-shadow(0 0 40px ${currentColors.tertiary.main}55) brightness(1.2)` 
                  },
                },
              }}
            />

            {points
              .filter((point) => !OCEAN_POINTS.has(point.name))
              .map((point) => (
                <MapDot
                  key={point.name}
                  point={point}
                  isSelected={selectedPoint?.name === point.name}
                  isZoomedOut={!!selectedPoint && selectedPoint.name !== point.name}
                  isDark={isDark}
                  primaryMain={primaryMain}
                  tertiaryMain={tertiaryMain}
                  secondaryMain={secondaryMain}
                  onSelect={setSelectedPoint}
                />
              ))}
          </Box>
        </Box>
      </Box>

      {/* ── Slide 1: Mission & Vision ──────────────────────────────────────── */}
      <Box sx={{
        minHeight: 'calc(100dvh - 80px)',
        display: 'flex',
        alignItems: 'center',
        scrollSnapAlign: 'start',
        scrollSnapStop: 'always',
        py: { xs: 4, md: 0 },
        position: 'relative',
        overflow: 'hidden',
        bgcolor: 'background.default',
      }}>
        <BackgroundTexture />
        <AbstractBlob color={tertiaryMain} top="-15%" right="-10%" size="850px" opacity={isDark ? 0.06 : 0.09} />
        <AbstractBlob color={primaryMain} bottom="5%" left="-15%" size="700px" opacity={isDark ? 0.05 : 0.08} />

        <PageContainer maxWidth="lg" disableVerticalPadding sx={{ width: '100%', position: 'relative', zIndex: 2 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid size={{ xs: 12, md: 7 }}>
              <Box
                component={motion.div}
                variants={fadeLeft}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
              >
                <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: 2, mb: 1, display: 'block' }}>
                  CORE IDENTITY
                </Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, mb: 2, lineHeight: 1.1, fontSize: { xs: '2.5rem', md: '3.5rem' } }}>
                  Why Choose Boss Cargo?
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4, fontSize: '1.1rem', maxWidth: '600px' }}>
                  Our Mission, Vision, and Values define who we are and what we stand for in the logistics industry.
                </Typography>

                <Stack spacing={4}>
                  {[
                    {
                      label: 'Our Mission',
                      color: 'primary.main',
                      borderColor: tertiaryMain,
                      dotColor: 'primary.main',
                      text: SITE_CONTENT.missionVision.mission,
                      delay: 0.2,
                    },
                    {
                      label: 'Our Dream (Vision)',
                      color: 'secondary.main',
                      borderColor: primaryMain,
                      dotColor: 'secondary.main',
                      text: SITE_CONTENT.missionVision.vision,
                      delay: 0.4,
                    },
                  ].map(({ label, color, borderColor, dotColor, text, delay }) => (
                    <Box
                      key={label}
                      component={motion.div}
                      variants={fadeUp(delay)}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true, amount: 0.5 }}
                    >
                      <Typography variant="h6" sx={{ color, fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: dotColor, boxShadow: `0 0 15px currentColor` }} />
                        {label}
                      </Typography>
                      <Typography variant="body2" sx={{ pl: 3, borderLeft: '2px solid', borderColor, py: 0.5, lineHeight: 1.7 }}>
                        {text}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <DecorativeImageFrame theme={theme}>
                <ImageWithFallback
                  src={IMAGE_URLS.WHY_US_VALUES}
                  alt={getImageMetadata(IMAGE_URLS.WHY_US_VALUES).alt}
                  layout="responsive"
                  aspectRatio="4:3"
                  sizes="(max-width: 900px) 100vw, 50vw"
                  rounded={0}
                  shadow={0}
                  style={{ transform: 'scale(1.08)', transformOrigin: 'center center' }}
                />
              </DecorativeImageFrame>
            </Grid>
          </Grid>
        </PageContainer>

        <SectionTransition toColor={theme.palette.background.paper} />
      </Box>

      {/* ── Slide 2: Brand Values & Culture ───────────────────────────────── */}
      <Box sx={{
        minHeight: 'calc(100dvh - 80px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        scrollSnapAlign: 'start',
        scrollSnapStop: 'always',
        bgcolor: 'background.paper',
        py: { xs: 6, md: 6 },
        px: { xs: 2, md: 0 },
        position: 'relative',
        overflow: 'hidden',
      }}>
        <BackgroundTexture />
        <AbstractBlob color={tertiaryMain} top="10%" left="-20%" size="850px" opacity={isDark ? 0.05 : 0.08} />
        <AbstractBlob color={primaryMain} bottom="-15%" right="-15%" size="800px" opacity={isDark ? 0.04 : 0.07} />

        <PageContainer maxWidth="lg" disableVerticalPadding sx={{ width: '100%', position: 'relative', zIndex: 2 }}>
          <Grid container spacing={2}>
            {/* Brand Values */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                component={motion.div}
                variants={fadeUp()}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
              >
                <Typography variant="h3" sx={{ mb: 1, fontWeight: 700, color: 'primary.main', fontSize: { xs: '1.75rem', md: '2rem' } }}>
                  Our Brand Values
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, opacity: 0.8, fontSize: '0.95rem' }}>
                  Creating a strong and positive perception of our company in our customers' minds.
                </Typography>
              </Box>

              <Grid container spacing={1.5} alignItems="stretch">
                {values.map((value, index) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={index} sx={{ display: 'flex' }}>
                    <Paper
                      component={motion.div}
                      initial={{ opacity: 0, scale: 0.93, y: 16 }}
                      whileInView={{ opacity: 1, scale: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ duration: 0.45, delay: index * 0.08 }}
                      whileHover={{ x: 8 }}
                      elevation={0}
                      sx={{
                        p: 1.75,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-start',
                        bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                        borderLeft: `4px solid ${index % 2 === 0 ? primaryMain : tertiaryMain}`,
                        borderRadius: '0 12px 12px 0',
                        transition: 'background-color 0.25s ease, box-shadow 0.25s ease',
                        '&:hover': {
                          bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                          boxShadow: `0 4px 20px -10px ${primaryMain}`,
                        },
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ mb: 0.75, color: index % 2 === 0 ? 'primary.main' : 'text.primary', fontWeight: 700, fontSize: '0.95rem' }}>
                        {value.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.85rem', lineHeight: 1.5 }}>
                        {value.description}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* Culture */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                component={motion.div}
                variants={fadeRight}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
              >
                <Typography variant="h3" sx={{ mb: 1, fontWeight: 700, color: 'secondary.main', fontSize: { xs: '1.75rem', md: '2rem' } }}>
                  Our Culture
                </Typography>
                <Paper elevation={0} sx={{
                  p: 2,
                  mb: 2,
                  bgcolor: isDark ? 'action.hover' : 'action.selected',
                  borderRadius: 3,
                  position: 'relative',
                  overflow: 'hidden',
                  borderLeft: `2px solid ${tertiaryMain}`,
                }}>
                  <Typography variant="caption" sx={{ lineHeight: 1.6, fontStyle: 'italic', position: 'relative', zIndex: 1, fontSize: '0.9rem' }}>
                    "{SITE_CONTENT.missionVision.culture}"
                  </Typography>
                  {/* Static decorative circle – removed the Infinity animate */}
                  <Box sx={{
                    position: 'absolute',
                    top: -10,
                    right: -10,
                    width: 60,
                    height: 60,
                    bgcolor: 'tertiary.main',
                    opacity: 0.12,
                    borderRadius: '50%',
                  }} />
                </Paper>
                <Box sx={{ maxWidth: { xs: '100%', md: '360px' }, mx: 'auto' }}>
                  <DecorativeImageFrame theme={theme}>
                    <ImageWithFallback
                      src={IMAGE_URLS.WHY_US_CULTURE}
                      alt={getImageMetadata(IMAGE_URLS.WHY_US_CULTURE).alt}
                      layout="responsive"
                      aspectRatio="1:1"
                      sizes="(max-width: 900px) 100vw, 50vw"
                      rounded={0}
                      shadow={0}
                      style={{ transform: 'scale(1.1)', transformOrigin: 'center center' }}
                    />
                  </DecorativeImageFrame>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </PageContainer>

        <SectionTransition toColor={theme.palette.background.default} />
      </Box>
    </Box>
  );
}