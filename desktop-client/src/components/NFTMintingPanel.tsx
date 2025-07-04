import React, { useCallback } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { styled } from '@mui/material/styles';

interface NFTMintingPanelProps {
  onFileUpload: (file: File) => void;
  isMinting: boolean;
}

const DropzoneArea = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.primary.main}`,
  borderRadius: '15px',
  padding: '2rem',
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  background: theme.palette.mode === 'light' 
    ? 'linear-gradient(145deg, #e6e6e6, #ffffff)'
    : 'linear-gradient(145deg, #2a2a2a, #1a1a1a)',
  '&:hover': {
    background: theme.palette.mode === 'light'
      ? 'linear-gradient(145deg, #ffffff, #e6e6e6)'
      : 'linear-gradient(145deg, #1a1a1a, #2a2a2a)',
  },
}));

const NFTMintingPanel: React.FC<NFTMintingPanelProps> = ({ onFileUpload, isMinting }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileUpload(acceptedFiles[0]);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
      'audio/*': ['.mp3', '.wav'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
  });

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Mint New NFT
      </Typography>
      
      <DropzoneArea {...getRootProps()}>
        <input {...getInputProps()} />
        {isMinting ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <CircularProgress />
            <Typography>Minting your NFT...</Typography>
          </Box>
        ) : isDragActive ? (
          <Typography>Drop the file here...</Typography>
        ) : (
          <Box>
            <Typography gutterBottom>
              Drag and drop a file here, or click to select
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Supported formats: PNG, JPEG, PDF, WAV, MP3
            </Typography>
          </Box>
        )}
      </DropzoneArea>

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          disabled={isMinting}
          onClick={() => document.querySelector('input')?.click()}
        >
          Select File
        </Button>
      </Box>
    </Box>
  );
};

export default NFTMintingPanel; 