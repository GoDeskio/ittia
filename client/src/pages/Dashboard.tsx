import React from 'react';
import { Box, Typography } from '@mui/material';
import { NeumorphicCard } from '../components/shared';

const Dashboard: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <NeumorphicCard>
        <Typography variant="h4">Welcome to Your Dashboard</Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          You have successfully logged in.
        </Typography>
      </NeumorphicCard>
    </Box>
  );
};

export default Dashboard; 