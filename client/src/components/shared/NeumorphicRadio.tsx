import React from 'react';
import { Radio, RadioProps, styled } from '@mui/material';
import { useTheme } from '../../contexts/ThemeContext';

interface NeumorphicRadioProps extends Omit<RadioProps, 'size'> {
  size?: 'small' | 'medium' | 'large';
}

const NeumorphicRadio: React.FC<NeumorphicRadioProps> = ({ size = 'medium', ...props }) => {
  const { neumorphicSettings, colors, animationSettings } = useTheme();
  const {
    shadowDistance,
    shadowBlur,
    darkShadowOpacity,
    lightShadowOpacity,
  } = neumorphicSettings;

  const getRadioShadow = (isChecked: boolean = false) => {
    const darkShadow = `rgba(163,177,198,${darkShadowOpacity})`;
    const lightShadow = `rgba(255,255,255,${lightShadowOpacity})`;
    const distance = Math.max(shadowDistance / 3, 2);
    const blur = Math.max(shadowBlur / 3, 3);

    return isChecked
      ? `inset ${distance}px ${distance}px ${blur}px ${darkShadow}, 
         inset -${distance}px -${distance}px ${blur}px ${lightShadow}`
      : `${distance}px ${distance}px ${blur}px ${darkShadow}, 
         -${distance}px -${distance}px ${blur}px ${lightShadow}`;
  };

  const sizes = {
    small: {
      size: 20,
      padding: 4,
      innerSize: 8,
    },
    medium: {
      size: 24,
      padding: 6,
      innerSize: 10,
    },
    large: {
      size: 28,
      padding: 8,
      innerSize: 12,
    },
  };

  const currentSize = sizes[size];

  const StyledRadio = styled(Radio)(({ theme }) => ({
    padding: currentSize.padding,
    '& .MuiSvgIcon-root': {
      width: currentSize.size,
      height: currentSize.size,
      borderRadius: '50%',
      backgroundColor: colors.background,
      transition: `all ${animationSettings.transitionDuration}ms ${animationSettings.transitionEasing}`,
      boxShadow: getRadioShadow(),
      color: 'transparent',
      position: 'relative',
      '&::after': {
        content: '""',
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: currentSize.innerSize,
        height: currentSize.innerSize,
        borderRadius: '50%',
        backgroundColor: colors.primaryColor,
        transform: 'translate(-50%, -50%) scale(0)',
        transition: `transform ${animationSettings.transitionDuration}ms ${animationSettings.transitionEasing}`,
      },
    },
    '&.Mui-checked': {
      '& .MuiSvgIcon-root': {
        boxShadow: getRadioShadow(true),
        '&::after': {
          transform: 'translate(-50%, -50%) scale(1)',
        },
      },
    },
    '&:hover': {
      '& .MuiSvgIcon-root': {
        transform: `scale(${animationSettings.hoverScale})`,
      },
    },
    '&:active': {
      '& .MuiSvgIcon-root': {
        transform: `scale(${animationSettings.pressedScale})`,
      },
    },
    '&.Mui-disabled': {
      '& .MuiSvgIcon-root': {
        backgroundColor: theme.palette.action.disabledBackground,
        boxShadow: 'none',
        '&::after': {
          backgroundColor: theme.palette.action.disabled,
        },
      },
    },
  }));

  return <StyledRadio {...props} />;
};

export default NeumorphicRadio; 