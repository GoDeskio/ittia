import React, { useState } from 'react';
import { 
  TextField, 
  TextFieldProps as MuiTextFieldProps, 
  InputAdornment, 
  IconButton 
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

type TextFieldProps = Omit<MuiTextFieldProps, 'variant'>;

interface NeumorphicInputProps extends TextFieldProps {
  isFocused?: boolean;
}

const NeumorphicInput: React.FC<NeumorphicInputProps> = ({ 
  isFocused = false, 
  type,
  ...props 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === 'password';
  
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  // Determine the actual input type
  const inputType = isPasswordField ? (showPassword ? 'text' : 'password') : type;

  // Create InputProps with password reveal functionality
  const inputProps = isPasswordField ? {
    ...props.InputProps,
    endAdornment: (
      <InputAdornment position="end">
        <IconButton
          aria-label="toggle password visibility"
          onClick={handleClickShowPassword}
          onMouseDown={handleMouseDownPassword}
          edge="end"
          sx={{
            color: '#6a6a6a',
            '&:hover': {
              backgroundColor: 'rgba(106, 106, 106, 0.1)',
            },
          }}
        >
          {showPassword ? <VisibilityOff /> : <Visibility />}
        </IconButton>
      </InputAdornment>
    ),
  } : props.InputProps;

  return (
    <TextField
      {...props}
      type={inputType}
      InputProps={inputProps}
      variant="outlined"
      sx={{
        // Root container styling
        width: '100%',
        
        '& .MuiOutlinedInput-root': {
          backgroundColor: '#e0e5ec',
          borderRadius: '12px',
          border: 'none',
          boxShadow: 'inset 4px 4px 8px rgba(163,177,198,0.6), inset -4px -4px 8px rgba(255,255,255,0.5)',
          transition: 'all 0.3s ease',
          
          // Remove default fieldset completely
          '& fieldset': {
            display: 'none',
          },
          
          // Hover and focus states
          '&:hover': {
            backgroundColor: '#e0e5ec',
          },
          '&.Mui-focused': {
            backgroundColor: '#e0e5ec',
            boxShadow: 'inset 4px 4px 8px rgba(163,177,198,0.6), inset -4px -4px 8px rgba(255,255,255,0.5)',
          },
        },
        
        // Critical: Input element must be fully functional
        '& .MuiOutlinedInput-input': {
          color: '#4a4a4a !important',
          padding: '12px 16px',
          fontSize: '16px',
          fontFamily: 'inherit',
          fontWeight: 'normal',
          
          // Ensure input is editable and accepts keyboard input
          backgroundColor: 'transparent !important',
          border: 'none !important',
          outline: 'none !important',
          
          // Critical: Make sure input can receive focus and keyboard input
          cursor: 'text !important',
          userSelect: 'text !important',
          pointerEvents: 'auto !important',
          
          // Ensure keyboard events work
          '&:focus': {
            outline: 'none !important',
            border: 'none !important',
            backgroundColor: 'transparent !important',
          },
          
          // Ensure text can be typed
          '&:not(:disabled)': {
            cursor: 'text !important',
            pointerEvents: 'auto !important',
          },
          
          '&::placeholder': {
            color: '#4a4a4a',
            opacity: 0.7,
          },
          
          '&:disabled': {
            cursor: 'not-allowed',
            opacity: 0.6,
          },
        },
        
        // Ensure input adornments (like password reveal) work properly
        '& .MuiInputAdornment-root': {
          color: '#6a6a6a',
          '& .MuiIconButton-root': {
            color: '#6a6a6a',
            padding: '8px',
            '&:hover': {
              backgroundColor: 'rgba(106, 106, 106, 0.1)',
            },
          },
        },
        
        // Label styling
        '& .MuiInputLabel-root': {
          color: '#4a4a4a',
          '&.Mui-focused': {
            color: '#6a6a6a',
          },
        },
        
        // Disabled state
        '&.Mui-disabled': {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#f0f0f0',
            boxShadow: 'none',
          },
        },
      }}
    />
  );
};

export default NeumorphicInput; 