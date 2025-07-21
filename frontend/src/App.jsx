import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';

// Auth store
import useAuthStore from './stores/authStore';
import { authAPI } from './services/api';

// Components
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoadingSpinner from './components/ui/LoadingSpinner';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import SheetsPage from './pages/sheets/SheetsPage';
import SheetDetailPage from './pages/sheets/SheetDetailPage';
import UploadSheetPage from './pages/sheets/UploadSheetPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProfilePage from './pages/profile/ProfilePage';
import OrdersPage from './pages/orders/OrdersPage';
import UploaderApplicationPage from './pages/uploader/UploaderApplicationPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminSheetsPage from './pages/admin/AdminSheetsPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminUploadersPage from './pages/admin/AdminUploadersPage';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  const { isAuthenticated, token, setAuth, clearAuth, setLoading } = useAuthStore();

  // Initialize auth on app start
  useEffect(() => {
    const initAuth = async () => {
      if (token && !isAuthenticated) {
        setLoading(true);
        try {
          const response = await authAPI.getProfile();
          setAuth(response.data.user, token);
        } catch (error) {
          console.error('Auth initialization failed:', error);
          clearAuth();
        } finally {
          setLoading(false);
        }
      }
    };

    initAuth();
  }, [token, isAuthenticated, setAuth, clearAuth, setLoading]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected routes with layout */}
            <Route
              path="/*"
              element={
                <Layout>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/sheets" element={<SheetsPage />} />
                    <Route path="/sheets/:id" element={<SheetDetailPage />} />
                    
                    {/* Protected routes */}
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <DashboardPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <ProfilePage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/orders"
                      element={
                        <ProtectedRoute>
                          <OrdersPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/upload"
                      element={
                        <ProtectedRoute requireUploader>
                          <UploadSheetPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/apply-uploader"
                      element={
                        <ProtectedRoute>
                          <UploaderApplicationPage />
                        </ProtectedRoute>
                      }
                    />
                    
                    {/* Admin routes */}
                    <Route
                      path="/admin"
                      element={
                        <ProtectedRoute requireAdmin>
                          <AdminDashboardPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/users"
                      element={
                        <ProtectedRoute requireAdmin>
                          <AdminUsersPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/sheets"
                      element={
                        <ProtectedRoute requireAdmin>
                          <AdminSheetsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/orders"
                      element={
                        <ProtectedRoute requireAdmin>
                          <AdminOrdersPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/uploaders"
                      element={
                        <ProtectedRoute requireAdmin>
                          <AdminUploadersPage />
                        </ProtectedRoute>
                      }
                    />
                    
                    {/* Catch all route */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Layout>
              }
            />
          </Routes>
        </div>
        
        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#363636',
            },
            success: {
              duration: 3000,
              style: {
                background: '#10B981',
                color: '#fff',
              },
            },
            error: {
              duration: 5000,
              style: {
                background: '#EF4444',
                color: '#fff',
              },
            },
          }}
        />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
