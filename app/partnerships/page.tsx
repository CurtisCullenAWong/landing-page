'use client';

import { Handshake, Briefcase, Package, Wrench, UtensilsCrossed, DollarSign, Store } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';

import { ImageWithFallback } from '../../components/layout/ImageWithFallback';
import { IMAGE_URLS, getImageMetadata } from '../../constants/images';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Paper,
  useTheme,
  alpha,
  Stack,
} from '@mui/material';
import { createClient } from '@/lib/supabase/client';
import { PageContainer, PageHeader } from '../../components/layout';
import { usePageTitle } from '../../lib/usePageTitle';
import { SITE_CONTENT } from '../../constants/site-content';
import { SECTION_SPACING } from '@/constants/layout';
import React, { useState, useEffect } from 'react';

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
        d={BLOB_PATHS[(variant || 0) % BLOB_PATHS.length] || BLOB_PATHS[0]}
        transform="translate(100 100)"
      />
    </svg>
  </Box>
);

const DecorativeImageFrame = ({ children, theme }: any) => {
  const tertiaryMain = (theme.palette as any).tertiary?.main || theme.palette.primary.main;

  return (
    <Box sx={{ position: 'relative', p: 1 }}>
      {/* Architectural accent borders */}
      <Box
        sx={{
          position: 'absolute',
          inset: -12,
          border: '1px solid',
          borderColor: tertiaryMain,
          borderRadius: '40% 60% 70% 30% / 40% 40% 60% 60%',
          opacity: 0.2,
          zIndex: 0,
          animation: 'rotate 20s linear infinite',
          '@keyframes rotate': {
            '0%': { transform: 'rotate(0deg)' },
            '100%': { transform: 'rotate(360deg)' },
          }
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          inset: -6,
          border: '2px solid',
          borderColor: 'primary.main',
          borderRadius: '60% 40% 30% 70% / 60% 60% 40% 40%',
          opacity: 0.1,
          zIndex: 0,
          animation: 'rotate-reverse 25s linear infinite',
          '@keyframes rotate-reverse': {
            '0%': { transform: 'rotate(360deg)' },
            '100%': { transform: 'rotate(0deg)' },
          }
        }}
      />
      <Box sx={{ position: 'relative', zIndex: 1, borderRadius: 4, overflow: 'hidden', boxShadow: theme.shadows[10] }}>
        {children}
      </Box>
    </Box>
  );
};

export default function PartnershipsPage() {
  usePageTitle('Partnerships');
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [activeIndex, setActiveIndex] = useState(0);
  const [baseSpacing, setBaseSpacing] = useState(320);

  React.useEffect(() => {
    const handleResize = () => {
      setBaseSpacing(window.innerWidth < 1000 ? 160 : 320);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const primaryMain = theme.palette.primary.main;
  const secondaryMain = theme.palette.secondary.main;
  const tertiaryMain = (theme.palette as any).tertiary?.main || primaryMain;

  const [partnerItems, setPartnerItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('partners')
          .select('*')
          .order('display_order', { ascending: true });
        if (!error && data) {
          setPartnerItems(data);
        }
      } catch (err) {
        console.error('Error fetching partners:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPartners();
  }, []);

  const dbIndustries = partnerItems.filter(item => item.type === 'industry');
  const displayIndustries = dbIndustries.length > 0 ? dbIndustries : SITE_CONTENT.partnerships.industries;

  const industries = displayIndustries.map(industry => {
    let icon = Briefcase;
    if (industry.name.includes('Consumer Goods') || industry.name.includes('FMCG')) icon = Package;
    if (industry.name.includes('Engineering')) icon = Wrench;
    if (industry.name.includes('Food')) icon = UtensilsCrossed;
    if (industry.name.includes('Financial')) icon = DollarSign;
    if (industry.name.includes('Retail')) icon = Store;
    return {
      name: industry.name,
      description: industry.description || (industry as any).role || '',
      icon
    };
  });

  const dbMemberships = partnerItems.filter(item => item.type === 'membership');
  const memberships = dbMemberships.map(m => {
    return {
      name: m.name,
      fullName: m.name,
      description: m.description || '',
      image: m.image_url || '',
      whiteBackground: m.white_background
    };
  });

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % memberships.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + memberships.length) % memberships.length);
  };

  const handleDragEnd = (_: any, info: any) => {
    const threshold = 50;
    if (info.offset.x < -threshold) handleNext();
    else if (info.offset.x > threshold) handlePrev();
  };

  return (
    <Box>
      {/* Slide 1: Introduction & Industries */}
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

        <PageContainer maxWidth="lg" disableVerticalPadding sx={{ width: '100%', position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            <PageHeader
              title="Strategic Alliances"
              subtitle={SITE_CONTENT.partnerships.description}
              bottomSpacing={SECTION_SPACING.medium}
              sx={{
                '& .MuiTypography-h2': { fontSize: { xs: '2.25rem', sm: '3rem', md: '3.75rem' } },
                '& .MuiTypography-h6': { fontSize: { xs: '1rem', md: '1.125rem' }, opacity: 0.8, maxWidth: '700px' }
              }}
            />
          </motion.div>

          <Box 
            component={motion.div}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            sx={{ mt: 2 }}
          >
            <Typography variant="overline" sx={{ display: 'block', textAlign: 'center', mb: 4, fontWeight: 800, color: 'primary.main', letterSpacing: { xs: 2, md: 4 }, opacity: 0.8, fontSize: { xs: '0.7rem', md: '0.875rem' } }}>
              INDUSTRIES WE SERVE
            </Typography>

            {/* Infinite Scrolling Carousel Container */}
            <Box sx={{
              position: 'relative',
              width: '100vw',
              left: '50%',
              right: '50%',
              marginLeft: '-50vw',
              marginRight: '-50vw',
              overflow: 'hidden',
              py: 2
            }}>
              {/* Soft Edge Gradient Masks */}
              <Box sx={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                width: { xs: 80, md: 200 },
                background: `linear-gradient(to right, ${theme.palette.background.default}, transparent)`,
                zIndex: 2,
                pointerEvents: 'none'
              }} />
              <Box sx={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                right: 0,
                width: { xs: 80, md: 200 },
                background: `linear-gradient(to left, ${theme.palette.background.default}, transparent)`,
                zIndex: 2,
                pointerEvents: 'none'
              }} />

              <motion.div
                animate={{
                  x: [0, -1224], // 6 items * (180px width + 24px gap)
                }}
                transition={{
                  x: {
                    repeat: Infinity,
                    repeatType: "loop",
                    duration: 35,
                    ease: "linear",
                  },
                }}
                style={{
                  display: 'flex',
                  gap: '24px',
                  width: 'fit-content',
                  padding: '0 12px',
                  willChange: 'transform'
                }}
              >
                {/* Triple the items to ensure seamless overlap */}
                {[...industries, ...industries, ...industries].map((industry, index) => {
                  const IconComponent = industry.icon;
                  return (
                    <Box key={index} sx={{ width: 180, flexShrink: 0 }}>
                      <Card
                        elevation={0}
                        sx={{
                          height: '100%',
                          bgcolor: isDark ? alpha(primaryMain, 0.08) : alpha(primaryMain, 0.03),
                          border: '1px solid',
                          borderColor: isDark ? alpha(primaryMain, 0.2) : alpha(primaryMain, 0.1),
                          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                          borderRadius: 4,
                          '&:hover': {
                            transform: 'translateY(-10px) scale(1.02)',
                            bgcolor: alpha(primaryMain, 0.12),
                            borderColor: primaryMain,
                            boxShadow: `0 20px 40px ${alpha(primaryMain, 0.15)}`
                          }
                        }}
                      >
                        <CardContent sx={{ p: 3, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2.5 }}>
                          <Box
                            sx={{
                              p: 2,
                              borderRadius: '50%',
                              bgcolor: 'primary.main',
                              color: 'primary.contrastText',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: `0 8px 20px ${alpha(primaryMain, 0.3)}`,
                              transition: 'transform 0.3s ease',
                              '.MuiCard-root:hover &': { transform: 'rotate(10deg) scale(1.1)' }
                            }}
                          >
                            <IconComponent size={24} />
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.3, letterSpacing: -0.2 }}>
                            {industry.name}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Box>
                  );
                })}
              </motion.div>
            </Box>
          </Box>

        </PageContainer>

        {/* Smooth transition to Slide 2 */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '15dvh',
            background: `linear-gradient(to bottom, transparent, ${theme.palette.background.paper})`,
            pointerEvents: 'none',
            zIndex: 3,
          }}
        />
      </Box>

      {/* Slide 2: Partnership Philosophy (Alternating Orientation) */}
      <Box
        sx={{
          minHeight: 'calc(100dvh - 80px)',
          display: 'flex',
          alignItems: 'center',
          scrollSnapAlign: 'start',
          scrollSnapStop: 'always',
          bgcolor: 'background.paper',
          py: { xs: 10, md: 15 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <AbstractBlob color={secondaryMain} top="10%" left="-15%" size="900px" rotate={45} opacity={0.06} />
        <AbstractBlob color={tertiaryMain} bottom="-10%" right="-10%" size="700px" rotate={-15} opacity={0.04} />

        <PageContainer maxWidth="lg" disableVerticalPadding sx={{ width: '100%', position: 'relative', zIndex: 1 }}>
          <Grid container spacing={8} alignItems="center">
            <Grid size={{ xs: 12, lg: 6 }} sx={{ order: { xs: 2, lg: 1 } }}>
              <Box 
                component={motion.div}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                style={{ willChange: 'transform, opacity' }}
                sx={{ position: 'relative' }}
              >
                <Box
                  component={motion.div}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.1, 0.15, 0.1],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  sx={{
                    position: 'absolute',
                    top: -20,
                    left: -20,
                    width: 80,
                    height: 80,
                    bgcolor: secondaryMain,
                    opacity: 0.1,
                    borderRadius: '50%',
                    zIndex: -1
                  }}
                />
                <Typography variant="overline" sx={{ color: 'secondary.main', fontWeight: 800, letterSpacing: 2 }}>
                  OUR PHILOSOPHY
                </Typography>
                <Typography variant="h2" sx={{ mb: 3, fontWeight: 800, color: 'text.primary', fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' }, lineHeight: 1.2 }}>
                  Dependable & <br />
                  <span style={{ color: primaryMain }}>Cost-Effective</span>
                </Typography>
                <Typography variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.8, color: 'text.secondary', mb: 4 }}>
                  {SITE_CONTENT.partnerships.description}
                </Typography>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    bgcolor: isDark ? alpha(primaryMain, 0.1) : alpha(primaryMain, 0.05),
                    borderLeft: `4px solid ${primaryMain}`,
                    borderRadius: '0 12px 12px 0'
                  }}
                >
                  <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.primary', fontWeight: 500 }}>
                    "Our key strategies for expansion and customer satisfaction are geared towards extending our product scope and serving a wider market segment."
                  </Typography>
                </Paper>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, lg: 6 }} sx={{ order: { xs: 1, lg: 2 } }}>
              <Box
                component={motion.div}
                initial={{ opacity: 0, scale: 0.9, x: 50 }}
                whileInView={{ opacity: 1, scale: 1, x: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                style={{ willChange: 'transform, opacity' }}
              >
                <DecorativeImageFrame theme={theme}>
                  <ImageWithFallback
                    src={IMAGE_URLS.PARTNERSHIPS_HANDSHAKE}
                    alt={getImageMetadata(IMAGE_URLS.PARTNERSHIPS_HANDSHAKE).alt}
                    layout="responsive"
                    aspectRatio="4:3"
                    sizes="(max-width: 900px) 100vw, 50vw"
                    rounded={0}
                    shadow={0}
                    hoverZoom
                  />
                </DecorativeImageFrame>
              </Box>
            </Grid>
          </Grid>
        </PageContainer>

        {/* Smooth transition to Slide 3 */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '15dvh',
            background: `linear-gradient(to bottom, transparent, ${theme.palette.background.default})`,
            pointerEvents: 'none',
            zIndex: 3,
          }}
        />
      </Box>

      {/* Slide 3: Memberships & CTA */}
      <Box
        sx={{
          minHeight: 'calc(100dvh - 80px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          scrollSnapAlign: 'start',
          scrollSnapStop: 'always',
          py: { xs: 10, md: 15 },
          position: 'relative',
          overflow: 'visible'
        }}
      >
        <AbstractBlob color={primaryMain} top="5%" right="-10%" size="800px" rotate={-15} opacity={0.08} />
        <AbstractBlob color={tertiaryMain} bottom="10%" left="-15%" size="600px" rotate={30} opacity={0.06} />

        <PageContainer maxWidth="lg" disableVerticalPadding sx={{ width: '100%', position: 'relative', zIndex: 1 }}>
          <Box 
            component={motion.div}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{ willChange: 'transform, opacity' }}
            sx={{ textAlign: 'center', mb: 6 }}
          >
            <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: 4 }}>
              ACCREDITATIONS
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, color: 'text.primary', fontSize: { xs: '2rem', sm: '2.75rem', md: '3.5rem' } }}>
              Global Networks
            </Typography>
          </Box>

          <Box sx={{
            position: 'relative',
            height: { xs: 450, md: 520 },
            width: '100%',
            overflow: 'visible',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            perspective: '1500px',
            mb: 8
          }}>
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={handleDragEnd}
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                touchAction: 'none'
              }}
            >
              <AnimatePresence initial={false}>
                {memberships.map((membership, index) => {
                  let relIndex = (index - activeIndex);
                  const half = Math.floor(memberships.length / 2);
                  if (relIndex > half) relIndex -= memberships.length;
                  if (relIndex < -half) relIndex += memberships.length;

                  const absRel = Math.abs(relIndex);
                  const isActive = relIndex === 0;

                  // Visibility check - show up to 5 cards for memberships
                  if (absRel > 2) return null;

                  const xOffset = relIndex * baseSpacing;
                  const yOffset = absRel * absRel * 20;
                  const rotateZ = relIndex * 8;
                  const scale = isActive ? 1.05 : (1 - absRel * 0.15);
                  const opacity = 1 - absRel * 0.3;
                  const zIndex = 10 - absRel;

                  return (
                    <motion.div
                      key={membership.name}
                      initial={false}
                      animate={{
                        x: xOffset,
                        y: yOffset,
                        rotateZ: rotateZ,
                        scale: scale,
                        opacity: opacity,
                        zIndex: zIndex
                      }}
                      transition={{
                        type: 'spring',
                        stiffness: 200,
                        damping: 25,
                        mass: 1
                      }}
                      style={{
                        position: 'absolute',
                        width: '90%',
                        maxWidth: 400,
                        cursor: isActive ? 'default' : 'pointer',
                        willChange: 'transform, opacity'
                      }}
                      onClick={() => {
                        if (!isActive) setActiveIndex(index);
                      }}
                    >
                      <Card
                        elevation={0}
                        sx={{
                          height: { xs: 380, md: 440 },
                          display: 'flex',
                          flexDirection: 'column',
                          bgcolor: 'background.paper',
                          border: '1px solid',
                          borderColor: isActive ? primaryMain : (isDark ? alpha(primaryMain, 0.2) : alpha(primaryMain, 0.1)),
                          borderRadius: 6,
                          boxShadow: isActive ? theme.shadows[15] : theme.shadows[5],
                          overflow: 'hidden',
                          ...(absRel === 2 && {
                            maskImage: 'linear-gradient(to top, transparent, black 40%)',
                            WebkitMaskImage: 'linear-gradient(to top, transparent, black 40%)'
                          })
                        }}
                      >
                        <Box
                          sx={{
                            p: 4,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: 180,
                            position: 'relative',
                            bgcolor: membership.whiteBackground ? '#fff' : alpha(primaryMain, 0.03),
                          }}
                        >
                          <Box sx={{ position: 'relative', width: '85%', height: '85%' }}>
                            <ImageWithFallback
                              src={membership.image}
                              alt={membership.fullName}
                              layout="fill"
                              objectFit="contain"
                              sizes="160px"
                            />
                          </Box>
                        </Box>
                        <CardContent sx={{ p: 4, flexGrow: 1, borderTop: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                          <Typography variant="h5" sx={{ mb: 1.5, color: 'primary.main', fontWeight: 900, textAlign: 'center' }}>
                            {membership.fullName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, textAlign: 'center', fontSize: '1rem' }}>
                            {membership.description}
                          </Typography>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          </Box>

          {/* Opportunities & CTA */}
          <Paper
            component={motion.div}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            elevation={0}
            sx={{
              p: { xs: 4, md: 6 },
              borderRadius: 6,
              background: isDark
                ? `linear-gradient(135deg, ${alpha(secondaryMain, 0.25)} 0%, ${alpha(primaryMain, 0.15)} 100%)`
                : `linear-gradient(135deg, ${alpha(primaryMain, 0.08)} 0%, ${alpha(secondaryMain, 0.08)} 100%)`,
              border: '1px solid',
              borderColor: isDark ? alpha(primaryMain, 0.3) : alpha(primaryMain, 0.15),
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Grid container spacing={4} alignItems="center">
              <Grid size={{ xs: 12, md: 8 }}>
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="h4" sx={{ fontWeight: 800, mb: 2, fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' } }}>
                    Ready to Expand Your Reach?
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: { xs: '0.95rem', md: '1.1rem' }, maxWidth: '600px' }}>
                    Join our network of strategic partners and investors to revolutionize the logistics industry in the Philippines and beyond.
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Link href="/about-us" style={{ textDecoration: 'none' }}>
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    sx={{
                      py: 2,
                      px: 4,
                      fontSize: '1.1rem',
                      fontWeight: 800,
                      borderRadius: 3,
                      boxShadow: `0 8px 24px ${alpha(primaryMain, 0.4)}`,
                      '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 12px 32px ${alpha(primaryMain, 0.5)}` }
                    }}
                  >
                    Partner With Us
                  </Button>
                </Link>
              </Grid>
            </Grid>

            {/* Decorative background element */}
            <Handshake
              size={120}
              style={{
                position: 'absolute',
                right: -20,
                bottom: -20,
                opacity: 0.05,
                transform: 'rotate(-15deg)'
              }}
            />
          </Paper>
        </PageContainer>

        {/* Smooth transition to next page section */}
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
