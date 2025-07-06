import React from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Link,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
} from '@mui/material';
import {
  Code as CodeIcon,
  Person as PersonIcon,
  Build as BuildIcon,
  Copyright as CopyrightIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

const AboutPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            About VoiceVault
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Advanced Voice Recognition and Management System
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Creator Information */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PersonIcon sx={{ mr: 2 }} />
              <Typography variant="h6">Creator & Lead Developer</Typography>
            </Box>
            <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
              <List>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>DP</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Dustin Pennington"
                    secondary="Project Creator & Lead Developer"
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>

          {/* Application Information */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <InfoIcon sx={{ mr: 2 }} />
              <Typography variant="h6">Application Information</Typography>
            </Box>
            <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
              <Typography variant="body1" paragraph>
                VoiceVault is a sophisticated voice recognition and management system that allows users to record, analyze, and organize voice samples with advanced features including emotion detection, speaker identification, and comprehensive organization tools.
              </Typography>
              <Typography variant="body1" paragraph>
                Version: 1.0.0
              </Typography>
              <Typography variant="body1">
                Released: {new Date().getFullYear()}
              </Typography>
            </Paper>
          </Grid>

          {/* Features */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <BuildIcon sx={{ mr: 2 }} />
              <Typography variant="h6">Key Features</Typography>
            </Box>
            <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <List>
                    <ListItem>
                      <ListItemText 
                        primary="Voice Recognition"
                        secondary="Advanced speaker identification and verification"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Emotion Detection"
                        secondary="91 distinct emotions across 13 categories"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Organization System"
                        secondary="Hierarchical folders and comprehensive tagging"
                      />
                    </ListItem>
                  </List>
                </Grid>
                <Grid item xs={12} md={6}>
                  <List>
                    <ListItem>
                      <ListItemText 
                        primary="Real-time Processing"
                        secondary="Immediate voice analysis and categorization"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Security"
                        secondary="Role-based access control and encryption"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Analytics"
                        secondary="Comprehensive voice pattern analysis"
                      />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Copyright and License */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CopyrightIcon sx={{ mr: 2 }} />
              <Typography variant="h6">Copyright & License</Typography>
            </Box>
            <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
              <Typography variant="body1" paragraph>
                © {new Date().getFullYear()} Dustin Pennington. All rights reserved.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This software is protected by copyright law and international treaties.
                Unauthorized reproduction or distribution of this software, or any portion of it,
                may result in severe civil and criminal penalties.
              </Typography>
            </Paper>
          </Grid>

          {/* Technical Stack */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CodeIcon sx={{ mr: 2 }} />
              <Typography variant="h6">Technical Stack</Typography>
            </Box>
            <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle1" gutterBottom>
                    Frontend
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText primary="React" secondary="UI Framework" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="TypeScript" secondary="Programming Language" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Material-UI" secondary="Component Library" />
                    </ListItem>
                  </List>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle1" gutterBottom>
                    Backend
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText primary="Node.js" secondary="Runtime Environment" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Express" secondary="Web Framework" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="TypeScript" secondary="Programming Language" />
                    </ListItem>
                  </List>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle1" gutterBottom>
                    Infrastructure
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText primary="PostgreSQL" secondary="Database" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Redis" secondary="Caching" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Docker" secondary="Containerization" />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default AboutPage; 