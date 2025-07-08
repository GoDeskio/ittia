// Unified Figma-inspired Neumorphic Design System
// This design system ensures consistency across web, mobile, and desktop clients

export const NeumorphicDesignSystem = {
  // Color Palette - Figma-inspired neumorphic colors
  colors: {
    // Primary neumorphic background
    background: {
      primary: '#e0e5ec',
      secondary: '#d1d9e6',
      tertiary: '#b8c3d9',
      light: '#e8edf5',
      dark: '#c8d0e7',
    },
    
    // Text colors
    text: {
      primary: '#4a4a4a',
      secondary: '#666666',
      tertiary: '#8a8a8a',
      inverse: '#ffffff',
    },
    
    // Accent colors
    accent: {
      primary: '#2196F3',
      secondary: '#1976D2',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#f44336',
      info: '#2196F3',
    },
    
    // Shadow colors for neumorphic effects
    shadow: {
      dark: 'rgba(163, 177, 198, 0.6)',
      light: 'rgba(255, 255, 255, 0.7)',
      darkInset: 'rgba(163, 177, 198, 0.4)',
      lightInset: 'rgba(255, 255, 255, 0.6)',
    },
    
    // Gradient definitions
    gradients: {
      primary: 'linear-gradient(145deg, #e6ebf2, #d1d9e6)',
      secondary: 'linear-gradient(145deg, #d1d9e6, #b8c3d9)',
      accent: 'linear-gradient(145deg, #2196F3, #1976D2)',
      success: 'linear-gradient(145deg, #4CAF50, #388E3C)',
      warning: 'linear-gradient(145deg, #FF9800, #F57C00)',
      error: 'linear-gradient(145deg, #f44336, #d32f2f)',
    },
  },

  // Typography system
  typography: {
    fontFamily: {
      primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      secondary: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      mono: 'SF Mono, Monaco, Inconsolata, "Roboto Mono", Consolas, "Courier New", monospace',
    },
    
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem',    // 48px
    },
    
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  // Spacing system (based on 4px grid)
  spacing: {
    px: '1px',
    0: '0',
    1: '0.25rem',  // 4px
    2: '0.5rem',   // 8px
    3: '0.75rem',  // 12px
    4: '1rem',     // 16px
    5: '1.25rem',  // 20px
    6: '1.5rem',   // 24px
    8: '2rem',     // 32px
    10: '2.5rem',  // 40px
    12: '3rem',    // 48px
    16: '4rem',    // 64px
    20: '5rem',    // 80px
    24: '6rem',    // 96px
    32: '8rem',    // 128px
  },

  // Border radius system
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    base: '0.25rem',  // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px',
  },

  // Neumorphic shadow system
  shadows: {
    // Raised elements (buttons, cards)
    raised: {
      sm: '4px 4px 8px rgba(163, 177, 198, 0.3), -4px -4px 8px rgba(255, 255, 255, 0.5)',
      md: '6px 6px 12px rgba(163, 177, 198, 0.4), -6px -6px 12px rgba(255, 255, 255, 0.6)',
      lg: '8px 8px 16px rgba(163, 177, 198, 0.4), -8px -8px 16px rgba(255, 255, 255, 0.6)',
      xl: '12px 12px 24px rgba(163, 177, 198, 0.4), -12px -12px 24px rgba(255, 255, 255, 0.6)',
    },
    
    // Pressed/inset elements (inputs, pressed buttons)
    inset: {
      sm: 'inset 2px 2px 4px rgba(163, 177, 198, 0.3), inset -2px -2px 4px rgba(255, 255, 255, 0.5)',
      md: 'inset 4px 4px 8px rgba(163, 177, 198, 0.4), inset -4px -4px 8px rgba(255, 255, 255, 0.6)',
      lg: 'inset 6px 6px 12px rgba(163, 177, 198, 0.4), inset -6px -6px 12px rgba(255, 255, 255, 0.6)',
    },
    
    // Hover states
    hover: {
      sm: '2px 2px 4px rgba(163, 177, 198, 0.3), -2px -2px 4px rgba(255, 255, 255, 0.5)',
      md: '4px 4px 8px rgba(163, 177, 198, 0.3), -4px -4px 8px rgba(255, 255, 255, 0.5)',
      lg: '6px 6px 12px rgba(163, 177, 198, 0.4), -6px -6px 12px rgba(255, 255, 255, 0.6)',
    },
    
    // Floating elements (modals, dropdowns)
    floating: {
      sm: '0 4px 8px rgba(163, 177, 198, 0.3)',
      md: '0 8px 16px rgba(163, 177, 198, 0.4)',
      lg: '0 12px 24px rgba(163, 177, 198, 0.5)',
      xl: '0 20px 40px rgba(163, 177, 198, 0.6)',
    },
  },

  // Animation system
  animations: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    
    easing: {
      linear: 'linear',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
    
    transitions: {
      all: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
      transform: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)',
      opacity: 'opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)',
      shadow: 'box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },

  // Component-specific styles
  components: {
    // Button styles
    button: {
      base: {
        borderRadius: '12px',
        padding: '12px 24px',
        fontSize: '1rem',
        fontWeight: 600,
        textTransform: 'none' as const,
        transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        border: 'none',
        cursor: 'pointer',
      },
      
      primary: {
        background: 'linear-gradient(145deg, #2196F3, #1976D2)',
        color: '#ffffff',
        boxShadow: '6px 6px 12px rgba(163, 177, 198, 0.4), -6px -6px 12px rgba(255, 255, 255, 0.6)',
      },
      
      secondary: {
        background: 'linear-gradient(145deg, #e6ebf2, #d1d9e6)',
        color: '#4a4a4a',
        boxShadow: '6px 6px 12px rgba(163, 177, 198, 0.4), -6px -6px 12px rgba(255, 255, 255, 0.6)',
      },
    },
    
    // Card styles
    card: {
      base: {
        background: 'linear-gradient(145deg, #e6ebf2, #d1d9e6)',
        borderRadius: '20px',
        padding: '24px',
        boxShadow: '8px 8px 16px rgba(163, 177, 198, 0.4), -8px -8px 16px rgba(255, 255, 255, 0.6)',
        transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
      },
      
      hover: {
        transform: 'translateY(-2px)',
        boxShadow: '12px 12px 20px rgba(163, 177, 198, 0.5), -12px -12px 20px rgba(255, 255, 255, 0.7)',
      },
    },
    
    // Input styles
    input: {
      base: {
        background: '#e0e5ec',
        borderRadius: '12px',
        padding: '12px 16px',
        fontSize: '1rem',
        color: '#4a4a4a',
        border: 'none',
        outline: 'none',
        boxShadow: 'inset 4px 4px 8px rgba(163, 177, 198, 0.4), inset -4px -4px 8px rgba(255, 255, 255, 0.6)',
        transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
      },
      
      focus: {
        boxShadow: 'inset 6px 6px 12px rgba(163, 177, 198, 0.5), inset -6px -6px 12px rgba(255, 255, 255, 0.7)',
      },
    },
    
    // Sidebar styles
    sidebar: {
      collapsed: {
        width: '70px',
        boxShadow: '6px 0 12px rgba(163, 177, 198, 0.3), -2px 0 4px rgba(255, 255, 255, 0.2)',
      },
      
      expanded: {
        width: '280px',
        boxShadow: '12px 0 24px rgba(163, 177, 198, 0.4), -4px 0 8px rgba(255, 255, 255, 0.3)',
      },
    },
  },

  // Breakpoints for responsive design
  breakpoints: {
    xs: '320px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Z-index system
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },
};

// Helper functions for generating neumorphic styles
export const neumorphicHelpers = {
  // Generate raised element styles
  raised: (size: 'sm' | 'md' | 'lg' | 'xl' = 'md') => ({
    background: NeumorphicDesignSystem.colors.gradients.primary,
    boxShadow: NeumorphicDesignSystem.shadows.raised[size],
    transition: NeumorphicDesignSystem.animations.transitions.all,
  }),

  // Generate inset element styles
  inset: (size: 'sm' | 'md' | 'lg' = 'md') => ({
    background: NeumorphicDesignSystem.colors.background.primary,
    boxShadow: NeumorphicDesignSystem.shadows.inset[size],
    transition: NeumorphicDesignSystem.animations.transitions.all,
  }),

  // Generate hover styles
  hover: (size: 'sm' | 'md' | 'lg' = 'md') => ({
    boxShadow: NeumorphicDesignSystem.shadows.hover[size],
    transform: 'translateY(-1px)',
  }),

  // Generate button styles
  button: (variant: 'primary' | 'secondary' = 'primary') => ({
    ...NeumorphicDesignSystem.components.button.base,
    ...NeumorphicDesignSystem.components.button[variant],
  }),

  // Generate card styles
  card: () => ({
    ...NeumorphicDesignSystem.components.card.base,
  }),

  // Generate input styles
  input: () => ({
    ...NeumorphicDesignSystem.components.input.base,
  }),
};

export default NeumorphicDesignSystem;