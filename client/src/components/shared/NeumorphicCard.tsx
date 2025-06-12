import React from 'react';
import { Paper, PaperProps, styled } from '@mui/material';
import { useTheme } from '../../contexts/ThemeContext';

interface NeumorphicCardProps extends PaperProps {
  isPressed?: boolean;
  noHover?: boolean;
}

const NeumorphicCard: React.FC<NeumorphicCardProps> = ({
  isPressed = false,
  noHover = false,
  children,
  ...props
}) => {
  const { neumorphicSettings, colors, animationSettings } = useTheme();
  const {
    shadowDistance,
    shadowBlur,
    darkShadowOpacity,
    lightShadowOpacity,
    borderRadius,
    useInsetShadow,
  } = neumorphicSettings;

  const getCardShadow = () => {
    const darkShadow = `rgba(163,177,198,${darkShadowOpacity})`;
    const lightShadow = `rgba(255,255,255,${lightShadowOpacity})`;
    const insetPrefix = useInsetShadow ? 'inset ' : '';

    return isPressed
      ? `inset ${shadowDistance}px ${shadowDistance}px ${shadowBlur}px ${darkShadow}, 
         inset -${shadowDistance}px -${shadowDistance}px ${shadowBlur}px ${lightShadow}`
      : `${insetPrefix}${shadowDistance}px ${shadowDistance}px ${shadowBlur}px ${darkShadow}, 
         ${insetPrefix}-${shadowDistance}px -${shadowDistance}px ${shadowBlur}px ${lightShadow}`;
  };

  const StyledCard = styled(Paper)(({ theme }) => ({
    backgroundColor: colors.background,
    borderRadius: borderRadius,
    padding: theme.spacing(2),
    boxShadow: getCardShadow(),
    border: 'none',
    transition: `all ${animationSettings.transitionDuration}ms ${animationSettings.transitionEasing}`,
    ...(noHover ? {} : {
      '&:hover': {
        transform: `scale(${animationSettings.hoverScale}) translateY(${animationSettings.hoverTranslateY}px)`,
      },
    }),
    '&:active': {
      transform: isPressed ? `scale(${animationSettings.pressedScale})` : 'none',
    },
    '&.Mui-disabled': {
      backgroundColor: theme.palette.action.disabledBackground,
      boxShadow: 'none',
    },
  }));

  return (
    <StyledCard elevation={0} {...props}>
      {children}
    </StyledCard>
  );
};

export default NeumorphicCard; 