import React, { useState, useEffect } from 'react';
import { Box, Typography, styled, Alert } from '@mui/material';
import { Login as LoginIcon, Error as ErrorIcon } from '@mui/icons-material';
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
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();
  const { login, user, loading } = useAuth();

  // Clear error when user starts typing
  useEffect(() => {
    if (loginError && (email || password)) {
      setLoginError('');
    }
  }, [email, password, loginError]);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!email.trim() || !password.trim()) {
      setLoginError('Please enter both email and password');
      return;
    }

    setIsSubmitting(true);
    setLoginError('');

    try {
      await login(email, password);
      // Navigation will be handled by the useEffect above
    } catch (error: any) {
      console.error('Login error:', error);
      // Set a user-friendly error message
      if (error.response?.status === 401) {
        setLoginError('Your username or password was incorrect');
      } else if (error.response?.status === 429) {
        setLoginError('Too many login attempts. Please try again later');
      } else if (error.response?.data?.message) {
        setLoginError(error.response.data.message);
      } else {
        setLoginError('Your username or password was incorrect');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  const handleForgotPasswordClick = () => {
    navigate('/forgot-credentials');
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

          {/* Error message above the email field */}
          {loginError && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2,
                backgroundColor: '#ffebee',
                color: '#c62828',
                border: '1px solid #ef5350',
                borderRadius: '8px',
                '& .MuiAlert-icon': {
                  color: '#c62828'
                }
              }}
            >
              {loginError}
            </Alert>
          )}

          <NeumorphicInput
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            disabled={isSubmitting}
          />

          <NeumorphicInput
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            disabled={isSubmitting}
          />

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', alignItems: 'center' }}>
            <NeumorphicButton
              variant="convex"
              type="submit"
              disabled={isSubmitting || !email.trim() || !password.trim()}
              sx={{ 
                minWidth: '120px', 
                maxWidth: '150px',
                opacity: isSubmitting ? 0.7 : 1
              }}
            >
              {isSubmitting ? 'Signing In...' : 'Login'}
            </NeumorphicButton>
            <NeumorphicButton
              variant="flat"
              onClick={handleRegisterClick}
              disabled={isSubmitting}
              sx={{ minWidth: '100px', maxWidth: '130px' }}
            >
              Register
            </NeumorphicButton>
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <NeumorphicButton
              variant="flat"
              onClick={handleForgotPasswordClick}
              disabled={isSubmitting}
              sx={{ 
                textTransform: 'none',
                fontSize: '14px',
                color: '#666'
              }}
            >
              Forgot Username or Password?
            </NeumorphicButton>
          </Box>
        </StyledForm>
      </NeumorphicCard>
    </Container>
  );
};

export default Login; 