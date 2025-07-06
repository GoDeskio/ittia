import React, { useState } from 'react';
import { Box, Typography, styled, Grid } from '@mui/material';
import { PersonAdd as PersonAddIcon } from '@mui/icons-material';
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
  maxWidth: 800,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
}));

const RequiredLabel = styled('span')(({ theme }) => ({
  color: theme.palette.error.main,
  marginLeft: '4px',
}));

interface RegistrationForm {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

const Registration: React.FC = () => {
  const [formData, setFormData] = useState<RegistrationForm>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (field: string, value: string) => {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      // TODO: Implement API call to register user
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulated API call
      setMessage('Registration successful! You can now login.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setMessage('An error occurred during registration. Please try again.');
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

          <Grid container spacing={3}>
            {/* Required Fields */}
            <Grid item xs={12} sm={6}>
              <NeumorphicInput
                fullWidth
                label={<>First Name<RequiredLabel>*</RequiredLabel></>}
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <NeumorphicInput
                fullWidth
                label={<>Last Name<RequiredLabel>*</RequiredLabel></>}
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <NeumorphicInput
                fullWidth
                label={<>Email<RequiredLabel>*</RequiredLabel></>}
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <NeumorphicInput
                fullWidth
                label={<>Phone Number<RequiredLabel>*</RequiredLabel></>}
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => handleChange('phoneNumber', e.target.value)}
                required
              />
            </Grid>

            {/* Optional Address Fields */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Home Address (Optional)
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <NeumorphicInput
                fullWidth
                label="Street Address"
                value={formData.address.street}
                onChange={(e) => handleChange('address.street', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <NeumorphicInput
                fullWidth
                label="City"
                value={formData.address.city}
                onChange={(e) => handleChange('address.city', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <NeumorphicInput
                fullWidth
                label="State"
                value={formData.address.state}
                onChange={(e) => handleChange('address.state', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <NeumorphicInput
                fullWidth
                label="ZIP Code"
                value={formData.address.zipCode}
                onChange={(e) => handleChange('address.zipCode', e.target.value)}
              />
            </Grid>
          </Grid>

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

export default Registration; 