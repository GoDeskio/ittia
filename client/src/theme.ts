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
            boxShadow: 'inset 6px 6px 10px rgb(163,177,198,0.6), inset -6px -6px 10px rgba(255,255,255, 0.5)',
            '& fieldset': {
              border: 'none',
            },
            '&:hover fieldset': {
              border: 'none',
            },
            '&.Mui-focused fieldset': {
              border: 'none',
            },
          },
          '& input': {
            color: '#4a4a4a',
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            '&:focus': {
              outline: 'none',
              border: 'none',
            },
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#e0e5ec',
            borderRadius: '12px',
            boxShadow: 'inset 6px 6px 10px rgb(163,177,198,0.6), inset -6px -6px 10px rgba(255,255,255, 0.5)',
            '& fieldset': {
              border: 'none',
            },
            '&:hover fieldset': {
              border: 'none',
            },
            '&.Mui-focused fieldset': {
              border: 'none',
            },
          },
          '& .MuiOutlinedInput-input': {
            color: '#4a4a4a',
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            '&:focus': {
              outline: 'none',
              border: 'none',
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