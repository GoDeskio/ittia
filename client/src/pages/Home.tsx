import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    {
      title: 'Voice Recording',
      description: 'Record your voice with high-quality audio capture',
      image: '/images/voice-recording.jpg',
    },
    {
      title: 'Emotion Analysis',
      description: 'Advanced AI-powered emotion detection from voice',
      image: '/images/emotion-analysis.jpg',
    },
    {
      title: 'QR Code Generation',
      description: 'Generate QR codes for easy sharing and access',
      image: '/images/qr-code.jpg',
    },
  ];

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          pt: 8,
          pb: 6,
          textAlign: 'center',
        }}
      >
        <Typography
          component="h1"
          variant="h2"
          color="text.primary"
          gutterBottom
        >
          Welcome to VoiceVault
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Your secure platform for voice recording and emotion analysis
        </Typography>
        <Box sx={{ mt: 4 }}>
          {!user && (
            <Grid container spacing={2} justifyContent="center">
              <Grid item>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/register')}
                >
                  Get Started
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/login')}
                >
                  Login
                </Button>
              </Grid>
            </Grid>
          )}
          {user && (
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={4} sx={{ mt: 4 }}>
        {features.map((feature) => (
          <Grid item key={feature.title} xs={12} sm={6} md={4}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <CardMedia
                component="img"
                sx={{
                  height: 200,
                }}
                image={feature.image}
                alt={feature.title}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2">
                  {feature.title}
                </Typography>
                <Typography>{feature.description}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
} 