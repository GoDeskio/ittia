import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  Alert,
  CircularProgress,
  Snackbar
} from '@mui/material';
import {
  Update as UpdateIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { UpdateService, UpdateCheckResult } from '../../../shared/updateService';

interface UpdateNotificationProps {
  autoCheck?: boolean;
  onUpdateAvailable?: (result: UpdateCheckResult) => void;
}

class WebUpdateService extends UpdateService {
  public getCurrentVersion(): string {
    // Get version from package.json or environment variable
    return process.env.REACT_APP_VERSION || '1.0.0';
  }
}

const UpdateNotification: React.FC<UpdateNotificationProps> = ({
  autoCheck = true,
  onUpdateAvailable
}) => {
  const [updateService] = useState(() => new WebUpdateService());
  const [updateResult, setUpdateResult] = useState<UpdateCheckResult | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [checking, setChecking] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    if (autoCheck) {
      updateService.startAutoCheck(handleUpdateAvailable);
    }

    return () => {
      updateService.stopAutoCheck();
    };
  }, [autoCheck, updateService]);

  const handleUpdateAvailable = (result: UpdateCheckResult) => {
    if (result.hasUpdate && result.versionInfo) {
      // Don't show if user has skipped this version and it's not critical
      if (!result.versionInfo.critical && updateService.shouldSkipVersion(result.versionInfo.version)) {
        return;
      }

      setUpdateResult(result);
      setShowDialog(true);
      
      if (onUpdateAvailable) {
        onUpdateAvailable(result);
      }
    }
  };

  const handleManualCheck = async () => {
    setChecking(true);
    try {
      // Clear skipped versions when manually checking
      updateService.clearSkippedVersions();
      
      const result = await updateService.checkForUpdates();
      
      if (result.hasUpdate) {
        setUpdateResult(result);
        setShowDialog(true);
      } else if (result.error) {
        setSnackbarMessage(`Update check failed: ${result.error}`);
        setSnackbarOpen(true);
      } else {
        setSnackbarMessage('You are running the latest version!');
        setSnackbarOpen(true);
      }
    } catch (error) {
      setSnackbarMessage('Failed to check for updates');
      setSnackbarOpen(true);
    } finally {
      setChecking(false);
    }
  };

  const handleUpdate = () => {
    if (updateResult?.versionInfo?.platform === 'web') {
      // For web apps, refresh the page to get the latest version
      window.location.reload();
    } else if (updateResult?.versionInfo?.downloadUrl) {
      // For other platforms, open download URL
      window.open(updateResult.versionInfo.downloadUrl, '_blank');
    }
    setShowDialog(false);
  };

  const handleSkip = () => {
    if (updateResult?.versionInfo) {
      updateService.skipVersion(updateResult.versionInfo.version);
    }
    setShowDialog(false);
  };

  const handleClose = () => {
    setShowDialog(false);
  };

  const formatReleaseDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <>
      {/* Manual Check Button */}
      <Button
        variant="outlined"
        startIcon={checking ? <CircularProgress size={16} /> : <RefreshIcon />}
        onClick={handleManualCheck}
        disabled={checking}
        sx={{ mb: 1 }}
      >
        {checking ? 'Checking...' : 'Check for Updates'}
      </Button>

      {/* Update Dialog */}
      <Dialog
        open={showDialog}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: 3
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            {updateResult?.versionInfo?.critical ? (
              <WarningIcon color="warning" />
            ) : (
              <UpdateIcon color="primary" />
            )}
            <Typography variant="h6">
              Update Available
            </Typography>
            {updateResult?.versionInfo?.critical && (
              <Chip
                label="Critical"
                color="warning"
                size="small"
                variant="outlined"
              />
            )}
          </Box>
        </DialogTitle>

        <DialogContent>
          {updateResult?.versionInfo && (
            <Box>
              <Alert 
                severity={updateResult.versionInfo.critical ? "warning" : "info"}
                sx={{ mb: 2 }}
              >
                {updateResult.versionInfo.critical 
                  ? "This is a critical security update. Please update immediately."
                  : "A new version is available with improvements and bug fixes."
                }
              </Alert>

              <Box mb={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Current Version: {updateResult.currentVersion}
                </Typography>
                <Typography variant="h6" color="primary">
                  Latest Version: {updateResult.versionInfo.version}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Released: {formatReleaseDate(updateResult.versionInfo.releaseDate)}
                </Typography>
              </Box>

              {updateResult.versionInfo.releaseNotes.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    What's New:
                  </Typography>
                  <List dense>
                    {updateResult.versionInfo.releaseNotes.map((note, index) => (
                      <ListItem key={index} sx={{ py: 0.5 }}>
                        <CheckCircleIcon 
                          color="success" 
                          sx={{ fontSize: 16, mr: 1 }} 
                        />
                        <ListItemText 
                          primary={note}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          {!updateResult?.versionInfo?.critical && (
            <Button onClick={handleSkip} color="inherit">
              Skip This Version
            </Button>
          )}
          <Button onClick={handleClose} color="inherit">
            Later
          </Button>
          <Button 
            onClick={handleUpdate} 
            variant="contained"
            startIcon={<UpdateIcon />}
          >
            {updateResult?.versionInfo?.platform === 'web' ? 'Refresh Now' : 'Download'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </>
  );
};

export default UpdateNotification;