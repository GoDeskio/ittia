import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      light: '#4791db',
      main: '#1976d2',
      dark: '#115293',
    },
    secondary: {
      light: '#e33371',
      main: '#dc004e',
      dark: '#9a0036',
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
      default: '#f5f5f5',
      paper: '#ffffff',
      dark: '#e8e8e8',
      light: '#fafafa',
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
          boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            boxShadow: '3px 3px 6px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)',
          '& .MuiTable-root': {
            backgroundColor: '#ffffff',
          },
          '& .MuiTableRow-root:nth-of-type(odd)': {
            backgroundColor: '#fafafa',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          '&.MuiOutlinedInput-root': {
            boxShadow: 'inset 1px 1px 3px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            boxShadow: 'inset 1px 1px 3px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiIcon: {
      styleOverrides: {
        root: {
          filter: 'drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.1))',
        },
      },
    },
  },
});

export default theme; 