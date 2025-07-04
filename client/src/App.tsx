import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useTheme } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Registration from './pages/Registration';
import ForgotCredentials from './pages/ForgotCredentials';
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
import AdminRoute from './components/AdminRoute';
import PrivateRoute from './components/PrivateRoute';

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

const AppContent: React.FC = () => {
  const { colors } = useTheme();
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
              <Route path="/register" element={<Registration />} />
              <Route path="/forgot-credentials" element={<ForgotCredentials />} />
              <Route
                path="/dashboard/*"
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
                  <AdminRoute>
                    {user?.authMethods?.admin ? (
                      <AdminDashboard />
                    ) : (
                      <Navigate to="/" />
                    )}
                  </AdminRoute>
                }
              />
              <Route
                path="/god"
                element={
                  <AdminRoute requiredRole="god">
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
              <Route
                path="/error-logs"
                element={
                  <PrivateRoute>
                    {user?.authMethods?.admin ? (
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
              <Route path="/" element={<Navigate to="/login" replace />} />
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