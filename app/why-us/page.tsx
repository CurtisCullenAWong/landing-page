'use client';

import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  useTheme,
} from '@mui/material';
import { ImageWithFallback } from '../../components/layout/ImageWithFallback';
import { IMAGE_URLS, getImageMetadata } from '../../constants/images';
import { PageContainer, PageHeader, Section, ContentGrid } from '../../components/layout';
import { SECTION_SPACING } from '../../constants/layout';
import { usePageTitle } from '../../lib/usePageTitle';

export default function WhyBossCargo() {
  usePageTitle('Why Us');
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const values = [
    {
      title: 'Transparent Communication',
      description: 'Focus on openness and clarity in all our interactions and business dealings.'
    },
    {
      title: 'Business Sustainability',
      description: 'Commitment to long-term impact and sustainable business practices.'
    },
    {
      title: 'Continuous Learning',
      description: 'Embracing growth and education through our Boss Cargo University and ongoing development programs.'
    },
    {
      title: 'Cohesive Teamwork',
      description: 'Working as one unit towards our common goal of growth for our clients.'
    }
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Why Choose Boss Cargo Express?"
        subtitle="Our Mission, Vision, Values, and Culture define who we are and what we stand for."
      />

      {/* Mission & Vision */}
      <ContentGrid spacing="medium" sx={{ mb: SECTION_SPACING.xlarge }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h4" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
                  Our Mission
                </Typography>
                <Typography variant="body1" color="text.primary">
                  Our mission is to grow and empower businesses across the Philippines by providing a customized logistics solutions and seek to develop a highly sustainable business by using state-of-the-art technology and creating unprecedented value and opportunity for our customers and employees while embracing the frame of CANI (Constant And Never Ending Improvement).
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h4" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
                  Our Dream (Vision)
                </Typography>
                <Typography variant="body1" color="text.primary">
                  To be the country's preeminent and technologically driven logistics company.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
      </ContentGrid>

      {/* Values Image */}
      <Box sx={{ mb: SECTION_SPACING.xlarge }}>
        <ImageWithFallback
          src={IMAGE_URLS.WHY_US_VALUES}
          alt={getImageMetadata(IMAGE_URLS.WHY_US_VALUES).alt}
          layout="responsive"
          aspectRatio="21:9"
          rounded={8}
          shadow={2}
        />
      </Box>

      {/* Brand Values */}
      <Section bottomSpacing="xlarge">
        <PageHeader
          title="Our Brand Values"
          titleVariant="h3"
          bottomSpacing={SECTION_SPACING.medium}
        />
        <Paper
          sx={{
            p: 3,
            mb: SECTION_SPACING.medium,
            bgcolor: isDark ? 'action.hover' : 'action.selected',
            textAlign: 'center',
          }}
        >
          <Typography variant="body1" color="text.primary" sx={{ fontSize: '1.1rem' }}>
            Creating a strong and positive perception of one's company to their customer's mind.
          </Typography>
        </Paper>
        <ContentGrid spacing="small" columns={{ xs: 1, sm: 2, md: 4 }}>
            {values.map((value, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                <Paper
                  sx={{
                    p: 3,
                    bgcolor: isDark ? 'action.hover' : 'action.selected',
                    borderTop: `4px solid ${theme.palette.primary.main}`,
                    height: '100%',
                  }}
                >
                  <Typography variant="h5" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
                    {value.title}
                  </Typography>
                  <Typography variant="body2" color="text.primary">
                    {value.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
        </ContentGrid>
      </Section>

      {/* Featured Video Section */}
      {/* <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mb: SECTION_SPACING.xlarge,
          px: 2 // Padding to ensure it doesn't touch screen edges on mobile
        }}
      >
        <Box
          sx={{
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: 4,
            width: 560, // Match iframe width
            maxWidth: '100%', // Responsive constraint
            lineHeight: 0, // Removes bottom gap for inline elements
            bgcolor: 'black'
          }}
        >
          <iframe 
            src="https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1203741278359082%2F&show_text=false&width=560&t=0" 
            width="560" 
            height="314" 
            style={{ border: 'none', overflow: 'hidden', maxWidth: '100%' }} 
            scrolling="no" 
            frameBorder="0" 
            allowFullScreen={true} 
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          />
        </Box>
      </Box> */}

      {/* Corporate Culture */}
      <Section>
        <PageHeader
          title="Our Culture"
          titleVariant="h3"
          bottomSpacing={SECTION_SPACING.medium}
        />
        <ContentGrid spacing="medium" alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                sx={{
                  p: 4,
                  bgcolor: isDark ? 'action.hover' : 'action.selected',
                }}
              >
                <Typography variant="body1" color="text.primary" sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                  It's who we are. It's what we're about. Honestly, it's hard to describe culture. It's just something you feel. But what we can say is that we're clear on what we want. We work as one, towards one common goal: growth for our clients. We're the ones you want to roll up your sleeves with, to deliver your cargo from point A to point B, to not just work for your team, but to become an extension of it.
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <ImageWithFallback
                src={IMAGE_URLS.WHY_US_CULTURE}
                alt={getImageMetadata(IMAGE_URLS.WHY_US_CULTURE).alt}
                layout="responsive"
                aspectRatio="4:3"
                rounded={8}
                shadow={2}
              />
            </Grid>
        </ContentGrid>
      </Section>
    </PageContainer>
  );
}