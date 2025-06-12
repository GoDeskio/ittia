import React from 'react';
import { Button, ButtonProps, styled } from '@mui/material';
import { useTheme } from '../../contexts/ThemeContext';

interface NeumorphicButtonProps extends ButtonProps {
  isPressed?: boolean;
}

const NeumorphicButton: React.FC<NeumorphicButtonProps> = ({ isPressed = false, children, ...props }) => {
  const { neumorphicSettings, colors, animationSettings } = useTheme();
  const {
    shadowDistance,
    shadowBlur,
    darkShadowOpacity,
    lightShadowOpacity,
    borderRadius,
    useInsetShadow,
  } = neumorphicSettings;

  const getButtonShadow = () => {
    const darkShadow = `rgba(163,177,198,${darkShadowOpacity})`;
    const lightShadow = `rgba(255,255,255,${lightShadowOpacity})`;
    const insetPrefix = useInsetShadow ? 'inset ' : '';

    return isPressed
      ? `inset ${shadowDistance}px ${shadowDistance}px ${shadowBlur}px ${darkShadow}, 
         inset -${shadowDistance}px -${shadowDistance}px ${shadowBlur}px ${lightShadow}`
      : `${insetPrefix}${shadowDistance}px ${shadowDistance}px ${shadowBlur}px ${darkShadow}, 
         ${insetPrefix}-${shadowDistance}px -${shadowDistance}px ${shadowBlur}px ${lightShadow}`;
  };

  const StyledButton = styled(Button)(({ theme }) => ({
    backgroundColor: colors.background,
    color: colors.text,
    borderRadius: borderRadius,
    padding: '12px 24px',
    boxShadow: getButtonShadow(),
    border: 'none',
    transition: `all ${animationSettings.transitionDuration}ms ${animationSettings.transitionEasing}`,
    '&:hover': {
      backgroundColor: colors.background,
      transform: `scale(${animationSettings.hoverScale}) translateY(${animationSettings.hoverTranslateY}px)`,
    },
    '&:active': {
      transform: `scale(${animationSettings.pressedScale})`,
      boxShadow: getButtonShadow(),
    },
    '&.Mui-disabled': {
      backgroundColor: theme.palette.action.disabledBackground,
      boxShadow: 'none',
    },
  }));

  return (
    <StyledButton {...props}>
      {children}
    </StyledButton>
  );
};

export default NeumorphicButton; 