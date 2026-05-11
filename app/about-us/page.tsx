'use client';

import { Mail, Phone, MapPin, User, Linkedin, ExternalLink, Facebook, Zap, Globe, Award, Clock, Target, Eye } from 'lucide-react';
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
  Divider,
  alpha,
  Chip,
  IconButton,
  Dialog,
  DialogContent,
  Slide,
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { SECTION_SPACING } from '../../constants/layout';
import { usePageTitle } from '../../lib/usePageTitle';
import React, { useState, useEffect } from 'react';
import { SITE_CONTENT } from '../../constants/site-content';
import { postService, Post } from '../../lib/services/post-service';
import { createClient } from '../../lib/supabase/client';
import { Calendar, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

const PostTransition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement<any, any> },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function AboutPage() {
  usePageTitle('About Us');
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Defensive Theme Extraction
  const primaryMain = theme.palette.primary?.main || '#00A39D';
  const primaryDark = theme.palette.primary?.dark || '#007A76';
  const secondaryDark = theme.palette.secondary?.dark || '#111626';
  const tertiaryMain = (theme.palette as any).tertiary?.main || primaryMain;
  const tertiaryDark = (theme.palette as any).tertiary?.dark || primaryDark;
  const bgColor = theme.palette.background?.default || '#ffffff';
  const paperColor = theme.palette.background?.paper || '#F8FAFC';

  const offices = [
    {
      name: 'Headquarters',
      address: SITE_CONTENT.contact.headquarters.address.split(', Barangay')[0],
      city: 'Barangay' + SITE_CONTENT.contact.headquarters.address.split(', Barangay')[1],
      phone: SITE_CONTENT.contact.phones.find(p => p.label === 'General Hotline')?.number,
      email: SITE_CONTENT.contact.emails.find(e => e.label === 'General Inquiries')?.address,
      marketing: SITE_CONTENT.contact.phones.find(p => p.label === 'Marketing')?.number,
      customerService: SITE_CONTENT.contact.phones.find(p => p.label === 'Customer Service')?.number,
      finance: SITE_CONTENT.contact.phones.find(p => p.label === 'Finance')?.number,
      mobile: SITE_CONTENT.contact.phones.filter(p => p.label.includes('Mobile')).map(p => p.number)
    }
  ];

  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const data = await postService.getPublished();
        setPosts(data);
      } catch (error) {
        console.error('Error loading posts:', error);
      } finally {
        setIsLoadingPosts(false);
      }
    };

    loadPosts();

    // Implement Realtime updates for Posts
    const supabase = createClient();
    const channel = supabase
      .channel('posts-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'posts' },
        () => {
          loadPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleNext = () => {
    if (posts.length === 0) return;
    setActiveIndex((prev) => (prev + 1) % posts.length);
  };

  const handlePrev = () => {
    if (posts.length === 0) return;
    setActiveIndex((prev) => (prev - 1 + posts.length) % posts.length);
  };

  const handleDragEnd = (_: any, info: any) => {
    const threshold = 50;
    if (info.offset.x < -threshold) handleNext();
    else if (info.offset.x > threshold) handlePrev();
  };

  // Shared "Corner Accents" component
  const CornerAccents = () => (
    <>
      {/* Top Left Squiggle */}
      <Box sx={{
        position: 'absolute',
        top: -12,
        left: -12,
        width: 40,
        height: 40,
        bgcolor: alpha(tertiaryMain, 0.25),
        borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
        zIndex: 0,
        pointerEvents: 'none',
        transform: 'rotate(-15deg)'
      }} />
      <Box sx={{
        position: 'absolute',
        top: -1,
        left: -1,
        width: 20,
        height: 20,
        borderTop: `3px solid ${tertiaryMain}`,
        borderLeft: `3px solid ${tertiaryMain}`,
        borderTopLeftRadius: 'inherit',
        zIndex: 2,
        pointerEvents: 'none'
      }} />
      {/* Bottom Right Squiggle */}
      <Box sx={{
        position: 'absolute',
        bottom: -12,
        right: -12,
        width: 32,
        height: 32,
        bgcolor: alpha(tertiaryMain, 0.2),
        borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
        zIndex: 0,
        pointerEvents: 'none',
        transform: 'rotate(15deg)'
      }} />
      <Box sx={{
        position: 'absolute',
        bottom: -1,
        right: -1,
        width: 20,
        height: 20,
        borderBottom: `3px solid ${tertiaryMain}`,
        borderRight: `3px solid ${tertiaryMain}`,
        borderBottomRightRadius: 'inherit',
        zIndex: 2,
        pointerEvents: 'none'
      }} />
    </>
  );


  return (
    <Box sx={{ bgcolor: bgColor }}>
      {/* Slide 1: Introduction & Identity */}
      <Box
        sx={{
          minHeight: 'calc(100vh - 80px)',
          display: 'flex',
          alignItems: 'center',
          scrollSnapAlign: 'start',
          scrollSnapStop: 'always',
          py: { xs: 5, md: 7 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background Architectural Elements */}
        <Box sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
        }}>
          {/* Massive Squiggly Shape 1 (Teal) */}
          <Box sx={{
            position: 'absolute',
            top: '-15%',
            right: '-10%',
            width: '1400px',
            height: '800px',
            bgcolor: alpha(primaryMain, 0.12),
            borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
            transform: 'rotate(-15deg)',
          }} />
          {/* Massive Squiggly Shape 2 (Yellow) */}
          <Box sx={{
            position: 'absolute',
            bottom: '-10%',
            left: '-15%',
            width: '1000px',
            height: '1000px',
            bgcolor: alpha(tertiaryMain, 0.15),
            borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
            transform: 'rotate(20deg)',
          }} />
          {/* Industrial Grid */}
          <Box sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `radial-gradient(${alpha(isDark ? '#fff' : '#000', 0.1)} 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
            opacity: 0.5
          }} />
        </Box>

        <PageContainer maxWidth="lg" disableVerticalPadding sx={{ width: '100%', position: 'relative', zIndex: 1 }}>
          <PageHeader
            title="About Boss Cargo Express"
            subtitle="Embark on a sustainable and transformative journey with us."
            bottomSpacing={SECTION_SPACING.medium}
            sx={{
              '& .MuiTypography-h2': { fontSize: { xs: '2.25rem', sm: '3rem', md: '3.75rem' } },
              '& .MuiTypography-h6': { fontSize: { xs: '1rem', md: '1.125rem' }, opacity: 0.8, maxWidth: '700px' }
            }}
          />

          <Grid container spacing={4} alignItems="center">
            {/* Left: Who We Are & Mission/Vision */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                sx={{
                  p: 2.5,
                  mb: 1.5,
                  borderRadius: 1.5,
                  bgcolor: alpha(isDark ? primaryDark : primaryMain, 0.08),
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${alpha(primaryMain, 0.2)}`,
                  position: 'relative',
                  overflow: 'visible'
                }}
              >
                <CornerAccents />

                <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: primaryMain, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Zap size={20} /> At a Glance
                </Typography>
                <Grid container spacing={2}>
                  {[
                    { icon: <Clock size={20} />, label: 'Since 2014', sub: 'A decade of logistics excellence.' },
                    { icon: <Globe size={20} />, label: 'Nationwide', sub: 'Network across the archipelago.' },
                    { icon: <Award size={20} />, label: 'Expert Team', sub: 'Years of solid freight experience.' },
                    { icon: <Zap size={20} />, label: 'CANI Driven', sub: 'Constant and never-ending improvement.' },
                  ].map((stat, i) => (
                    <Grid size={{ xs: 6 }} key={i}>
                      <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: alpha(primaryMain, 0.05), border: `1px solid ${alpha(primaryMain, 0.1)}` }}>
                        <Box sx={{ color: primaryMain, mb: 0.5 }}>{stat.icon}</Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.8125rem' }}>{stat.label}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.2 }}>{stat.sub}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Card sx={{ height: '100%', position: 'relative', borderRadius: 1.5, bgcolor: isDark ? 'action.hover' : 'background.paper', border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                    <CornerAccents />

                    <CardContent sx={{ p: 2.5 }}>
                      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                        <Box sx={{ p: 1, borderRadius: 1, bgcolor: alpha(primaryMain, 0.1), color: primaryMain }}>
                          <Target size={18} />
                        </Box>
                        <Typography variant="subtitle2" sx={{ color: primaryMain, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                          Mission
                        </Typography>
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                        Empowering businesses through customized, tech-driven, and sustainable logistics solutions.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Card sx={{ height: '100%', position: 'relative', borderRadius: 1.5, bgcolor: isDark ? 'action.hover' : 'background.paper', border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                    <CornerAccents />

                    <CardContent sx={{ p: 2.5 }}>
                      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                        <Box sx={{ p: 1, borderRadius: 1, bgcolor: alpha(tertiaryMain, 0.1), color: tertiaryMain }}>
                          <Eye size={18} />
                        </Box>
                        <Typography variant="subtitle2" sx={{ color: tertiaryMain, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                          Vision
                        </Typography>
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                        To be the country's preeminent and technologically driven logistics leader.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>

            {/* Right: Hero Image with Offset Decorative Frame */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ position: 'relative', p: 1 }}>
                {/* Decorative Squiggly Frame */}
                <Box sx={{
                  position: 'absolute',
                  inset: '-15px 15px 15px -15px',
                  border: `2px solid ${tertiaryMain}`,
                  borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
                  zIndex: 0,
                  opacity: 0.6
                }} />
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <ImageWithFallback
                    src={IMAGE_URLS.ABOUT_WAREHOUSE_TEAM}
                    alt={getImageMetadata(IMAGE_URLS.ABOUT_WAREHOUSE_TEAM).alt}
                    layout="responsive"
                    aspectRatio="4:3"
                    rounded={6}
                    shadow={8}
                    priority
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </PageContainer>

        {/* Smooth transition to Slide 2 */}
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

      {/* Slide 2: News & Events */}
      <Box
        sx={{
          minHeight: 'calc(100vh - 80px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: { xs: 'flex-start', md: 'center' },
          scrollSnapAlign: 'start',
          scrollSnapStop: 'always',
          bgcolor: paperColor,
          py: { xs: 5, md: 7 },
          position: 'relative',
          overflow: 'visible'
        }}
      >
        {/* Background Architectural Elements */}
        <Box sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
        }}>
          {/* Massive Squiggly Shape (Yellow) */}
          <Box sx={{
            position: 'absolute',
            top: '10%',
            left: '-15%',
            width: '1600px',
            height: '600px',
            bgcolor: alpha(tertiaryMain, 0.12),
            borderRadius: '50% 20% 50% 20% / 20% 50% 20% 50%',
            transform: 'rotate(15deg)',
          }} />
          {/* Organic Shape (Teal) */}
          <Box sx={{
            position: 'absolute',
            bottom: '-15%',
            right: '-10%',
            width: '900px',
            height: '900px',
            bgcolor: alpha(primaryMain, 0.15),
            borderRadius: '67% 33% 47% 53% / 37% 20% 80% 63%',
          }} />
        </Box>

        <PageContainer maxWidth={false} disableVerticalPadding sx={{ width: '100%', position: 'relative', zIndex: 1, px: { xs: 1, md: 2 } }}>
          <PageHeader
            title="News & Events"
            subtitle="Stay updated with our latest milestones and corporate insights."
            titleVariant="h3"
            sx={{
              '& .MuiTypography-h3': { fontSize: { xs: '2.25rem', sm: '2.75rem', md: '3.25rem' } },
              '& .MuiTypography-h6': { maxWidth: '800px', mx: 'auto', mb: 1 }
            }}
            bottomSpacing={SECTION_SPACING.small}
            align="center"
          />

          {isLoadingPosts ? (
            <Box sx={{ height: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="h6" color="text.secondary" sx={{ animation: 'pulse 1.5s infinite' }}>Loading our journal...</Typography>
            </Box>
          ) : posts.length > 0 ? (
            <Box sx={{
              position: 'relative',
              height: { xs: 450, md: 580 }, // Compressed vertical height
              width: '100%',
              overflow: 'visible', // Allow cards to span past viewport if needed
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              perspective: '1500px'
            }}>
              {/* Arc Carousel Container with Drag */}
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
                  {posts.map((item, index) => {
                    // Calculate relative position in the looping array
                    let relIndex = (index - activeIndex);
                    const half = Math.floor(posts.length / 2);
                    if (relIndex > half) relIndex -= posts.length;
                    if (relIndex < -half) relIndex += posts.length;

                    // Geometry calculations for the "Bridge/Arc"
                    const absRel = Math.abs(relIndex);
                    const isActive = relIndex === 0;

                    // Visibility check: exactly 7 cards for a more populated look
                    if (absRel > 3) return null;

                    // Transformation values - Compact and non-linear spread for 7 cards
                    // Pulling the 3rd level cards slightly closer horizontally
                    const baseSpacing = (typeof window !== 'undefined' && window.innerWidth < 1000 ? 150 : 260);
                    const xOffset = relIndex * baseSpacing * (absRel === 3 ? 0.85 : 1);
                    const yOffset = absRel * absRel * 22;
                    const rotateZ = relIndex * 9;
                    const scale = isActive ? 1.05 : (1 - absRel * 0.14);
                    const opacity = 1 - absRel * 0.2;
                    const zIndex = 10 - absRel;

                    return (
                      <motion.div
                        key={item.id}
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
                          stiffness: 130,
                          damping: 18,
                          mass: 1
                        }}
                        style={{
                          position: 'absolute',
                          width: '90%',
                          maxWidth: 400,
                          cursor: isActive ? 'pointer' : 'grab'
                        }}
                        whileTap={{ cursor: isActive ? 'pointer' : 'grabbing' }}
                        onClick={() => {
                          if (isActive) {
                            setSelectedPost(item);
                          } else {
                            setActiveIndex(index);
                          }
                        }}
                      >
                        <Card
                          sx={{
                            height: { xs: 350, md: 420 },
                            display: 'flex',
                            flexDirection: 'column',
                            bgcolor: 'background.default',
                            boxShadow: isActive ? (isDark ? 30 : 15) : 5,
                            borderRadius: 4,
                            overflow: 'hidden',
                            border: `1px solid ${isActive ? alpha(primaryMain, 0.4) : alpha(theme.palette.divider, 0.1)}`,
                            position: 'relative',
                            // Deeper fade for the 7th cards (extremes)
                            ...(absRel === 3 && {
                              maskImage: 'linear-gradient(to top, transparent, black 50%)',
                              WebkitMaskImage: 'linear-gradient(to top, transparent, black 50%)'
                            }),
                            // Subtle fade for the 2nd level
                            ...(absRel === 2 && {
                              maskImage: 'linear-gradient(to top, transparent, black 20%)',
                              WebkitMaskImage: 'linear-gradient(to top, transparent, black 20%)'
                            })
                          }}
                        >
                          {/* Category Badge */}
                          <Box sx={{
                            position: 'absolute',
                            top: 14,
                            left: 14,
                            zIndex: 10,
                            px: 1.5,
                            py: 0.5,
                            borderRadius: '4px',
                            bgcolor: item.post_type === 'event' ? tertiaryMain : primaryMain,
                            color: item.post_type === 'event' ? secondaryDark : 'white',
                            fontWeight: 900,
                            fontSize: '0.6rem',
                            textTransform: 'uppercase',
                            letterSpacing: 2,
                            boxShadow: 2
                          }}>
                            {item.category || item.post_type}
                          </Box>

                          <Box sx={{ width: '100%', height: '35%', position: 'relative', overflow: 'hidden' }}>
                            {item.image_url ? (
                              <Box
                                component="img"
                                src={item.image_url}
                                alt={item.title}
                                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <Box sx={{ width: '100%', height: '100%', bgcolor: alpha(primaryMain, 0.05), display: 'flex', alignItems: 'center', justifyContent: 'center', color: alpha(primaryMain, 0.2) }}>
                                <Globe size={60} />
                              </Box>
                            )}
                          </Box>

                          <CardContent sx={{ flexGrow: 1, p: { xs: 2, md: 2.5 }, display: 'flex', flexDirection: 'column' }}>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1, color: 'text.disabled' }}>
                              <Calendar size={14} />
                              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                {new Date(item.event_date || item.published_at || item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </Typography>
                            </Stack>

                            <Typography variant="h6" sx={{
                              fontWeight: 900,
                              mb: 1,
                              lineHeight: 1.1,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              fontSize: { xs: '1rem', md: '1.25rem' },
                              color: 'text.primary'
                            }}>
                              {item.title}
                            </Typography>

                            <Typography variant="body2" color="text.secondary" sx={{
                              lineHeight: 1.5,
                              mb: 1.5,
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              fontSize: '0.875rem'
                            }}>
                              {item.excerpt || item.content}
                            </Typography>

                            {item.tags && item.tags.length > 0 && (
                              <Stack direction="row" spacing={1} sx={{ mt: 'auto', pt: 1, flexWrap: 'wrap', gap: 1 }}>
                                {item.tags.slice(0, 2).map(tag => (
                                  <Chip
                                    key={tag}
                                    label={`#${tag}`}
                                    size="small"
                                    sx={{
                                      height: 18,
                                      fontSize: '0.6rem',
                                      fontWeight: 800,
                                      bgcolor: alpha(primaryMain, 0.03),
                                      color: primaryMain,
                                      border: `1px solid ${alpha(primaryMain, 0.1)}`
                                    }}
                                  />
                                ))}
                              </Stack>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary" sx={{ opacity: 0.6 }}>
                The archives are empty for now.
              </Typography>
            </Box>
          )}
        </PageContainer>

        {/* Smooth transition to Slide 3 */}
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

      {/* Slide 3: Contact Information */}
      <Box
        sx={{
          minHeight: 'calc(100vh - 80px)',
          display: 'flex',
          alignItems: 'center',
          scrollSnapAlign: 'start',
          scrollSnapStop: 'always',
          py: { xs: 5, md: 7 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background Architectural Elements */}
        <Box sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          backgroundImage: `radial-gradient(${alpha(tertiaryMain, 0.1)} 2px, transparent 2px)`,
          backgroundSize: '40px 40px',
        }}>
          {/* Massive Organic Shape (Teal) */}
          <Box sx={{
            position: 'absolute',
            top: '-10%',
            left: '-10%',
            width: '1000px',
            height: '1200px',
            bgcolor: alpha(primaryMain, 0.1),
            borderRadius: '40% 60% 30% 70% / 60% 30% 70% 40%',
            maskImage: 'linear-gradient(to right, black, transparent)',
          }} />
          {/* Secondary Squiggle (Yellow) */}
          <Box sx={{
            position: 'absolute',
            bottom: '-20%',
            right: '-5%',
            width: '800px',
            height: '800px',
            bgcolor: alpha(tertiaryMain, 0.08),
            borderRadius: '50% 50% 20% 80% / 25% 80% 20% 75%',
            transform: 'rotate(-10deg)'
          }} />
        </Box>

        <PageContainer maxWidth="lg" disableVerticalPadding sx={{ width: '100%', position: 'relative', zIndex: 1 }}>
          <Box sx={{
            p: { xs: 2.5, sm: 3, md: 4 },
            mb: { xs: 3, md: 4 },
            borderRadius: 2,
            background: `linear-gradient(135deg, ${primaryMain} 0%, ${primaryDark} 100%)`,
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: 8,
            borderLeft: `4px solid ${tertiaryMain}`
          }}>
            {/* Tertiary Squiggle Overlay */}
            <Box sx={{
              position: 'absolute',
              top: '-15%',
              right: '-5%',
              width: '300px',
              height: '300px',
              bgcolor: alpha(tertiaryMain, 0.15),
              borderRadius: '40% 60% 70% 30% / 30% 30% 70% 70%',
              zIndex: 0,
              transform: 'rotate(15deg)',
            }} />
            <Box sx={{
              position: 'absolute',
              bottom: '-20%',
              left: '20%',
              width: '150px',
              height: '150px',
              bgcolor: alpha(tertiaryMain, 0.1),
              borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
              zIndex: 0,
            }} />

            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography variant="h3" sx={{
                fontWeight: 900,
                mb: 1,
                textTransform: 'uppercase',
                letterSpacing: -1,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' }
              }}>
                Get In Touch
              </Typography>
              <Typography variant="h6" sx={{
                opacity: 0.9,
                fontWeight: 400,
                maxWidth: 600,
                fontSize: { xs: '0.9375rem', sm: '1.125rem', md: '1.25rem' }
              }}>
                We're ready to handle your logistics needs with precision and care.
              </Typography>
            </Box>
          </Box>


          <Grid container spacing={4} alignItems="stretch">
            {offices.map((office, index) => (
              <React.Fragment key={index}>
                {/* Left side: Contact Details */}
                <Grid size={{ xs: 12, md: 5 }}>
                  <Stack spacing={3} sx={{ height: '100%' }}>
                    <Box>
                      <Typography variant="h4" sx={{
                        color: primaryMain,
                        fontWeight: 800,
                        mb: 1,
                        textTransform: 'uppercase',
                        letterSpacing: -1,
                        fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' }
                      }}>
                        {office.name}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 400 }}>
                        Corporate headquarters providing comprehensive logistics solutions.
                      </Typography>
                    </Box>

                    <Stack spacing={2}>
                      {/* Address */}
                      <Paper variant="outlined" sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: alpha(primaryMain, 0.03),
                        borderColor: alpha(primaryMain, 0.2),
                        position: 'relative'
                      }}>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                          <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: primaryMain, color: 'white', display: 'flex', boxShadow: 2 }}>
                            <MapPin size={24} />
                          </Box>
                          <Box>
                            <Typography variant="overline" sx={{ fontWeight: 800, color: tertiaryDark, lineHeight: 1 }}>Location</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 700, mt: 0.5 }}>{office.address}</Typography>
                            <Typography variant="body2" color="text.secondary">{office.city}</Typography>
                          </Box>
                        </Box>
                      </Paper>

                      {/* Phone Numbers */}
                      <Paper variant="outlined" sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: alpha(tertiaryMain, 0.03),
                        borderColor: alpha(tertiaryMain, 0.2)
                      }}>
                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                          <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: tertiaryMain, color: secondaryDark, display: 'flex', boxShadow: 2, alignSelf: 'flex-start' }}>
                            <Phone size={24} />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="overline" sx={{ fontWeight: 800, color: primaryDark, lineHeight: 1 }}>Communication</Typography>
                            <Grid container spacing={2} sx={{ mt: 1 }}>
                              <Grid size={6}>
                                <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 700, display: 'block' }}>General</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 700 }}>{office.phone}</Typography>
                              </Grid>
                              <Grid size={6}>
                                <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 700, display: 'block' }}>Cust. Service</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 700 }}>{office.customerService}</Typography>
                              </Grid>
                            </Grid>
                          </Box>
                        </Box>
                        <Divider sx={{ my: 1.5, opacity: 0.2 }} />
                        <Box sx={{ pl: 5 }}>
                          <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.disabled', display: 'block', mb: 0.5 }}>Mobile Contacts</Typography>
                          <Stack direction="row" spacing={3}>
                            {office.mobile.map((num, i) => (
                              <Typography key={i} variant="body1" sx={{ fontWeight: 800, color: primaryMain }}>{num}</Typography>
                            ))}
                          </Stack>
                        </Box>
                      </Paper>

                      {/* Emails & Socials */}
                      <Box sx={{ px: 1 }}>
                        <Grid container spacing={3} alignItems="center">
                          <Grid size={7}>
                            <Stack spacing={1}>
                              {[office.email, 'people@bosscargo.express'].map((email, i) => (
                                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                  <Mail size={16} color={primaryMain} />
                                  <Typography component="a" href={`mailto:${email}`} sx={{ textDecoration: 'none', color: 'text.primary', fontWeight: 700, '&:hover': { color: primaryMain } }}>
                                    {email}
                                  </Typography>
                                </Box>
                              ))}
                            </Stack>
                          </Grid>
                          <Grid size={5}>
                            <Stack direction="row" spacing={2} justifyContent="flex-end">
                              {[
                                { icon: <Linkedin size={22} />, url: "https://www.linkedin.com/company/boss-cargo-express" },
                                { icon: <Facebook size={22} />, url: "https://www.facebook.com/ikawangbossko20" },
                                { icon: <ExternalLink size={22} />, url: "https://ph.indeed.com/cmp/Boss-Cargo-Express-3/jobs" }
                              ].map((social, i) => (
                                <Typography key={i} component="a" href={social.url} target="_blank" sx={{ color: 'text.secondary', transition: 'color 0.2s', '&:hover': { color: primaryMain } }}>
                                  {social.icon}
                                </Typography>
                              ))}
                            </Stack>
                          </Grid>
                        </Grid>
                      </Box>
                    </Stack>
                  </Stack>
                </Grid>

                <Grid size={{ xs: 12, md: 7 }}>
                  <Box sx={{ position: 'relative', height: '100%', minHeight: { xs: 300, md: 500 } }}>
                    {/* Decorative Squiggly Frame for Map */}
                    <Box sx={{
                      position: 'absolute',
                      inset: '20px -20px -20px 20px',
                      border: `2px solid ${tertiaryMain}`,
                      borderRadius: '40% 60% 30% 70% / 60% 30% 70% 40%',
                      zIndex: 0
                    }} />
                    <Paper
                      elevation={12}
                      sx={{
                        borderRadius: 2,
                        overflow: 'hidden',
                        height: '100%',
                        width: '100%',
                        border: `1px solid ${alpha(primaryMain, 0.3)}`,
                        position: 'relative',
                        zIndex: 1
                      }}
                    >
                      <iframe
                        src={`https://www.google.com/maps?q=${encodeURIComponent(`${office.address}, ${office.city}`)}&output=embed`}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        title="Office Location"
                      />
                    </Paper>
                  </Box>
                </Grid>
              </React.Fragment>
            ))}
          </Grid>
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
        {/* Post Details Modal - Restored at root for interaction safety */}
        <Dialog
          open={!!selectedPost}
          onClose={() => setSelectedPost(null)}
          maxWidth="lg"
          fullWidth
          TransitionComponent={PostTransition}
          PaperProps={{
            sx: {
              borderRadius: 4,
              bgcolor: 'background.paper',
              backgroundImage: 'none',
              overflow: 'hidden',
              maxHeight: '92vh',
              boxShadow: 24,
            }
          }}
        >
          {selectedPost && (
            <Box sx={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <IconButton
                onClick={() => setSelectedPost(null)}
                sx={{
                  position: 'absolute',
                  right: 20,
                  top: 20,
                  zIndex: 10,
                  bgcolor: alpha(theme.palette.background.paper, 0.8),
                  backdropFilter: 'blur(8px)',
                  color: 'text.primary',
                  boxShadow: 2,
                  '&:hover': { bgcolor: primaryMain, color: 'white' }
                }}
              >
                <X size={24} />
              </IconButton>

              <Grid container sx={{ height: '100%', minHeight: { md: '600px' } }}>
                {/* Image Side */}
                {selectedPost.image_url && (
                  <Grid size={{ xs: 12, md: 5 }} sx={{ position: 'relative', minHeight: { xs: '300px', md: '100%' } }}>
                    <Box
                      component="img"
                      src={selectedPost.image_url}
                      alt={selectedPost.title}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        position: { md: 'absolute' },
                        inset: 0
                      }}
                    />
                    <Box sx={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to right, rgba(0,0,0,0.3), transparent)',
                      display: { xs: 'none', md: 'block' }
                    }} />
                  </Grid>
                )}

                {/* Content Side */}
                <Grid size={{ xs: 12, md: selectedPost.image_url ? 7 : 12 }} sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  overflowY: 'auto',
                  maxHeight: { md: '92vh' }
                }}>
                  <DialogContent sx={{ p: { xs: 4, md: 6 }, display: 'flex', flexDirection: 'column' }}>
                    <Stack direction="row" spacing={1.5} sx={{ mb: 3 }}>
                      <Chip
                        label={selectedPost.post_type}
                        size="small"
                        sx={{
                          bgcolor: alpha(primaryMain, 0.1),
                          color: primaryMain,
                          fontWeight: 800,
                          px: 1,
                          textTransform: 'uppercase'
                        }}
                      />
                      {selectedPost.category && (
                        <Chip
                          label={selectedPost.category}
                          size="small"
                          sx={{
                            bgcolor: alpha(tertiaryMain, 0.1),
                            color: tertiaryMain,
                            fontWeight: 800,
                            px: 1,
                            textTransform: 'uppercase'
                          }}
                        />
                      )}
                    </Stack>

                    <Typography variant="h3" sx={{
                      fontWeight: 900,
                      mb: 2,
                      lineHeight: 1.1,
                      fontSize: { xs: '1.75rem', md: '2.25rem' },
                      color: 'text.primary'
                    }}>
                      {selectedPost.title}
                    </Typography>

                    <Stack direction="row" spacing={3} sx={{ mb: 2, color: 'text.secondary' }}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Calendar size={20} color={primaryMain} />
                        <Typography variant="body1" sx={{ fontWeight: 700 }}>
                          {new Date(selectedPost.event_date || selectedPost.published_at || selectedPost.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </Typography>
                      </Stack>
                      {selectedPost.author_name && (
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <User size={20} color={tertiaryMain} />
                          <Typography variant="body1" sx={{ fontWeight: 700 }}>{selectedPost.author_name}</Typography>
                        </Stack>
                      )}
                    </Stack>

                    <Divider sx={{ mb: 2, opacity: 0.6 }} />

                    <Box
                      sx={{
                        lineHeight: 1.8,
                        fontSize: '1.125rem',
                        color: 'text.primary',
                        flexGrow: 1,
                        '& h1, & h2, & h3, & h4': { 
                          mt: 2, 
                          mb: 1.5, 
                          fontWeight: 900, 
                          color: 'text.primary',
                          lineHeight: 1.2
                        },
                        '& h1': { fontSize: { xs: '1.75rem', md: '2.25rem' }, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`, pb: 1 },
                        '& h2': { fontSize: { xs: '1.5rem', md: '1.875rem' } },
                        '& h3': { fontSize: { xs: '1.25rem', md: '1.5rem' } },
                        '& h4': { fontSize: { xs: '1.125rem', md: '1.25rem' } },
                        '& p': { mb: 2 },
                        '& strong, & b': { fontWeight: 900, color: theme.palette.text.primary },
                        '& em, & i': { fontStyle: 'italic' },
                        '& ul, & ol': { 
                          mb: 2, 
                          pl: 3,
                          listStyleType: 'disc'
                        },
                        '& ol': {
                          listStyleType: 'decimal'
                        },
                        '& li': { 
                          mb: 1,
                          display: 'list-item'
                        },
                        '& blockquote': { 
                          borderLeft: `4px solid ${primaryMain}`, 
                          pl: 3, 
                          py: 1.5, 
                          m: 0, 
                          mb: 3, 
                          bgcolor: alpha(primaryMain, 0.05),
                          borderRadius: '0 8px 8px 0',
                          fontStyle: 'italic'
                        },
                        '& code': { 
                          bgcolor: alpha(theme.palette.divider, 0.4), 
                          px: 1, 
                          py: 0.5, 
                          borderRadius: 1, 
                          fontFamily: 'monospace',
                          fontSize: '0.9em'
                        },
                        '& pre': {
                          bgcolor: isDark ? alpha('#000', 0.3) : alpha(theme.palette.divider, 0.2),
                          p: 3,
                          borderRadius: 2,
                          overflowX: 'auto',
                          mb: 4,
                          '& code': { bgcolor: 'transparent', p: 0 }
                        },
                        '& img': { 
                          maxWidth: '100%', 
                          borderRadius: 2,
                          boxShadow: 4,
                          my: 4
                        }
                      }}
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                        {selectedPost.content}
                      </ReactMarkdown>
                    </Box>

                    {selectedPost.tags && selectedPost.tags.length > 0 && (
                      <Box sx={{ mt: 4, pt: 3, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                        <Typography variant="overline" sx={{ fontWeight: 900, color: 'text.disabled', mb: 1.5, display: 'block', letterSpacing: 2 }}>Exploration Tags</Typography>
                        <Stack direction="row" spacing={1.5} flexWrap="wrap" gap={1.5}>
                          {selectedPost.tags.map(tag => (
                            <Chip
                              key={tag}
                              label={`#${tag}`}
                              variant="outlined"
                              sx={{
                                fontWeight: 700,
                                borderRadius: 1.5,
                                borderColor: alpha(primaryMain, 0.2),
                                '&:hover': { bgcolor: alpha(primaryMain, 0.05), borderColor: primaryMain }
                              }}
                            />
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </DialogContent>
                </Grid>
              </Grid>
            </Box>
          )}
        </Dialog>
      </Box>
    </Box>
  );
}