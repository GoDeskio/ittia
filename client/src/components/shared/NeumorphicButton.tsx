import React from 'react';
import { Button, ButtonProps } from '@mui/material';
import { styled } from '@mui/material/styles';
import Neumorphic from './NeumorphicBase';

interface NeumorphicButtonProps extends ButtonProps {
  variant?: 'flat' | 'pressed' | 'convex';
  size?: 'small' | 'medium' | 'large';
}

const StyledButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1, 2),
  '&:hover': {
    backgroundColor: 'transparent',
  },
  '&:active': {
    backgroundColor: 'transparent',
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