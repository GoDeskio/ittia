import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { generateVoiceLibraryQR } from '../utils/qrCodeGenerator';
import RegistrationSuccess from './RegistrationSuccess';

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { currentTheme } = useTheme();
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<{
    show: boolean;
    qrCode: string;
    libraryName: string;
    apiToken: string;
  }>({
    show: false,
    qrCode: '',
    libraryName: '',
    apiToken: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await register(formData.username, formData.email, formData.password);
      
      // Generate QR code for the new user's voice library
      const qrCode = await generateVoiceLibraryQR({
        libraryName: `${formData.username}'s Voice Library`,
        apiToken: response.apiToken,
        userId: response.user.id,
        timestamp: Date.now(),
      });

      setSuccess({
        show: true,
        qrCode,
        libraryName: `${formData.username}'s Voice Library`,
        apiToken: response.apiToken,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  const handleSuccessClose = () => {
    setSuccess((prev) => ({ ...prev, show: false }));
    navigate('/dashboard');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: currentTheme === 'dark' ? 'background.default' : 'grey.100',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 400,
          bgcolor: currentTheme === 'dark' ? 'background.paper' : 'background.default',
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Register
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            margin="normal"
            required
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3 }}
          >
            Register
          </Button>
        </form>
      </Paper>

      <RegistrationSuccess
        open={success.show}
        onClose={handleSuccessClose}
        qrCode={success.qrCode}
        libraryName={success.libraryName}
        apiToken={success.apiToken}
      />
    </Box>
  );
};

export default Register; 