import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  IconButton,
  Tooltip,
} from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import Tab from '@mui/material/Tab';
import {
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Storage as StorageIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import IconManagement from '../components/IconManagement';
import UserManagement from '../components/UserManagement';
import UploadSettings from '../components/UploadSettings';

interface SystemStats {
  totalUsers: number;
  totalCachedFiles: number;
  totalLibraryFiles: number;
  totalStorage: {
    cache: number;
    library: number;
  };
  activeUsers: number;
}

interface UserStats {
  _id: string;
  email: string;
  createdAt: string;
  storageQuota: {
    cache: number;
    library: number;
  };
  storageUsed: {
    cache: number;
    library: number;
  };
  cachedFilesCount: number;
  libraryFilesCount: number;
  totalCachedSize: number;
  totalLibrarySize: number;
}

const AdminDashboard: React.FC = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [users, setUsers] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [userActivity, setUserActivity] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('1');

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        axios.get('/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data);
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch data');
      setLoading(false);
    }
  };

  const handleDownloadSource = async () => {
    try {
      const response = await axios.get('/api/admin/source-code', {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'voicevault-source.zip');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to download source code');
    }
  };

  const handleViewActivity = async (userId: string) => {
    try {
      const response = await axios.get(`/api/admin/user-activity/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserActivity(response.data);
      setSelectedUser(userId);
    } catch (err) {
      setError('Failed to fetch user activity');
    }
  };

  const formatBytes = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round((bytes / Math.pow(1024, i)) * 100) / 100} ${sizes[i]}`;
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          God Mode Dashboard
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TabContext value={activeTab}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <TabList onChange={handleTabChange}>
              <Tab label="User Management" value="1" />
              <Tab label="Upload Settings" value="2" />
              <Tab label="Icon Management" value="3" />
            </TabList>
          </Box>
          <TabPanel value="1">
            <UserManagement />
          </TabPanel>
          <TabPanel value="2">
            <UploadSettings />
          </TabPanel>
          <TabPanel value="3">
            <IconManagement />
          </TabPanel>
        </TabContext>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PeopleIcon sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h6">{stats?.totalUsers}</Typography>
                    <Typography color="text.secondary">Total Users</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <StorageIcon sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h6">
                      {(stats?.totalCachedFiles || 0) + (stats?.totalLibraryFiles || 0)}
                    </Typography>
                    <Typography color="text.secondary">Total Files</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AssessmentIcon sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h6">
                      {formatBytes(
                        (stats?.totalStorage.cache || 0) +
                        (stats?.totalStorage.library || 0)
                      )}
                    </Typography>
                    <Typography color="text.secondary">Total Storage</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PeopleIcon sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h6">{stats?.activeUsers}</Typography>
                    <Typography color="text.secondary">Active Users (30d)</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ mb: 4 }}>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadSource}
          >
            Download Source Code
          </Button>
        </Box>

        <Paper sx={{ mb: 4 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Email</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Cache Usage</TableCell>
                  <TableCell>Library Usage</TableCell>
                  <TableCell>Total Files</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {formatBytes(user.storageUsed.cache)} / {formatBytes(user.storageQuota.cache)}
                    </TableCell>
                    <TableCell>
                      {formatBytes(user.storageUsed.library)} / {formatBytes(user.storageQuota.library)}
                    </TableCell>
                    <TableCell>
                      {user.cachedFilesCount + user.libraryFilesCount}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View Activity">
                        <IconButton
                          onClick={() => handleViewActivity(user._id)}
                          color={selectedUser === user._id ? 'primary' : 'default'}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {userActivity && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              User Activity
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Cache Files
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Filename</TableCell>
                        <TableCell>Size</TableCell>
                        <TableCell>Created</TableCell>
                        <TableCell>Processed</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {userActivity.cachedAudios.map((file: any) => (
                        <TableRow key={file._id}>
                          <TableCell>{file.filename}</TableCell>
                          <TableCell>{formatBytes(file.size)}</TableCell>
                          <TableCell>
                            {new Date(file.createdAt).toLocaleString()}
                          </TableCell>
                          <TableCell>{file.processed ? 'Yes' : 'No'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Library Files
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Filename</TableCell>
                        <TableCell>Size</TableCell>
                        <TableCell>Created</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {userActivity.audioFiles.map((file: any) => (
                        <TableRow key={file._id}>
                          <TableCell>{file.filename}</TableCell>
                          <TableCell>{formatBytes(file.size)}</TableCell>
                          <TableCell>
                            {new Date(file.createdAt).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default AdminDashboard; 