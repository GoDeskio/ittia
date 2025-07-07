import React from 'react';
import { TextField, TextFieldProps as MuiTextFieldProps, styled } from '@mui/material';

type TextFieldProps = Omit<MuiTextFieldProps, 'variant'>;

interface NeumorphicInputProps extends TextFieldProps {
  isFocused?: boolean;
}

const NeumorphicInput: React.FC<NeumorphicInputProps> = ({ isFocused = false, ...props }) => {
  // Use simple hardcoded values to ensure functionality
  const shadowDistance = 8;
  const shadowBlur = 16;
  const darkShadowOpacity = 0.6;
  const lightShadowOpacity = 0.5;
  const borderRadius = 12;
  const backgroundColor = '#e0e5ec';
  const textColor = '#4a4a4a';
  const primaryColor = '#6a6a6a';
  const transitionDuration = 300;
  const transitionEasing = 'ease';

  const getInputShadow = () => {
    const darkShadow = `rgba(163,177,198,${darkShadowOpacity})`;
    const lightShadow = `rgba(255,255,255,${lightShadowOpacity})`;
    const distance = Math.max(shadowDistance / 2, 3);
    const blur = Math.max(shadowBlur / 2, 4);

    return `inset ${distance}px ${distance}px ${blur}px ${darkShadow}, inset -${distance}px -${distance}px ${blur}px ${lightShadow}`;
  };

  const StyledTextField = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
      backgroundColor: backgroundColor,
      borderRadius: borderRadius,
      border: 'none',
      transition: `all ${transitionDuration}ms ${transitionEasing}`,
      boxShadow: getInputShadow(),
      position: 'relative',
      zIndex: 1,
      pointerEvents: 'auto',
      '& fieldset': {
        border: 'none',
      },
      '&:hover fieldset': {
        border: 'none',
      },
      '&.Mui-focused fieldset': {
        border: 'none',
      },
      '&:hover': {
        backgroundColor: backgroundColor,
      },
      '&.Mui-focused': {
        backgroundColor: backgroundColor,
        boxShadow: getInputShadow(),
      },
    },
    '& .MuiOutlinedInput-input': {
      color: textColor,
      padding: '12px 16px',
      fontSize: '16px',
      backgroundColor: 'transparent',
      border: 'none',
      outline: 'none',
      position: 'relative',
      zIndex: 2,
      pointerEvents: 'auto',
      cursor: 'text',
      '&::placeholder': {
        color: textColor,
        opacity: 0.7,
      },
      '&:focus': {
        outline: 'none',
        border: 'none',
      },
      '&:disabled': {
        cursor: 'not-allowed',
      },
    },
    '& .MuiInputLabel-root': {
      color: textColor,
      '&.Mui-focused': {
        color: primaryColor,
      },
    },
    '& .Mui-disabled': {
      backgroundColor: theme.palette.action.disabledBackground,
      boxShadow: 'none',
    },
  }));

  return <StyledTextField {...props} variant="outlined" />;
};

export default NeumorphicInput; 