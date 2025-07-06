import React from 'react';
import { Container, Box } from '@mui/material';
import UserSettingsDashboard from '../components/UserSettingsDashboard';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const Settings: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <UserSettingsDashboard />
      </Box>
    </Container>
  );
};

export default Settings; 