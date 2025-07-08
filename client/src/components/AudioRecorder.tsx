import React, { useState, useEffect, useRef } from 'react';
import { Button, Box, Typography, CircularProgress } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';

interface AudioRecorderProps {
  onRecordingComplete?: (blob: Blob) => void;
  onRecordingStart?: () => void;
  onRecordingStop?: () => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ 
  onRecordingComplete, 
  onRecordingStart, 
  onRecordingStop 
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      stopRecording();
    };
  }, []);

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

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        if (onRecordingComplete) {
          onRecordingComplete(blob);
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

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      gap: 3,
    }}>
      {isRecording && (
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
          <CircularProgress 
            variant="determinate" 
            value={(recordingTime % 60) * 1.67} 
            size={80}
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
          }}>
            <Typography 
              variant="body2" 
              component="div" 
              sx={{ 
                color: '#4a4a4a',
                fontWeight: 600,
                fontSize: '0.9rem',
              }}
            >
              {formatTime(recordingTime)}
            </Typography>
          </Box>
        </Box>
      )}

      <Button
        variant="contained"
        size="large"
        onClick={isRecording ? stopRecording : startRecording}
        sx={{
          minWidth: 200,
          height: 50,
          borderRadius: '25px',
          fontSize: '1rem',
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
      
      {!isRecording && (
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#666666',
            textAlign: 'center',
            maxWidth: 300,
          }}
        >
          Click to start recording your voice. The recording will be automatically saved and processed.
        </Typography>
      )}
    </Box>
  );
};

export default AudioRecorder; 