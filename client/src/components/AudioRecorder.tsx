import React, { useState, useEffect, useRef } from 'react';
import { Button, Box, Typography, CircularProgress } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';

interface AudioRecorderProps {
  onRecordingComplete?: (blob: Blob) => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onRecordingComplete }) => {
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
      gap: 2,
      p: 2,
      borderRadius: 2,
      bgcolor: 'background.paper',
      boxShadow: 1
    }}>
      <Typography variant="h6" component="div">
        Voice Recorder
      </Typography>
      
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <CircularProgress 
          variant="determinate" 
          value={isRecording ? (recordingTime % 60) * 1.67 : 0} 
          color={isRecording ? "error" : "primary"}
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
          <Typography variant="caption" component="div" color="text.secondary">
            {formatTime(recordingTime)}
          </Typography>
        </Box>
      </Box>

      <Button
        variant="contained"
        color={isRecording ? "error" : "primary"}
        startIcon={isRecording ? <StopIcon /> : <MicIcon />}
        onClick={isRecording ? stopRecording : startRecording}
      >
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </Button>
    </Box>
  );
};

export default AudioRecorder; 