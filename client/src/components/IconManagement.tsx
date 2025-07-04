import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Stack,
  TextField,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import axios from 'axios';

interface IconType {
  type: 'loading' | 'desktop' | 'mobile' | 'favicon';
  currentUrl: string;
  dimensions: {
    width: number;
    height: number;
  };
}

const IconManagement: React.FC = () => {
  const [selectedIconType, setSelectedIconType] = useState<string>('loading');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const iconTypes: IconType[] = [
    { type: 'loading', currentUrl: '/assets/loading.gif', dimensions: { width: 400, height: 400 } },
    { type: 'desktop', currentUrl: '/assets/desktop-icon.png', dimensions: { width: 256, height: 256 } },
    { type: 'mobile', currentUrl: '/assets/mobile-icon.png', dimensions: { width: 192, height: 192 } },
    { type: 'favicon', currentUrl: '/assets/favicon.ico', dimensions: { width: 32, height: 32 } },
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.match(/^image\/(jpeg|png|gif)$/i)) {
        setMessage({ type: 'error', text: 'Please upload a JPEG, PNG, or GIF file' });
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('icon', selectedFile);
    formData.append('type', selectedIconType);

    try {
      await axios.post('/api/admin/icons', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage({ type: 'success', text: 'Icon updated successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update icon' });
    }
  };

  return (
    <Card sx={{ p: 3 }}>
      <CardContent>
        <Stack spacing={3}>
          <Typography variant="h4" fontWeight="bold">Icon Management</Typography>
          
          {message && (
            <Alert severity={message.type}>
              {message.text}
            </Alert>
          )}
          
          <FormControl fullWidth>
            <InputLabel>Icon Type</InputLabel>
            <Select
              value={selectedIconType}
              onChange={(e) => setSelectedIconType(e.target.value)}
              label="Icon Type"
            >
              {iconTypes.map((icon) => (
                <MenuItem key={icon.type} value={icon.type}>
                  {icon.type.charAt(0).toUpperCase() + icon.type.slice(1)} Icon
                  ({icon.dimensions.width}x{icon.dimensions.height})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            type="file"
            inputProps={{ accept: "image/jpeg,image/png,image/gif" }}
            onChange={handleFileSelect}
            helperText="Select an image file to upload"
          />

          {previewUrl && (
            <Box>
              <Typography variant="body1" sx={{ mb: 1 }}>Preview:</Typography>
              <Box
                component="img"
                src={previewUrl}
                alt="Preview"
                sx={{
                  maxHeight: 200,
                  maxWidth: '100%',
                  objectFit: 'contain',
                }}
              />
            </Box>
          )}

          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={!selectedFile}
          >
            Upload Icon
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default IconManagement; 