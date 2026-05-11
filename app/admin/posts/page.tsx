'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  alpha,
  useTheme,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import { Plus, Newspaper, ArrowLeft, Layers, Calendar, Globe, Tag } from 'lucide-react';
import Link from 'next/link';
import { usePageTitle } from '@/lib/usePageTitle';
import { postService, Post, PostType } from '@/lib/services/post-service';
import PostTable from '@/components/admin/PostTable';
import PostDialog from '@/components/admin/PostDialog';
import { AdminTableSkeleton } from '@/components/loading';

export default function AdminPostsPage() {
  usePageTitle('Manage Content');
  const theme = useTheme();
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Post | null>(null);
  const [currentTab, setCurrentTab] = useState(0);
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      const data = await postService.getAll();
      setPosts(data);
      setFilteredPosts(data);
    } catch (error) {
      console.error('Error loading posts:', error);
      showSnackbar('Failed to load content.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  useEffect(() => {
    const types: (PostType | 'all')[] = ['all', 'news', 'event', 'insight', 'announcement', 'gallery'];
    const selectedType = types[currentTab];
    
    if (selectedType === 'all') {
      setFilteredPosts(posts);
    } else {
      setFilteredPosts(posts.filter(p => p.post_type === selectedType));
    }
  }, [currentTab, posts]);

  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpenDialog = (item: Post | null = null) => {
    setEditItem(item);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditItem(null);
  };

  const handleSave = async (formData: any) => {
    try {
      if (editItem) {
        await postService.update(editItem.id, formData);
        showSnackbar('Post updated successfully!');
      } else {
        await postService.create(formData);
        showSnackbar('New post created successfully!');
      }
      handleCloseDialog();
      loadPosts();
    } catch (error) {
      console.error('Error saving post:', error);
      showSnackbar('Failed to save post.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        // Find the post to get its image URL
        const postToDelete = posts.find(p => p.id === id);
        if (postToDelete?.image_url) {
          await postService.deleteImage(postToDelete.image_url);
        }

        await postService.delete(id);
        showSnackbar('Post deleted successfully!');
        loadPosts();
      } catch (error) {
        console.error('Error deleting post:', error);
        showSnackbar('Failed to delete post.', 'error');
      }
    }
  };

  const handleTogglePublish = async (item: Post) => {
    try {
      await postService.update(item.id, { is_published: !item.is_published });
      showSnackbar(`Post ${!item.is_published ? 'published' : 'unpublished'} successfully!`);
      loadPosts();
    } catch (error) {
      console.error('Error toggling publish status:', error);
      showSnackbar('Failed to update status.', 'error');
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Button
            component={Link}
            href="/admin"
            startIcon={<ArrowLeft size={18} />}
            sx={{ mb: 2, color: 'text.secondary', textTransform: 'none', fontWeight: 600 }}
          >
            Back to Dashboard
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Layers size={32} color={theme.palette.primary.main} />
            Content Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create and manage news, events, insights, and other company content.
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={() => handleOpenDialog()}
          sx={{ borderRadius: 2, px: 3, py: 1.5, fontWeight: 700, boxShadow: theme.shadows[4] }}
        >
          Create New Post
        </Button>
      </Box>

      <Paper sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
        <Tabs 
          value={currentTab} 
          onChange={(_, v) => setCurrentTab(v)}
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            '& .MuiTab-root': { fontWeight: 700, textTransform: 'none', minWidth: 100 }
          }}
        >
          <Tab label="All Content" />
          <Tab label="News" icon={<Newspaper size={16} />} iconPosition="start" />
          <Tab label="Events" icon={<Calendar size={16} />} iconPosition="start" />
          <Tab label="Insights" icon={<Globe size={16} />} iconPosition="start" />
          <Tab label="Announcements" icon={<Layers size={16} />} iconPosition="start" />
          <Tab label="Gallery" icon={<Tag size={16} />} iconPosition="start" />
        </Tabs>
      </Paper>

      {isLoading ? (
        <AdminTableSkeleton />
      ) : (
        <PostTable 
          posts={filteredPosts} 
          onEdit={handleOpenDialog} 
          onDelete={handleDelete} 
          onTogglePublish={handleTogglePublish}
        />
      )}

      <PostDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSave}
        editItem={editItem}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity} 
          sx={{ width: '100%', borderRadius: 2, fontWeight: 600 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
