'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Box,
  Chip,
  alpha,
  useTheme,
  Tooltip,
  Stack
} from '@mui/material';
import { Edit2, Trash2, Globe, Eye, EyeOff, Calendar, Tag, FileText, Info } from 'lucide-react';
import { Post } from '@/lib/services/post-service';

interface PostTableProps {
  posts: Post[];
  onEdit: (post: Post) => void;
  onDelete: (id: string) => void;
  onTogglePublish: (post: Post) => void;
}

export default function PostTable({ posts, onEdit, onDelete, onTogglePublish }: PostTableProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'event': return theme.palette.secondary.main;
      case 'insight': return theme.palette.info.main;
      case 'announcement': return theme.palette.warning.main;
      case 'gallery': return theme.palette.success.main;
      default: return theme.palette.primary.main;
    }
  };

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
            <TableCell sx={{ fontWeight: 700, py: 2 }}>Content</TableCell>
            <TableCell sx={{ fontWeight: 700, py: 2 }}>Type / Category</TableCell>
            <TableCell sx={{ fontWeight: 700, py: 2 }}>Details</TableCell>
            <TableCell sx={{ fontWeight: 700, py: 2 }}>Status</TableCell>
            <TableCell align="right" sx={{ fontWeight: 700, py: 2 }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {posts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                <Typography variant="body1" color="text.secondary">No posts found.</Typography>
              </TableCell>
            </TableRow>
          ) : (
            posts.map((post) => (
              <TableRow key={post.id} sx={{ '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.5) } }}>
                <TableCell sx={{ maxWidth: 300 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {post.image_url ? (
                      <Box
                        component="img"
                        src={post.image_url}
                        alt={post.title}
                        sx={{ width: 48, height: 48, borderRadius: 1, objectFit: 'cover' }}
                      />
                    ) : (
                      <Box sx={{ width: 48, height: 48, borderRadius: 1, bgcolor: alpha(theme.palette.primary.main, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.palette.primary.main }}>
                        <FileText size={20} />
                      </Box>
                    )}
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{post.title}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ 
                        display: '-webkit-box', 
                        WebkitLineClamp: 1, 
                        WebkitBoxOrient: 'vertical', 
                        overflow: 'hidden' 
                      }}>
                        {post.excerpt || post.content}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Stack spacing={0.5} alignItems="flex-start">
                    <Chip 
                      label={post.post_type} 
                      size="small" 
                      sx={{ 
                        fontWeight: 800, 
                        bgcolor: alpha(getTypeColor(post.post_type), 0.1),
                        color: getTypeColor(post.post_type),
                        textTransform: 'uppercase',
                        fontSize: '0.625rem'
                      }} 
                    />
                    {post.category && (
                      <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600 }}>
                        {post.category}
                      </Typography>
                    )}
                  </Stack>
                </TableCell>
                <TableCell>
                  <Stack spacing={1}>
                    {post.event_date && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Calendar size={14} color={theme.palette.text.disabled} />
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {new Date(post.event_date).toLocaleDateString()}
                        </Typography>
                      </Box>
                    )}
                    {post.tags && post.tags.length > 0 && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                        <Tag size={12} color={theme.palette.text.disabled} />
                        {post.tags.slice(0, 2).map(tag => (
                          <Typography key={tag} variant="caption" sx={{ bgcolor: alpha(theme.palette.divider, 0.5), px: 0.5, borderRadius: 0.5, fontSize: '0.65rem' }}>
                            {tag}
                          </Typography>
                        ))}
                        {post.tags.length > 2 && <Typography variant="caption">+{post.tags.length - 2}</Typography>}
                      </Box>
                    )}
                  </Stack>
                </TableCell>
                <TableCell>
                  <Chip 
                    icon={post.is_published ? <Eye size={14} /> : <EyeOff size={14} />}
                    label={post.is_published ? 'Published' : 'Draft'} 
                    size="small" 
                    variant="outlined"
                    color={post.is_published ? 'success' : 'default'}
                    sx={{ fontWeight: 600 }}
                  />
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Tooltip title={post.is_published ? "Unpublish" : "Publish"}>
                      <IconButton size="small" onClick={() => onTogglePublish(post)} color={post.is_published ? "success" : "default"}>
                        {post.is_published ? <EyeOff size={18} /> : <Eye size={18} />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => onEdit(post)} color="primary">
                        <Edit2 size={18} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={() => onDelete(post.id)} color="error">
                        <Trash2 size={18} />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
