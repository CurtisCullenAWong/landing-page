'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { usePageTitle } from '@/lib/usePageTitle';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Search,
  ArrowLeft,
  Users,
  Shield,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  TablePagination,
  Stack,
  Divider,
  Alert,
  alpha,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';
import { AdminTableSkeleton } from '@/components/loading';

// Helper to extract clean error message from Supabase Edge Function responses
async function getFunctionErrorMessage(err: any): Promise<string> {
  if (err && err.context && typeof err.context.clone === 'function') {
    try {
      const responseClone = err.context.clone();
      const body = await responseClone.json();
      if (body && body.error) {
        return body.error;
      }
    } catch (_) {
      try {
        const text = await err.context.clone().text();
        if (text) return text;
      } catch (_) { }
    }
  }
  return err.message || 'Unknown error occurred';
}

type UserRole = 'user' | 'admin';

interface UserProfile {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  /** Role merged from public.profiles by the edge function */
  profile_role?: UserRole;
  user_metadata?: {
    full_name?: string;
  };
  banned_until?: string | null;
}

export default function UserManagementPage() {
  usePageTitle('User Management');
  const theme = useTheme();

  // State
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Search & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Dialogs
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Form inputs
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('admin');
  const [isDisabled, setIsDisabled] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [showConfirmEditPassword, setShowConfirmEditPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmEditPassword, setConfirmEditPassword] = useState('');

  const supabase = createClient();

  // Load users
  const loadUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!supabase.functions) {
        throw new Error('Supabase Edge Functions client not available');
      }

      const { data, error: funcError } = await supabase.functions.invoke('manage-users', {
        body: { action: 'list' },
      });

      if (funcError) throw funcError;
      if (data?.error) throw new Error(data.error);

      setUsers(data.users || []);
    } catch (err: any) {
      console.error('Error loading users:', err);

      let reason = await getFunctionErrorMessage(err);
      if (err.status === 403 && reason === 'Edge Function returned a non-2xx status code') {
        reason = 'Access denied (403): Your account does not have the admin role in app_metadata.';
      } else if (err.status === 401 && reason === 'Edge Function returned a non-2xx status code') {
        reason = 'Unauthorized (401): Missing or invalid authentication token. Try logging out and back in.';
      } else if (err.status === 500 && reason === 'Edge Function returned a non-2xx status code') {
        reason = 'Internal Server Error (500): The edge function encountered an error or variables are missing.';
      }
      setError(reason);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkAccess = async () => {
      setIsAuthChecking(true);
      try {
        if (!supabase.functions) {
          throw new Error('Supabase Edge Functions client not available');
        }
        const { data, error: funcError } = await supabase.functions.invoke('manage-users', {
          body: { action: 'list' },
        });

        if (funcError) {
          let reason: string = funcError.message || 'Unknown error';
          if (funcError.context && typeof funcError.context.clone === 'function') {
            try {
              const body = await funcError.context.clone().json();
              if (body?.error) reason = body.error;
            } catch (_) {}
          }
          if (funcError.status === 403) reason = 'Access denied: Your account does not have the admin role required to access User Management.';
          else if (funcError.status === 401) reason = 'Unauthorized: Missing or invalid authentication token. Try logging out and back in.';
          setAuthError(reason);
        } else if (data?.error) {
          setAuthError(data.error);
        } else {
          // Access OK — load full users list
          await loadUsers();
        }
      } catch (err: any) {
        setAuthError(err.message || 'Failed to verify access.');
      } finally {
        setIsAuthChecking(false);
      }
    };
    checkAccess();
    }, []);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const name = (u.user_metadata?.full_name || '').toLowerCase();
      const mail = u.email.toLowerCase();
      const query = searchQuery.toLowerCase();
      return name.includes(query) || mail.includes(query);
    });
  }, [users, searchQuery]);

  // Paginated users
  const paginatedUsers = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredUsers.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredUsers, page, rowsPerPage]);

  // Handlers
  const handleOpenCreate = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setRole('admin');
    setError(null);
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (user: UserProfile) => {
    setSelectedUser(user);
    setEmail(user.email);
    setPassword('');
    setConfirmEditPassword('');
    setFullName(user.user_metadata?.full_name || '');
    setRole(user.profile_role ?? 'admin');
    setIsDisabled(!!user.banned_until);
    setError(null);
    setIsEditOpen(true);
  };

  const handleOpenDelete = (user: UserProfile) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error: funcError } = await supabase.functions.invoke('manage-users', {
        body: {
          action: 'create',
          params: { email, password, fullName, role },
        },
      });
      if (funcError) throw funcError;
      if (data.error) throw new Error(data.error);

      setIsCreateOpen(false);
      await loadUsers();
    } catch (err: any) {
      setError(await getFunctionErrorMessage(err));
      setIsLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setError(null);

    if (password !== confirmEditPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error: funcError } = await supabase.functions.invoke('manage-users', {
        body: {
          action: 'update',
          params: {
            id: selectedUser.id,
            email,
            password: password || undefined,
            fullName,
            role,
            isDisabled,
          },
        },
      });
      if (funcError) throw funcError;
      if (data.error) throw new Error(data.error);

      setIsEditOpen(false);
      await loadUsers();
    } catch (err: any) {
      setError(await getFunctionErrorMessage(err));
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: funcError } = await supabase.functions.invoke('manage-users', {
        body: {
          action: 'delete',
          params: { id: selectedUser.id },
        },
      });
      if (funcError) throw funcError;
      if (data?.error) throw new Error(data.error);

      setIsDeleteOpen(false);
      await loadUsers();
    } catch (err: any) {
      setError(await getFunctionErrorMessage(err));
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Box>
      {authError && (
        <Alert
          severity="error"
          sx={{
            mb: 4,
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
          }}
        >
          <Stack spacing={1}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Access Denied
            </Typography>
            <Typography variant="body2">{authError}</Typography>
          </Stack>
        </Alert>
      )}

      {!authError && (isAuthChecking || isLoading ? (
        <AdminTableSkeleton />
      ) : (
      <>
      {/* Header */}
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'flex-start' },
          gap: 2,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Button
            component={Link}
            href="/admin"
            startIcon={<ArrowLeft size={18} />}
            sx={{ mb: 2, color: theme.palette.text.secondary, textTransform: 'none', fontWeight: 600 }}
          >
            Back to Dashboard
          </Button>
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, mb: 1, display: 'flex', alignItems: 'center', gap: 2 }}
          >
            <Users size={32} color={theme.palette.primary.main} />
            User Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage dashboard users, register new accounts, and configure roles and login permissions.
          </Typography>
        </Box>
          <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={handleOpenCreate}
          sx={{
            borderRadius: 2,
            px: 2,
            py: 1.5,
            fontWeight: 700,
            boxShadow: theme.shadows[4],
          }}
        >
          Add New User
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 4,
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
          }}
        >
          <Stack spacing={1}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Connection Error
            </Typography>
            <Typography variant="body2">
              {error}
            </Typography>
          </Stack>
        </Alert>
      )}

      {/* Main Content Card */}
      <Card sx={{ borderRadius: 3, boxShadow: theme.shadows[2], mb: 4 }}>
        <CardContent sx={{ p: 0 }}>
          {/* Table Toolbar */}
          <Box
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'stretch', sm: 'center' },
              gap: 2,
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}
          >
            <TextField
              size="small"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0);
              }}
              sx={{ width: { xs: '100%', sm: 320 } }}
              InputProps={{
                startAdornment: <Search size={18} style={{ marginRight: 8, color: theme.palette.text.secondary }} />,
                endAdornment: searchQuery && (
                  <IconButton size="small" onClick={() => setSearchQuery('')}>
                    <X size={16} />
                  </IconButton>
                ),
              }}
            />
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshCw size={16} />}
              onClick={() => loadUsers()}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Refresh Table
            </Button>
          </Box>

          {/* Table / Skeleton loading */}
          {isLoading ? (
            <AdminTableSkeleton />
          ) : (
            <>
              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table sx={{ minWidth: 800 }}>
                  <TableHead sx={{ bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Full Name</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Email Address</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Created Date</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Last Login</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, pr: 3 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                          <Typography variant="body1" color="text.secondary">
                            No users found matching your search.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedUsers.map((user) => {
                        const isBanned = !!user.banned_until;
                        return (
                          <TableRow key={user.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                            <TableCell sx={{ py: 2 }}>
                              <Stack direction="row" spacing={1.5} alignItems="center">
                                <Box
                                  sx={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: '50%',
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    color: theme.palette.primary.main,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 700,
                                  }}
                                >
                                  {(user.user_metadata?.full_name || user.email)[0].toUpperCase()}
                                </Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                  {user.user_metadata?.full_name || 'No Name Provided'}
                                </Typography>
                              </Stack>
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              {(() => {
                                const userRole = user.profile_role ?? 'user';
                                return userRole === 'admin' ? (
                                  <Chip
                                    icon={<Shield size={12} />}
                                    label="Admin"
                                    size="small"
                                    color="primary"
                                    variant="filled"
                                    sx={{ fontWeight: 600 }}
                                  />
                                ) : (
                                  <Chip
                                    icon={<User size={12} />}
                                    label="User"
                                    size="small"
                                    color="info"
                                    variant="outlined"
                                    sx={{ fontWeight: 600 }}
                                  />
                                );
                              })()}
                            </TableCell>
                            <TableCell>{formatDate(user.created_at)}</TableCell>
                            <TableCell>{formatDate(user.last_sign_in_at)}</TableCell>
                            <TableCell>
                              {isBanned ? (
                                <Chip
                                  icon={<AlertTriangle size={12} />}
                                  label="Disabled"
                                  size="small"
                                  color="error"
                                  variant="outlined"
                                  sx={{ fontWeight: 600 }}
                                />
                              ) : (
                                <Chip
                                  icon={<CheckCircle2 size={12} />}
                                  label="Active"
                                  size="small"
                                  color="success"
                                  variant="filled"
                                  sx={{ fontWeight: 600 }}
                                />
                              )}
                            </TableCell>
                            <TableCell align="right" sx={{ pr: 3 }}>
                              <IconButton
                                size="small"
                                onClick={() => handleOpenEdit(user)}
                                color="primary"
                                title="Edit user details"
                              >
                                <Edit2 size={18} />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleOpenDelete(user)}
                                color="error"
                                title="Delete user"
                                sx={{ ml: 1 }}
                              >
                                <Trash2 size={18} />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredUsers.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onClose={() => setIsCreateOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 800, borderBottom: `1px solid ${theme.palette.divider}` }}>
          Register New User
        </DialogTitle>
        <form onSubmit={handleCreate}>
          <DialogContent sx={{ pt: 3 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {error}
              </Alert>
            )}
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                InputProps={{
                  startAdornment: <User size={18} style={{ marginRight: 8, color: theme.palette.text.secondary }} />,
                }}
                required
              />
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  startAdornment: <Mail size={18} style={{ marginRight: 8, color: theme.palette.text.secondary }} />,
                }}
                required
              />
              <TextField
                fullWidth
                label="Initial Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: <Lock size={18} style={{ marginRight: 8, color: theme.palette.text.secondary }} />,
                  endAdornment: (
                    <IconButton
                      size="small"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </IconButton>
                  ),
                }}
                helperText="Minimum 6 characters"
                required
              />
              <TextField
                fullWidth
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                InputProps={{
                  startAdornment: <Lock size={18} style={{ marginRight: 8, color: theme.palette.text.secondary }} />,
                  endAdornment: (
                    <IconButton
                      size="small"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </IconButton>
                  ),
                }}
                helperText="Re-enter password"
                required
              />
              <FormControl fullWidth>
                <InputLabel id="create-role-label">Role</InputLabel>
                <Select
                  labelId="create-role-label"
                  value={role}
                  label="Role"
                  onChange={(e) => setRole(e.target.value as UserRole)}
                >
                  <MenuItem value="admin">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Shield size={16} />
                      <span>Admin — full dashboard access</span>
                    </Stack>
                  </MenuItem>
                  <MenuItem value="user">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <User size={16} />
                      <span>User — limited access</span>
                    </Stack>
                  </MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, borderTop: `1px solid ${theme.palette.divider}`, pt: 2 }}>
            <Button onClick={() => setIsCreateOpen(false)} color="inherit" sx={{ fontWeight: 600 }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={isLoading} sx={{ fontWeight: 700 }}>
              {isLoading ? 'Registering...' : 'Register'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onClose={() => setIsEditOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 800, borderBottom: `1px solid ${theme.palette.divider}` }}>
          Edit User Details
        </DialogTitle>
        <form onSubmit={handleEdit}>
          <DialogContent sx={{ pt: 3 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {error}
              </Alert>
            )}
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                InputProps={{
                  startAdornment: <User size={18} style={{ marginRight: 8, color: theme.palette.text.secondary }} />,
                }}
                required
              />
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  startAdornment: <Mail size={18} style={{ marginRight: 8, color: theme.palette.text.secondary }} />,
                }}
                required
              />
              <TextField
                fullWidth
                label="Reset Password"
                type={showEditPassword ? "text" : "password"}
                placeholder="Leave blank to keep current"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: <Lock size={18} style={{ marginRight: 8, color: theme.palette.text.secondary }} />,
                  endAdornment: (
                    <IconButton
                      size="small"
                      onClick={() => setShowEditPassword(!showEditPassword)}
                      edge="end"
                    >
                      {showEditPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </IconButton>
                  ),
                }}
                helperText="Only fill this to reset their password"
              />
              <TextField
                fullWidth
                label="Confirm Reset Password"
                type={showConfirmEditPassword ? "text" : "password"}
                placeholder="Leave blank to keep current"
                value={confirmEditPassword}
                onChange={(e) => setConfirmEditPassword(e.target.value)}
                InputProps={{
                  startAdornment: <Lock size={18} style={{ marginRight: 8, color: theme.palette.text.secondary }} />,
                  endAdornment: (
                    <IconButton
                      size="small"
                      onClick={() => setShowConfirmEditPassword(!showConfirmEditPassword)}
                      edge="end"
                    >
                      {showConfirmEditPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </IconButton>
                  ),
                }}
                helperText="Re-enter new password"
              />
              <FormControl fullWidth>
                <InputLabel id="edit-role-label">Role</InputLabel>
                <Select
                  labelId="edit-role-label"
                  value={role}
                  label="Role"
                  onChange={(e) => setRole(e.target.value as UserRole)}
                >
                  <MenuItem value="admin">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Shield size={16} />
                      <span>Admin — full dashboard access</span>
                    </Stack>
                  </MenuItem>
                  <MenuItem value="user">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <User size={16} />
                      <span>User — limited access</span>
                    </Stack>
                  </MenuItem>
                </Select>
              </FormControl>
              <Divider sx={{ my: 1 }} />
              <FormControlLabel
                control={
                  <Switch
                    checked={isDisabled}
                    onChange={(e) => setIsDisabled(e.target.checked)}
                    color="error"
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {isDisabled ? 'Disable Access (Banned)' : 'Allow Access (Active)'}
                  </Typography>
                }
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, borderTop: `1px solid ${theme.palette.divider}`, pt: 2 }}>
            <Button onClick={() => setIsEditOpen(false)} color="inherit" sx={{ fontWeight: 600 }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={isLoading} sx={{ fontWeight: 700 }}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onClose={() => setIsDeleteOpen(false)}>
        <DialogTitle sx={{ fontWeight: 800 }}>Delete User</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete admin account <strong>{selectedUser?.email}</strong>?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 1, fontWeight: 600 }}>
            This action is permanent and cannot be undone. The user will lose all access to the dashboard.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setIsDeleteOpen(false)} color="inherit" sx={{ fontWeight: 600 }}>
            Cancel
          </Button>
          <Button onClick={handleDelete} variant="contained" color="error" disabled={isLoading} sx={{ fontWeight: 700 }}>
            {isLoading ? 'Deleting...' : 'Delete Permanently'}
          </Button>
        </DialogActions>
      </Dialog>
      </>
      ))}
    </Box>
  );
}
