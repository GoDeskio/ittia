import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Avatar,
  Button,
  Grid,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Link
} from '@mui/material';
import {
  Edit as EditIcon,
  PhotoCamera as PhotoCameraIcon,
  Visibility as VisibilityIcon,
  Public as PublicIcon,
  Lock as LockIcon,
  Group as GroupIcon,
  QrCode as QrCodeIcon,
  LibraryBooks as LibraryBooksIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import {
  ProfileSection,
  EnhancedButton,
  VisibleTableContainer,
  ContentSection,
  EnhancedTextField,
  StyledTabs,
  StyledTab,
} from '../components/shared/StyledComponents';
import { useTheme } from '../contexts/ThemeContext';
import ProfileCustomization from '../components/ProfileCustomization';

interface Post {
  _id: string;
  content: string;
  media?: {
    url: string;
    type: 'image' | 'gif' | 'video';
    thumbnailUrl?: string;
  };
  visibility: 'public' | 'private' | 'followers';
  createdAt: string;
  likes: string[];
  comments: {
    author: {
      _id: string;
      name: string;
      profilePicture?: string;
    };
    content: string;
    createdAt: string;
  }[];
}

const Profile: React.FC<{ userId: string }> = ({ userId }) => {
  const { colors, bannerImage, isCurrentUser } = useTheme();
  const [activeTab, setActiveTab] = React.useState(0);
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qrCode, setQrCode] = useState<string>('');
  const [showQrDialog, setShowQrDialog] = useState(false);

  useEffect(() => {
    // Fetch profile data
    axios.get(`/api/users/${userId}/profile`)
      .then(response => {
        setProfile(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to fetch profile:', error);
        setLoading(false);
      });

    // Fetch QR code for voice library if this is the current user or public access
    if (userId) {
      axios.get(`/api/settings/validate-token/public-${userId}`)
        .then(response => {
          // This would be a public endpoint to get QR code
          // For now, we'll generate it on the client side
        })
        .catch(error => {
          console.log('QR code not available for this profile');
        });
    }
  }, [userId]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!profile) {
    return <div>Profile not found</div>;
  }

  // Use the profile's style preferences if viewing another user's profile
  const displayStyles = isCurrentUser(userId) ? colors : profile.stylePreferences;
  const displayBanner = isCurrentUser(userId) ? bannerImage : profile.bannerImage;

  return (
    <Grid container spacing={3}>
      {/* Profile Header with Banner */}
      <Grid item xs={12}>
        <Box
          sx={{
            height: 200,
            position: 'relative',
            backgroundColor: displayStyles.primaryColor,
            backgroundImage: displayBanner ? `url(${displayBanner.url})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: `${displayBanner?.position.x}% ${displayBanner?.position.y}%`,
            transform: `scale(${displayBanner?.position.scale || 1})`,
            borderRadius: 2,
            mb: 4,
          }}
        />
      </Grid>

      {/* Profile Content */}
      <Grid item xs={12}>
        <ProfileSection sx={{ backgroundColor: displayStyles.primaryColor }}>
          <div className="profile-header">
            <Grid container alignItems="center" spacing={2}>
              <Grid item>
                <Avatar 
                  src={profile.profilePicture}
                  sx={{ width: 120, height: 120 }}
                >
                  {profile.name[0]}
                </Avatar>
              </Grid>
              <Grid item xs>
                <Typography variant="h4">{profile.name}</Typography>
                <Typography variant="subtitle1" color="textSecondary">
                  @{profile.username}
                </Typography>
              </Grid>
              <Grid item>
                {isCurrentUser(userId) ? (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <EnhancedButton
                      variant="contained"
                      onClick={() => navigate('/settings')}
                      sx={{ backgroundColor: displayStyles.buttonColor }}
                    >
                      Edit Profile Settings
                    </EnhancedButton>
                    <EnhancedButton
                      variant="outlined"
                      startIcon={<QrCodeIcon />}
                      onClick={() => setShowQrDialog(true)}
                      sx={{ borderColor: displayStyles.buttonColor }}
                    >
                      Share Library
                    </EnhancedButton>
                  </Box>
                ) : (
                  <EnhancedButton
                    variant="contained"
                    startIcon={<LibraryBooksIcon />}
                    onClick={() => setShowQrDialog(true)}
                    sx={{ backgroundColor: displayStyles.buttonColor }}
                  >
                    Connect to Voice Library
                  </EnhancedButton>
                )}
              </Grid>
            </Grid>
          </div>
        </ProfileSection>
      </Grid>

      {/* Profile Tabs */}
      <Grid item xs={12}>
        <StyledTabs
          value={activeTab}
          onChange={handleTabChange}
          centered
          sx={{ backgroundColor: displayStyles.tableColor }}
        >
          <StyledTab label="Posts" />
          <StyledTab label="Activity" />
          <StyledTab label="About" />
        </StyledTabs>
      </Grid>

      {/* Content Sections */}
      <Grid item xs={12}>
        <ContentSection sx={{ backgroundColor: displayStyles.tableColor }}>
          {activeTab === 0 && (
            <VisibleTableContainer>
              {/* Posts content */}
              <Typography>User Posts</Typography>
            </VisibleTableContainer>
          )}
          {activeTab === 1 && (
            <VisibleTableContainer>
              {/* Activity content */}
              <Typography>User Activity</Typography>
            </VisibleTableContainer>
          )}
          {activeTab === 2 && (
            <div>
              <EnhancedTextField
                fullWidth
                label="Location"
                value={profile.location}
                disabled={!isCurrentUser(userId)}
                variant="outlined"
                margin="normal"
                sx={{ backgroundColor: displayStyles.commentBoxColor }}
              />
              <EnhancedTextField
                fullWidth
                label="Website"
                value={profile.website}
                disabled={!isCurrentUser(userId)}
                variant="outlined"
                margin="normal"
                sx={{ backgroundColor: displayStyles.commentBoxColor }}
              />
              <EnhancedTextField
                fullWidth
                multiline
                rows={4}
                label="About Me"
                value={profile.bio}
                disabled={!isCurrentUser(userId)}
                variant="outlined"
                margin="normal"
                sx={{ backgroundColor: displayStyles.commentBoxColor }}
              />
              {isCurrentUser(userId) && (
                <Typography variant="body2" color="textSecondary" mt={2}>
                  To edit your profile information, please visit your{' '}
                  <Link
                    component="button"
                    variant="body2"
                    onClick={() => navigate('/settings')}
                  >
                    settings dashboard
                  </Link>
                  .
                </Typography>
              )}
            </div>
          )}
        </ContentSection>
      </Grid>

      {/* QR Code Dialog */}
      <Dialog open={showQrDialog} onClose={() => setShowQrDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <QrCodeIcon />
            {isCurrentUser(userId) ? 'Share Your Voice Library' : `Connect to ${profile?.name}'s Voice Library`}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', p: 2 }}>
            {isCurrentUser(userId) ? (
              <Box>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Share this QR code to allow others to connect to your voice library.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<QrCodeIcon />}
                  onClick={() => {
                    setShowQrDialog(false);
                    navigate('/settings');
                  }}
                  fullWidth
                >
                  View QR Code in Settings
                </Button>
              </Box>
            ) : (
              <Box>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Request access to {profile?.name}'s voice library.
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  This will send a connection request that they can approve in their settings.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<LibraryBooksIcon />}
                  onClick={() => {
                    // Handle connection request
                    console.log('Requesting connection to', userId);
                    setShowQrDialog(false);
                  }}
                  fullWidth
                >
                  Request Library Access
                </Button>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowQrDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default Profile; 