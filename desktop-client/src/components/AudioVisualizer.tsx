import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';

interface AudioVisualizerProps {
  isActive: boolean;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const bars = 50;
  const barWidth = 4;
  const barGap = 2;
  const maxHeight = 60;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      if (!isActive) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#2196F3';

      for (let i = 0; i < bars; i++) {
        const height = Math.random() * maxHeight;
        const x = i * (barWidth + barGap);
        const y = (canvas.height - height) / 2;

        ctx.fillRect(x, y, barWidth, height);
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive]);

  return (
    <Box
      sx={{
        width: '100%',
        height: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.paper',
        borderRadius: 1,
        overflow: 'hidden',
      }}
    >
      <canvas
        ref={canvasRef}
        width={bars * (barWidth + barGap)}
        height={maxHeight}
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    </Box>
  );
}; 