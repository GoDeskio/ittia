import { createTheme } from '@mui/material/styles';

const neuPalette = {
  light: '#e0e5ec',
  main: '#d1d9e6',
  dark: '#b8c3d9',
  contrastText: '#4a4a4a'
};

const theme = createTheme({
  palette: {
    primary: {
      light: '#e0e5ec',
      main: '#d1d9e6',
      dark: '#b8c3d9',
      contrastText: '#4a4a4a',
    },
    secondary: {
      light: '#c8d0e7',
      main: '#b8c3d9',
      dark: '#9ba6c5',
      contrastText: '#4a4a4a',
    },
    error: {
      main: '#f44336',
    },
    warning: {
      main: '#ff9800',
    },
    success: {
      main: '#4caf50',
    },
    background: {
      default: '#e0e5ec',
      paper: '#e0e5ec',
      dark: '#d1d9e6',
      light: '#e8edf5',
    },
    text: {
      primary: '#4a4a4a',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          backgroundColor: '#e0e5ec',
          color: '#4a4a4a', // Dark grey text color
          boxShadow: '9px 9px 16px rgb(163,177,198,0.6), -9px -9px 16px rgba(255,255,255, 0.5)',
          borderRadius: '12px',
          padding: '8px 16px', // Reduced padding for smaller buttons
          fontSize: '0.875rem', // Slightly smaller font
          fontWeight: 500,
          '&:hover': {
            backgroundColor: '#d1d9e6',
            color: '#3a3a3a', // Slightly darker on hover
            boxShadow: '6px 6px 10px rgb(163,177,198,0.6), -6px -6px 10px rgba(255,255,255, 0.5)',
          },
          '&:active': {
            color: '#2a2a2a', // Even darker when pressed
            boxShadow: 'inset 6px 6px 10px rgb(163,177,198,0.6), inset -6px -6px 10px rgba(255,255,255, 0.5)',
          },
          '&.Mui-disabled': {
            color: '#8a8a8a', // Lighter grey when disabled
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#e0e5ec',
          borderRadius: '15px',
          boxShadow: '9px 9px 16px rgb(163,177,198,0.6), -9px -9px 16px rgba(255,255,255, 0.5)',
          padding: '20px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#e0e5ec',
          borderRadius: '15px',
          boxShadow: '9px 9px 16px rgb(163,177,198,0.6), -9px -9px 16px rgba(255,255,255, 0.5)',
          padding: '20px',
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          backgroundColor: '#e0e5ec',
          boxShadow: '9px 9px 16px rgb(163,177,198,0.6), -9px -9px 16px rgba(255,255,255, 0.5)',
          borderRadius: '15px',
          padding: '10px',
          '& .MuiTable-root': {
            backgroundColor: 'transparent',
          },
          '& .MuiTableRow-root:nth-of-type(odd)': {
            backgroundColor: 'rgba(209,217,230,0.3)',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          backgroundColor: '#e0e5ec',
          borderRadius: '12px',
          padding: '5px',
          boxShadow: '9px 9px 16px rgb(163,177,198,0.6), -9px -9px 16px rgba(255,255,255, 0.5)',
        },
        indicator: {
          display: 'none',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          borderRadius: '10px',
          margin: '0 5px',
          '&.Mui-selected': {
            backgroundColor: '#d1d9e6',
            boxShadow: 'inset 6px 6px 10px rgb(163,177,198,0.6), inset -6px -6px 10px rgba(255,255,255, 0.5)',
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          '&.MuiOutlinedInput-root': {
            backgroundColor: '#e0e5ec',
            borderRadius: '12px',
            boxShadow: 'inset 4px 4px 8px rgba(163,177,198,0.6), inset -4px -4px 8px rgba(255,255,255,0.5)',
            border: 'none',
            transition: 'all 0.3s ease',
            
            '& fieldset': {
              display: 'none', // Completely remove fieldset
            },
            
            '&:hover': {
              backgroundColor: '#e0e5ec',
            },
            '&.Mui-focused': {
              backgroundColor: '#e0e5ec',
              boxShadow: 'inset 4px 4px 8px rgba(163,177,198,0.6), inset -4px -4px 8px rgba(255,255,255,0.5)',
            },
          },
          
          // Ensure all input elements work
          '& input': {
            color: '#4a4a4a !important',
            padding: '12px 16px',
            fontSize: '16px',
            fontFamily: 'inherit',
            fontWeight: 'normal',
            
            backgroundColor: 'transparent !important',
            border: 'none !important',
            outline: 'none !important',
            
            cursor: 'text !important',
            userSelect: 'text !important',
            pointerEvents: 'auto !important',
            
            '&:focus': {
              outline: 'none !important',
              border: 'none !important',
              backgroundColor: 'transparent !important',
            },
            
            '&::placeholder': {
              color: '#4a4a4a',
              opacity: 0.7,
            },
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          // Ensure all TextFields work properly
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#e0e5ec',
            borderRadius: '12px',
            boxShadow: 'inset 4px 4px 8px rgba(163,177,198,0.6), inset -4px -4px 8px rgba(255,255,255,0.5)',
            border: 'none',
            transition: 'all 0.3s ease',
            
            // Remove fieldset completely to prevent interference
            '& fieldset': {
              display: 'none',
            },
            
            '&:hover': {
              backgroundColor: '#e0e5ec',
            },
            '&.Mui-focused': {
              backgroundColor: '#e0e5ec',
              boxShadow: 'inset 4px 4px 8px rgba(163,177,198,0.6), inset -4px -4px 8px rgba(255,255,255,0.5)',
            },
          },
          
          // Critical: Ensure input element is fully functional
          '& .MuiOutlinedInput-input': {
            color: '#4a4a4a !important',
            padding: '12px 16px',
            fontSize: '16px',
            fontFamily: 'inherit',
            fontWeight: 'normal',
            
            // Ensure input is editable
            backgroundColor: 'transparent !important',
            border: 'none !important',
            outline: 'none !important',
            
            // Make sure input can receive focus and text
            cursor: 'text !important',
            userSelect: 'text !important',
            pointerEvents: 'auto !important',
            
            '&:focus': {
              outline: 'none !important',
              border: 'none !important',
              backgroundColor: 'transparent !important',
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
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#e0e5ec',
          boxShadow: '9px 9px 16px rgb(163,177,198,0.6), -9px -9px 16px rgba(255,255,255, 0.5)',
          '& .MuiToolbar-root': {
            color: '#4a4a4a',
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#e0e5ec',
          boxShadow: '9px 9px 16px rgb(163,177,198,0.6)',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          margin: '5px 10px',
          '&:hover': {
            backgroundColor: '#d1d9e6',
            boxShadow: 'inset 6px 6px 10px rgb(163,177,198,0.6), inset -6px -6px 10px rgba(255,255,255, 0.5)',
          },
        },
      },
    },
    MuiIcon: {
      styleOverrides: {
        root: {
          color: '#4a4a4a',
        },
      },
    },
  },
});

export default theme; 