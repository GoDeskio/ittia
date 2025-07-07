import React from 'react';
import { Button, ButtonProps } from '@mui/material';
import { styled } from '@mui/material/styles';
import Neumorphic from './NeumorphicBase';

interface NeumorphicButtonProps extends Omit<ButtonProps, 'variant'> {
  variant?: 'flat' | 'pressed' | 'convex';
  size?: 'small' | 'medium' | 'large';
}

const StyledButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(0.75, 1.5), // Reduced padding for smaller buttons
  minWidth: 'auto', // Allow buttons to be smaller
  fontSize: '0.875rem', // Slightly smaller font
  color: '#4a4a4a', // Dark grey text color
  fontWeight: 500,
  '&:hover': {
    backgroundColor: 'transparent',
    color: '#3a3a3a', // Slightly darker on hover
  },
  '&:active': {
    backgroundColor: 'transparent',
    color: '#2a2a2a', // Even darker when pressed
  },
  '&.Mui-disabled': {
    color: '#8a8a8a', // Lighter grey when disabled
  }
}));

const NeumorphicButton: React.FC<NeumorphicButtonProps> = ({ 
  children, 
  variant = 'flat',
  size = 'medium',
  ...props 
}) => {
  return (
    <Neumorphic variant={variant} size={size}>
      <StyledButton {...props}>
        {children}
      </StyledButton>
    </Neumorphic>
  );
};

export default NeumorphicButton; 