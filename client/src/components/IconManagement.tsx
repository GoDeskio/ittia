import React, { useState, useEffect } from 'react';
import { Box, Button, FormControl, Input, Select, Text, VStack, Image, useToast } from '@chakra-ui/react';
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
  const toast = useToast();

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
        toast({
          title: 'Invalid file type',
          description: 'Please upload a JPEG, PNG, or GIF file',
          status: 'error',
          duration: 3000,
        });
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

      toast({
        title: 'Success',
        description: 'Icon updated successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update icon',
        status: 'error',
        duration: 3000,
      });
    }
  };

  return (
    <Box p={6} bg="white" borderRadius="lg" shadow="md">
      <VStack spacing={6} align="stretch">
        <Text fontSize="2xl" fontWeight="bold">Icon Management</Text>
        
        <FormControl>
          <Select
            value={selectedIconType}
            onChange={(e) => setSelectedIconType(e.target.value)}
          >
            {iconTypes.map((icon) => (
              <option key={icon.type} value={icon.type}>
                {icon.type.charAt(0).toUpperCase() + icon.type.slice(1)} Icon
                ({icon.dimensions.width}x{icon.dimensions.height})
              </option>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <Input
            type="file"
            accept="image/jpeg,image/png,image/gif"
            onChange={handleFileSelect}
          />
        </FormControl>

        {previewUrl && (
          <Box>
            <Text mb={2}>Preview:</Text>
            <Image
              src={previewUrl}
              alt="Preview"
              maxH="200px"
              objectFit="contain"
            />
          </Box>
        )}

        <Button
          colorScheme="blue"
          onClick={handleUpload}
          isDisabled={!selectedFile}
        >
          Upload Icon
        </Button>
      </VStack>
    </Box>
  );
};

export default IconManagement; 