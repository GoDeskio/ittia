import React from 'react';
import { styled } from '@mui/material/styles';

interface NeumorphicProps {
  variant?: 'flat' | 'pressed' | 'convex';
  size?: 'small' | 'medium' | 'large';
  color?: string;
  children: React.ReactNode;
  className?: string;
}

const getShadow = (variant: string, size: string) => {
  const shadows = {
    flat: {
      small: '2px 2px 4px rgba(0,0,0,0.1), -2px -2px 4px rgba(255,255,255,0.8)',
      medium: '4px 4px 8px rgba(0,0,0,0.1), -4px -4px 8px rgba(255,255,255,0.8)',
      large: '6px 6px 12px rgba(0,0,0,0.1), -6px -6px 12px rgba(255,255,255,0.8)'
    },
    pressed: {
      small: 'inset 2px 2px 4px rgba(0,0,0,0.1), inset -2px -2px 4px rgba(255,255,255,0.8)',
      medium: 'inset 4px 4px 8px rgba(0,0,0,0.1), inset -4px -4px 8px rgba(255,255,255,0.8)',
      large: 'inset 6px 6px 12px rgba(0,0,0,0.1), inset -6px -6px 12px rgba(255,255,255,0.8)'
    },
    convex: {
      small: '2px 2px 4px rgba(0,0,0,0.1), -2px -2px 4px rgba(255,255,255,0.8), inset 1px 1px 2px rgba(255,255,255,0.8)',
      medium: '4px 4px 8px rgba(0,0,0,0.1), -4px -4px 8px rgba(255,255,255,0.8), inset 2px 2px 4px rgba(255,255,255,0.8)',
      large: '6px 6px 12px rgba(0,0,0,0.1), -6px -6px 12px rgba(255,255,255,0.8), inset 3px 3px 6px rgba(255,255,255,0.8)'
    }
  };
  return shadows[variant as keyof typeof shadows][size as keyof typeof shadows.flat];
};

const NeumorphicBase = styled('div')<NeumorphicProps>(({ theme, variant = 'flat', size = 'medium', color = theme.palette.background.default }) => ({
  backgroundColor: color,
  borderRadius: theme.shape.borderRadius,
  boxShadow: getShadow(variant, size),
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: variant === 'flat' ? getShadow('convex', size) : getShadow(variant, size),
  },
  '&:active': {
    boxShadow: getShadow('pressed', size),
  }
}));

export const Neumorphic: React.FC<NeumorphicProps> = ({ children, ...props }) => {
  return <NeumorphicBase {...props}>{children}</NeumorphicBase>;
};

export default Neumorphic; 