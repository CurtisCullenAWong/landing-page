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
  const primaryDark = theme.palette.primary?.dark || '#007A76';
  const secondaryMain = theme.palette.secondary?.main || '#202945';
  const secondaryDark = theme.palette.secondary?.dark || '#111626';
  const tertiaryMain = (theme.palette as any).tertiary?.main || primaryMain;
  const tertiaryDark = (theme.palette as any).tertiary?.dark || primaryDark;

  const values = SITE_CONTENT.missionVision.values;

  return (
    <Box>
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
          color={theme.palette.primary.main}
          top="-15%"
          right="-10%"
          size="900px"
          rotate={15}
          opacity={isDark ? 0.04 : 0.06}
          variant={0}
        />
        <AbstractBlob
          color={tertiaryMain}
          bottom="5%"
          left="-15%"
          size="700px"
          rotate={-20}
          opacity={isDark ? 0.03 : 0.05}
          variant={1}
        />
        <AbstractBlob
          color={theme.palette.secondary.main}
          top="30%"
          left="20%"
          size="500px"
          rotate={180}
          opacity={isDark ? 0.02 : 0.04}
          variant={2}
        />
        <AbstractBlob
          color={theme.palette.primary.main}
          top="10%"
          left="5%"
          size="400px"
          rotate={45}
          opacity={isDark ? 0.02 : 0.04}
          variant={1}
        />
        <AbstractBlob
          color={tertiaryMain}
          top="-5%"
          left="40%"
          size="300px"
          rotate={-15}
          opacity={isDark ? 0.02 : 0.04}
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
          position: 'relative'
        }}
      >
        <AbstractBlob
          color={theme.palette.secondary.main}
          top="10%"
          left="-20%"
          size="900px"
          rotate={45}
          opacity={isDark ? 0.03 : 0.06}
          variant={1}
        />
        <AbstractBlob
          color={tertiaryMain}
          bottom="-15%"
          right="-15%"
          size="850px"
          rotate={-30}
          opacity={isDark ? 0.02 : 0.05}
          variant={2}
        />
        <AbstractBlob
          color={theme.palette.primary.main}
          top="40%"
          right="10%"
          size="600px"
          rotate={120}
          opacity={isDark ? 0.02 : 0.04}
          variant={0}
        />
        <AbstractBlob
          color={theme.palette.secondary.main}
          bottom="20%"
          left="10%"
          size="500px"
          rotate={-60}
          opacity={isDark ? 0.02 : 0.04}
          variant={2}
        />
        <AbstractBlob
          color={theme.palette.primary.main}
          top="-10%"
          right="30%"
          size="450px"
          rotate={30}
          opacity={isDark ? 0.02 : 0.04}
          variant={1}
        />
        <AbstractBlob
          color={tertiaryMain}
          bottom="10%"
          right="40%"
          size="350px"
          rotate={200}
          opacity={isDark ? 0.02 : 0.04}
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