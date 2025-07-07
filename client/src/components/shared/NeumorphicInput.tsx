import React from 'react';
import { TextField, TextFieldProps as MuiTextFieldProps, styled } from '@mui/material';
import { useTheme } from '../../contexts/ThemeContext';

type TextFieldProps = Omit<MuiTextFieldProps, 'variant'>;

interface NeumorphicInputProps extends TextFieldProps {
  isFocused?: boolean;
}

const NeumorphicInput: React.FC<NeumorphicInputProps> = ({ isFocused = false, ...props }) => {
  // Use fallback values if theme context is not available
  const themeContext = useTheme();
  const neumorphicSettings = themeContext?.neumorphicSettings || {
    shadowDistance: 8,
    shadowBlur: 16,
    darkShadowOpacity: 0.6,
    lightShadowOpacity: 0.5,
    borderRadius: 12,
  };
  const colors = themeContext?.colors || {
    background: '#e0e5ec',
    text: '#4a4a4a',
    primaryColor: '#d1d9e6',
  };
  const animationSettings = themeContext?.animationSettings || {
    transitionDuration: 300,
    transitionEasing: 'ease',
  };

  const {
    shadowDistance,
    shadowBlur,
    darkShadowOpacity,
    lightShadowOpacity,
    borderRadius,
  } = neumorphicSettings;

  const getInputShadow = () => {
    const darkShadow = `rgba(163,177,198,${darkShadowOpacity})`;
    const lightShadow = `rgba(255,255,255,${lightShadowOpacity})`;
    const distance = Math.max(shadowDistance / 2, 3);
    const blur = Math.max(shadowBlur / 2, 4);

    return `inset ${distance}px ${distance}px ${blur}px ${darkShadow}, inset -${distance}px -${distance}px ${blur}px ${lightShadow}`;
  };

  const StyledTextField = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
      backgroundColor: colors.background,
      borderRadius: borderRadius,
      border: 'none',
      transition: `all ${animationSettings.transitionDuration}ms ${animationSettings.transitionEasing}`,
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
        backgroundColor: colors.background,
      },
      '&.Mui-focused': {
        backgroundColor: colors.background,
        boxShadow: getInputShadow(),
      },
    },
    '& .MuiOutlinedInput-input': {
      color: colors.text,
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
        color: colors.text,
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
      color: colors.text,
      '&.Mui-focused': {
        color: colors.primaryColor,
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