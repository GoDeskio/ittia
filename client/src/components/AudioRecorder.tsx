import React, { useState, useEffect, useRef } from 'react';
import { 
  Button, 
  Box, 
  Typography, 
  CircularProgress, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  Chip,
  Grid,
  Card,
  CardContent,
  LinearProgress
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import VoiceOverOffIcon from '@mui/icons-material/VoiceOverOff';
import ElevenLabsService, { Voice, AudioMetadata } from '../services/ElevenLabsService';
import WaveSurfer from 'wavesurfer.js';

interface AudioRecorderProps {
  onRecordingComplete?: (blob: Blob, metadata?: AudioMetadata) => void;
  onRecordingStart?: () => void;
  onRecordingStop?: () => void;
  enableElevenLabs?: boolean;
  enableMetadata?: boolean;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ 
  onRecordingComplete, 
  onRecordingStart, 
  onRecordingStop,
  enableElevenLabs = true,
  enableMetadata = true
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [audioMetadata, setAudioMetadata] = useState<AudioMetadata | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{latitude: number; longitude: number} | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);

  useEffect(() => {
    if (enableElevenLabs) {
      loadVoices();
    }
    if (enableMetadata) {
      getCurrentLocation();
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
      }
      stopRecording();
    };
  }, [enableElevenLabs, enableMetadata]);

  const loadVoices = async () => {
    try {
      const voiceList = await ElevenLabsService.getVoices();
      setVoices(voiceList);
      if (voiceList.length > 0) {
        setSelectedVoice(voiceList[0].voice_id);
      }
    } catch (error) {
      console.error('Error loading voices:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const location = await ElevenLabsService.getCurrentLocation();
      setCurrentLocation(location);
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        
        if (enableMetadata) {
          setIsProcessing(true);
          try {
            const audioFile = new File([blob], 'recording.webm', { type: 'audio/webm' });
            const result = await ElevenLabsService.processAudioWithMetadata(audioFile, currentLocation);
            setAudioMetadata(result.metadata);
            
            if (onRecordingComplete) {
              onRecordingComplete(blob, result.metadata);
            }
          } catch (error) {
            console.error('Error processing audio metadata:', error);
            if (onRecordingComplete) {
              onRecordingComplete(blob);
            }
          } finally {
            setIsProcessing(false);
          }
        } else {
          if (onRecordingComplete) {
            onRecordingComplete(blob);
          }
        }
      };

      mediaRecorderRef.current.start(1000);
      setIsRecording(true);
      
      // Call the onRecordingStart callback
      if (onRecordingStart) {
        onRecordingStart();
      }
      
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      // Request background permission if available
      if ('serviceWorker' in navigator && 'Notification' in window) {
        await Notification.requestPermission();
      }
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Failed to start recording. Please check microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      setRecordingTime(0);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Call the onRecordingStop callback
      if (onRecordingStop) {
        onRecordingStop();
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const convertSpeechToSpeech = async (audioBlob: Blob) => {
    if (!selectedVoice) return;
    
    setIsProcessing(true);
    try {
      const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
      const convertedAudio = await ElevenLabsService.speechToSpeech(audioFile, selectedVoice);
      
      // Play converted audio
      const audioUrl = URL.createObjectURL(convertedAudio);
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (error) {
      console.error('Error converting speech:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderEmotionChips = () => {
    if (!audioMetadata?.words) return null;

    const emotionColors: { [key: string]: string } = {
      joy: '#4caf50',
      sadness: '#2196f3',
      anger: '#f44336',
      fear: '#9c27b0',
      surprise: '#ff9800',
      disgust: '#795548',
    };

    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" gutterBottom>Word-Level Emotions</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {audioMetadata.words.map((wordData, index) => {
            const dominantEmotion = Object.entries(wordData.emotion.emotions)
              .reduce((a, b) => a[1] > b[1] ? a : b)[0];
            
            return (
              <Chip
                key={index}
                label={`${wordData.word} (${dominantEmotion})`}
                sx={{
                  backgroundColor: emotionColors[dominantEmotion] || '#gray',
                  color: 'white',
                  fontSize: '0.75rem',
                }}
                size="small"
              />
            );
          })}
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      gap: 3,
      maxWidth: 800,
      margin: '0 auto',
      p: 3,
    }}>
      {/* Voice Selection */}
      {enableElevenLabs && voices.length > 0 && (
        <Card sx={{ width: '100%', mb: 2 }}>
          <CardContent>
            <FormControl fullWidth>
              <InputLabel>Select Voice for Conversion</InputLabel>
              <Select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                label="Select Voice for Conversion"
              >
                {voices.map((voice) => (
                  <MenuItem key={voice.voice_id} value={voice.voice_id}>
                    {voice.name} ({voice.category})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </CardContent>
        </Card>
      )}

      {/* Recording Status */}
      {isRecording && (
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
          <CircularProgress 
            variant="determinate" 
            value={(recordingTime % 60) * 1.67} 
            size={120}
            thickness={4}
            sx={{
              color: '#ff6b6b',
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
              },
            }}
          />
          <Box sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
          }}>
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                color: '#4a4a4a',
                fontWeight: 600,
              }}
            >
              {formatTime(recordingTime)}
            </Typography>
            <Typography variant="caption" sx={{ color: '#666' }}>
              Recording...
            </Typography>
          </Box>
        </Box>
      )}

      {/* Waveform Visualization */}
      <Box 
        ref={waveformRef} 
        sx={{ 
          width: '100%', 
          height: 100, 
          border: '1px solid #ddd', 
          borderRadius: 2,
          display: isRecording ? 'block' : 'none'
        }} 
      />

      {/* Main Recording Button */}
      <Button
        variant="contained"
        size="large"
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcessing}
        sx={{
          minWidth: 250,
          height: 60,
          borderRadius: '30px',
          fontSize: '1.1rem',
          fontWeight: 600,
          textTransform: 'none',
          background: isRecording 
            ? 'linear-gradient(145deg, #ff6b6b, #ee5a52)'
            : 'linear-gradient(145deg, #2196F3, #1976D2)',
          boxShadow: isRecording
            ? '6px 6px 12px rgba(255,107,107,0.3), -6px -6px 12px rgba(255,255,255,0.7)'
            : '6px 6px 12px rgba(33,150,243,0.3), -6px -6px 12px rgba(255,255,255,0.7)',
          '&:hover': {
            background: isRecording 
              ? 'linear-gradient(145deg, #ee5a52, #ff6b6b)'
              : 'linear-gradient(145deg, #1976D2, #2196F3)',
            transform: 'translateY(-1px)',
            boxShadow: isRecording
              ? '8px 8px 16px rgba(255,107,107,0.4), -8px -8px 16px rgba(255,255,255,0.8)'
              : '8px 8px 16px rgba(33,150,243,0.4), -8px -8px 16px rgba(255,255,255,0.8)',
          },
          '&:active': {
            transform: 'translateY(0px)',
          },
        }}
        startIcon={isRecording ? <StopIcon /> : <MicIcon />}
      >
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </Button>

      {/* Processing Indicator */}
      {isProcessing && (
        <Box sx={{ width: '100%', mt: 2 }}>
          <Typography variant="body2" sx={{ mb: 1, textAlign: 'center' }}>
            Processing audio with AI analysis...
          </Typography>
          <LinearProgress />
        </Box>
      )}

      {/* Location Info */}
      {enableMetadata && currentLocation && (
        <Typography variant="caption" sx={{ color: '#666', textAlign: 'center' }}>
          📍 Location tracking enabled for metadata
        </Typography>
      )}

      {/* Metadata Display */}
      {audioMetadata && (
        <Card sx={{ width: '100%', mt: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recording Analysis
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2">
                  <strong>Duration:</strong> {audioMetadata.duration.toFixed(2)}s
                </Typography>
                <Typography variant="body2">
                  <strong>Sample Rate:</strong> {audioMetadata.sampleRate}Hz
                </Typography>
                <Typography variant="body2">
                  <strong>Channels:</strong> {audioMetadata.channels}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2">
                  <strong>Overall Sentiment:</strong> {audioMetadata.overallEmotion?.score || 'N/A'}
                </Typography>
                <Typography variant="body2">
                  <strong>Words Detected:</strong> {audioMetadata.words.length}
                </Typography>
                {audioMetadata.recordingLocation && (
                  <Typography variant="body2">
                    <strong>Location:</strong> {audioMetadata.recordingLocation.city || 'Unknown'}
                  </Typography>
                )}
              </Grid>
            </Grid>
            {renderEmotionChips()}
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      {!isRecording && !isProcessing && (
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#666666',
            textAlign: 'center',
            maxWidth: 400,
          }}
        >
          {enableElevenLabs 
            ? 'Record your voice and optionally convert it using AI voice cloning technology.'
            : 'Click to start recording your voice. The recording will be automatically saved and processed.'
          }
        </Typography>
      )}
    </Box>
  );
};

export default AudioRecorder; 