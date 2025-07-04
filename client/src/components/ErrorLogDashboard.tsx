import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import axios from 'axios';
// import { DatePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';

interface ErrorLog {
  _id: string;
  timestamp: string;
  errorType: string;
  description: string;
  userId?: string;
  userAgent: string;
  route: string;
  stackTrace?: string;
  screenshots: string[];
  status: 'new' | 'in-progress' | 'resolved';
  resolution?: string;
  assignedTo?: string;
}

export const ErrorLogDashboard: React.FC = () => {
  const [logs, setLogs] = useState<ErrorLog[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedLog, setSelectedLog] = useState<ErrorLog | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    startDate: null as Date | null,
    endDate: null as Date | null,
    errorType: '',
  });

  const fetchLogs = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.startDate) params.append('startDate', filters.startDate.toISOString());
      if (filters.endDate) params.append('endDate', filters.endDate.toISOString());
      if (filters.errorType) params.append('errorType', filters.errorType);

      const response = await axios.get(`/api/error/logs?${params.toString()}`);
      setLogs(response.data);
    } catch (error) {
      console.error('Failed to fetch error logs:', error);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const handleStatusChange = async (logId: string, newStatus: string) => {
    try {
      await axios.patch(`/api/error/logs/${logId}`, {
        status: newStatus
      });
      fetchLogs();
    } catch (error) {
      console.error('Failed to update error status:', error);
    }
  };

  const handleUpdateResolution = async (logId: string, resolution: string) => {
    try {
      await axios.patch(`/api/error/logs/${logId}`, {
        resolution,
        status: 'resolved'
      });
      setViewerOpen(false);
      fetchLogs();
    } catch (error) {
      console.error('Failed to update resolution:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'error';
      case 'in-progress':
        return 'warning';
      case 'resolved':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Error Logs
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="new">New</MenuItem>
                <MenuItem value="in-progress">In Progress</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={filters.startDate ? filters.startDate.toISOString().split('T')[0] : ''}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value ? new Date(e.target.value) : null }))}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={filters.endDate ? filters.endDate.toISOString().split('T')[0] : ''}
              onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value ? new Date(e.target.value) : null }))}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Error Type"
              value={filters.errorType}
              onChange={(e) => setFilters(prev => ({ ...prev, errorType: e.target.value }))}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Error Logs Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Timestamp</TableCell>
              <TableCell>Error Type</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Screenshots</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((log) => (
                <TableRow key={log._id}>
                  <TableCell>{format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')}</TableCell>
                  <TableCell>{log.errorType}</TableCell>
                  <TableCell>{log.description.substring(0, 100)}...</TableCell>
                  <TableCell>
                    <Chip
                      label={log.status}
                      color={getStatusColor(log.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {log.screenshots.length > 0 && (
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedLog(log);
                          setSelectedImage(log.screenshots[0]);
                          setImageViewerOpen(true);
                        }}
                      >
                        <ImageIcon />
                      </IconButton>
                    )}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedLog(log);
                        setViewerOpen(true);
                      }}
                    >
                      <ViewIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={logs.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>

      {/* Error Details Dialog */}
      <Dialog
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedLog && (
          <>
            <DialogTitle>Error Details</DialogTitle>
            <DialogContent>
              <Typography variant="subtitle1" gutterBottom>
                Error Type: {selectedLog.errorType}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Description: {selectedLog.description}
              </Typography>
              {selectedLog.stackTrace && (
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Stack Trace"
                  value={selectedLog.stackTrace}
                  InputProps={{ readOnly: true }}
                  sx={{ mt: 2 }}
                />
              )}
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={selectedLog.status}
                  label="Status"
                  onChange={(e) => handleStatusChange(selectedLog._id, e.target.value)}
                >
                  <MenuItem value="new">New</MenuItem>
                  <MenuItem value="in-progress">In Progress</MenuItem>
                  <MenuItem value="resolved">Resolved</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Resolution"
                value={selectedLog.resolution || ''}
                onChange={(e) => handleUpdateResolution(selectedLog._id, e.target.value)}
                sx={{ mt: 2 }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setViewerOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Image Viewer Dialog */}
      <Dialog
        open={imageViewerOpen}
        onClose={() => setImageViewerOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        {selectedLog && (
          <>
            <DialogTitle>Screenshots</DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <img
                  src={selectedImage}
                  alt="Error Screenshot"
                  style={{ maxWidth: '100%', maxHeight: '70vh' }}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                {selectedLog.screenshots.map((screenshot, index) => (
                  <img
                    key={index}
                    src={screenshot}
                    alt={`Screenshot ${index + 1}`}
                    style={{
                      width: 100,
                      height: 100,
                      objectFit: 'cover',
                      cursor: 'pointer',
                      border: selectedImage === screenshot ? '2px solid #1976d2' : 'none',
                    }}
                    onClick={() => setSelectedImage(screenshot)}
                  />
                ))}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setImageViewerOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}; 