import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  Paper,
  Alert,
  CircularProgress,
  Divider,
  InputAdornment,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface ProfileData {
  email: string;
  phoneNumber: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  storageQuota: {
    cache: number;
    library: number;
  };
  storageUsed: {
    cache: number;
    library: number;
  };
}

interface StorageUsage {
  quota: {
    cache: number;
    library: number;
  };
  used: {
    cache: number;
    library: number;
  };
  available: {
    cache: number;
    library: number;
  };
}

const ProfileSettings: React.FC = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [storageUsage, setStorageUsage] = useState<StorageUsage | null>(null);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Storage quota state
  const [newCacheQuota, setNewCacheQuota] = useState('');
  const [newLibraryQuota, setNewLibraryQuota] = useState('');

  const formatBytes = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [profileRes, storageRes] = await Promise.all([
          axios.get('/api/users/profile', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('/api/users/storage-usage', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        
        setProfile(profileRes.data);
        setStorageUsage(storageRes.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load profile data');
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await axios.put('/api/users/profile', {
        email: profile?.email,
        phoneNumber: profile?.phoneNumber,
        address: profile?.address
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setProfile(response.data);
      setSuccess('Profile updated successfully');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update profile');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      await axios.post('/api/users/change-password', {
        currentPassword,
        newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to change password');
    }
  };

  const handleStorageQuotaUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const cache = newCacheQuota ? parseInt(newCacheQuota) * 1024 * 1024 * 1024 : undefined; // Convert GB to bytes
      const library = newLibraryQuota ? parseInt(newLibraryQuota) * 1024 * 1024 * 1024 : undefined;

      const response = await axios.post('/api/users/storage-quota', {
        cache,
        library
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setStorageUsage({
        ...storageUsage!,
        quota: response.data.storageQuota
      });
      setSuccess('Storage quota updated successfully');
      setNewCacheQuota('');
      setNewLibraryQuota('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update storage quota');
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>Profile Settings</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Personal Information</Typography>
        <form onSubmit={handleProfileUpdate}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                value={profile?.email || ''}
                onChange={(e) => setProfile(prev => ({ ...prev!, email: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                value={profile?.phoneNumber || ''}
                onChange={(e) => setProfile(prev => ({ ...prev!, phoneNumber: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street Address"
                value={profile?.address?.street || ''}
                onChange={(e) => setProfile(prev => ({
                  ...prev!,
                  address: { ...prev!.address, street: e.target.value }
                }))}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="City"
                value={profile?.address?.city || ''}
                onChange={(e) => setProfile(prev => ({
                  ...prev!,
                  address: { ...prev!.address, city: e.target.value }
                }))}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="State"
                value={profile?.address?.state || ''}
                onChange={(e) => setProfile(prev => ({
                  ...prev!,
                  address: { ...prev!.address, state: e.target.value }
                }))}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="ZIP Code"
                value={profile?.address?.zipCode || ''}
                onChange={(e) => setProfile(prev => ({
                  ...prev!,
                  address: { ...prev!.address, zipCode: e.target.value }
                }))}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Country"
                value={profile?.address?.country || ''}
                onChange={(e) => setProfile(prev => ({
                  ...prev!,
                  address: { ...prev!.address, country: e.target.value }
                }))}
              />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary">
                Update Profile
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Change Password</Typography>
        <form onSubmit={handlePasswordChange}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="password"
                label="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="password"
                label="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="password"
                label="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary">
                Change Password
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Storage Management</Typography>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>Current Usage</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography>Cache Storage:</Typography>
              <Typography color="text.secondary">
                Used: {formatBytes(storageUsage?.used.cache || 0)} / {formatBytes(storageUsage?.quota.cache || 0)}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography>Library Storage:</Typography>
              <Typography color="text.secondary">
                Used: {formatBytes(storageUsage?.used.library || 0)} / {formatBytes(storageUsage?.quota.library || 0)}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 2 }} />

        <form onSubmit={handleStorageQuotaUpdate}>
          <Typography variant="subtitle1" gutterBottom>Update Storage Quota</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="number"
                label="New Cache Quota (GB)"
                value={newCacheQuota}
                onChange={(e) => setNewCacheQuota(e.target.value)}
                InputProps={{
                  endAdornment: <InputAdornment position="end">GB</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="number"
                label="New Library Quota (GB)"
                value={newLibraryQuota}
                onChange={(e) => setNewLibraryQuota(e.target.value)}
                InputProps={{
                  endAdornment: <InputAdornment position="end">GB</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary">
                Update Storage Quota
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default ProfileSettings; 