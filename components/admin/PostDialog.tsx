'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stack,
  Box,
  Typography,
  alpha,
  useTheme,
  Switch,
  FormControlLabel,
  Grid,
  Chip,
  Autocomplete
} from '@mui/material';
import { Post, PostType, postService } from '@/lib/services/post-service';
import { Globe, Calendar, Type, FileText, Image as ImageIcon, Tag, User, Layers, Upload, X, Loader2, Eye, Edit3 } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import remarkBreaks from 'remark-breaks';

interface PostDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (post: any) => void;
  editItem?: Post | null;
}

const POST_TYPES: { value: PostType; label: string; icon: any }[] = [
  { value: 'news', label: 'News Article', icon: <FileText size={18} /> },
  { value: 'event', label: 'Company Event', icon: <Calendar size={18} /> },
  { value: 'insight', label: 'Market Insight', icon: <Globe size={18} /> },
  { value: 'announcement', label: 'Official Announcement', icon: <Layers size={18} /> },
  { value: 'gallery', label: 'Photo Gallery', icon: <ImageIcon size={18} /> },
];

const SUGGESTED_TAGS = [
  'Logistics', 'Shipping', 'Warehousing', 'Corporate', 'Event', 'Announcement',
  'Sustainability', 'Technology', 'Innovation', 'SupplyChain', 'Philippines',
  'CustomerSuccess', 'Milestone', 'Business'
];

export default function PostDialog({ open, onClose, onSave, editItem }: PostDialogProps) {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    post_type: 'news' as PostType,
    category: '',
    image_url: '',
    event_date: '',
    is_published: false,
    author_name: '',
    tags: [] as string[],
    metadata: {} as Record<string, any>
  });

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editItem) {
      setFormData({
        title: editItem.title,
        content: editItem.content,
        excerpt: editItem.excerpt || '',
        post_type: editItem.post_type,
        category: editItem.category || '',
        image_url: editItem.image_url || '',
        event_date: editItem.event_date ? new Date(editItem.event_date).toISOString().split('T')[0] : '',
        is_published: editItem.is_published,
        author_name: editItem.author_name || '',
        tags: editItem.tags || [],
        metadata: editItem.metadata || {}
      });
    } else {
      setFormData({
        title: '',
        content: '',
        excerpt: '',
        post_type: 'news',
        category: '',
        image_url: '',
        event_date: new Date().toISOString().split('T')[0],
        is_published: false,
        author_name: '',
        tags: [],
        metadata: {}
      });
    }
  }, [editItem, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTagsChange = (_event: any, newValue: string[]) => {
    setFormData(prev => ({ ...prev, tags: newValue }));
  };

  const handleContentChange = (value?: string) => {
    setFormData(prev => ({ ...prev, content: value || '' }));
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // If there's an existing image, we could delete it, but let's keep it simple for now
      // and only upload the new one. 
      const url = await postService.uploadImage(file);
      setFormData(prev => ({ ...prev, image_url: url }));
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = async () => {
    if (!formData.image_url) return;

    // Optional: actually delete from storage
    // try {
    //   await postService.deleteImage(formData.image_url);
    // } catch (e) {}

    setFormData(prev => ({ ...prev, image_url: '' }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
      <DialogTitle sx={{ fontWeight: 800, bgcolor: alpha(theme.palette.primary.main, 0.05), borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
        {editItem ? 'Edit Content Post' : 'Create New Post'}
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={3} sx={{ mt: 2 }}>
          {/* Basic Info */}
          <TextField
            name="title"
            label="Post Title"
            fullWidth
            required
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Annual Logistics Summit 2024"
            InputProps={{ startAdornment: <Type size={18} style={{ marginRight: 12, opacity: 0.5 }} /> }}
          />

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                name="post_type"
                label="Content Type"
                fullWidth
                value={formData.post_type}
                onChange={handleChange}
                InputProps={{ startAdornment: <Layers size={18} style={{ marginRight: 12, opacity: 0.5 }} /> }}
              >
                {POST_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      {type.icon}
                      {type.label}
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name="category"
                label="Category / Department"
                fullWidth
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g., Corporate, Operations, CSR"
                InputProps={{ startAdornment: <Globe size={18} style={{ marginRight: 12, opacity: 0.5 }} /> }}
              />
            </Grid>
          </Grid>

          {/* Media & Meta */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
              <ImageIcon size={18} />
              Featured Image
            </Typography>

            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              ref={fileInputRef}
              onChange={handleImageUpload}
            />

            {formData.image_url ? (
              <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', border: `1px solid ${theme.palette.divider}`, width: '100%', height: 200, bgcolor: alpha(theme.palette.background.paper, 0.5) }}>
                <img
                  src={formData.image_url}
                  alt="Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    onClick={handleRemoveImage}
                    sx={{ minWidth: 0, p: 0.5, borderRadius: 1.5 }}
                  >
                    <X size={16} />
                  </Button>
                </Box>
              </Box>
            ) : (
              <Button
                fullWidth
                variant="outlined"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                sx={{
                  height: 120,
                  borderStyle: 'dashed',
                  borderRadius: 2,
                  flexDirection: 'column',
                  gap: 1,
                  color: 'text.secondary'
                }}
              >
                {isUploading ? (
                  <>
                    <Loader2 size={24} className="animate-spin" />
                    <Typography variant="body2">Uploading...</Typography>
                  </>
                ) : (
                  <>
                    <Upload size={24} />
                    <Typography variant="body2">Click to upload featured image</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>JPG, PNG or WEBP (Max 5MB)</Typography>
                  </>
                )}
              </Button>
            )}

            <TextField
              name="image_url"
              label="Or enter image URL manually"
              fullWidth
              size="small"
              sx={{ mt: 2 }}
              value={formData.image_url}
              onChange={handleChange}
              placeholder="https://images.unsplash.com/..."
            />
          </Box>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name="event_date"
                label="Relevant Date"
                type="date"
                fullWidth
                value={formData.event_date}
                onChange={handleChange}
                InputProps={{ startAdornment: <Calendar size={18} style={{ marginRight: 12, opacity: 0.5 }} /> }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name="author_name"
                label="Author Attribution"
                fullWidth
                value={formData.author_name}
                onChange={handleChange}
                placeholder="e.g., Management"
                InputProps={{ startAdornment: <User size={18} style={{ marginRight: 12, opacity: 0.5 }} /> }}
              />
            </Grid>
          </Grid>

          {/* Tags */}
          <Autocomplete
            multiple
            freeSolo
            options={SUGGESTED_TAGS}
            value={formData.tags}
            onChange={handleTagsChange}
            renderTags={(value: string[], getTagProps) =>
              value.map((option: string, index: number) => {
                const { key, ...tagProps } = getTagProps({ index });
                return (
                  <Chip
                    key={key}
                    variant="outlined"
                    label={option}
                    {...tagProps}
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                );
              })
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Exploration Tags"
                placeholder="Select suggestions or type new ones..."
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <Tag size={18} style={{ marginLeft: 8, marginRight: 4, opacity: 0.5 }} />
                      {params.InputProps.startAdornment}
                    </>
                  ),
                }}
              />
            )}
          />

          {/* Content */}
          <TextField
            name="excerpt"
            label="Brief Excerpt"
            fullWidth
            multiline
            rows={2}
            value={formData.excerpt}
            onChange={handleChange}
            placeholder="A short summary for previews and social sharing..."
          />

          <Box sx={{ mt: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <FileText size={18} />
              Content Editor (Markdown)
            </Typography>
            <Box data-color-mode={theme.palette.mode} sx={{
              '& .w-md-editor': {
                borderRadius: 2,
                overflow: 'hidden',
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: 'background.paper'
              },
              '& .w-md-editor-toolbar': {
                bgcolor: alpha(theme.palette.background.default, 0.8),
                backdropFilter: 'blur(8px)',
                borderBottom: `1px solid ${theme.palette.divider}`
              },
              '& .w-md-editor-preview': {
                bgcolor: alpha(theme.palette.background.paper, 0.5)
              },
              // Markdown content styles
              '& .wmde-markdown': {
                fontFamily: theme.typography.fontFamily,
                color: theme.palette.text.secondary,
              },
              '& .wmde-markdown h1, & .wmde-markdown h2, & .wmde-markdown h3, & .wmde-markdown h4': {
                fontWeight: 800,
                color: theme.palette.text.primary,
                borderBottom: 'none',
                pb: 0,
                mt: 2,
                mb: 1,
                display: 'block'
              },
              '& .wmde-markdown h1': { fontSize: '1.75rem' },
              '& .wmde-markdown h2': { fontSize: '1.5rem' },
              '& .wmde-markdown h3': { fontSize: '1.25rem' },
              '& .wmde-markdown strong, & .wmde-markdown b': {
                fontWeight: 800,
                color: theme.palette.text.primary
              },
              '& .wmde-markdown ul, & .wmde-markdown ol': {
                pl: 3,
                mb: 2,
                display: 'block',
                listStyleType: 'disc !important' // Force bullets to show
              },
              '& .wmde-markdown ol': {
                listStyleType: 'decimal !important'
              },
              '& .wmde-markdown li': {
                mb: 0.5,
                display: 'list-item'
              }
            }}>
              <MDEditor
                value={formData.content}
                onChange={handleContentChange}
                height={400}
                preview="live"
                textareaProps={{
                  placeholder: "Write your story here... TIP: Use '# Heading' (with a space) for headers, '**bold**' for bold, and '-' for lists."
                }}
                previewOptions={{
                  remarkPlugins: [remarkBreaks]
                }}
              />
            </Box>
          </Box>

          {/* Settings */}
          <Box sx={{ p: 2, borderRadius: 1.5, bgcolor: alpha(theme.palette.success.main, 0.05), border: `1px solid ${alpha(theme.palette.success.main, 0.1)}` }}>
            <FormControlLabel
              control={
                <Switch
                  name="is_published"
                  checked={formData.is_published}
                  onChange={handleChange}
                  color="success"
                />
              }
              label={
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Public Visibility</Typography>
                  <Typography variant="caption" color="text.secondary">When enabled, this post will be live on the website.</Typography>
                </Box>
              }
            />
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 3, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`, bgcolor: alpha(theme.palette.background.default, 0.5) }}>
        <Button onClick={onClose} color="inherit" sx={{ fontWeight: 600 }}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" sx={{ px: 4, borderRadius: 2, fontWeight: 700 }}>
          {editItem ? 'Save Changes' : 'Create Post'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
