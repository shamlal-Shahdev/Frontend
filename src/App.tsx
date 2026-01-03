import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/guards/ProtectedRoute";
import { AdminRoute } from "@/components/guards/AdminRoute";

// Auth pages
import { Register } from "./pages/auth/Register";
import { Login } from "./pages/auth/Login";
import { ForgotPassword } from "./pages/auth/ForgotPassword";
import { ResetPassword } from "./pages/auth/ResetPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";

// User pages
import { KYC } from '@/pages/user/KYC';
import { KYCInfo } from '@/pages/user/KYCInfo';
import { KYCStatus } from "./pages/user/KYCStatus";
import { Dashboard } from "./pages/user/Dashboard";
import { Profile } from "./pages/user/Profile";

// Admin pages
import { AdminLogin } from "./pages/admin/AdminLogin";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { KYCReview } from "./pages/admin/KYCReview";
import { KYCDetail } from "./pages/admin/KYCDetail";

// Other pages
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // Debug: Check if app is rendering
  console.log('App component rendering...');
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected User Routes */}
          <Route path="/kyc" element={
            <ProtectedRoute>
              <Navigate to="/kyc/info" replace />
            </ProtectedRoute>
          } />
          <Route path="/kyc/info" element={
            <ProtectedRoute>
              <KYCInfo />
            </ProtectedRoute>
          } />
          <Route path="/kyc/documents" element={
            <ProtectedRoute>
              <KYC />
            </ProtectedRoute>
          } />
          <Route path="/kyc-status" element={
            <ProtectedRoute>
              <KYCStatus />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          <Route path="/admin/kyc" element={
            <AdminRoute>
              <KYCReview />
            </AdminRoute>
          } />
          <Route path="/admin/kyc/:userId" element={
            <AdminRoute>
              <KYCDetail />
            </AdminRoute>
          } />

          {/* Default Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
