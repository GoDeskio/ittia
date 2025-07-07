import React, { useState } from 'react';
import { Box, Typography, styled } from '@mui/material';
import { Login as LoginIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, error: authError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      setError(authError || 'Invalid email or password');
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
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', alignItems: 'center' }}>
            <NeumorphicButton
              variant="convex"
              type="submit"
              disabled={isSubmitting}
              sx={{ minWidth: '120px', maxWidth: '150px' }}
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </NeumorphicButton>
            <NeumorphicButton
              variant="flat"
              onClick={() => navigate('/register')}
              sx={{ minWidth: '100px', maxWidth: '130px' }}
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