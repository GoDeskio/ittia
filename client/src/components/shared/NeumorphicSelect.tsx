import React from 'react';
import { Select, SelectProps, MenuItem, styled } from '@mui/material';
import { useTheme } from '../../contexts/ThemeContext';

interface NeumorphicSelectProps extends Omit<SelectProps, 'variant'> {
  options: Array<{ value: string | number; label: string }>;
}

const NeumorphicSelect: React.FC<NeumorphicSelectProps> = ({ options, children, ...props }) => {
  const { neumorphicSettings, colors, animationSettings } = useTheme();
  const {
    shadowDistance,
    shadowBlur,
    darkShadowOpacity,
    lightShadowOpacity,
    borderRadius,
  } = neumorphicSettings;

  const getSelectShadow = (isOpen: boolean = false) => {
    const darkShadow = `rgba(163,177,198,${darkShadowOpacity})`;
    const lightShadow = `rgba(255,255,255,${lightShadowOpacity})`;
    const distance = Math.max(shadowDistance / 2, 3);
    const blur = Math.max(shadowBlur / 2, 4);

    return isOpen
      ? `inset ${distance}px ${distance}px ${blur}px ${darkShadow}, 
         inset -${distance}px -${distance}px ${blur}px ${lightShadow}`
      : `${distance}px ${distance}px ${blur}px ${darkShadow}, 
         -${distance}px -${distance}px ${blur}px ${lightShadow}`;
  };

  const StyledSelect = styled(Select)(({ theme }) => ({
    backgroundColor: colors.background,
    borderRadius: borderRadius,
    border: 'none',
    transition: `all ${animationSettings.transitionDuration}ms ${animationSettings.transitionEasing}`,
    boxShadow: getSelectShadow(),
    '& .MuiOutlinedInput-notchedOutline': {
      border: 'none',
    },
    '&.Mui-focused': {
      backgroundColor: colors.background,
      boxShadow: getSelectShadow(true),
    },
    '&:hover': {
      backgroundColor: colors.background,
      transform: `translateY(${animationSettings.hoverTranslateY}px)`,
    },
    '& .MuiSelect-select': {
      padding: '12px 16px',
      color: colors.text,
    },
    '& .MuiSvgIcon-root': {
      color: colors.text,
      transition: `transform ${animationSettings.transitionDuration}ms ${animationSettings.transitionEasing}`,
    },
    '&.Mui-disabled': {
      backgroundColor: theme.palette.action.disabledBackground,
      boxShadow: 'none',
    },
  }));

  const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
    color: colors.text,
    transition: `all ${animationSettings.transitionDuration}ms ${animationSettings.transitionEasing}`,
    '&:hover': {
      backgroundColor: `${colors.primaryColor}22`,
      transform: `scale(${animationSettings.hoverScale})`,
    },
    '&.Mui-selected': {
      backgroundColor: `${colors.primaryColor}33`,
      '&:hover': {
        backgroundColor: `${colors.primaryColor}44`,
      },
    },
  }));

  return (
    <StyledSelect {...props} variant="outlined">
      {options.map((option) => (
        <StyledMenuItem key={option.value} value={option.value}>
          {option.label}
        </StyledMenuItem>
      ))}
      {children}
    </StyledSelect>
  );
};

export default NeumorphicSelect; 