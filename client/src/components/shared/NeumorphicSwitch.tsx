import React from 'react';
import { Switch, SwitchProps, styled } from '@mui/material';
import { useTheme } from '../../contexts/ThemeContext';

interface NeumorphicSwitchProps extends Omit<SwitchProps, 'size'> {
  size?: 'small' | 'medium' | 'large';
}

const NeumorphicSwitch: React.FC<NeumorphicSwitchProps> = ({ size = 'medium', ...props }) => {
  const { neumorphicSettings, colors, animationSettings } = useTheme();
  const {
    shadowDistance,
    shadowBlur,
    darkShadowOpacity,
    lightShadowOpacity,
    borderRadius,
  } = neumorphicSettings;

  const getSwitchShadow = (isThumb: boolean = false) => {
    const darkShadow = `rgba(163,177,198,${darkShadowOpacity})`;
    const lightShadow = `rgba(255,255,255,${lightShadowOpacity})`;
    const distance = isThumb ? Math.max(shadowDistance / 3, 2) : shadowDistance;
    const blur = isThumb ? Math.max(shadowBlur / 3, 3) : shadowBlur;

    return isThumb
      ? `${distance}px ${distance}px ${blur}px ${darkShadow}`
      : `inset ${distance}px ${distance}px ${blur}px ${darkShadow}, 
         inset -${distance}px -${distance}px ${blur}px ${lightShadow}`;
  };

  const sizes = {
    small: {
      width: 40,
      height: 24,
      padding: 8,
      thumbSize: 16,
    },
    medium: {
      width: 52,
      height: 32,
      padding: 10,
      thumbSize: 22,
    },
    large: {
      width: 64,
      height: 40,
      padding: 12,
      thumbSize: 28,
    },
  };

  const currentSize = sizes[size];

  const StyledSwitch = styled(Switch)(({ theme }) => ({
    width: currentSize.width,
    height: currentSize.height,
    padding: 0,
    '& .MuiSwitch-switchBase': {
      padding: currentSize.padding,
      transition: theme.transitions.create(['left', 'transform'], {
        duration: animationSettings.transitionDuration,
        easing: animationSettings.transitionEasing,
      }),
      '&.Mui-checked': {
        transform: 'translateX(100%)',
        color: colors.background,
        '& + .MuiSwitch-track': {
          backgroundColor: colors.primary,
          opacity: 1,
          border: 0,
        },
        '& .MuiSwitch-thumb': {
          backgroundColor: colors.background,
        },
      },
    },
    '& .MuiSwitch-thumb': {
      width: currentSize.thumbSize,
      height: currentSize.thumbSize,
      borderRadius: '50%',
      backgroundColor: colors.text,
      boxShadow: getSwitchShadow(true),
      transition: theme.transitions.create(['width', 'transform'], {
        duration: animationSettings.transitionDuration,
        easing: animationSettings.transitionEasing,
      }),
    },
    '& .MuiSwitch-track': {
      borderRadius: currentSize.height / 2,
      backgroundColor: colors.background,
      opacity: 1,
      boxShadow: getSwitchShadow(),
      transition: theme.transitions.create(['background-color', 'box-shadow'], {
        duration: animationSettings.transitionDuration,
        easing: animationSettings.transitionEasing,
      }),
    },
    '&:hover': {
      '& .MuiSwitch-thumb': {
        transform: `scale(${animationSettings.hoverScale})`,
      },
    },
    '&:active': {
      '& .MuiSwitch-thumb': {
        transform: `scale(${animationSettings.pressedScale})`,
      },
    },
  }));

  return <StyledSwitch {...props} />;
};

export default NeumorphicSwitch; 