import React from 'react';
import { Slider, SliderProps, styled } from '@mui/material';
import { useTheme } from '../../contexts/ThemeContext';

interface NeumorphicSliderProps extends Omit<SliderProps, 'size'> {
  size?: 'small' | 'medium' | 'large';
}

const NeumorphicSlider: React.FC<NeumorphicSliderProps> = ({ size = 'medium', ...props }) => {
  const { neumorphicSettings, colors, animationSettings } = useTheme();
  const {
    shadowDistance,
    shadowBlur,
    darkShadowOpacity,
    lightShadowOpacity,
    borderRadius,
  } = neumorphicSettings;

  const getSliderShadow = (isThumb: boolean = false) => {
    const darkShadow = `rgba(163,177,198,${darkShadowOpacity})`;
    const lightShadow = `rgba(255,255,255,${lightShadowOpacity})`;
    const distance = isThumb ? Math.max(shadowDistance / 3, 2) : Math.max(shadowDistance / 4, 1);
    const blur = isThumb ? Math.max(shadowBlur / 3, 3) : Math.max(shadowBlur / 4, 2);

    return isThumb
      ? `${distance}px ${distance}px ${blur}px ${darkShadow}, 
         -${distance}px -${distance}px ${blur}px ${lightShadow}`
      : `inset ${distance}px ${distance}px ${blur}px ${darkShadow}, 
         inset -${distance}px -${distance}px ${blur}px ${lightShadow}`;
  };

  const sizes = {
    small: {
      thumbSize: 16,
      trackHeight: 4,
    },
    medium: {
      thumbSize: 20,
      trackHeight: 6,
    },
    large: {
      thumbSize: 24,
      trackHeight: 8,
    },
  };

  const currentSize = sizes[size];

  const StyledSlider = styled(Slider)(({ theme }) => ({
    height: currentSize.trackHeight,
    padding: `${currentSize.thumbSize / 3}px 0`,
    borderRadius: currentSize.trackHeight / 2,
    boxShadow: getSliderShadow(),
    '& .MuiSlider-rail': {
      opacity: 1,
      backgroundColor: colors.background,
      borderRadius: currentSize.trackHeight / 2,
    },
    '& .MuiSlider-track': {
      height: currentSize.trackHeight,
      border: 'none',
      borderRadius: currentSize.trackHeight / 2,
      backgroundColor: colors.primaryColor,
      transition: `all ${animationSettings.transitionDuration}ms ${animationSettings.transitionEasing}`,
    },
    '& .MuiSlider-thumb': {
      width: currentSize.thumbSize,
      height: currentSize.thumbSize,
      backgroundColor: colors.background,
      boxShadow: getSliderShadow(true),
      transition: `all ${animationSettings.transitionDuration}ms ${animationSettings.transitionEasing}`,
      '&:hover': {
        transform: `scale(${animationSettings.hoverScale})`,
        boxShadow: getSliderShadow(true),
      },
      '&.Mui-active': {
        transform: `scale(${animationSettings.pressedScale})`,
        boxShadow: getSliderShadow(true),
      },
      '&::before': {
        display: 'none',
      },
      '&::after': {
        display: 'none',
      },
    },
    '&.Mui-disabled': {
      '& .MuiSlider-track': {
        backgroundColor: theme.palette.action.disabled,
      },
      '& .MuiSlider-thumb': {
        backgroundColor: theme.palette.action.disabledBackground,
        boxShadow: 'none',
      },
    },
    '&:hover': {
      '& .MuiSlider-track': {
        backgroundColor: colors.primaryColor,
      },
    },
  }));

  return <StyledSlider {...props} />;
};

export default NeumorphicSlider; 