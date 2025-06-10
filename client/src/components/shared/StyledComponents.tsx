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

// Shared card component with consistent styling
export const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)',
  borderRadius: 8,
  margin: theme.spacing(2),
  overflow: 'visible',
}));

// Profile sections and user content areas
export const ContentSection = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)',
  borderRadius: 8,
  padding: theme.spacing(3),
  margin: theme.spacing(2, 0),
}));

// Enhanced table container with better visibility
export const VisibleTableContainer = styled(TableContainer)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)',
  borderRadius: 8,
  margin: theme.spacing(2, 0),
  '& .MuiTable-root': {
    backgroundColor: theme.palette.background.paper,
  },
  '& .MuiTableRow-root:nth-of-type(odd)': {
    backgroundColor: theme.palette.background.light,
  },
  '& .MuiTableCell-root': {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));

// Search and input fields with inset shadow
export const EnhancedTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.background.paper,
    boxShadow: 'inset 1px 1px 3px rgba(0, 0, 0, 0.1)',
    '&:hover': {
      backgroundColor: theme.palette.background.light,
    },
  },
}));

// Comment box with inset shadow
export const CommentBox = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.background.paper,
    boxShadow: 'inset 1px 1px 3px rgba(0, 0, 0, 0.1)',
    minHeight: '80px',
  },
}));

// Enhanced button with consistent shadow
export const EnhancedButton = styled(Button)(({ theme }) => ({
  boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)',
  '&:hover': {
    boxShadow: '3px 3px 6px rgba(0, 0, 0, 0.15)',
  },
}));

// Tab styling
export const StyledTabs = styled(Tabs)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)',
  borderRadius: 8,
  '& .MuiTab-root': {
    textTransform: 'none',
  },
}));

export const StyledTab = styled(Tab)(({ theme }) => ({
  '&.Mui-selected': {
    backgroundColor: theme.palette.background.light,
  },
}));

// Profile section styling
export const ProfileSection = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)',
  borderRadius: 8,
  padding: theme.spacing(3),
  margin: theme.spacing(2, 0),
  '& .profile-header': {
    marginBottom: theme.spacing(2),
  },
  '& .profile-content': {
    backgroundColor: theme.palette.background.light,
    padding: theme.spacing(2),
    borderRadius: 4,
  },
}));

// Social feed container
export const FeedContainer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  padding: theme.spacing(2),
  '& > *': {
    marginBottom: theme.spacing(2),
  },
}));

// Public area container
export const PublicAreaContainer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  padding: theme.spacing(2),
  '& > *': {
    marginBottom: theme.spacing(2),
  },
})); 