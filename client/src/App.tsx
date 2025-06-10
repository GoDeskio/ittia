import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useTheme } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import AdminDashboard from './pages/AdminDashboard';
import { ErrorReportDialog } from './components/ErrorReportDialog';
import { ErrorLogDashboard } from './components/ErrorLogDashboard';
import Messages from './pages/Messages';
import theme from './theme';
import AboutPage from './pages/AboutPage';
import SettingsPage from './pages/SettingsPage';
import Layout from './components/Layout';
import CyborgLoadingPage from './pages/CyborgLoadingPage';

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null; errorInfo: React.ErrorInfo | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorReportDialog
          open={true}
          onClose={() => this.setState({ hasError: false })}
          errorType={this.state.error?.name}
          errorStack={this.state.error?.stack}
        />
      );
    }

    return this.props.children;
  }
}

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, token } = useAuth();

  if (!isAuthenticated || !token) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      event.preventDefault();
      setErrorDialogOpen(true);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <PrivateRoute>
                    <SettingsPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <PrivateRoute>
                    {user?.authMethods.admin ? (
                      <AdminDashboard />
                    ) : (
                      <Navigate to="/" />
                    )}
                  </PrivateRoute>
                }
              />
              <Route
                path="/error-logs"
                element={
                  <PrivateRoute>
                    {user?.authMethods.admin ? (
                      <ErrorLogDashboard />
                    ) : (
                      <Navigate to="/" />
                    )}
                  </PrivateRoute>
                }
              />
              <Route
                path="/messages"
                element={
                  <PrivateRoute>
                    <Messages />
                  </PrivateRoute>
                }
              />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/cyborg-loading" element={
                <Layout>
                  <CyborgLoadingPage />
                </Layout>
              } />
            </Routes>

            {/* Error reporting dialog for unhandled errors */}
            <ErrorReportDialog
              open={errorDialogOpen}
              onClose={() => setErrorDialogOpen(false)}
            />
          </div>
        </Router>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App; 