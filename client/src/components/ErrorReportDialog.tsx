import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  AddPhotoAlternate as AddPhotoIcon,
} from '@mui/icons-material';
import axios from 'axios';

interface ErrorReportDialogProps {
  open: boolean;
  onClose: () => void;
  errorType?: string;
  errorStack?: string;
}

export const ErrorReportDialog: React.FC<ErrorReportDialogProps> = ({
  open,
  onClose,
  errorType = '',
  errorStack = '',
}) => {
  const [description, setDescription] = useState('');
  const [screenshots, setScreenshots] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScreenshotSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length + screenshots.length > 10) {
      setError('Maximum 10 screenshots allowed');
      return;
    }

    const validFiles = files.filter(file => {
      const isValid = file.type.startsWith('image/');
      if (!isValid) {
        setError('Only image files are allowed');
      }
      return isValid;
    });

    setScreenshots(prev => [...prev, ...validFiles]);
    setError(null);
  }, [screenshots]);

  const handleRemoveScreenshot = (index: number) => {
    setScreenshots(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);

      const formData = new FormData();
      formData.append('errorType', errorType || 'User Reported Error');
      formData.append('description', description);
      if (errorStack) {
        formData.append('stackTrace', errorStack);
      }

      screenshots.forEach(file => {
        formData.append('screenshots', file);
      });

      await axios.post('/api/error/report', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      onClose();
    } catch (err) {
      setError('Failed to submit error report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Report an Issue
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Error Type: {errorType || 'User Reported Error'}
          </Typography>
          
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please describe what you were doing when the error occurred and any other relevant details..."
            sx={{ mt: 2 }}
          />

          {errorStack && (
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Error Details"
              value={errorStack}
              InputProps={{ readOnly: true }}
              sx={{ mt: 2 }}
            />
          )}
        </Box>

        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Screenshots (Optional)
          </Typography>
          
          <input
            accept="image/*"
            id="screenshot-input"
            type="file"
            multiple
            onChange={handleScreenshotSelect}
            style={{ display: 'none' }}
          />
          
          <label htmlFor="screenshot-input">
            <Button
              component="span"
              variant="outlined"
              startIcon={<AddPhotoIcon />}
              disabled={screenshots.length >= 10}
            >
              Add Screenshots
            </Button>
          </label>

          <Typography variant="caption" color="textSecondary" sx={{ ml: 2 }}>
            {`${screenshots.length}/10 screenshots added`}
          </Typography>

          {screenshots.length > 0 && (
            <List>
              {screenshots.map((file, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={file.name}
                    secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleRemoveScreenshot(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}

          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={!description || submitting}
        >
          {submitting ? 'Submitting...' : 'Submit Report'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 