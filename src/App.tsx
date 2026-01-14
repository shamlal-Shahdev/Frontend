import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/guards/ProtectedRoute";
import { AdminRoute } from "@/components/guards/AdminRoute";
import { VendorRoute } from "@/components/guards/VendorRoute";

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
import InstallToEarn from "./pages/user/InstallToEarn";
import { InstallationStatus } from "./pages/user/InstallationStatus";

// Admin pages
import { AdminLogin } from "./pages/admin/AdminLogin";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { KYCReview } from "./pages/admin/KYCReview";
import { KYCDetail } from "./pages/admin/KYCDetail";
import { InstallationRequests } from "./pages/admin/InstallationRequests";

// Vendor pages
import { VendorRegister } from "./pages/vendor/VendorRegister";
import { VendorLogin } from "./pages/vendor/VendorLogin";
import { VendorForgotPassword } from "./pages/vendor/VendorForgotPassword";
import { VendorResetPassword } from "./pages/vendor/VendorResetPassword";
import { VendorDashboard } from "./pages/vendor/VendorDashboard";
import { VendorInstallations } from "./pages/vendor/VendorInstallations";
import { VendorProfile } from "./pages/vendor/VendorProfile";

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
          <Route path="/install-to-earn" element={
            <ProtectedRoute>
              <InstallToEarn />
            </ProtectedRoute>
          } />
          <Route path="/installation-status" element={
            <ProtectedRoute>
              <InstallationStatus />
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
          <Route path="/admin/installations" element={
            <AdminRoute>
              <InstallationRequests />
            </AdminRoute>
          } />

          {/* Vendor Routes */}
          <Route path="/vendor/register" element={<VendorRegister />} />
          <Route path="/vendor/login" element={<VendorLogin />} />
          <Route path="/vendor/forgot-password" element={<VendorForgotPassword />} />
          <Route path="/vendor/reset-password" element={<VendorResetPassword />} />
          <Route path="/vendor/dashboard" element={
            <VendorRoute>
              <VendorDashboard />
            </VendorRoute>
          } />
          <Route path="/vendor/installations" element={
            <VendorRoute>
              <VendorInstallations />
            </VendorRoute>
          } />
          <Route path="/vendor/profile" element={
            <VendorRoute>
              <VendorProfile />
            </VendorRoute>
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
