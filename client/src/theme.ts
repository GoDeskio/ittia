import { createTheme } from '@mui/material/styles';
import { NeumorphicDesignSystem } from '../../shared/design-system';

const { colors, typography, shadows, borderRadius, spacing } = NeumorphicDesignSystem;

const theme = createTheme({
  palette: {
    primary: {
      light: colors.background.light,
      main: colors.accent.primary,
      dark: colors.accent.secondary,
      contrastText: colors.text.inverse,
    },
    secondary: {
      light: colors.background.secondary,
      main: colors.background.tertiary,
      dark: colors.background.dark,
      contrastText: colors.text.primary,
    },
    error: {
      main: colors.accent.error,
    },
    warning: {
      main: colors.accent.warning,
    },
    success: {
      main: colors.accent.success,
    },
    info: {
      main: colors.accent.info,
    },
    background: {
      default: colors.background.primary,
      paper: colors.background.primary,
    },
    text: {
      primary: colors.text.primary,
      secondary: colors.text.secondary,
    },
  },
  typography: {
    fontFamily: typography.fontFamily.primary,
    h1: {
      fontSize: typography.fontSize['5xl'],
      fontWeight: typography.fontWeight.bold,
      lineHeight: typography.lineHeight.tight,
    },
    h2: {
      fontSize: typography.fontSize['4xl'],
      fontWeight: typography.fontWeight.bold,
      lineHeight: typography.lineHeight.tight,
    },
    h3: {
      fontSize: typography.fontSize['3xl'],
      fontWeight: typography.fontWeight.semibold,
      lineHeight: typography.lineHeight.tight,
    },
    h4: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.semibold,
      lineHeight: typography.lineHeight.normal,
    },
    h5: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.medium,
      lineHeight: typography.lineHeight.normal,
    },
    h6: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.medium,
      lineHeight: typography.lineHeight.normal,
    },
    body1: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.normal,
      lineHeight: typography.lineHeight.normal,
    },
    body2: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.normal,
      lineHeight: typography.lineHeight.normal,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: borderRadius['2xl'],
          padding: `${spacing[3]} ${spacing[6]}`,
          fontSize: typography.fontSize.base,
          fontWeight: typography.fontWeight.semibold,
          transition: NeumorphicDesignSystem.animations.transitions.all,
          border: 'none',
          '&.MuiButton-contained': {
            background: colors.gradients.accent,
            color: colors.text.inverse,
            boxShadow: shadows.raised.md,
            '&:hover': {
              background: colors.gradients.accent,
              boxShadow: shadows.hover.md,
              transform: 'translateY(-1px)',
            },
            '&:active': {
              boxShadow: shadows.inset.sm,
              transform: 'translateY(0px)',
            },
          },
          '&.MuiButton-outlined': {
            background: colors.gradients.primary,
            color: colors.text.primary,
            boxShadow: shadows.raised.md,
            border: 'none',
            '&:hover': {
              background: colors.gradients.secondary,
              boxShadow: shadows.hover.md,
              transform: 'translateY(-1px)',
            },
            '&:active': {
              boxShadow: shadows.inset.sm,
              transform: 'translateY(0px)',
            },
          },
          '&.MuiButton-text': {
            background: 'transparent',
            color: colors.text.primary,
            boxShadow: 'none',
            '&:hover': {
              background: colors.background.secondary,
              boxShadow: shadows.raised.sm,
            },
          },
          '&.Mui-disabled': {
            color: colors.text.tertiary,
            background: colors.background.secondary,
            boxShadow: 'none',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: colors.gradients.primary,
          borderRadius: borderRadius['3xl'],
          boxShadow: shadows.raised.lg,
          padding: spacing[6],
          transition: NeumorphicDesignSystem.animations.transitions.all,
          '&:hover': {
            boxShadow: shadows.raised.xl,
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: colors.gradients.primary,
          borderRadius: borderRadius['3xl'],
          boxShadow: shadows.raised.lg,
          padding: spacing[6],
          transition: NeumorphicDesignSystem.animations.transitions.all,
          border: 'none',
          '&:hover': {
            boxShadow: shadows.raised.xl,
            transform: 'translateY(-2px)',
          },
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
            backgroundColor: colors.background.primary,
            borderRadius: borderRadius['2xl'],
            boxShadow: shadows.inset.md,
            border: 'none',
            transition: NeumorphicDesignSystem.animations.transitions.all,
            
            '& fieldset': {
              display: 'none', // Completely remove fieldset
            },
            
            '&:hover': {
              backgroundColor: colors.background.primary,
              boxShadow: shadows.inset.lg,
            },
            '&.Mui-focused': {
              backgroundColor: colors.background.primary,
              boxShadow: shadows.inset.lg,
            },
          },
          
          // Ensure all input elements work and accept keyboard input
          '& input': {
            color: '#4a4a4a !important',
            padding: '12px 16px',
            fontSize: '16px',
            fontFamily: 'inherit',
            fontWeight: 'normal',
            
            backgroundColor: 'transparent !important',
            border: 'none !important',
            outline: 'none !important',
            
            // Critical: Ensure keyboard input works
            cursor: 'text !important',
            userSelect: 'text !important',
            pointerEvents: 'auto !important',
            
            // Ensure input can receive keyboard events
            '&:focus': {
              outline: 'none !important',
              border: 'none !important',
              backgroundColor: 'transparent !important',
            },
            
            // Ensure text input is not blocked
            '&:not(:disabled)': {
              cursor: 'text !important',
              pointerEvents: 'auto !important',
            },
            
            // Cross-browser placeholder support
            '&::-webkit-input-placeholder': {
              color: '#4a4a4a',
              opacity: 0.7,
            },
            '&::-moz-placeholder': {
              color: '#4a4a4a',
              opacity: 0.7,
            },
            '&:-ms-input-placeholder': {
              color: '#4a4a4a',
              opacity: 0.7,
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
          
          // Critical: Ensure input element is fully functional and accepts keyboard input
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
            
            // Ensure keyboard events are captured
            '&:focus': {
              outline: 'none !important',
              border: 'none !important',
              backgroundColor: 'transparent !important',
            },
            
            // Ensure text input works
            '&:not(:disabled)': {
              cursor: 'text !important',
              pointerEvents: 'auto !important',
            },
            
            // Remove any potential input blocking
            '&::-webkit-input-placeholder': {
              color: '#4a4a4a',
              opacity: 0.7,
            },
            '&::-moz-placeholder': {
              color: '#4a4a4a',
              opacity: 0.7,
            },
            '&:-ms-input-placeholder': {
              color: '#4a4a4a',
              opacity: 0.7,
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