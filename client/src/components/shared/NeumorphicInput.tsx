import React from 'react';
import { TextField, TextFieldProps as MuiTextFieldProps } from '@mui/material';

type TextFieldProps = Omit<MuiTextFieldProps, 'variant'>;

interface NeumorphicInputProps extends TextFieldProps {
  isFocused?: boolean;
}

const NeumorphicInput: React.FC<NeumorphicInputProps> = ({ isFocused = false, ...props }) => {
  return (
    <TextField
      {...props}
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
          color: '#4a4a4a',
          padding: '12px 16px',
          fontSize: '16px',
          fontFamily: 'inherit',
          fontWeight: 'normal',
          
          // Ensure input is editable
          backgroundColor: 'transparent',
          border: 'none',
          outline: 'none',
          
          // Make sure input can receive focus and text
          cursor: 'text',
          userSelect: 'text',
          
          '&:focus': {
            outline: 'none',
            border: 'none',
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