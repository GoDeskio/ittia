import React from 'react';
import { Box, BoxProps } from '@mui/material';
import { styled } from '@mui/material/styles';

interface NeumorphicBaseProps extends BoxProps {
  variant?: 'flat' | 'pressed' | 'convex';
  size?: 'small' | 'medium' | 'large';
}

const StyledBox = styled(Box)<NeumorphicBaseProps>(({ theme, variant = 'flat', size = 'medium' }) => {
  const getShadow = () => {
    const lightShadow = '8px 8px 16px rgba(163, 177, 198, 0.6)';
    const darkShadow = '-8px -8px 16px rgba(255, 255, 255, 0.5)';
    
    switch (variant) {
      case 'pressed':
        return `inset ${lightShadow}, inset ${darkShadow}`;
      case 'convex':
        return `${lightShadow}, ${darkShadow}`;
      case 'flat':
      default:
        return `4px 4px 8px rgba(163, 177, 198, 0.4), -4px -4px 8px rgba(255, 255, 255, 0.3)`;
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'small':
        return theme.spacing(0.5, 1);
      case 'large':
        return theme.spacing(2, 3);
      case 'medium':
      default:
        return theme.spacing(1, 2);
    }
  };

  return {
    backgroundColor: theme.palette.background.default,
    borderRadius: theme.shape.borderRadius,
    boxShadow: getShadow(),
    padding: getPadding(),
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      boxShadow: variant === 'pressed' 
        ? getShadow()
        : `6px 6px 12px rgba(163, 177, 198, 0.5), -6px -6px 12px rgba(255, 255, 255, 0.4)`,
    },
    '&:active': {
      boxShadow: `inset 4px 4px 8px rgba(163, 177, 198, 0.4), inset -4px -4px 8px rgba(255, 255, 255, 0.3)`,
    }
  };
});

const NeumorphicBase: React.FC<NeumorphicBaseProps> = ({ 
  children, 
  variant = 'flat',
  size = 'medium',
  ...props 
}) => {
  return (
    <StyledBox variant={variant} size={size} {...props}>
      {children}
    </StyledBox>
  );
};

export default NeumorphicBase;