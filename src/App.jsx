import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ProtectedRoute from '@/components/ProtectedRoute';
import { I18nProvider } from '@/lib/i18n';
import { ThemeProvider } from '@/lib/ThemeContext';
import { NotificationProvider } from '@/lib/NotificationContext';

import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

import AppLayout from '@/components/layout/AppLayout';
import Dashboard from '@/pages/Dashboard';
import Orders from '@/pages/Orders';
import Trucks from '@/pages/Trucks';
import Drivers from '@/pages/Drivers';
import Companies from '@/pages/Companies';
import Locations from '@/pages/Locations';
import Reports from '@/pages/Reports';
import Settings from '@/pages/Settings';
import DriverGroups from '@/pages/DriverGroups';
import ProductDoc from '@/pages/ProductDoc';
import UserGuide from '@/pages/UserGuide';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading ConcretePulse...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/trucks" element={<Trucks />} />
          <Route path="/drivers" element={<Drivers />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/locations" element={<Locations />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/driver-groups" element={<DriverGroups />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/product-doc" element={<ProductDoc />} />
          <Route path="/user-guide" element={<UserGuide />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <I18nProvider>
          <QueryClientProvider client={queryClientInstance}>
            <Router>
              <NotificationProvider>
                <AuthenticatedApp />
              </NotificationProvider>
            </Router>
            <Toaster />
          </QueryClientProvider>
        </I18nProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App