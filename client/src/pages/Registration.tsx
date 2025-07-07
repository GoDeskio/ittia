import React, { useState } from 'react';
import { Box, Typography, styled } from '@mui/material';
import { PersonAdd as PersonAddIcon } from '@mui/icons-material';
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
  maxWidth: 800,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
}));

const RequiredLabel = styled('span')(({ theme }) => ({
  color: theme.palette.error.main,
  marginLeft: '4px',
}));

const Registration: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { register, error: authError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsSubmitting(false);
      return;
    }

    try {
      await register(username, email, password);
      setMessage('Registration successful! You can now login.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setError(authError || 'An error occurred during registration. Please try again.');
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
              <PersonAddIcon />
            </NeumorphicIcon>
            <Typography variant="h5" sx={{ mt: 2 }}>
              Create Account
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Fields marked with <RequiredLabel>*</RequiredLabel> are required
            </Typography>
          </Box>

          <NeumorphicInput
            fullWidth
            label={<>Username<RequiredLabel>*</RequiredLabel></>}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <NeumorphicInput
            fullWidth
            label={<>Email<RequiredLabel>*</RequiredLabel></>}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <NeumorphicInput
            fullWidth
            label={<>Password<RequiredLabel>*</RequiredLabel></>}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <NeumorphicInput
            fullWidth
            label={<>Confirm Password<RequiredLabel>*</RequiredLabel></>}
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <NeumorphicButton
              fullWidth
              variant="convex"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </NeumorphicButton>
            <NeumorphicButton
              variant="flat"
              onClick={() => navigate('/login')}
            >
              Back to Login
            </NeumorphicButton>
          </Box>

          {error && (
            <Typography
              color="error"
              textAlign="center"
              variant="body2"
            >
              {error}
            </Typography>
          )}

          {message && (
            <Typography
              color="success"
              textAlign="center"
              variant="body2"
            >
              {message}
            </Typography>
          )}
        </StyledForm>
      </NeumorphicCard>
    </Container>
  );
};

export default Registration; 