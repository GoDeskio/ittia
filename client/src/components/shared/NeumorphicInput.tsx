import React from 'react';
import { TextField, TextFieldProps as MuiTextFieldProps, styled } from '@mui/material';
import { useTheme } from '../../contexts/ThemeContext';

type TextFieldProps = Omit<MuiTextFieldProps, 'variant'>;

interface NeumorphicInputProps extends TextFieldProps {
  isFocused?: boolean;
}

const NeumorphicInput: React.FC<NeumorphicInputProps> = ({ isFocused = false, ...props }) => {
  const { neumorphicSettings, colors, animationSettings } = useTheme();
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

    return isFocused
      ? `inset ${distance}px ${distance}px ${blur}px ${darkShadow}, 
         inset -${distance}px -${distance}px ${blur}px ${lightShadow}`
      : `inset ${distance}px ${distance}px ${blur}px ${darkShadow}, 
         inset -${distance}px -${distance}px ${blur}px ${lightShadow}`;
  };

  const StyledTextField = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
      backgroundColor: colors.background,
      borderRadius: borderRadius,
      border: 'none',
      transition: `all ${animationSettings.transitionDuration}ms ${animationSettings.transitionEasing}`,
      boxShadow: getInputShadow(),
      '& fieldset': {
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
    },
    '& .MuiInputLabel-root': {
      color: colors.text,
      '&.Mui-focused': {
        color: colors.primary,
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