'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  Paper,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Chip,
  InputAdornment,
  Link as MuiLink,
} from '@mui/material';
import {
  Plus,
  Newspaper,
  ArrowLeft,
  Layers,
  Calendar,
  Globe,
  Tag,
  Handshake,
  History,
  Search,
  Edit2,
  Trash2,
  Image as ImageIcon,
  ArrowUpDown,
  Building,
  Award,
  Upload,
  X,
  Loader2,
  ExternalLink,
  MapPin,
} from 'lucide-react';
import Link from 'next/link';
import { usePageTitle } from '@/lib/usePageTitle';
import { createClient } from '@/lib/supabase/client';
import { postService, Post, PostType } from '@/lib/services/post-service';
import PostTable from '@/components/admin/PostTable';
import PostDialog from '@/components/admin/PostDialog';
import { AdminTableSkeleton } from '@/components/loading';

// Interfaces for local types
interface Partner {
  id: string;
  name: string;
  description: string | null;
  icon?: string | null;
  role?: string | null;
  type: 'industry' | 'membership';
  image_url: string | null;
  white_background: boolean;
  display_order: number;
  created_at: string;
}

interface Milestone {
  id: string;
  year: string;
  title: string;
  description: string;
  display_order: number;
  created_at: string;
}

interface CoveragePoint {
  id: string;
  name: string;
  x: number;
  y: number;
  description: string;
  created_at: string;
}

export default function AdminContentManagerPage() {
  usePageTitle('Content Manager');
  const theme = useTheme();

  // High-level content manager tabs:
  // 0 = Posts & News, 1 = Industries Served, 2 = Accreditations & Networks, 3 = Company Timeline
  const [mainTab, setMainTab] = useState(0);

  // Loading states
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isLoadingPartners, setIsLoadingPartners] = useState(true);
  const [isLoadingMilestones, setIsLoadingMilestones] = useState(true);
  const [isLoadingCoveragePoints, setIsLoadingCoveragePoints] = useState(true);

  // Unified Snackbar State
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // --- POSTS STATE & HANDLERS ---
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [postDialogOpen, setPostDialogOpen] = useState(false);
  const [editPostItem, setEditPostItem] = useState<Post | null>(null);
  const [postCategoryTab, setPostCategoryTab] = useState(0); // All, News, Events, Insights, Announcements, Gallery

  const loadPosts = async () => {
    setIsLoadingPosts(true);
    try {
      const data = await postService.getAll();
      setPosts(data);
      setFilteredPosts(data);
    } catch (error) {
      console.error('Error loading posts:', error);
      showSnackbar('Failed to load content.', 'error');
    } finally {
      setIsLoadingPosts(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel('admin-content-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
        },
        () => {
          loadPosts();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'partners',
        },
        () => {
          loadPartners();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'milestones',
        },
        () => {
          loadMilestones();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'coverage_points',
        },
        () => {
          loadCoveragePoints();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const types: (PostType | 'all')[] = ['all', 'news', 'event', 'insight', 'announcement', 'gallery'];
    const selectedType = types[postCategoryTab];

    if (selectedType === 'all') {
      setFilteredPosts(posts);
    } else {
      setFilteredPosts(posts.filter((p) => p.post_type === selectedType));
    }
  }, [postCategoryTab, posts]);

  const handleOpenPostDialog = (item: Post | null = null) => {
    setEditPostItem(item);
    setPostDialogOpen(true);
  };

  const handleClosePostDialog = () => {
    setPostDialogOpen(false);
    setEditPostItem(null);
  };

  const handleSavePost = async (formData: any) => {
    try {
      if (editPostItem) {
        await postService.update(editPostItem.id, formData);
        showSnackbar('Post updated successfully!');
      } else {
        await postService.create(formData);
        showSnackbar('New post created successfully!');
      }
      handleClosePostDialog();
      loadPosts();
    } catch (error) {
      console.error('Error saving post:', error);
      showSnackbar('Failed to save post.', 'error');
    }
  };

  const handleDeletePost = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        const postToDelete = posts.find((p) => p.id === id);
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

  const handleTogglePublishPost = async (item: Post) => {
    try {
      await postService.update(item.id, { is_published: !item.is_published });
      showSnackbar(`Post ${!item.is_published ? 'published' : 'unpublished'} successfully!`);
      loadPosts();
    } catch (error) {
      console.error('Error toggling publish status:', error);
      showSnackbar('Failed to update status.', 'error');
    }
  };

  // --- PARTNERS (INDUSTRIES & MEMBERSHIPS) STATE & HANDLERS ---
  const [partners, setPartners] = useState<Partner[]>([]);
  const [partnerSearchTerm, setPartnerSearchTerm] = useState('');
  const [partnerDialogOpen, setPartnerDialogOpen] = useState(false);
  const [confirmPartnerDeleteOpen, setConfirmPartnerDeleteOpen] = useState(false);
  const [activePartner, setActivePartner] = useState<Partner | null>(null);
  const [partnerFormData, setPartnerFormData] = useState({
    name: '',
    description: '',
    icon: '',
    type: 'industry' as 'industry' | 'membership',
    image_url: '',
    white_background: false,
    display_order: 0,
  });
  const [isUploadingPartnerLogo, setIsUploadingPartnerLogo] = useState(false);
  const partnerFileInputRef = React.useRef<HTMLInputElement>(null);

  const uploadPartnerImage = async (file: File) => {
    const supabase = createClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `partner-logos/${fileName}`;

    const { data, error } = await supabase.storage
      .from('posts')
      .upload(filePath, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('posts')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const deletePartnerImage = async (url: string) => {
    const supabase = createClient();
    const parts = url.split('/storage/v1/object/public/posts/');
    if (parts.length < 2) return;

    const filePath = parts[1];
    const { error } = await supabase.storage
      .from('posts')
      .remove([filePath]);

    if (error) {
      console.error('Error deleting partner image from storage:', error);
    }
  };

  const handlePartnerImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPartnerLogo(true);
    try {
      if (partnerFormData.image_url) {
        await deletePartnerImage(partnerFormData.image_url);
      }
      const url = await uploadPartnerImage(file);
      setPartnerFormData(prev => ({ ...prev, image_url: url }));
      showSnackbar('Logo uploaded successfully!');
    } catch (error: any) {
      console.error('Logo upload failed:', error);
      showSnackbar(error.message || 'Failed to upload logo image.', 'error');
    } finally {
      setIsUploadingPartnerLogo(false);
      if (partnerFileInputRef.current) partnerFileInputRef.current.value = '';
    }
  };

  const handleRemovePartnerLogo = async () => {
    if (!partnerFormData.image_url) return;

    try {
      await deletePartnerImage(partnerFormData.image_url);
      setPartnerFormData(prev => ({ ...prev, image_url: '' }));
      showSnackbar('Logo removed.');
    } catch (error) {
      console.error('Error removing logo:', error);
      setPartnerFormData(prev => ({ ...prev, image_url: '' }));
    }
  };

  const loadPartners = async () => {
    setIsLoadingPartners(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setPartners(data || []);
    } catch (error: any) {
      console.error('Error loading partners:', error);
      showSnackbar(error.message || 'Failed to load partners.', 'error');
    } finally {
      setIsLoadingPartners(false);
    }
  };

  useEffect(() => {
    loadPartners();
  }, []);

  // Filter partners type === 'industry'
  const filteredIndustries = useMemo(() => {
    return partners.filter((p) => {
      if (p.type !== 'industry') return false;
      return (
        p.name.toLowerCase().includes(partnerSearchTerm.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(partnerSearchTerm.toLowerCase())) ||
        (p.role && p.role.toLowerCase().includes(partnerSearchTerm.toLowerCase()))
      );
    });
  }, [partners, partnerSearchTerm]);

  // Filter partners type === 'membership'
  const filteredMemberships = useMemo(() => {
    return partners.filter((p) => {
      if (p.type !== 'membership') return false;
      return (
        p.name.toLowerCase().includes(partnerSearchTerm.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(partnerSearchTerm.toLowerCase()))
      );
    });
  }, [partners, partnerSearchTerm]);

  const handleOpenPartnerDialog = (partner: Partner | null = null, defaultType?: 'industry' | 'membership') => {
    if (partner) {
      setActivePartner(partner);
      setPartnerFormData({
        name: partner.name,
        description: partner.description || '',
        icon: partner.icon || '',
        type: partner.type,
        image_url: partner.image_url || '',
        white_background: partner.white_background,
        display_order: partner.display_order,
      });
    } else {
      const entityType = defaultType || 'industry';
      setActivePartner(null);
      setPartnerFormData({
        name: '',
        description: '',
        icon: '',
        type: entityType,
        image_url: '',
        white_background: false,
        display_order: partners.filter((p) => p.type === entityType).length,
      });
    }
    setPartnerDialogOpen(true);
  };

  const handleClosePartnerDialog = () => {
    setPartnerDialogOpen(false);
    setActivePartner(null);
  };

  const handlePartnerInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPartnerFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePartnerSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPartnerFormData((prev) => ({ ...prev, white_background: e.target.checked }));
  };

  const handleSavePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerFormData.name.trim()) {
      showSnackbar('Partner name is required.', 'error');
      return;
    }

    try {
      const supabase = createClient();
      const payload = {
        name: partnerFormData.name.trim(),
        description: partnerFormData.description.trim() || null,
        icon: partnerFormData.type === 'industry' ? partnerFormData.icon.trim() || null : null,
        type: partnerFormData.type,
        display_order: Number(partnerFormData.display_order) || 0,
        ...(partnerFormData.type === 'membership'
          ? {
              image_url: partnerFormData.image_url.trim() || null,
              white_background: partnerFormData.white_background,
            }
          : {}),
      };

      if (activePartner) {
        const { error } = await supabase
          .from('partners')
          .update(payload)
          .eq('id', activePartner.id);

        if (error) throw error;
        showSnackbar('Partner updated successfully!');
      } else {
        const { error } = await supabase
          .from('partners')
          .insert(payload);

        if (error) throw error;
        showSnackbar('New partner created successfully!');
      }

      handleClosePartnerDialog();
      loadPartners();
    } catch (error: any) {
      console.error('Error saving partner:', error);
      showSnackbar(error.message || 'Failed to save partner.', 'error');
    }
  };

  const handleOpenPartnerDelete = (partner: Partner) => {
    setActivePartner(partner);
    setConfirmPartnerDeleteOpen(true);
  };

  const handleDeletePartner = async () => {
    if (!activePartner) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('partners')
        .delete()
        .eq('id', activePartner.id);

      if (error) throw error;

      if (activePartner.image_url) {
        await deletePartnerImage(activePartner.image_url);
      }

      showSnackbar('Partner deleted successfully!');
      setConfirmPartnerDeleteOpen(false);
      setActivePartner(null);
      loadPartners();
    } catch (error: any) {
      console.error('Error deleting partner:', error);
      showSnackbar(error.message || 'Failed to delete partner.', 'error');
    }
  };

  // --- MILESTONES STATE & HANDLERS ---
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [milestoneDialogOpen, setMilestoneDialogOpen] = useState(false);
  const [confirmMilestoneDeleteOpen, setConfirmMilestoneDeleteOpen] = useState(false);
  const [activeMilestone, setActiveMilestone] = useState<Milestone | null>(null);
  const [milestoneFormData, setMilestoneFormData] = useState({
    year: '',
    title: '',
    description: '',
    display_order: 0,
  });

  const loadMilestones = async () => {
    setIsLoadingMilestones(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('milestones')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setMilestones(data || []);
    } catch (error: any) {
      console.error('Error loading milestones:', error);
      showSnackbar(error.message || 'Failed to load milestones.', 'error');
    } finally {
      setIsLoadingMilestones(false);
    }
  };

  useEffect(() => {
    loadMilestones();
  }, []);

  const handleOpenMilestoneDialog = (milestone: Milestone | null = null) => {
    if (milestone) {
      setActiveMilestone(milestone);
      setMilestoneFormData({
        year: milestone.year,
        title: milestone.title,
        description: milestone.description,
        display_order: milestone.display_order,
      });
    } else {
      setActiveMilestone(null);
      setMilestoneFormData({
        year: '',
        title: '',
        description: '',
        display_order: milestones.length,
      });
    }
    setMilestoneDialogOpen(true);
  };

  const handleMilestoneInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMilestoneFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneFormData.year.trim() || !milestoneFormData.title.trim() || !milestoneFormData.description.trim()) {
      showSnackbar('Year, title, and description are required.', 'error');
      return;
    }

    try {
      const supabase = createClient();
      const payload = {
        year: milestoneFormData.year.trim(),
        title: milestoneFormData.title.trim(),
        description: milestoneFormData.description.trim(),
        display_order: Number(milestoneFormData.display_order) || 0,
      };

      if (activeMilestone) {
        const { error } = await supabase
          .from('milestones')
          .update(payload)
          .eq('id', activeMilestone.id);

        if (error) throw error;
        showSnackbar('Milestone updated successfully!');
      } else {
        const { error } = await supabase
          .from('milestones')
          .insert(payload);

        if (error) throw error;
        showSnackbar('New milestone created successfully!');
      }

      setMilestoneDialogOpen(false);
      setActiveMilestone(null);
      loadMilestones();
    } catch (error: any) {
      console.error('Error saving milestone:', error);
      showSnackbar(error.message || 'Failed to save milestone.', 'error');
    }
  };

  const handleOpenMilestoneDelete = (milestone: Milestone) => {
    setActiveMilestone(milestone);
    setConfirmMilestoneDeleteOpen(true);
  };

  const handleDeleteMilestone = async () => {
    if (!activeMilestone) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('milestones')
        .delete()
        .eq('id', activeMilestone.id);

      if (error) throw error;
      showSnackbar('Milestone deleted successfully!');
      setConfirmMilestoneDeleteOpen(false);
      setActiveMilestone(null);
      loadMilestones();
    } catch (error: any) {
      console.error('Error deleting milestone:', error);
      showSnackbar(error.message || 'Failed to delete milestone.', 'error');
    }
  };

  // --- COVERAGE POINTS STATE & HANDLERS ---
  const [coveragePoints, setCoveragePoints] = useState<CoveragePoint[]>([]);
  const [coverageSearchTerm, setCoverageSearchTerm] = useState('');
  const [coverageDialogOpen, setCoverageDialogOpen] = useState(false);
  const [confirmCoverageDeleteOpen, setConfirmCoverageDeleteOpen] = useState(false);
  const [activeCoveragePoint, setActiveCoveragePoint] = useState<CoveragePoint | null>(null);
  const [coverageFormData, setCoverageFormData] = useState({
    name: '',
    x: 50.0,
    y: 50.0,
    description: '',
  });

  const loadCoveragePoints = async () => {
    setIsLoadingCoveragePoints(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('coverage_points')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setCoveragePoints(data || []);
    } catch (error: any) {
      console.error('Error loading coverage points:', error);
      showSnackbar(error.message || 'Failed to load coverage points.', 'error');
    } finally {
      setIsLoadingCoveragePoints(false);
    }
  };

  useEffect(() => {
    loadCoveragePoints();
  }, []);

  const filteredCoveragePoints = useMemo(() => {
    return coveragePoints.filter((cp) => {
      return (
        cp.name.toLowerCase().includes(coverageSearchTerm.toLowerCase()) ||
        cp.description.toLowerCase().includes(coverageSearchTerm.toLowerCase())
      );
    });
  }, [coveragePoints, coverageSearchTerm]);

  const handleOpenCoverageDialog = (point: CoveragePoint | null = null) => {
    if (point) {
      setActiveCoveragePoint(point);
      setCoverageFormData({
        name: point.name,
        x: Number(point.x),
        y: Number(point.y),
        description: point.description,
      });
    } else {
      setActiveCoveragePoint(null);
      setCoverageFormData({
        name: '',
        x: 50.0,
        y: 50.0,
        description: '',
      });
    }
    setCoverageDialogOpen(true);
  };

  const handleCloseCoverageDialog = () => {
    setCoverageDialogOpen(false);
    setActiveCoveragePoint(null);
  };

  const handleCoverageInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCoverageFormData((prev) => ({
      ...prev,
      [name]: name === 'x' || name === 'y' ? (value === '' ? '' : Number(value)) : value,
    }));
  };

  const handleSaveCoveragePoint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverageFormData.name.trim()) {
      showSnackbar('Location name is required.', 'error');
      return;
    }
    const xNum = Number(coverageFormData.x);
    const yNum = Number(coverageFormData.y);
    if (isNaN(xNum) || xNum < 0 || xNum > 100) {
      showSnackbar('X coordinate must be between 0 and 100.', 'error');
      return;
    }
    if (isNaN(yNum) || yNum < 0 || yNum > 100) {
      showSnackbar('Y coordinate must be between 0 and 100.', 'error');
      return;
    }

    try {
      const supabase = createClient();
      const payload = {
        name: coverageFormData.name.trim(),
        x: xNum,
        y: yNum,
        description: coverageFormData.description.trim(),
      };

      if (activeCoveragePoint) {
        const { error } = await supabase
          .from('coverage_points')
          .update(payload)
          .eq('id', activeCoveragePoint.id);

        if (error) throw error;
        showSnackbar('Coverage point updated successfully!');
      } else {
        const { error } = await supabase
          .from('coverage_points')
          .insert(payload);

        if (error) throw error;
        showSnackbar('New coverage point created successfully!');
      }

      handleCloseCoverageDialog();
      loadCoveragePoints();
    } catch (error: any) {
      console.error('Error saving coverage point:', error);
      showSnackbar(error.message || 'Failed to save coverage point.', 'error');
    }
  };

  const handleOpenCoverageDelete = (point: CoveragePoint) => {
    setActiveCoveragePoint(point);
    setConfirmCoverageDeleteOpen(true);
  };

  const handleDeleteCoveragePoint = async () => {
    if (!activeCoveragePoint) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('coverage_points')
        .delete()
        .eq('id', activeCoveragePoint.id);

      if (error) throw error;
      showSnackbar('Coverage point deleted successfully!');
      setConfirmCoverageDeleteOpen(false);
      setActiveCoveragePoint(null);
      loadCoveragePoints();
    } catch (error: any) {
      console.error('Error deleting coverage point:', error);
      showSnackbar(error.message || 'Failed to delete coverage point.', 'error');
    }
  };

  // Clear search on tab change
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setMainTab(newValue);
    setPartnerSearchTerm('');
    setCoverageSearchTerm('');
  };

  // Dynamic header button renderer
  const renderHeaderAction = () => {
    switch (mainTab) {
      case 0:
        return (
          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={() => handleOpenPostDialog()}
            sx={{ borderRadius: 2, px: 3, py: 1.5, fontWeight: 700, boxShadow: theme.shadows[4] }}
          >
            Create New Post
          </Button>
        );
      case 1:
        return (
          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={() => handleOpenPartnerDialog(null, 'industry')}
            sx={{ borderRadius: 2, px: 3, py: 1.5, fontWeight: 700, boxShadow: theme.shadows[4] }}
          >
            Add Industry Served
          </Button>
        );
      case 2:
        return (
          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={() => handleOpenPartnerDialog(null, 'membership')}
            sx={{ borderRadius: 2, px: 3, py: 1.5, fontWeight: 700, boxShadow: theme.shadows[4] }}
          >
            Add Accreditation / Network
          </Button>
        );
      case 3:
        return (
          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={() => handleOpenMilestoneDialog(null)}
            sx={{ borderRadius: 2, px: 3, py: 1.5, fontWeight: 700, boxShadow: theme.shadows[4] }}
          >
            Add Milestone
          </Button>
        );
      case 4:
      default:
        return (
          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={() => handleOpenCoverageDialog(null)}
            sx={{ borderRadius: 2, px: 3, py: 1.5, fontWeight: 700, boxShadow: theme.shadows[4] }}
          >
            Add Coverage Point
          </Button>
        );
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'flex-start' }, gap: 2 }}>
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
            Content Manager
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your posts, news, industries served, networks, and historical milestones.
          </Typography>
        </Box>
        {renderHeaderAction()}
      </Box>

      {/* Main Tab bar */}
      <Tabs
        value={mainTab}
        onChange={handleTabChange}
        sx={{
          mb: 4,
          borderBottom: 1,
          borderColor: 'divider',
          '& .MuiTab-root': {
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '1rem',
          },
        }}
      >
        <Tab icon={<Newspaper size={18} style={{ marginRight: 8 }} />} label="Posts & News" iconPosition="start" />
        <Tab icon={<Building size={18} style={{ marginRight: 8 }} />} label="Industries Served" iconPosition="start" />
        <Tab icon={<Award size={18} style={{ marginRight: 8 }} />} label="Accreditations & Networks" iconPosition="start" />
        <Tab icon={<History size={18} style={{ marginRight: 8 }} />} label="Company Timeline" iconPosition="start" />
        <Tab icon={<MapPin size={18} style={{ marginRight: 8 }} />} label="Map Coverage" iconPosition="start" />
      </Tabs>

      {/* Tab Contents */}
      {/* Tab 0: Posts */}
      {mainTab === 0 && (
        <Box>
          <Paper sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
            <Tabs
              value={postCategoryTab}
              onChange={(_, v) => setPostCategoryTab(v)}
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

          {isLoadingPosts ? (
            <AdminTableSkeleton />
          ) : (
            <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3, overflow: 'hidden' }}>
              <Box sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  All Posts ({filteredPosts.length})
                </Typography>
              </Box>
              <PostTable
                posts={filteredPosts}
                onEdit={handleOpenPostDialog}
                onDelete={handleDeletePost}
                onTogglePublish={handleTogglePublishPost}
              />
            </Card>
          )}
        </Box>
      )}

      {/* Tab 1: Industries Served */}
      {mainTab === 1 && (
        <Box>
          <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3, overflow: 'hidden' }}>
            {/* Card Header with unified layout */}
            <Box sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Industries Served ({filteredIndustries.length})
              </Typography>
              <TextField
                size="small"
                placeholder="Search industries..."
                value={partnerSearchTerm}
                onChange={(e) => setPartnerSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={16} style={{ color: theme.palette.text.secondary }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  width: 220,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Box>

            {/* Table representation */}
            {isLoadingPartners ? (
              <Box sx={{ p: 4 }}>
                <AdminTableSkeleton />
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                      <TableCell sx={{ fontWeight: 700, py: 2 }}>Display Order</TableCell>
                      <TableCell sx={{ fontWeight: 700, py: 2 }}>Industry Name</TableCell>
                      <TableCell sx={{ fontWeight: 700, py: 2 }}>Icon Key</TableCell>
                      <TableCell sx={{ fontWeight: 700, py: 2 }}>Description</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, py: 2 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredIndustries.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                          <Typography variant="body1" color="text.secondary">
                            No industries served found.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredIndustries.map((partner) => (
                        <TableRow key={partner.id} sx={{ '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.5) } }}>
                          <TableCell sx={{ width: 140, py: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <ArrowUpDown size={14} style={{ color: theme.palette.text.disabled }} />
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {partner.display_order}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ maxWidth: 350, py: 2 }}>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                {partner.name}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            {partner.icon ? (
                              <Chip
                                label={partner.icon}
                                size="small"
                                variant="outlined"
                                sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                              />
                            ) : (
                              <Typography variant="caption" color="text.disabled">
                                briefcase
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell sx={{ maxWidth: 360, py: 2 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                              {partner.description || partner.role || 'None'}
                            </Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ py: 2 }}>
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Tooltip title="Edit">
                                <IconButton size="small" onClick={() => handleOpenPartnerDialog(partner)} color="primary">
                                  <Edit2 size={16} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton size="small" onClick={() => handleOpenPartnerDelete(partner)} color="error">
                                  <Trash2 size={16} />
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
            )}
          </Card>
        </Box>
      )}

      {/* Tab 2: Accreditations & Networks */}
      {mainTab === 2 && (
        <Box>
          <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3, overflow: 'hidden' }}>
            {/* Card Header with unified layout */}
            <Box sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Accreditations & Networks ({filteredMemberships.length})
              </Typography>
              <TextField
                size="small"
                placeholder="Search networks..."
                value={partnerSearchTerm}
                onChange={(e) => setPartnerSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={16} style={{ color: theme.palette.text.secondary }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  width: 220,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Box>

            {/* Table representation */}
            {isLoadingPartners ? (
              <Box sx={{ p: 4 }}>
                <AdminTableSkeleton />
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                      <TableCell sx={{ fontWeight: 700, py: 2 }}>Display Order</TableCell>
                      <TableCell sx={{ fontWeight: 700, py: 2 }}>Organization Name</TableCell>
                      <TableCell sx={{ fontWeight: 700, py: 2 }}>Logo URL</TableCell>
                      <TableCell sx={{ fontWeight: 700, py: 2 }}>Options</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, py: 2 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredMemberships.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                          <Typography variant="body1" color="text.secondary">
                            No accreditations or networks found.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredMemberships.map((partner) => (
                        <TableRow key={partner.id} sx={{ '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.5) } }}>
                          <TableCell sx={{ width: 140, py: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <ArrowUpDown size={14} style={{ color: theme.palette.text.disabled }} />
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {partner.display_order}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ maxWidth: 350, py: 2 }}>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                {partner.name}
                              </Typography>
                              {partner.description && (
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                  {partner.description}
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            {partner.image_url ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box
                                  component="img"
                                  src={partner.image_url}
                                  alt={partner.name}
                                  sx={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 1,
                                    objectFit: 'contain',
                                    border: `1px solid ${theme.palette.divider}`,
                                    p: partner.white_background ? 0.5 : 0,
                                    bgcolor: partner.white_background ? 'white' : 'transparent',
                                  }}
                                />
                                <MuiLink
                                  href={partner.image_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                    color: 'primary.main',
                                    textDecoration: 'none',
                                    '&:hover': {
                                      textDecoration: 'underline',
                                    },
                                  }}
                                >
                                  View Logo
                                  <ExternalLink size={14} />
                                </MuiLink>
                              </Box>
                            ) : (
                              <Typography variant="caption" color="text.disabled">
                                None
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            {partner.white_background ? (
                              <Chip label="White Bg" size="small" color="info" variant="outlined" sx={{ fontWeight: 600, fontSize: '0.7rem' }} />
                            ) : (
                              <Typography variant="caption" color="text.disabled">
                                Default
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="right" sx={{ py: 2 }}>
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Tooltip title="Edit">
                                <IconButton size="small" onClick={() => handleOpenPartnerDialog(partner)} color="primary">
                                  <Edit2 size={16} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton size="small" onClick={() => handleOpenPartnerDelete(partner)} color="error">
                                  <Trash2 size={16} />
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
            )}
          </Card>
        </Box>
      )}

      {/* Tab 3: Timeline */}
      {mainTab === 3 && (
        <Box>
          <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3, overflow: 'hidden' }}>
            {/* Card Header with unified layout */}
            <Box sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Company Milestones ({milestones.length})
              </Typography>
            </Box>

            {isLoadingMilestones ? (
              <Box sx={{ p: 4 }}>
                <AdminTableSkeleton />
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                      <TableCell sx={{ fontWeight: 700, py: 2 }}>Order</TableCell>
                      <TableCell sx={{ fontWeight: 700, py: 2 }}>Year</TableCell>
                      <TableCell sx={{ fontWeight: 700, py: 2 }}>Title</TableCell>
                      <TableCell sx={{ fontWeight: 700, py: 2 }}>Description</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, py: 2 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {milestones.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                          <Typography variant="body1" color="text.secondary">
                            No milestones found.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      milestones.map((milestone) => (
                        <TableRow key={milestone.id} sx={{ '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.5) } }}>
                          <TableCell sx={{ width: 100, py: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <ArrowUpDown size={14} style={{ color: theme.palette.text.disabled }} />
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {milestone.display_order}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700, width: 140, py: 2 }}>
                            {milestone.year}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700, maxWidth: 220, py: 2 }}>
                            {milestone.title}
                          </TableCell>
                          <TableCell sx={{ color: 'text.secondary', py: 2 }}>
                            {milestone.description}
                          </TableCell>
                          <TableCell align="right" sx={{ py: 2 }}>
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Tooltip title="Edit">
                                <IconButton size="small" onClick={() => handleOpenMilestoneDialog(milestone)} color="primary">
                                  <Edit2 size={16} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton size="small" onClick={() => handleOpenMilestoneDelete(milestone)} color="error">
                                  <Trash2 size={16} />
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
            )}
          </Card>
        </Box>
      )}

      {/* Tab 4: Map Coverage */}
      {mainTab === 4 && (
        <Box>
          <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3, overflow: 'hidden' }}>
            <Box sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Map Coverage Points ({filteredCoveragePoints.length})
              </Typography>
              <TextField
                size="small"
                placeholder="Search points..."
                value={coverageSearchTerm}
                onChange={(e) => setCoverageSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={16} style={{ color: theme.palette.text.secondary }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  width: 220,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Box>

            {isLoadingCoveragePoints ? (
              <Box sx={{ p: 4 }}>
                <AdminTableSkeleton />
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                      <TableCell sx={{ fontWeight: 700, py: 2 }}>Location Name</TableCell>
                      <TableCell sx={{ fontWeight: 700, py: 2 }}>X Coordinate (%)</TableCell>
                      <TableCell sx={{ fontWeight: 700, py: 2 }}>Y Coordinate (%)</TableCell>
                      <TableCell sx={{ fontWeight: 700, py: 2 }}>Description</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, py: 2 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredCoveragePoints.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                          <Typography variant="body1" color="text.secondary">
                            No coverage points found.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCoveragePoints.map((point) => (
                        <TableRow key={point.id} sx={{ '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.5) } }}>
                          <TableCell sx={{ fontWeight: 700, py: 2 }}>{point.name}</TableCell>
                          <TableCell sx={{ py: 2 }}>{point.x}%</TableCell>
                          <TableCell sx={{ py: 2 }}>{point.y}%</TableCell>
                          <TableCell sx={{ maxWidth: 300, py: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              {point.description}
                            </Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ py: 2 }}>
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Tooltip title="Edit">
                                <IconButton size="small" onClick={() => handleOpenCoverageDialog(point)} color="primary">
                                  <Edit2 size={16} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton size="small" onClick={() => handleOpenCoverageDelete(point)} color="error">
                                  <Trash2 size={16} />
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
            )}
          </Card>
        </Box>
      )}

      {/* Save Partner Modal Dialog */}
      <Dialog open={partnerDialogOpen} onClose={handleClosePartnerDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSavePartner}>
          <DialogTitle sx={{ fontWeight: 800 }}>
            {partnerFormData.type === 'industry'
              ? activePartner
                ? 'Edit Industry Served'
                : 'Add Industry Served'
              : activePartner
                ? 'Edit Accreditation / Network'
                : 'Add Accreditation / Network'}
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                name="name"
                label={partnerFormData.type === 'industry' ? 'Industry Name' : 'Organization Name'}
                fullWidth
                required
                value={partnerFormData.name}
                onChange={handlePartnerInputChange}
                inputProps={{ maxLength: 100 }}
              />

              <TextField
                name="description"
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={partnerFormData.description}
                onChange={handlePartnerInputChange}
                inputProps={{ maxLength: 500 }}
              />

              {partnerFormData.type === 'industry' && (
                <TextField
                  name="icon"
                  label="Icon Key"
                  fullWidth
                  value={partnerFormData.icon}
                  onChange={handlePartnerInputChange}
                  helperText={
                    <>
                      Use a Lucide icon key such as{' '}
                      <Link href="https://lucide.dev/icons/" target="_blank" rel="noreferrer">
                        briefcase, package, wrench, utensils-crossed, dollar-sign, or store
                      </Link>
                      .
                    </>
                  }
                  inputProps={{ maxLength: 50 }}
                />
              )}

              {partnerFormData.type === 'membership' && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ImageIcon size={18} />
                    Organization Logo
                  </Typography>

                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    ref={partnerFileInputRef}
                    onChange={handlePartnerImageUpload}
                  />

                  {partnerFormData.image_url ? (
                    <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', border: `1px solid ${theme.palette.divider}`, width: '100%', height: 140, bgcolor: alpha(theme.palette.background.paper, 0.5), display: 'flex', alignItems: 'center', justifyContent: 'center', p: 1 }}>
                      <img
                        src={partnerFormData.image_url}
                        alt="Logo Preview"
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      />
                      <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                        <IconButton
                          size="small"
                          onClick={handleRemovePartnerLogo}
                          sx={{ bgcolor: theme.palette.error.main, color: 'white', '&:hover': { bgcolor: theme.palette.error.dark } }}
                        >
                          <X size={16} />
                        </IconButton>
                      </Box>
                    </Box>
                  ) : (
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => partnerFileInputRef.current?.click()}
                      disabled={isUploadingPartnerLogo}
                      sx={{
                        height: 100,
                        borderStyle: 'dashed',
                        borderRadius: 2,
                        flexDirection: 'column',
                        gap: 1,
                        color: 'text.secondary'
                      }}
                    >
                      {isUploadingPartnerLogo ? (
                        <>
                          <Loader2 size={24} className="animate-spin" />
                          <Typography variant="body2">Uploading...</Typography>
                        </>
                      ) : (
                        <>
                          <Upload size={20} />
                          <Typography variant="body2">Click to upload logo image</Typography>
                          <Typography variant="caption" sx={{ opacity: 0.7 }}>JPG, PNG or WEBP (Max 5MB)</Typography>
                        </>
                      )}
                    </Button>
                  )}

                  <TextField
                    name="image_url"
                    label="Or enter logo URL manually"
                    fullWidth
                    size="small"
                    sx={{ mt: 2 }}
                    value={partnerFormData.image_url}
                    onChange={handlePartnerInputChange}
                    placeholder="https://example.com/logo.png"
                  />
                </Box>
              )}

              <TextField
                name="display_order"
                label="Display Order (priority)"
                type="number"
                fullWidth
                value={partnerFormData.display_order}
                onChange={handlePartnerInputChange}
                inputProps={{ min: 0 }}
              />

              {partnerFormData.type === 'membership' && (
                <FormControlLabel
                  control={
                    <Switch
                      checked={partnerFormData.white_background}
                      onChange={handlePartnerSwitchChange}
                      color="primary"
                    />
                  }
                  label="Enforce White Background for Logo"
                />
              )}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={handleClosePartnerDialog} variant="outlined" sx={{ borderRadius: 2 }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" sx={{ borderRadius: 2, px: 3 }}>
              {partnerFormData.type === 'industry' ? 'Save Industry' : 'Save Entity'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Partner Delete Confirmation Modal Dialog */}
      <Dialog open={confirmPartnerDeleteOpen} onClose={() => setConfirmPartnerDeleteOpen(false)}>
        <DialogTitle sx={{ fontWeight: 800 }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete <strong>{activePartner?.name}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setConfirmPartnerDeleteOpen(false)} variant="outlined" sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          <Button onClick={handleDeletePartner} variant="contained" color="error" sx={{ borderRadius: 2, px: 3 }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Save Milestone Modal Dialog */}
      <Dialog open={milestoneDialogOpen} onClose={() => setMilestoneDialogOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSaveMilestone}>
          <DialogTitle sx={{ fontWeight: 800 }}>
            {activeMilestone ? 'Edit Milestone' : 'Add Milestone'}
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                name="year"
                label="Year (e.g. 2014, 2015-2018)"
                fullWidth
                required
                value={milestoneFormData.year}
                onChange={handleMilestoneInputChange}
                inputProps={{ maxLength: 50 }}
              />

              <TextField
                name="title"
                label="Milestone Title"
                fullWidth
                required
                value={milestoneFormData.title}
                onChange={handleMilestoneInputChange}
                inputProps={{ maxLength: 100 }}
              />

              <TextField
                name="description"
                label="Description"
                fullWidth
                required
                multiline
                rows={4}
                value={milestoneFormData.description}
                onChange={handleMilestoneInputChange}
                inputProps={{ maxLength: 1000 }}
              />

              <TextField
                name="display_order"
                label="Display Order (priority)"
                type="number"
                fullWidth
                value={milestoneFormData.display_order}
                onChange={handleMilestoneInputChange}
                inputProps={{ min: 0 }}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setMilestoneDialogOpen(false)} variant="outlined" sx={{ borderRadius: 2 }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" sx={{ borderRadius: 2, px: 3 }}>
              Save Milestone
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Milestone Delete Confirmation Modal Dialog */}
      <Dialog open={confirmMilestoneDeleteOpen} onClose={() => setConfirmMilestoneDeleteOpen(false)}>
        <DialogTitle sx={{ fontWeight: 800 }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete the milestone <strong>{activeMilestone?.title}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setConfirmMilestoneDeleteOpen(false)} variant="outlined" sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          <Button onClick={handleDeleteMilestone} variant="contained" color="error" sx={{ borderRadius: 2, px: 3 }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Save Coverage Point Modal Dialog */}
      <Dialog open={coverageDialogOpen} onClose={handleCloseCoverageDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSaveCoveragePoint}>
          <DialogTitle sx={{ fontWeight: 800 }}>
            {activeCoveragePoint ? 'Edit Coverage Point' : 'Add Coverage Point'}
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                name="name"
                label="Location Name"
                fullWidth
                required
                value={coverageFormData.name}
                onChange={handleCoverageInputChange}
                inputProps={{ maxLength: 100 }}
              />

              <Stack direction="row" spacing={2}>
                <TextField
                  name="x"
                  label="X Coordinate (%)"
                  type="number"
                  fullWidth
                  required
                  value={coverageFormData.x}
                  onChange={handleCoverageInputChange}
                  inputProps={{ step: 'any', min: 0, max: 100 }}
                  helperText="Horizontal position on map (0-100)"
                />
                <TextField
                  name="y"
                  label="Y Coordinate (%)"
                  type="number"
                  fullWidth
                  required
                  value={coverageFormData.y}
                  onChange={handleCoverageInputChange}
                  inputProps={{ step: 'any', min: 0, max: 100 }}
                  helperText="Vertical position on map (0-100)"
                />
              </Stack>

              <TextField
                name="description"
                label="Description"
                fullWidth
                required
                multiline
                rows={3}
                value={coverageFormData.description}
                onChange={handleCoverageInputChange}
                inputProps={{ maxLength: 500 }}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={handleCloseCoverageDialog} variant="outlined" sx={{ borderRadius: 2 }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" sx={{ borderRadius: 2, px: 3 }}>
              Save Coverage Point
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Coverage Point Delete Confirmation Modal Dialog */}
      <Dialog open={confirmCoverageDeleteOpen} onClose={() => setConfirmCoverageDeleteOpen(false)}>
        <DialogTitle sx={{ fontWeight: 800 }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete <strong>{activeCoveragePoint?.name}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setConfirmCoverageDeleteOpen(false)} variant="outlined" sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          <Button onClick={handleDeleteCoveragePoint} variant="contained" color="error" sx={{ borderRadius: 2, px: 3 }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* PostDialog (Shared) */}
      <PostDialog
        open={postDialogOpen}
        onClose={handleClosePostDialog}
        onSave={handleSavePost}
        editItem={editPostItem}
      />

      {/* Notification Toast */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
