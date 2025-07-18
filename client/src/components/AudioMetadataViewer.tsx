import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  Mood as MoodIcon,
  GraphicEq as GraphicEqIcon,
  PlayArrow as PlayIcon,
} from '@mui/icons-material';
import { AudioMetadata, WordMetadata } from '../services/ElevenLabsService';

interface AudioMetadataViewerProps {
  metadata: AudioMetadata;
  audioUrl?: string;
  onPlayWord?: (word: WordMetadata) => void;
}

const AudioMetadataViewer: React.FC<AudioMetadataViewerProps> = ({
  metadata,
  audioUrl,
  onPlayWord,
}) => {
  const [expandedPanel, setExpandedPanel] = useState<string | false>('overview');

  const handleAccordionChange = (panel: string) => (
    event: React.SyntheticEvent,
    isExpanded: boolean
  ) => {
    setExpandedPanel(isExpanded ? panel : false);
  };

  const getEmotionColor = (emotion: string, value: number) => {
    const colors: { [key: string]: string } = {
      joy: '#4caf50',
      sadness: '#2196f3',
      anger: '#f44336',
      fear: '#9c27b0',
      surprise: '#ff9800',
      disgust: '#795548',
    };
    
    const opacity = Math.max(0.3, Math.min(1, value));
    const color = colors[emotion] || '#gray';
    return `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
  };

  const getDominantEmotion = (emotions: any) => {
    return Object.entries(emotions).reduce((a: any, b: any) => 
      a[1] > b[1] ? a : b
    )[0];
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(2);
    return `${mins}:${secs.padStart(5, '0')}`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const renderOverview = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <GraphicEqIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Audio Properties
            </Typography>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell><strong>Duration</strong></TableCell>
                  <TableCell>{metadata.duration.toFixed(2)} seconds</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Sample Rate</strong></TableCell>
                  <TableCell>{metadata.sampleRate} Hz</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Channels</strong></TableCell>
                  <TableCell>{metadata.channels}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Words Detected</strong></TableCell>
                  <TableCell>{metadata.words.length}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <MoodIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Overall Sentiment
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h4" color={metadata.overallEmotion?.score >= 0 ? 'success.main' : 'error.main'}>
                {metadata.overallEmotion?.score?.toFixed(2) || 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sentiment Score (-5 to +5)
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={((metadata.overallEmotion?.score || 0) + 5) * 10}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: '#ffcdd2',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: metadata.overallEmotion?.score >= 0 ? '#4caf50' : '#f44336',
                },
              }}
            />
          </CardContent>
        </Card>
      </Grid>

      {metadata.recordingLocation && (
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <LocationIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Recording Location
              </Typography>
              <Typography variant="body1">
                {metadata.recordingLocation.city && `${metadata.recordingLocation.city}, `}
                {metadata.recordingLocation.country}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Coordinates: {metadata.recordingLocation.latitude?.toFixed(6)}, {metadata.recordingLocation.longitude?.toFixed(6)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      )}

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <ScheduleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Recording Time
            </Typography>
            <Typography variant="body1">
              {formatDate(metadata.recordingTime)}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderWordTimeline = () => (
    <Timeline>
      {metadata.words.map((word, index) => {
        const dominantEmotion = getDominantEmotion(word.emotion.emotions);
        return (
          <TimelineItem key={index}>
            <TimelineSeparator>
              <TimelineDot
                sx={{
                  backgroundColor: getEmotionColor(dominantEmotion, word.emotion.emotions[dominantEmotion as keyof typeof word.emotion.emotions]),
                }}
              />
              {index < metadata.words.length - 1 && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="h6">
                  "{word.word}"
                </Typography>
                <Chip
                  label={dominantEmotion}
                  size="small"
                  sx={{
                    backgroundColor: getEmotionColor(dominantEmotion, word.emotion.emotions[dominantEmotion as keyof typeof word.emotion.emotions]),
                    color: 'white',
                  }}
                />
                {onPlayWord && (
                  <Tooltip title="Play word segment">
                    <IconButton size="small" onClick={() => onPlayWord(word)}>
                      <PlayIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
              <Typography variant="body2" color="text.secondary">
                {formatTime(word.startTime)} - {formatTime(word.endTime)} 
                (Confidence: {(word.confidence * 100).toFixed(1)}%)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sentiment: {word.emotion.sentiment.toFixed(2)}
              </Typography>
            </TimelineContent>
          </TimelineItem>
        );
      })}
    </Timeline>
  );

  const renderEmotionAnalysis = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Emotion Distribution by Word
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Word</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Joy</TableCell>
              <TableCell>Sadness</TableCell>
              <TableCell>Anger</TableCell>
              <TableCell>Fear</TableCell>
              <TableCell>Surprise</TableCell>
              <TableCell>Disgust</TableCell>
              <TableCell>Sentiment</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {metadata.words.map((word, index) => (
              <TableRow key={index}>
                <TableCell>
                  <strong>"{word.word}"</strong>
                </TableCell>
                <TableCell>
                  {formatTime(word.startTime)}
                </TableCell>
                <TableCell>
                  <LinearProgress
                    variant="determinate"
                    value={word.emotion.emotions.joy * 100}
                    sx={{ width: 60, backgroundColor: '#e8f5e8' }}
                  />
                  <Typography variant="caption">
                    {(word.emotion.emotions.joy * 100).toFixed(0)}%
                  </Typography>
                </TableCell>
                <TableCell>
                  <LinearProgress
                    variant="determinate"
                    value={word.emotion.emotions.sadness * 100}
                    sx={{ width: 60, backgroundColor: '#e3f2fd' }}
                  />
                  <Typography variant="caption">
                    {(word.emotion.emotions.sadness * 100).toFixed(0)}%
                  </Typography>
                </TableCell>
                <TableCell>
                  <LinearProgress
                    variant="determinate"
                    value={word.emotion.emotions.anger * 100}
                    sx={{ width: 60, backgroundColor: '#ffebee' }}
                  />
                  <Typography variant="caption">
                    {(word.emotion.emotions.anger * 100).toFixed(0)}%
                  </Typography>
                </TableCell>
                <TableCell>
                  <LinearProgress
                    variant="determinate"
                    value={word.emotion.emotions.fear * 100}
                    sx={{ width: 60, backgroundColor: '#f3e5f5' }}
                  />
                  <Typography variant="caption">
                    {(word.emotion.emotions.fear * 100).toFixed(0)}%
                  </Typography>
                </TableCell>
                <TableCell>
                  <LinearProgress
                    variant="determinate"
                    value={word.emotion.emotions.surprise * 100}
                    sx={{ width: 60, backgroundColor: '#fff3e0' }}
                  />
                  <Typography variant="caption">
                    {(word.emotion.emotions.surprise * 100).toFixed(0)}%
                  </Typography>
                </TableCell>
                <TableCell>
                  <LinearProgress
                    variant="determinate"
                    value={word.emotion.emotions.disgust * 100}
                    sx={{ width: 60, backgroundColor: '#efebe9' }}
                  />
                  <Typography variant="caption">
                    {(word.emotion.emotions.disgust * 100).toFixed(0)}%
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={word.emotion.sentiment.toFixed(2)}
                    size="small"
                    color={word.emotion.sentiment >= 0 ? 'success' : 'error'}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        Audio Analysis Results
      </Typography>

      <Accordion
        expanded={expandedPanel === 'overview'}
        onChange={handleAccordionChange('overview')}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Overview</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {renderOverview()}
        </AccordionDetails>
      </Accordion>

      <Accordion
        expanded={expandedPanel === 'timeline'}
        onChange={handleAccordionChange('timeline')}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Word Timeline</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {renderWordTimeline()}
        </AccordionDetails>
      </Accordion>

      <Accordion
        expanded={expandedPanel === 'emotions'}
        onChange={handleAccordionChange('emotions')}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Detailed Emotion Analysis</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {renderEmotionAnalysis()}
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default AudioMetadataViewer;