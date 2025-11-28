/**
 * Main Application Component
 * React Router setup with authentication and protected routes
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/layout/Layout';
import { Login, Dashboard, Employees, Attendance, Analytics, Payroll, Settings, MyAttendance, Security } from './pages';

// Create a client for React Query
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
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public route */}
            <Route path="/login" element={<Login />} />

            {/* Protected routes with layout */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route
                path="employees"
                element={
                  <ProtectedRoute roles={['admin', 'manager']}>
                    <Employees />
                  </ProtectedRoute>
                }
              />
              <Route path="attendance" element={<Attendance />} />
              <Route path="analytics" element={<Analytics />} />
              <Route
                path="payroll"
                element={
                  <ProtectedRoute roles={['admin', 'manager']}>
                    <Payroll />
                  </ProtectedRoute>
                }
              />
              <Route
                path="settings"
                element={
                  <ProtectedRoute roles={['admin']}>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route path="my-attendance" element={<MyAttendance />} />
              <Route path="security" element={<Security />} />
            </Route>

            {/* Catch all - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
