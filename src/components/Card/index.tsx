import React, { CSSProperties } from 'react';

export interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  onClick?: () => void;
  style?: CSSProperties;
  isPressed?: boolean;
  noHover?: boolean;
}

/**
 * A reusable Card component with neumorphic design
 */
export const Card: React.FC<CardProps> = ({
  children,
  title,
  className,
  onClick,
  style,
  isPressed = false,
  noHover = false,
  ...props
}) => {
  const getCardStyles = (): CSSProperties => {
    const shadowDistance = 6;
    const shadowBlur = 12;
    const darkShadowOpacity = 0.4;
    const lightShadowOpacity = 0.8;
    const borderRadius = 12;

    const darkShadow = `rgba(163,177,198,${darkShadowOpacity})`;
    const lightShadow = `rgba(255,255,255,${lightShadowOpacity})`;

    const boxShadow = isPressed
      ? `inset ${shadowDistance}px ${shadowDistance}px ${shadowBlur}px ${darkShadow}, 
         inset -${shadowDistance}px -${shadowDistance}px ${shadowBlur}px ${lightShadow}`
      : `${shadowDistance}px ${shadowDistance}px ${shadowBlur}px ${darkShadow}, 
         -${shadowDistance}px -${shadowDistance}px ${shadowBlur}px ${lightShadow}`;

    const baseStyles: CSSProperties = {
      backgroundColor: '#e6ebf1',
      borderRadius: borderRadius,
      padding: '16px',
      boxShadow: boxShadow,
      border: 'none',
      transition: 'all 200ms ease-in-out',
      cursor: onClick ? 'pointer' : 'default',
      position: 'relative',
      display: 'block',
      width: '100%',
      ...style
    };

    if (!noHover && onClick) {
      return {
        ...baseStyles,
        ':hover': {
          transform: 'scale(1.02) translateY(-2px)',
        },
        ':active': {
          transform: 'scale(0.98)',
        }
      };
    }

    return baseStyles;
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!noHover && onClick) {
      e.currentTarget.style.transform = 'scale(1.02) translateY(-2px)';
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!noHover && onClick) {
      e.currentTarget.style.transform = 'scale(1) translateY(0px)';
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (onClick) {
      e.currentTarget.style.transform = 'scale(0.98)';
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (onClick) {
      e.currentTarget.style.transform = noHover ? 'scale(1)' : 'scale(1.02) translateY(-2px)';
    }
  };

  return (
    <div
      className={className}
      onClick={onClick}
      style={getCardStyles()}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      {...props}
    >
      {title && (
        <h3 style={{ 
          margin: '0 0 12px 0', 
          fontSize: '18px', 
          fontWeight: '600', 
          color: '#333' 
        }}>
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};

export default Card;