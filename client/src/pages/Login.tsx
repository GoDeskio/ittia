import React, { useState } from 'react';
import { Box, Typography, styled } from '@mui/material';
import { Login as LoginIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  NeumorphicCard,
  NeumorphicButton,
  NeumorphicInput,
  NeumorphicIcon,
} from '../components/shared';

const Container = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
}));

const StyledForm = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: 400,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
}));

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // TODO: Implement login API call
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulated API call
      navigate('/dashboard');
    } catch (error) {
      setError('Invalid username or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container>
      <NeumorphicCard>
        <StyledForm component="form" onSubmit={handleSubmit}>
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <NeumorphicIcon size={48}>
              <LoginIcon />
            </NeumorphicIcon>
            <Typography variant="h5" sx={{ mt: 2 }}>
              Welcome Back
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Please sign in to continue
            </Typography>
          </Box>

          <NeumorphicInput
            fullWidth
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <NeumorphicInput
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <NeumorphicButton
              fullWidth
              variant="convex"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </NeumorphicButton>
            <NeumorphicButton
              variant="flat"
              onClick={() => navigate('/register')}
            >
              Register
            </NeumorphicButton>
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <NeumorphicButton
              variant="flat"
              onClick={() => navigate('/forgot-credentials')}
              sx={{ textTransform: 'none' }}
            >
              Forgot Username or Password?
            </NeumorphicButton>
          </Box>

          {error && (
            <Typography color="error" textAlign="center" variant="body2">
              {error}
            </Typography>
          )}
        </StyledForm>
      </NeumorphicCard>
    </Container>
  );
};

export default Login; 