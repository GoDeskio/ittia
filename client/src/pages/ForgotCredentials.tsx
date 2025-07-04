import React, { useState } from 'react';
import { Box, Typography, styled } from '@mui/material';
import { Email as EmailIcon } from '@mui/icons-material';
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

const ForgotCredentials: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      // TODO: Implement API call to send credentials
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulated API call
      setMessage('If an account exists with this email, we will send the credentials shortly.');
    } catch (error) {
      setMessage('An error occurred. Please try again later.');
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
              <EmailIcon />
            </NeumorphicIcon>
            <Typography variant="h5" sx={{ mt: 2 }}>
              Forgot Credentials
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Enter your email address and we'll send you your username and password.
            </Typography>
          </Box>

          <NeumorphicInput
            fullWidth
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <NeumorphicButton
              fullWidth
              variant="convex"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Credentials'}
            </NeumorphicButton>
            <NeumorphicButton
              variant="flat"
              onClick={() => navigate('/login')}
            >
              Back
            </NeumorphicButton>
          </Box>

          {message && (
            <Typography
              color={message.includes('error') ? 'error' : 'success'}
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

export default ForgotCredentials; 