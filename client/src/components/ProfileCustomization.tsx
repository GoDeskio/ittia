import React, { useState, useRef } from 'react';
import {
  Box,
  Grid,
  Typography,
  Slider,
  IconButton,
  Dialog,
} from '@mui/material';
import {
  PhotoCamera as PhotoCameraIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
} from '@mui/icons-material';
import { ChromePicker } from 'react-color';
import { EnhancedButton, StyledCard } from './shared/StyledComponents';

interface ProfileCustomizationProps {
  stylePreferences: {
    primaryColor: string;
    secondaryColor: string;
    buttonColor: string;
    tableColor: string;
    commentBoxColor: string;
  };
  bannerImage?: {
    url: string;
    width: number;
    height: number;
    position: {
      x: number;
      y: number;
      scale: number;
    };
  };
  onStyleChange: (style: any) => void;
  onBannerChange: (banner: any) => void;
}

const ProfileCustomization: React.FC<ProfileCustomizationProps> = ({
  stylePreferences,
  bannerImage,
  onStyleChange,
  onBannerChange,
}) => {
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const [colorPickerAnchor, setColorPickerAnchor] = useState<null | HTMLElement>(null);
  const [isImageEditorOpen, setIsImageEditorOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleColorChange = (color: any, type: string) => {
    onStyleChange({
      ...stylePreferences,
      [type]: color.hex,
    });
  };

  const handleBannerUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create a URL for the uploaded image
    const url = URL.createObjectURL(file);
    
    // Get image dimensions
    const img = new Image();
    img.onload = () => {
      onBannerChange({
        url,
        width: img.width,
        height: img.height,
        position: {
          x: 50,
          y: 50,
          scale: 1,
        },
      });
      setIsImageEditorOpen(true);
    };
    img.src = url;
  };

  const handleBannerPosition = (type: 'x' | 'y' | 'scale', value: number) => {
    if (!bannerImage) return;
    
    onBannerChange({
      ...bannerImage,
      position: {
        ...bannerImage.position,
        [type]: value,
      },
    });
  };

  return (
    <StyledCard>
      <Box p={3}>
        <Typography variant="h6" gutterBottom>
          Profile Customization
        </Typography>

        {/* Color Customization */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" gutterBottom>
              Colors
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography>Primary Color</Typography>
                <Box
                  onClick={(e) => {
                    setActiveColor('primaryColor');
                    setColorPickerAnchor(e.currentTarget);
                  }}
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: stylePreferences.primaryColor,
                    borderRadius: 1,
                    cursor: 'pointer',
                    border: '2px solid #ddd',
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <Typography>Button Color</Typography>
                <Box
                  onClick={(e) => {
                    setActiveColor('buttonColor');
                    setColorPickerAnchor(e.currentTarget);
                  }}
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: stylePreferences.buttonColor,
                    borderRadius: 1,
                    cursor: 'pointer',
                    border: '2px solid #ddd',
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <Typography>Table Color</Typography>
                <Box
                  onClick={(e) => {
                    setActiveColor('tableColor');
                    setColorPickerAnchor(e.currentTarget);
                  }}
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: stylePreferences.tableColor,
                    borderRadius: 1,
                    cursor: 'pointer',
                    border: '2px solid #ddd',
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <Typography>Comment Box Color</Typography>
                <Box
                  onClick={(e) => {
                    setActiveColor('commentBoxColor');
                    setColorPickerAnchor(e.currentTarget);
                  }}
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: stylePreferences.commentBoxColor,
                    borderRadius: 1,
                    cursor: 'pointer',
                    border: '2px solid #ddd',
                  }}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Banner Image Customization */}
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" gutterBottom>
              Banner Image
            </Typography>
            <Box
              sx={{
                height: 200,
                position: 'relative',
                backgroundColor: '#f5f5f5',
                backgroundImage: bannerImage ? `url(${bannerImage.url})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: `${bannerImage?.position.x}% ${bannerImage?.position.y}%`,
                borderRadius: 1,
              }}
            >
              <input
                type="file"
                hidden
                ref={fileInputRef}
                accept="image/*"
                onChange={handleBannerUpload}
              />
              <IconButton
                onClick={() => fileInputRef.current?.click()}
                sx={{ position: 'absolute', bottom: 8, right: 8 }}
              >
                <PhotoCameraIcon />
              </IconButton>
            </Box>
          </Grid>
        </Grid>

        {/* Color Picker Dialog */}
        <Dialog
          open={Boolean(colorPickerAnchor)}
          onClose={() => {
            setColorPickerAnchor(null);
            setActiveColor(null);
          }}
        >
          {activeColor && (
            <ChromePicker
              color={stylePreferences[activeColor as keyof typeof stylePreferences]}
              onChange={(color) => handleColorChange(color, activeColor)}
            />
          )}
        </Dialog>

        {/* Banner Image Editor Dialog */}
        <Dialog
          open={isImageEditorOpen}
          onClose={() => setIsImageEditorOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <Box p={3}>
            <Typography variant="h6" gutterBottom>
              Adjust Banner Image
            </Typography>
            
            <Box
              sx={{
                height: 300,
                backgroundImage: bannerImage ? `url(${bannerImage.url})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: `${bannerImage?.position.x}% ${bannerImage?.position.y}%`,
                borderRadius: 1,
                mb: 2,
              }}
            />

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography>Horizontal Position</Typography>
                <Slider
                  value={bannerImage?.position.x || 50}
                  onChange={(_, value) => handleBannerPosition('x', value as number)}
                  min={0}
                  max={100}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography>Vertical Position</Typography>
                <Slider
                  value={bannerImage?.position.y || 50}
                  onChange={(_, value) => handleBannerPosition('y', value as number)}
                  min={0}
                  max={100}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography>Zoom</Typography>
                <Box display="flex" alignItems="center">
                  <ZoomOutIcon />
                  <Slider
                    value={bannerImage?.position.scale || 1}
                    onChange={(_, value) => handleBannerPosition('scale', value as number)}
                    min={1}
                    max={2}
                    step={0.1}
                    sx={{ mx: 2 }}
                  />
                  <ZoomInIcon />
                </Box>
              </Grid>
            </Grid>

            <Box display="flex" justifyContent="flex-end" mt={2}>
              <EnhancedButton
                variant="contained"
                onClick={() => setIsImageEditorOpen(false)}
              >
                Done
              </EnhancedButton>
            </Box>
          </Box>
        </Dialog>
      </Box>
    </StyledCard>
  );
};

export default ProfileCustomization; 