'use client';

import React from 'react';
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  useTheme,
  Avatar
} from '@mui/material';
import { 
  Users, 
  Briefcase, 
  Clock, 
  CheckCircle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface StatCardsProps {
  totalJobs: number;
  activeJobs: number;
  totalApplicants: number;
  pendingApplicants: number;
}

export default function StatCards({ 
  totalJobs, 
  activeJobs, 
  totalApplicants, 
  pendingApplicants 
}: StatCardsProps) {
  const theme = useTheme();
  
  const stats = [
    {
      title: 'Total Jobs',
      value: totalJobs,
      subtitle: `${activeJobs} active postings`,
      icon: <Briefcase size={24} />,
      color: theme.palette.primary.main,
      trend: '+12%',
      isPositive: true
    },
    {
      title: 'Total Applicants',
      value: totalApplicants,
      subtitle: 'Across all positions',
      icon: <Users size={24} />,
      color: theme.palette.info.main,
      trend: '+5%',
      isPositive: true
    },
    {
      title: 'Pending Review',
      value: pendingApplicants,
      subtitle: 'Requires attention',
      icon: <Clock size={24} />,
      color: theme.palette.warning.main,
      trend: '-2%',
      isPositive: false
    },
    {
      title: 'Hired Candidates',
      value: Math.floor(totalApplicants * 0.15), // Mock data for now
      subtitle: 'This quarter',
      icon: <CheckCircle size={24} />,
      color: theme.palette.success.main,
      trend: '+8%',
      isPositive: true
    }
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {stats.map((stat, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
          <Card elevation={0} sx={{ 
            border: `1px solid ${theme.palette.divider}`, 
            borderRadius: 4,
            height: '100%',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: theme.shadows[4]
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Avatar sx={{ 
                  bgcolor: `${stat.color}15`, 
                  color: stat.color,
                  width: 48,
                  height: 48,
                  borderRadius: 2
                }}>
                  {stat.icon}
                </Avatar>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 0.5,
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  bgcolor: stat.isPositive ? 'success.lighter' : 'error.lighter',
                  color: stat.isPositive ? 'success.dark' : 'error.dark'
                }}>
                  {stat.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                    {stat.trend}
                  </Typography>
                </Box>
              </Box>
              
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
                {stat.value}
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                {stat.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {stat.subtitle}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
