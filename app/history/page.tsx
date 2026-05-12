'use client';

import { ImageWithFallback } from '../../components/layout/ImageWithFallback';
import { IMAGE_URLS, getImageMetadata } from '../../constants/images';
import { PageContainer, PageHeader } from '../../components/layout';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  useTheme,
  Stack,
  alpha,
} from '@mui/material';
import { SECTION_SPACING } from '../../constants/layout';
import { usePageTitle } from '../../lib/usePageTitle';
import { SITE_CONTENT } from '../../constants/site-content';
import { motion } from 'framer-motion';

// Abstract squiggly shapes for background variety
const BLOB_PATHS = [
  "M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-46.5C87.4,-33.8,90,-18.4,89.1,-3.5C88.2,11.4,83.7,25.9,76,38.5C68.3,51.1,57.3,61.8,44.2,69.5C31.1,77.2,15.5,81.9,0.4,81.2C-14.7,80.5,-29.4,74.3,-42.1,65.8C-54.8,57.3,-65.5,46.5,-73.2,33.8C-80.9,21.1,-85.7,6.5,-84.9,-7.7C-84.1,-21.9,-77.7,-35.7,-68.8,-47.4C-59.9,-59.1,-48.5,-68.7,-35.9,-76.7C-23.3,-84.7,-9.4,-91.1,3.4,-97C16.2,-102.9,30.5,-103.6,44.7,-76.4Z",
  "M38.5,-64.1C51.6,-56.3,65.2,-48.2,74.5,-36.5C83.7,-24.8,88.7,-9.5,88.5,5.8C88.4,21.1,83.1,36.5,73.5,48.7C63.8,60.9,49.8,70,34.8,75.1C19.8,80.2,3.8,81.4,-11.5,78.3C-26.8,75.2,-41.4,67.8,-53.4,57.2C-65.4,46.6,-74.8,32.8,-79.9,17.7C-85,2.6,-85.8,-13.7,-80.1,-27.9C-74.4,-42.1,-62.1,-54.2,-48.2,-61.6C-34.3,-69,-18.8,-71.7,-4.4,-64.6C10,-57.5,25.4,-71.8,38.5,-64.1Z",
  "M48.2,-78.3C60.7,-71.1,68,-54.2,73.2,-38.4C78.4,-22.6,81.4,-7.8,81.3,7.5C81.1,22.8,77.7,38.7,69.5,51.8C61.3,64.9,48.3,75.1,33.8,80.8C19.2,86.5,3,87.7,-14.2,85.5C-31.5,83.2,-49.8,77.5,-63.9,65.9C-78.1,54.3,-88.2,36.9,-91.5,18.7C-94.8,0.4,-91.3,-18.6,-82.5,-34.5C-73.8,-50.3,-59.8,-62.9,-44.7,-69.3C-29.6,-75.7,-13.4,-75.8,2,-78.9C17.5,-82,35.6,-85.5,48.2,-78.3Z"
];

const AbstractBlob = ({ color, top, left, right, bottom, size, rotate, opacity = 0.08, variant = 0 }: any) => (
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
      width: size || { xs: '300px', md: '600px' },
      height: size || { xs: '300px', md: '600px' },
      zIndex: 0,
      pointerEvents: 'none',
      filter: 'blur(20px)',
      willChange: 'transform, opacity',
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
      {/* Architectural accent borders */}
      <Box
        component={motion.div}
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
        sx={{
          position: 'absolute',
          inset: -12,
          border: '1px solid',
          borderColor: tertiaryMain,
          borderRadius: '40% 60% 70% 30% / 40% 40% 60% 60%',
          opacity: 0.2,
          zIndex: 0,
          willChange: 'transform',
        }}
      />
      <Box
        component={motion.div}
        animate={{
          rotate: [360, 0],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear"
        }}
        sx={{
          position: 'absolute',
          inset: -6,
          border: '2px solid',
          borderColor: 'primary.main',
          borderRadius: '60% 40% 30% 70% / 60% 60% 40% 40%',
          opacity: 0.1,
          zIndex: 0,
          willChange: 'transform',
        }}
      />
      <Box sx={{ position: 'relative', zIndex: 1, borderRadius: 4, overflow: 'hidden', boxShadow: theme.shadows[10] }}>
        {children}
      </Box>
    </Box>
  );
};

export default function HistoryPage() {
  usePageTitle('History');
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Defensive Theme Extraction
  const primaryMain = theme.palette.primary.main;
  const secondaryMain = theme.palette.secondary.main;
  const tertiaryMain = (theme.palette as any).tertiary?.main || primaryMain;

  const milestones = SITE_CONTENT.company.strategy.milestones.map((m, index) => {
    const colors = [primaryMain, secondaryMain, tertiaryMain];
    return {
      year: ('year' in m ? m.year : null) || (index === 1 ? '2015-2018' : index === 2 ? '2019-2022' : '2023-Present'),
      title: m.title,
      description: m.description,
      color: colors[index % colors.length]
    };
  });

  // Scalable Milestone Grouping (2 per slide)
  const milestoneChunks = [];
  for (let i = 0; i < milestones.length; i += 2) {
    milestoneChunks.push(milestones.slice(i, i + 2));
  }

  return (
    <Box>
      {/* Slide 1: Introduction & Story */}
      <Box
        sx={{
          minHeight: 'calc(100dvh - 80px)',
          display: 'flex',
          alignItems: 'center',
          scrollSnapAlign: 'start',
          scrollSnapStop: 'always',
          py: { xs: 10, md: 15 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <AbstractBlob color={primaryMain} top="-10%" right="-5%" size="800px" rotate={15} opacity={0.12} />
        <AbstractBlob color={tertiaryMain} bottom="0%" left="-10%" size="600px" rotate={-20} opacity={0.08} />
        <AbstractBlob color={secondaryMain} top="20%" left="15%" size="400px" rotate={45} opacity={0.06} />

        <PageContainer maxWidth="lg" disableVerticalPadding sx={{ width: '100%', position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            <PageHeader
              title="Our Journey"
              subtitle="Embark on a sustainable and transformative journey with us."
              bottomSpacing={SECTION_SPACING.medium}
            />
          </motion.div>

          <Grid container spacing={{ xs: 6, lg: 8 }} alignItems="center">
            <Grid size={{ xs: 12, lg: 6 }}>
              <Box 
                component={motion.div}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.8 }}
                sx={{ position: 'relative' }}
              >
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
                  sx={{
                    position: 'absolute',
                    top: -20,
                    left: -20,
                    width: 60,
                    height: 60,
                    bgcolor: tertiaryMain,
                    opacity: 0.15,
                    borderRadius: '50%',
                    zIndex: -1
                  }}
                />
                <Typography variant="h3" sx={{ mb: 3, fontWeight: 800, color: 'primary.main', letterSpacing: -1, fontSize: { xs: '2rem', md: '2.5rem', lg: '3rem' } }}>
                  The Boss Cargo Express Story
                </Typography>
                <Stack spacing={3}>
                  <Typography variant="body1" color="text.primary" sx={{ lineHeight: 1.8, fontSize: { xs: '1rem', md: '1.1rem' }, borderLeft: `5px solid ${tertiaryMain}`, pl: { xs: 3, md: 4 } }}>
                    {SITE_CONTENT.company.story}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, fontSize: { xs: '0.95rem', md: '1rem' }, pl: { xs: 3, md: 5 } }}>
                    {SITE_CONTENT.company.strategy.overview}
                  </Typography>
                </Stack>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, lg: 6 }}>
              <DecorativeImageFrame theme={theme}>
                <ImageWithFallback
                  src={IMAGE_URLS.HISTORY_CARGO_TRUCK}
                  alt={getImageMetadata(IMAGE_URLS.HISTORY_CARGO_TRUCK).alt}
                  layout="responsive"
                  aspectRatio="4:3"
                  rounded={0}
                  shadow={0}
                  hoverZoom
                />
              </DecorativeImageFrame>
            </Grid>
          </Grid>
        </PageContainer>

        {/* Transition to Milestones */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: { xs: '8dvh', md: '15dvh' },
            background: `linear-gradient(to bottom, transparent, ${theme.palette.background.paper})`,
            pointerEvents: 'none',
            zIndex: 0, // Lower z-index so content isn't covered
          }}
        />
      </Box>

      {/* Dynamic Milestone Slides */}
      {milestoneChunks.map((chunk, slideIndex) => (
        <Box
          key={slideIndex}
          sx={{
            minHeight: 'calc(100dvh - 80px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            scrollSnapAlign: 'start',
            scrollSnapStop: 'always',
            bgcolor: slideIndex % 2 === 0 ? 'background.paper' : 'background.default',
            py: { xs: 10, md: 15 },
            position: 'relative',
            overflow: 'visible'
          }}
        >
          {/* Alternating Background Blobs */}
          {slideIndex % 2 === 0 ? (
            <>
              <AbstractBlob color={secondaryMain} top="10%" left="-15%" size="900px" rotate={45} opacity={0.08} />
              <AbstractBlob color={primaryMain} bottom="-10%" right="-10%" size="700px" rotate={-15} opacity={0.06} />
            </>
          ) : (
            <>
              <AbstractBlob color={tertiaryMain} top="5%" right="-10%" size="800px" rotate={-15} opacity={0.1} />
              <AbstractBlob color={primaryMain} bottom="10%" left="-15%" size="600px" rotate={30} opacity={0.08} />
            </>
          )}

          {/* Timeline Connecting Line - Explicitly Not Faded (Z-Index 4) */}
          <Box
            sx={{
              position: 'absolute',
              left: '50%',
              top: slideIndex === 0 ? { xs: '30%', md: '28%' } : 0,
              bottom: slideIndex === milestoneChunks.length - 1 ? '50%' : 0,
              width: '3px',
              background: slideIndex % 2 === 0
                ? `linear-gradient(to bottom, ${primaryMain}, ${secondaryMain})`
                : `linear-gradient(to bottom, ${secondaryMain}, ${tertiaryMain})`,
              opacity: 1, // Explicitly not faded
              display: { xs: 'none', md: 'block' },
              zIndex: 4,
              boxShadow: `0 0 10px ${alpha(isDark ? '#fff' : '#000', 0.1)}`,
              willChange: 'transform, opacity',
            }}
          />

          <PageContainer maxWidth="lg" disableVerticalPadding sx={{ width: '100%', position: 'relative', zIndex: 5 }}>
            {slideIndex === 0 && (
              <Box 
                component={motion.div}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: false, amount: 0.5 }}
                transition={{ duration: 0.8 }}
                sx={{ textAlign: 'center', mb: 6 }}
              >
                <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: 4 }}>
                  CHRONICLES
                </Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, color: 'text.primary', fontSize: { xs: '2.25rem', sm: '2.75rem', md: '3.5rem' } }}>
                  Early Milestones
                </Typography>
              </Box>
            )}

            <Stack spacing={6}>
              {chunk.map((milestone, index) => {
                const globalIndex = slideIndex * 2 + index;
                const isLeft = globalIndex % 2 === 0;

                return (
                  <Grid 
                    container 
                    spacing={{ xs: 4, md: 8 }} 
                    alignItems="center" 
                    key={globalIndex}
                    component={motion.div}
                    initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false, amount: 0.2 }}
                    transition={{ duration: 0.8, delay: index * 0.2 }}
                  >
                    {/* Left Position */}
                    <Grid size={{ xs: 12, md: 5 }} sx={{ order: isLeft ? 1 : 3 }}>
                      <Card
                        elevation={0}
                        sx={{
                          bgcolor: isDark ? alpha(milestone.color, 0.15) : alpha(milestone.color, 0.06),
                          borderLeft: { xs: `6px solid ${milestone.color}`, md: isLeft ? `6px solid ${milestone.color}` : 'none' },
                          borderRight: { xs: 'none', md: !isLeft ? `6px solid ${milestone.color}` : 'none' },
                          borderRadius: {
                            xs: '0 24px 24px 0',
                            md: isLeft ? '0 24px 24px 0' : '24px 0 0 24px'
                          },
                          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            transform: {
                              xs: 'translateX(8px)',
                              md: isLeft ? 'translateX(15px)' : 'translateX(-15px)'
                            },
                            bgcolor: alpha(milestone.color, 0.2),
                            boxShadow: `0 10px 30px ${alpha(milestone.color, 0.15)}`
                          }
                        }}
                      >
                        <CardContent sx={{ p: { xs: 3, sm: 4, md: 5 }, textAlign: { xs: 'left', md: isLeft ? 'left' : 'right' } }}>
                          <Typography variant="h3" sx={{ color: milestone.color, fontWeight: 950, mb: 1.5, opacity: 1, fontSize: { xs: '2.5rem', md: '4rem' }, letterSpacing: -2 }}>{milestone.year}</Typography>
                          <Typography variant="h5" sx={{ mb: 2, fontWeight: 800, fontSize: { xs: '1.25rem', md: '1.75rem' }, lineHeight: 1.3 }}>{milestone.title}</Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, fontSize: { xs: '0.95rem', md: '1rem' }, fontWeight: 500 }}>{milestone.description}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Timeline Center Dot */}
                    <Grid size={{ xs: 0, md: 2 }} sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center', order: 2 }}>
                      <Box
                        component={motion.div}
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: false }}
                        transition={{ type: 'spring', stiffness: 200, delay: 0.5 + index * 0.2 }}
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          bgcolor: milestone.color,
                          border: `8px solid ${theme.palette.background.paper}`,
                          boxShadow: `0 0 30px ${alpha(milestone.color, 0.7)}`,
                          zIndex: 6,
                          position: 'relative',
                          transition: 'transform 0.3s ease',
                          '&:hover': { transform: 'scale(1.2)' }
                        }}
                      />
                    </Grid>

                    {/* Empty Space for Alternating - Hidden on mobile */}
                    <Grid size={{ xs: 0, md: 5 }} sx={{ display: { xs: 'none', md: 'block' }, order: isLeft ? 3 : 1 }} />
                  </Grid>
                );
              })}

              {/* Vision Section (Appended to last milestone slide) */}
              {slideIndex === milestoneChunks.length - 1 && (
                <Box 
                  component={motion.div}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{ duration: 1 }}
                  sx={{ mt: 10, position: 'relative' }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 4, md: 8 },
                      borderRadius: 8,
                      textAlign: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                      background: isDark
                        ? `linear-gradient(135deg, ${alpha(secondaryMain, 0.25)} 0%, ${alpha(primaryMain, 0.15)} 100%)`
                        : `linear-gradient(135deg, ${alpha(primaryMain, 0.08)} 0%, ${alpha(secondaryMain, 0.08)} 100%)`,
                      border: '1px solid',
                      borderColor: isDark ? alpha(primaryMain, 0.3) : alpha(primaryMain, 0.15),
                      boxShadow: `0 30px 70px -20px ${alpha(secondaryMain, 0.5)}`
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '8px',
                        background: `linear-gradient(to right, ${primaryMain}, ${tertiaryMain}, ${secondaryMain})`
                      }}
                    />
                    <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 900, letterSpacing: 3, mb: 1, display: 'block' }}>
                      OUR VISION
                    </Typography>
                    <Typography variant="h3" sx={{ mb: 2, fontWeight: 900, color: 'text.primary', fontSize: { xs: '1.75rem', sm: '2.25rem', md: '3rem' }, letterSpacing: -1 }}>
                      Looking Ahead
                    </Typography>
                    <Typography variant="body1" sx={{ maxWidth: '850px', mx: 'auto', lineHeight: 1.8, fontSize: { xs: '1rem', md: '1.2rem' }, color: 'text.primary', fontWeight: 500, fontStyle: 'italic' }}>
                      "As we move forward, Boss Cargo Express remains committed to innovation, sustainability, and
                      creating opportunities for our team members to grow and succeed. We continue to embrace the frame
                      of CANI as we write the next chapter of our story."
                    </Typography>
                  </Paper>
                </Box>
              )}
            </Stack>
          </PageContainer>

          {/* Smooth transition to next section */}

        </Box>
      ))}
    </Box>
  );
}
