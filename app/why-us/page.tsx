'use client';

import {
  Box,
  Typography,
  Grid,
  Paper,
  useTheme,
  Stack,
} from '@mui/material';
import { ImageWithFallback } from '../../components/layout/ImageWithFallback';
import { IMAGE_URLS, getImageMetadata } from '../../constants/images';
import { PageContainer } from '../../components/layout';
import { usePageTitle } from '../../lib/usePageTitle';
import { SITE_CONTENT } from '../../constants/site-content';
import { motion } from 'framer-motion';

// Abstract squiggly shape for background variety
const BLOB_PATHS = [
  "M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-46.5C87.4,-33.8,90,-18.4,89.1,-3.5C88.2,11.4,83.7,25.9,76,38.5C68.3,51.1,57.3,61.8,44.2,69.5C31.1,77.2,15.5,81.9,0.4,81.2C-14.7,80.5,-29.4,74.3,-42.1,65.8C-54.8,57.3,-65.5,46.5,-73.2,33.8C-80.9,21.1,-85.7,6.5,-84.9,-7.7C-84.1,-21.9,-77.7,-35.7,-68.8,-47.4C-59.9,-59.1,-48.5,-68.7,-35.9,-76.7C-23.3,-84.7,-9.4,-91.1,3.4,-97C16.2,-102.9,30.5,-103.6,44.7,-76.4Z",
  "M38.5,-64.1C51.6,-56.3,65.2,-48.2,74.5,-36.5C83.7,-24.8,88.7,-9.5,88.5,5.8C88.4,21.1,83.1,36.5,73.5,48.7C63.8,60.9,49.8,70,34.8,75.1C19.8,80.2,3.8,81.4,-11.5,78.3C-26.8,75.2,-41.4,67.8,-53.4,57.2C-65.4,46.6,-74.8,32.8,-79.9,17.7C-85,2.6,-85.8,-13.7,-80.1,-27.9C-74.4,-42.1,-62.1,-54.2,-48.2,-61.6C-34.3,-69,-18.8,-71.7,-4.4,-64.6C10,-57.5,25.4,-71.8,38.5,-64.1Z",
  "M48.2,-78.3C60.7,-71.1,68,-54.2,73.2,-38.4C78.4,-22.6,81.4,-7.8,81.3,7.5C81.1,22.8,77.7,38.7,69.5,51.8C61.3,64.9,48.3,75.1,33.8,80.8C19.2,86.5,3,87.7,-14.2,85.5C-31.5,83.2,-49.8,77.5,-63.9,65.9C-78.1,54.3,-88.2,36.9,-91.5,18.7C-94.8,0.4,-91.3,-18.6,-82.5,-34.5C-73.8,-50.3,-59.8,-62.9,-44.7,-69.3C-29.6,-75.7,-13.4,-75.8,2,-78.9C17.5,-82,35.6,-85.5,48.2,-78.3Z"
];

const AbstractBlob = ({ color, top, left, right, bottom, size, rotate, opacity = 0.12, variant = 0 }: any) => (
  <Box
    component={motion.div}
    initial={{ opacity: 0, scale: 0.8, rotate: (rotate || 0) - 10 }}
    whileInView={{
      opacity: opacity,
      scale: [1, 1.1, 1],
      rotate: [rotate || 0, (rotate || 0) + 10, rotate || 0],
      y: [0, 30, 0],
    }}
    viewport={{ once: false, amount: 0.2 }}
    transition={{
      opacity: { duration: 1 },
      scale: { duration: 15, repeat: Infinity, ease: "easeInOut" },
      rotate: { duration: 20, repeat: Infinity, ease: "easeInOut" },
      y: { duration: 12, repeat: Infinity, ease: "easeInOut" },
    }}
    sx={{
      position: 'absolute',
      top, left, right, bottom,
      width: size || { xs: '400px', md: '800px' },
      height: size || { xs: '400px', md: '800px' },
      zIndex: 0,
      pointerEvents: 'none',
      filter: 'blur(3px)',
    }}
  >
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <path
        fill={color}
        d={BLOB_PATHS[variant % BLOB_PATHS.length]}
        transform="translate(100 100)"
      />
    </svg>
  </Box>
);

const DecorativeImageFrame = ({ children, theme }: any) => {
  const tertiaryMain = (theme.palette as any).tertiary?.main || theme.palette.primary.main;

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, scale: 0.9, x: 20 }}
      whileInView={{ opacity: 1, scale: 1, x: 0 }}
      viewport={{ once: false, amount: 0.3 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      sx={{ position: 'relative', p: 1 }}
    >
      {/* Emphasized accent border using tertiary */}
      <Box
        component={motion.div}
        animate={{
          rotate: [0, 2, -2, 0],
          scale: [1, 1.02, 0.98, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        sx={{
          position: 'absolute',
          inset: -8,
          border: '2px solid',
          borderColor: tertiaryMain,
          borderRadius: 6,
          opacity: 0.3,
          zIndex: 0,
          clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 50%, 5% 50%, 5% 95%, 95% 95%, 95% 5%, 5% 5%, 5% 50%, 0% 50%)',
        }}
      />
      {/* Secondary background shape */}
      <Box
        component={motion.div}
        animate={{
          x: [0, 10, 0],
          rotate: [2, 4, 2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        sx={{
          position: 'absolute',
          top: 20,
          right: -20,
          width: '100%',
          height: '100%',
          bgcolor: 'secondary.main',
          opacity: 0.05,
          borderRadius: 8,
          zIndex: 0,
          transform: 'rotate(2deg)',
        }}
      />
      {/* Primary glow effect */}
      <Box
        sx={{
          position: 'absolute',
          inset: 20,
          bgcolor: 'primary.main',
          filter: 'blur(60px)',
          opacity: 0.1,
          zIndex: -1,
        }}
      />
      <Box sx={{ position: 'relative', zIndex: 1, borderRadius: 6, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
        {children}
      </Box>
    </Box>
  );
};

export default function WhyBossCargo() {
  usePageTitle('Why Us');
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Defensive Theme Extraction
  const primaryMain = theme.palette.primary?.main || '#00A39D';
  const secondaryMain = theme.palette.secondary?.main || '#202945';
  const tertiaryMain = (theme.palette as any).tertiary?.main || primaryMain;

  const values = SITE_CONTENT.missionVision.values;

  const COVERAGE_POINTS = [
    // North Luzon
    { name: 'Abra', x: 45, y: 23 },
    { name: 'Aparri', x: 53, y: 20 }, // Moved Inland
    { name: 'Baguio', x: 45, y: 30 },
    { name: 'Ilocos Sur', x: 42, y: 25 },
    { name: 'Ilocos Norte', x: 45, y: 20 }, // Moved Inland
    { name: 'Cauayan', x: 56, y: 28 },
    { name: 'Isabela', x: 57, y: 30 },
    { name: 'La Union', x: 43, y: 28 },
    { name: 'Solano NV', x: 51, y: 35 },
    { name: 'Tuguegarao', x: 55, y: 22 },
    { name: 'Vigan', x: 42, y: 23 },
    // Central Luzon
    { name: 'Bataan', x: 43, y: 44 },
    { name: 'Bulacan', x: 47, y: 43 },
    { name: 'Zambales', x: 41, y: 40 },
    { name: 'Nueva Ecija', x: 49, y: 37 },
    { name: 'Olongapo', x: 42, y: 42 },
    { name: 'Pampanga', x: 45, y: 42 },
    { name: 'Pangasinan', x: 44, y: 34 },
    { name: 'Santiago', x: 55, y: 32 },
    { name: 'Tarlac', x: 46, y: 38 },
    { name: 'Aurora', x: 55, y: 38 },
    // Metro Manila
    { name: 'Parañaque Hub', x: 46.5, y: 45.5 },
    { name: 'Taytay Hub', x: 48.5, y: 45 },
    { name: 'Las Piñas', x: 46.2, y: 46.5 },
    // South Luzon
    { name: 'Camarines Norte', x: 57, y: 47 },
    { name: 'Camarines Sur', x: 60, y: 51 },
    { name: 'Legaspi', x: 64, y: 55 },
    { name: 'Lucena', x: 51, y: 48 },
    { name: 'Masbate', x: 64, y: 62 },
    { name: 'Naga', x: 61, y: 51 },
    { name: 'Palawan', x: 30, y: 76 }, // Moved Inland
    { name: 'Quezon Province', x: 53, y: 46 },
    { name: 'San Jose Occidental Mindoro', x: 43, y: 58 },
    { name: 'Calapan Oriental Mindoro', x: 46, y: 52 },
    // Visayas
    { name: 'Bacolod', x: 55, y: 71 },
    { name: 'Cebu', x: 65, y: 72 },
    { name: 'Dumaguete', x: 59, y: 81 },
    { name: 'Iloilo', x: 53, y: 71 },
    { name: 'Kalibo', x: 52, y: 63 },
    { name: 'Tacloban', x: 72, y: 68 }, // Moved Inland
    { name: 'Tagbilaran', x: 66, y: 78 },
    { name: 'Roxas', x: 57, y: 63 },
    // Mindanao
    { name: 'Butuan', x: 75, y: 84 }, // Moved Inland
    { name: 'Cagayan de Oro', x: 68, y: 85 },
    { name: 'Cotabato', x: 65, y: 93 },
    { name: 'Davao', x: 78, y: 92 },
    { name: 'Dipolog', x: 56, y: 83 },
    { name: 'General Santos', x: 73, y: 97 },
    { name: 'Ozamis', x: 61, y: 87 },
    { name: 'Surigao', x: 76, y: 81 }, // Moved Inland
    { name: 'Zamboanga', x: 48, y: 89 }, // Moved Inland
    { name: 'Pagadian', x: 57, y: 90 },
  ].map((p, i) => ({ ...p, delay: (i % 30) * 0.03 }));

  return (
    <Box sx={{
      height: 'calc(100vh - 80px)',
      overflowY: 'auto',
      overflowX: 'hidden',
      scrollSnapType: 'y mandatory',
      scrollBehavior: 'smooth',
      '&::-webkit-scrollbar': { display: 'none' },
      msOverflowStyle: 'none',
      scrollbarWidth: 'none'
    }}>
      {/* Hero Slide: Nationwide Presence */}
      <Box
        sx={{
          minHeight: 'calc(100vh - 80px)',
          display: 'flex',
          alignItems: 'center',
          scrollSnapAlign: 'start',
          scrollSnapStop: 'always',
          py: { xs: 8, md: 0 },
          px: { xs: 2, md: 6 },
          position: 'relative',
          overflow: 'hidden',
          bgcolor: 'background.default'
        }}
      >
        <PageContainer maxWidth="lg" disableVerticalPadding sx={{ position: 'relative', zIndex: 2 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 7 }}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.8 }}
              >
                <Typography
                  variant="overline"
                  sx={{
                    color: 'primary.main',
                    fontWeight: 800,
                    letterSpacing: 4,
                    display: 'block',
                    mb: 2
                  }}
                >
                  Our Reach
                </Typography>
                <Typography
                  variant="h1"
                  sx={{
                    fontWeight: 900,
                    mb: 3,
                    fontSize: { xs: '3rem', md: '5rem' },
                    lineHeight: 1,
                    textTransform: 'uppercase'
                  }}
                >
                  Nationwide <br />
                  <Box component="span" sx={{ color: 'primary.main' }}>Archipelago</Box>
                </Typography>
                <Typography variant="h5" sx={{ mb: 4, maxWidth: '600px', opacity: 0.8, fontWeight: 400 }}>
                  We bridge the gap across the 7,641 islands of the Philippines with a robust logistics network designed for the modern era.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                      borderLeft: `4px solid ${primaryMain}`,
                      borderRadius: '0 8px 8px 0'
                    }}
                  >
                    <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main' }}>50+</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7, fontWeight: 700 }}>Service Points</Typography>
                  </Paper>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                      borderLeft: `4px solid ${tertiaryMain}`,
                      borderRadius: '0 8px 8px 0'
                    }}
                  >
                    <Typography variant="h4" sx={{ fontWeight: 800, color: 'secondary.main' }}>81</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7, fontWeight: 700 }}>Provinces Reached</Typography>
                  </Paper>
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </PageContainer>

        {/* Map Visualization Container */}
        <Box
          sx={{
            position: 'absolute',
            top: '5%',
            bottom: '5%',
            right: { xs: 'auto', md: '5%' },
            left: { xs: '0', md: 'auto' },
            width: { xs: '100%', md: '45%' },
            opacity: { xs: 0.3, md: 1 },
            pointerEvents: 'none',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1
          }}
        >
          <Box
            component={motion.div}
            animate={{
              y: [0, -30, 0],
              scale: [1.2, 1.25, 1.2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            sx={{
              width: '100%',
              aspectRatio: '1/1',
              position: 'relative',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Box
              component={motion.div}
              animate={{
                backgroundColor: [primaryMain, tertiaryMain, primaryMain],
                rotate: [0, 1, -1, 0],
                filter: isDark
                  ? [`drop-shadow(0 0 40px ${primaryMain}44)`, `drop-shadow(0 0 60px ${tertiaryMain}44)`, `drop-shadow(0 0 40px ${primaryMain}44)`]
                  : ['drop-shadow(0 20px 40px rgba(0,0,0,0.1))', 'drop-shadow(0 30px 50px rgba(0,0,0,0.15))', 'drop-shadow(0 20px 40px rgba(0,0,0,0.1))']
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              sx={{
                width: '100%',
                height: '100%',
                maskImage: `url(${(IMAGE_URLS.PH_MAP as any).src || IMAGE_URLS.PH_MAP})`,
                WebkitMaskImage: `url(${(IMAGE_URLS.PH_MAP as any).src || IMAGE_URLS.PH_MAP})`,
                maskSize: 'contain',
                maskRepeat: 'no-repeat',
                maskPosition: 'center',
                backgroundColor: primaryMain,
                zIndex: 1,
                position: 'absolute',
                top: 0,
                left: 0,
              }}
            />

            {COVERAGE_POINTS.map((point) => (
              <Box
                key={point.name}
                component={motion.div}
                initial="initial"
                whileInView="animate"
                whileHover="hover"
                viewport={{ once: false, amount: 0.1 }}
                sx={{
                  position: 'absolute',
                  left: `${point.x}%`,
                  top: `${point.y}%`,
                  zIndex: 10,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  pointerEvents: 'auto',
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {/* Compact Subtle Dot with synced pulse */}
                <Box
                  component={motion.div}
                  variants={{
                    initial: { scale: 0, opacity: 0 },
                    animate: { 
                      scale: [1, 1.3, 1],
                      opacity: [1, 0.7, 1],
                      transition: { 
                        delay: point.delay,
                        duration: 8, // Synced with map color pulse
                        repeat: Infinity,
                        ease: "easeInOut"
                      }
                    },
                    hover: { scale: 0 }
                  }}
                  sx={{
                    width: 6,
                    height: 6,
                    bgcolor: secondaryMain,
                    borderRadius: '50%',
                    border: `1px solid ${isDark ? 'white' : 'black'}`,
                    boxShadow: '0 0 10px rgba(0,0,0,0.5)',
                  }}
                />

                {/* Combined Hover Badge (Icon + Label) */}
                <Box
                  component={motion.div}
                  variants={{
                    initial: { 
                      opacity: 0, 
                      scale: 0, 
                      y: point.y < 25 ? -15 : 15,
                      transition: { duration: 0.2, ease: "easeOut" } 
                    },
                    hover: { 
                      opacity: 1, 
                      scale: 1,
                      y: 0,
                      transition: { type: 'spring', stiffness: 400, damping: 20 }
                    }
                  }}
                  sx={{
                    position: 'absolute',
                    [point.y < 25 ? 'top' : 'bottom']: '100%',
                    [point.y < 25 ? 'mt' : 'mb']: 1.5,
                    display: 'flex',
                    flexDirection: point.y < 25 ? 'column-reverse' : 'column',
                    alignItems: 'center',
                    gap: 1,
                    zIndex: 20,
                    pointerEvents: 'none'
                  }}
                >
                  <Box
                    component={motion.div}
                    animate={{
                      y: [0, -4, 0] // Subtle synced float isolated from hover transitions
                    }}
                    transition={{
                      duration: 8, // Synced with map color pulse
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}
                  >
                  <Typography
                    variant="caption"
                    sx={{
                      whiteSpace: 'nowrap',
                      color: isDark ? tertiaryMain : 'white',
                      fontWeight: 900,
                      fontSize: '0.7rem',
                      letterSpacing: 1,
                      textTransform: 'uppercase',
                      backgroundColor: secondaryMain,
                      px: 1.2,
                      py: 0.5,
                      borderRadius: 1,
                      boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
                      border: `1px solid ${tertiaryMain}44`,
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    {point.name}
                  </Typography>

                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      bgcolor: isDark ? 'rgba(15, 20, 25, 0.95)' : 'white',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '50%',
                      p: 0.5,
                      boxShadow: `0 8px 30px rgba(0,0,0,0.5), 0 0 0 2px ${secondaryMain}`,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      position: 'relative'
                    }}
                  >
                    <ImageWithFallback
                      src={IMAGE_URLS.BOSS_CARGO_ICON}
                      alt={point.name}
                      layout="fill"
                      objectFit="contain"
                      style={{ padding: '4px' }}
                    />
                  </Box>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>

      {/* Slide 1: Mission & Vision */}
      <Box
        sx={{
          minHeight: 'calc(100vh - 80px)',
          display: 'flex',
          alignItems: 'center',
          scrollSnapAlign: 'start',
          scrollSnapStop: 'always',
          py: { xs: 4, md: 0 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <AbstractBlob
          color={tertiaryMain}
          top="-15%"
          right="-10%"
          size="950px"
          rotate={15}
          opacity={isDark ? 0.06 : 0.1}
          variant={0}
        />
        <AbstractBlob
          color={theme.palette.primary.main}
          bottom="5%"
          left="-15%"
          size="800px"
          rotate={-20}
          opacity={isDark ? 0.05 : 0.09}
          variant={1}
        />
        <AbstractBlob
          color={tertiaryMain}
          top="30%"
          left="20%"
          size="600px"
          rotate={180}
          opacity={isDark ? 0.04 : 0.07}
          variant={2}
        />
        <AbstractBlob
          color={theme.palette.primary.main}
          top="10%"
          left="5%"
          size="500px"
          rotate={45}
          opacity={isDark ? 0.04 : 0.07}
          variant={1}
        />
        <AbstractBlob
          color={tertiaryMain}
          top="-5%"
          left="40%"
          size="400px"
          rotate={-15}
          opacity={isDark ? 0.04 : 0.07}
          variant={0}
        />
        <AbstractBlob
          color={theme.palette.secondary.main}
          bottom="-10%"
          right="20%"
          size="600px"
          rotate={90}
          opacity={isDark ? 0.03 : 0.05}
          variant={1}
        />
        {/* Crowded shapes */}
        <AbstractBlob
          color={theme.palette.primary.main}
          bottom="20%"
          left="30%"
          size="350px"
          rotate={110}
          opacity={0.03}
          variant={2}
        />
        <AbstractBlob
          color={theme.palette.secondary.main}
          top="50%"
          right="5%"
          size="450px"
          rotate={240}
          opacity={0.02}
          variant={0}
        />
        <AbstractBlob
          color={tertiaryMain}
          top="5%"
          right="35%"
          size="250px"
          rotate={10}
          opacity={0.03}
          variant={1}
        />
        <PageContainer maxWidth="lg" disableVerticalPadding sx={{ width: '100%', position: 'relative', zIndex: 2 }}>
          <Grid container spacing={6} alignItems="center">
            {/* Left side: Content */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Box
                component={motion.div}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.8 }}
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
                  <Box
                    component={motion.div}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.5 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'primary.main', boxShadow: `0 0 15px ${theme.palette.primary.main}` }} />
                      Our Mission
                    </Typography>
                    <Typography variant="body2" sx={{ pl: 3, borderLeft: '2px solid', borderColor: tertiaryMain, py: 0.5, lineHeight: 1.7, color: 'text.primary' }}>
                      {SITE_CONTENT.missionVision.mission}
                    </Typography>
                  </Box>

                  <Box
                    component={motion.div}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.5 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    <Typography variant="h6" sx={{ color: 'secondary.main', fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'secondary.main', boxShadow: `0 0 15px ${theme.palette.secondary.main}` }} />
                      Our Dream (Vision)
                    </Typography>
                    <Typography variant="body2" sx={{ pl: 3, borderLeft: '2px solid', borderColor: 'primary.main', py: 0.5, lineHeight: 1.7, color: 'text.primary' }}>
                      {SITE_CONTENT.missionVision.vision}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Grid>

            {/* Right side: Image */}
            <Grid size={{ xs: 12, md: 5 }}>
              <DecorativeImageFrame theme={theme}>
                <ImageWithFallback
                  src={IMAGE_URLS.WHY_US_VALUES}
                  alt={getImageMetadata(IMAGE_URLS.WHY_US_VALUES).alt}
                  layout="responsive"
                  aspectRatio="4:3"
                  rounded={0} // Managed by frame
                  shadow={0}
                />
              </DecorativeImageFrame>
            </Grid>
          </Grid>
        </PageContainer>
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '15vh',
            background: `linear-gradient(to bottom, transparent, ${theme.palette.background.paper})`,
            pointerEvents: 'none',
            zIndex: 3,
          }}
        />
      </Box>

      {/* Slide 2: Brand Values & Culture */}
      <Box
        sx={{
          minHeight: 'calc(100vh - 80px)',
          display: 'flex',
          alignItems: 'center',
          scrollSnapAlign: 'start',
          scrollSnapStop: 'always',
          bgcolor: 'background.paper',
          py: { xs: 4, md: 0 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <AbstractBlob
          color={tertiaryMain}
          top="10%"
          left="-20%"
          size="950px"
          rotate={45}
          opacity={isDark ? 0.05 : 0.08}
          variant={1}
        />
        <AbstractBlob
          color={tertiaryMain}
          bottom="-15%"
          right="-15%"
          size="900px"
          rotate={-30}
          opacity={isDark ? 0.04 : 0.07}
          variant={2}
        />
        <AbstractBlob
          color={theme.palette.primary.main}
          top="40%"
          right="10%"
          size="650px"
          rotate={120}
          opacity={isDark ? 0.04 : 0.07}
          variant={0}
        />
        <AbstractBlob
          color={tertiaryMain}
          bottom="20%"
          left="10%"
          size="550px"
          rotate={-60}
          opacity={isDark ? 0.04 : 0.07}
          variant={2}
        />
        <AbstractBlob
          color={theme.palette.primary.main}
          top="-10%"
          right="30%"
          size="500px"
          rotate={30}
          opacity={isDark ? 0.04 : 0.07}
          variant={1}
        />
        <AbstractBlob
          color={tertiaryMain}
          bottom="10%"
          right="40%"
          size="400px"
          rotate={200}
          opacity={isDark ? 0.04 : 0.07}
          variant={0}
        />
        {/* Crowded shapes */}
        <AbstractBlob
          color={theme.palette.secondary.main}
          top="50%"
          left="40%"
          size="400px"
          rotate={15}
          opacity={0.03}
          variant={1}
        />
        <AbstractBlob
          color={theme.palette.primary.main}
          bottom="5%"
          left="30%"
          size="300px"
          rotate={180}
          opacity={0.02}
          variant={0}
        />
        <AbstractBlob
          color={tertiaryMain}
          top="20%"
          right="25%"
          size="500px"
          rotate={70}
          opacity={0.03}
          variant={2}
        />
        <PageContainer maxWidth="lg" disableVerticalPadding sx={{ width: '100%', position: 'relative', zIndex: 2 }}>
          <Grid container spacing={4}>
            {/* Left: Brand Values */}
            <Grid size={{ xs: 12, md: 7 }}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.8 }}
              >
                <Typography variant="h3" sx={{ mb: 2, fontWeight: 700, color: 'primary.main' }}>
                  Our Brand Values
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, opacity: 0.8 }}>
                  Creating a strong and positive perception of our company in our customers' minds.
                </Typography>
              </motion.div>

              <Grid container spacing={2}>
                {values.map((value, index) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={index}>
                    <Paper
                      component={motion.div}
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      whileInView={{ opacity: 1, scale: 1, y: 0 }}
                      viewport={{ once: false, amount: 0.2 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      elevation={0}
                      sx={{
                        p: 2.5,
                        height: '100%',
                        bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                        borderLeft: `4px solid ${index % 2 === 0 ? primaryMain : tertiaryMain}`,
                        borderRadius: '0 12px 12px 0',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          transform: 'translateX(8px) !important', // Override motion transform if needed, or better, use whileHover
                          bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                          boxShadow: `0 4px 20px -10px ${theme.palette.primary.main}`
                        }
                      }}
                      whileHover={{ x: 8 }}
                    >
                      <Typography variant="subtitle1" sx={{ mb: 1, color: index % 2 === 0 ? 'primary.main' : 'text.primary', fontWeight: 700 }}>
                        {value.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {value.description}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* Right: Culture */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Box
                component={motion.div}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
              >
                <Typography variant="h3" sx={{ mb: 2, fontWeight: 700, color: 'secondary.main' }}>
                  Our Culture
                </Typography>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    mb: 3,
                    bgcolor: isDark ? 'action.hover' : 'action.selected',
                    borderRadius: 4,
                    position: 'relative',
                    overflow: 'hidden',
                    borderLeft: `2px solid ${tertiaryMain}`
                  }}
                >
                  <Typography variant="body2" sx={{ lineHeight: 1.7, fontStyle: 'italic', position: 'relative', zIndex: 1 }}>
                    "{SITE_CONTENT.missionVision.culture}"
                  </Typography>
                  <Box
                    component={motion.div}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.1, 0.2, 0.1],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    sx={{ position: 'absolute', top: -10, right: -10, width: 60, height: 60, bgcolor: 'tertiary.main', opacity: 0.1, borderRadius: '50%' }}
                  />
                </Paper>
                <DecorativeImageFrame theme={theme}>
                  <ImageWithFallback
                    src={IMAGE_URLS.WHY_US_CULTURE}
                    alt={getImageMetadata(IMAGE_URLS.WHY_US_CULTURE).alt}
                    layout="responsive"
                    aspectRatio="16:9"
                    rounded={0}
                    shadow={0}
                  />
                </DecorativeImageFrame>
              </Box>
            </Grid>
          </Grid>
        </PageContainer>
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '15vh',
            background: `linear-gradient(to bottom, transparent, ${theme.palette.background.default})`,
            pointerEvents: 'none',
            zIndex: 3,
          }}
        />
      </Box>
    </Box>
  );
}