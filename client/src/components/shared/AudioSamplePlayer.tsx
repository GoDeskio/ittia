import React, { useState } from 'react';
import { IconButton, Box, Typography, CircularProgress } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';

interface AudioSamplePlayerProps {
  userName: string;
  age: number;
  hobbies: string[];
  audioUrl?: string;
}

export const AudioSamplePlayer: React.FC<AudioSamplePlayerProps> = ({
  userName,
  age,
  hobbies,
  audioUrl
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const sampleText = `Hello, my name is ${userName} and I am ${age} years old. I love to ${hobbies.join(', ')} and I'd love it if you used my voice for your Virtual Assistant.`;

  const handlePlay = async () => {
    if (!audio) {
      setIsLoading(true);
      try {
        // If no audio URL is provided, use text-to-speech as fallback
        if (!audioUrl) {
          const speech = new SpeechSynthesisUtterance(sampleText);
          speech.onend = () => {
            setIsPlaying(false);
            setIsLoading(false);
          };
          window.speechSynthesis.speak(speech);
          setIsPlaying(true);
          return;
        }

        // Load and play the actual audio file
        const newAudio = new Audio(audioUrl);
        await newAudio.play();
        setAudio(newAudio);
        setIsPlaying(true);
        
        newAudio.onended = () => {
          setIsPlaying(false);
        };
      } catch (error) {
        console.error('Error playing audio:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        await audio.play();
        setIsPlaying(true);
      }
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <IconButton
        onClick={handlePlay}
        disabled={isLoading}
        sx={{
          backgroundColor: 'primary.main',
          color: 'white',
          '&:hover': {
            backgroundColor: 'primary.dark',
          },
          width: 48,
          height: 48,
        }}
      >
        {isLoading ? (
          <CircularProgress size={24} color="inherit" />
        ) : isPlaying ? (
          <PauseIcon />
        ) : (
          <PlayArrowIcon />
        )}
      </IconButton>
      <Typography variant="body2" color="text.secondary">
        Click to hear voice sample
      </Typography>
    </Box>
  );
};

export default AudioSamplePlayer; 