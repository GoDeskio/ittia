import React, { CSSProperties } from 'react';

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  style?: CSSProperties;
}

/**
 * A reusable Button component with neumorphic design
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  type = 'button',
  className,
  style,
  ...props
}) => {
  const getButtonStyles = (): CSSProperties => {
    const baseStyles: CSSProperties = {
      border: 'none',
      borderRadius: '12px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontFamily: 'inherit',
      fontWeight: '500',
      textTransform: 'none',
      transition: 'all 0.2s ease',
      outline: 'none',
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: disabled 
        ? 'none' 
        : '6px 6px 12px rgba(163,177,198,0.4), -6px -6px 12px rgba(255,255,255,0.8)',
      backgroundColor: '#e6ebf1',
      color: '#333',
      ...style
    };

    // Size variations
    const sizeStyles: Record<string, CSSProperties> = {
      small: { padding: '8px 16px', fontSize: '14px' },
      medium: { padding: '12px 24px', fontSize: '16px' },
      large: { padding: '16px 32px', fontSize: '18px' }
    };

    // Variant styles
    const variantStyles: Record<string, CSSProperties> = {
      primary: { backgroundColor: '#e6ebf1', color: '#333' },
      secondary: { backgroundColor: '#f0f0f0', color: '#666' },
      danger: { backgroundColor: '#ffe6e6', color: '#d32f2f' }
    };

    return {
      ...baseStyles,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...(disabled && {
        opacity: 0.6,
        boxShadow: 'none',
        backgroundColor: '#f5f5f5',
        color: '#999'
      })
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      e.currentTarget.style.boxShadow = 'inset 3px 3px 6px rgba(163,177,198,0.4), inset -3px -3px 6px rgba(255,255,255,0.8)';
      e.currentTarget.style.transform = 'scale(0.98)';
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      e.currentTarget.style.boxShadow = '6px 6px 12px rgba(163,177,198,0.4), -6px -6px 12px rgba(255,255,255,0.8)';
      e.currentTarget.style.transform = 'scale(1)';
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      e.currentTarget.style.boxShadow = '6px 6px 12px rgba(163,177,198,0.4), -6px -6px 12px rgba(255,255,255,0.8)';
      e.currentTarget.style.transform = 'scale(1)';
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={getButtonStyles()}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;