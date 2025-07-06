import { styled } from '@mui/material/styles';
import {
  Card,
  Paper,
  TableContainer,
  Box,
  TextField,
  Button,
  Tab,
  Tabs,
} from '@mui/material';

// Shared card component with neumorphic styling
export const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  boxShadow: '9px 9px 16px rgb(163,177,198,0.6), -9px -9px 16px rgba(255,255,255, 0.5)',
  borderRadius: '15px',
  margin: theme.spacing(2),
  padding: theme.spacing(3),
  overflow: 'visible',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
  },
}));

// Profile sections and user content areas with neumorphic effect
export const ContentSection = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  boxShadow: '9px 9px 16px rgb(163,177,198,0.6), -9px -9px 16px rgba(255,255,255, 0.5)',
  borderRadius: '15px',
  padding: theme.spacing(3),
  margin: theme.spacing(2, 0),
  transition: 'all 0.3s ease',
}));

// Enhanced table container with neumorphic visibility
export const VisibleTableContainer = styled(TableContainer)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  boxShadow: '9px 9px 16px rgb(163,177,198,0.6), -9px -9px 16px rgba(255,255,255, 0.5)',
  borderRadius: '15px',
  margin: theme.spacing(2, 0),
  padding: theme.spacing(2),
  '& .MuiTable-root': {
    backgroundColor: 'transparent',
  },
  '& .MuiTableRow-root:nth-of-type(odd)': {
    backgroundColor: 'rgba(209,217,230,0.3)',
  },
  '& .MuiTableCell-root': {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));

// Search and input fields with neumorphic inset effect
export const EnhancedTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.background.default,
    borderRadius: '12px',
    boxShadow: 'inset 6px 6px 10px rgb(163,177,198,0.6), inset -6px -6px 10px rgba(255,255,255, 0.5)',
    '& fieldset': {
      border: 'none',
    },
    '&:hover': {
      backgroundColor: theme.palette.background.dark,
    },
    '&.Mui-focused': {
      boxShadow: 'inset 4px 4px 8px rgb(163,177,198,0.6), inset -4px -4px 8px rgba(255,255,255, 0.5)',
    },
  },
}));

// Comment box with neumorphic inset effect
export const CommentBox = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.background.default,
    borderRadius: '12px',
    boxShadow: 'inset 6px 6px 10px rgb(163,177,198,0.6), inset -6px -6px 10px rgba(255,255,255, 0.5)',
    minHeight: '80px',
    '& fieldset': {
      border: 'none',
    },
  },
}));

// Enhanced button with neumorphic effect
export const EnhancedButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  boxShadow: '9px 9px 16px rgb(163,177,198,0.6), -9px -9px 16px rgba(255,255,255, 0.5)',
  borderRadius: '12px',
  padding: '10px 20px',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: theme.palette.background.dark,
    boxShadow: '6px 6px 10px rgb(163,177,198,0.6), -6px -6px 10px rgba(255,255,255, 0.5)',
  },
  '&:active': {
    boxShadow: 'inset 6px 6px 10px rgb(163,177,198,0.6), inset -6px -6px 10px rgba(255,255,255, 0.5)',
  },
}));

// Tab styling with neumorphic effect
export const StyledTabs = styled(Tabs)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  boxShadow: '9px 9px 16px rgb(163,177,198,0.6), -9px -9px 16px rgba(255,255,255, 0.5)',
  borderRadius: '12px',
  padding: '5px',
  '& .MuiTab-root': {
    textTransform: 'none',
    borderRadius: '10px',
    margin: '0 5px',
    transition: 'all 0.3s ease',
  },
}));

export const StyledTab = styled(Tab)(({ theme }) => ({
  '&.Mui-selected': {
    backgroundColor: theme.palette.background.dark,
    boxShadow: 'inset 6px 6px 10px rgb(163,177,198,0.6), inset -6px -6px 10px rgba(255,255,255, 0.5)',
  },
}));

// Profile section styling with neumorphic effect
export const ProfileSection = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  boxShadow: '9px 9px 16px rgb(163,177,198,0.6), -9px -9px 16px rgba(255,255,255, 0.5)',
  borderRadius: '15px',
  padding: theme.spacing(3),
  margin: theme.spacing(2, 0),
  '& .profile-header': {
    marginBottom: theme.spacing(2),
  },
  '& .profile-content': {
    backgroundColor: theme.palette.background.dark,
    padding: theme.spacing(2),
    borderRadius: '12px',
    boxShadow: 'inset 6px 6px 10px rgb(163,177,198,0.6), inset -6px -6px 10px rgba(255,255,255, 0.5)',
  },
}));

// Social feed container with neumorphic effect
export const FeedContainer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  padding: theme.spacing(2),
  borderRadius: '15px',
  boxShadow: '9px 9px 16px rgb(163,177,198,0.6), -9px -9px 16px rgba(255,255,255, 0.5)',
  '& > *': {
    marginBottom: theme.spacing(2),
  },
}));

// Public area container with neumorphic effect
export const PublicAreaContainer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  padding: theme.spacing(2),
  borderRadius: '15px',
  boxShadow: '9px 9px 16px rgb(163,177,198,0.6), -9px -9px 16px rgba(255,255,255, 0.5)',
  '& > *': {
    marginBottom: theme.spacing(2),
  },
})); 