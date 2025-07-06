import React from 'react';
import { Box, SvgIcon, SvgIconProps } from '@mui/material';
import { useTheme } from '../../contexts/ThemeContext';

interface NeumorphicIconProps extends SvgIconProps {
  isPressed?: boolean;
  size?: number;
  iconColor?: string;
}

const NeumorphicIcon: React.FC<NeumorphicIconProps> = ({
  children,
  isPressed = false,
  size = 24,
  iconColor,
  ...props
}) => {
  const { neumorphicSettings, colors } = useTheme();
  const {
    shadowDistance,
    shadowBlur,
    darkShadowOpacity,
    lightShadowOpacity,
  } = neumorphicSettings;

  const getIconShadow = () => {
    const distance = Math.max(shadowDistance / 3, 2); // Scale down shadow for icons
    const blur = Math.max(shadowBlur / 3, 3);
    const darkShadow = `rgba(163,177,198,${darkShadowOpacity})`;
    const lightShadow = `rgba(255,255,255,${lightShadowOpacity})`;

    return isPressed
      ? `inset ${distance}px ${distance}px ${blur}px ${darkShadow}, 
         inset -${distance}px -${distance}px ${blur}px ${lightShadow}`
      : `${distance}px ${distance}px ${blur}px ${darkShadow}, 
         -${distance}px -${distance}px ${blur}px ${lightShadow}`;
  };

  return (
    <Box
      sx={{
        display: 'inline-flex',
        padding: size / 4,
        borderRadius: size / 4,
        backgroundColor: colors.background,
        boxShadow: getIconShadow(),
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: isPressed ? 'none' : 'translateY(-1px)',
        },
      }}
    >
      <SvgIcon
        {...props}
        sx={{
          width: size,
          height: size,
          color: iconColor || colors.text,
          transition: 'all 0.3s ease',
          ...props.sx,
        }}
      >
        {children}
      </SvgIcon>
    </Box>
  );
};

export default NeumorphicIcon; 