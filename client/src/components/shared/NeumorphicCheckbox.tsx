import React from 'react';
import { Checkbox, CheckboxProps, styled } from '@mui/material';
import { useTheme } from '../../contexts/ThemeContext';

interface NeumorphicCheckboxProps extends Omit<CheckboxProps, 'size'> {
  size?: 'small' | 'medium' | 'large';
}

const NeumorphicCheckbox: React.FC<NeumorphicCheckboxProps> = ({ size = 'medium', ...props }) => {
  const { neumorphicSettings, colors, animationSettings } = useTheme();
  const {
    shadowDistance,
    shadowBlur,
    darkShadowOpacity,
    lightShadowOpacity,
    borderRadius,
  } = neumorphicSettings;

  const getCheckboxShadow = (isChecked: boolean = false) => {
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
      borderRadius: Math.max(borderRadius / 2, 4),
    },
    medium: {
      size: 24,
      padding: 6,
      borderRadius: Math.max(borderRadius / 2, 5),
    },
    large: {
      size: 28,
      padding: 8,
      borderRadius: Math.max(borderRadius / 2, 6),
    },
  };

  const currentSize = sizes[size];

  const StyledCheckbox = styled(Checkbox)(({ theme }) => ({
    padding: currentSize.padding,
    '& .MuiSvgIcon-root': {
      width: currentSize.size,
      height: currentSize.size,
      borderRadius: currentSize.borderRadius,
      backgroundColor: colors.background,
      transition: `all ${animationSettings.transitionDuration}ms ${animationSettings.transitionEasing}`,
      boxShadow: getCheckboxShadow(),
      color: 'transparent',
    },
    '&.Mui-checked': {
      '& .MuiSvgIcon-root': {
        backgroundColor: colors.primary,
        color: colors.background,
        boxShadow: getCheckboxShadow(true),
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
      },
    },
  }));

  return <StyledCheckbox {...props} />;
};

export default NeumorphicCheckbox; 