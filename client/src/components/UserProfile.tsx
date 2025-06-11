import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Box,
  Chip,
  Divider,
  Paper
} from '@mui/material';
import AudioSamplePlayer from './shared/AudioSamplePlayer';

interface UserProfileProps {
  user: {
    id: string;
    name: string;
    age: number;
    hobbies: string[];
    avatarUrl?: string;
    bio?: string;
    location?: string;
    voiceSampleUrl?: string;
  };
}

export const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  return (
    <Paper elevation={3} sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar
              src={user.avatarUrl}
              alt={user.name}
              sx={{ width: 80, height: 80, mr: 2 }}
            />
            <Box>
              <Typography variant="h5" component="h1" gutterBottom>
                {user.name}
              </Typography>
              {user.location && (
                <Typography variant="body2" color="text.secondary">
                  📍 {user.location}
                </Typography>
              )}
            </Box>
          </Box>

          {user.bio && (
            <Typography variant="body1" paragraph>
              {user.bio}
            </Typography>
          )}

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Hobbies
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {user.hobbies.map((hobby, index) => (
                <Chip key={index} label={hobby} size="small" />
              ))}
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Voice Sample
            </Typography>
            <AudioSamplePlayer
              userName={user.name}
              age={user.age}
              hobbies={user.hobbies}
              audioUrl={user.voiceSampleUrl}
            />
          </Box>
        </CardContent>
      </Card>
    </Paper>
  );
};

export default UserProfile; 