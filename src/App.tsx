import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/guards/ProtectedRoute";
import { AdminRoute } from "@/components/guards/AdminRoute";
import { VendorRoute } from "@/components/guards/VendorRoute";
import { Register } from "./pages/auth/Register";
import { Login } from "./pages/auth/Login";
import { ForgotPassword } from "./pages/auth/ForgotPassword";
import { ResetPassword } from "./pages/auth/ResetPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";
import { EmailVerificationSent } from "./pages/auth/EmailVerificationSent";
import { KYC } from '@/pages/user/KYC';
import { KYCInfo } from '@/pages/user/KYCInfo';
import { KYCStatus } from "./pages/user/KYCStatus";
import { Dashboard } from "./pages/user/Dashboard";
import { Profile } from "./pages/user/Profile";
import InstallToEarn from "./pages/user/InstallToEarn";
import { InstallationStatus } from "./pages/user/InstallationStatus";
import { EnergyStatus } from "./pages/user/EnergyStatus";
import { Wallet } from "./pages/user/Wallet";
import { Certificates } from "./pages/user/Certificates";
import VerifyCertificate from "./pages/VerifyCertificate";
import { CarbonOffset } from "./pages/user/CarbonOffset";
import { Marketplace } from "./pages/user/Marketplace";
import { PurchaseSuccess } from "./pages/user/PurchaseSuccess";
import { MyCoupons } from "./pages/user/MyCoupons";
import { Predict } from "./pages/user/Predict";
import { AdminLogin } from "./pages/admin/AdminLogin";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { KYCReview } from "./pages/admin/KYCReview";
import { KYCDetail } from "./pages/admin/KYCDetail";
import { InstallationRequests } from "./pages/admin/InstallationRequests";
import { EnergyRequests } from "./pages/admin/EnergyRequests";
import { AdminRewardTransactions } from "./pages/admin/AdminRewardTransactions";
import { AdminCertificates } from "./pages/admin/AdminCertificates";
import { AdminPredictions } from "./pages/admin/AdminPredictions";
import { AdminMarketplace } from "./pages/admin/AdminMarketplace";
import { AdminWithdrawals } from "./pages/admin/AdminWithdrawals";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { UserLayout } from "@/components/user/UserLayout";
import { VendorLayout } from "@/components/vendor/VendorLayout";
import { VendorRegister } from "./pages/vendor/VendorRegister";
import { VendorLogin } from "./pages/vendor/VendorLogin";
import { VendorForgotPassword } from "./pages/vendor/VendorForgotPassword";
import { VendorResetPassword } from "./pages/vendor/VendorResetPassword";
import { VendorDashboard } from "./pages/vendor/VendorDashboard";
import { VendorInstallations } from "./pages/vendor/VendorInstallations";
import { VendorProfile } from "./pages/vendor/VendorProfile";
import { VendorEmailVerificationSent } from "./pages/vendor/VendorEmailVerificationSent";
import { VendorUsageImport } from "./pages/vendor/VendorUsageImport";
import { VendorCompanyOnboarding } from "./pages/vendor/VendorCompanyOnboarding";
import { VendorMarketplaceDashboard } from "./pages/vendor/VendorMarketplaceDashboard";
import { VendorCoupons } from "./pages/vendor/VendorCoupons";
import { VendorCreateCoupon } from "./pages/vendor/VendorCreateCoupon";
import { VendorWallet } from "./pages/vendor/VendorWallet";
import NotFound from "./pages/NotFound";
const queryClient = new QueryClient();
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {}
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/email-verification-sent" element={<EmailVerificationSent />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          {}
          <Route path="/verify-certificate/:certificateId" element={<VerifyCertificate />} />
          {}
          <Route element={<ProtectedRoute />}>
            <Route path="/kyc" element={<Navigate to="/kyc/info" replace />} />
            <Route path="/kyc/info" element={<KYCInfo />} />
            <Route path="/kyc/documents" element={<KYC />} />
            <Route path="/kyc-status" element={<KYCStatus />} />
            <Route element={<UserLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/install-to-earn" element={<InstallToEarn />} />
              <Route path="/installation-status" element={<InstallationStatus />} />
              <Route path="/energy/upload" element={<Navigate to="/energy/status" replace />} />
              <Route path="/energy/status" element={<EnergyStatus />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/certificates" element={<Certificates />} />
              <Route path="/carbon" element={<CarbonOffset />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/marketplace/my-coupons" element={<MyCoupons />} />
              <Route path="/marketplace/purchase-success" element={<PurchaseSuccess />} />
              <Route path="/marketplace/:id/purchase" element={<Navigate to="/marketplace" replace />} />
              <Route path="/marketplace/:id" element={<Navigate to="/marketplace" replace />} />
              <Route path="/predict" element={<Predict />} />
            </Route>
          </Route>
          {}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="kyc" element={<KYCReview />} />
              <Route path="kyc/:userId" element={<KYCDetail />} />
              <Route path="installations" element={<InstallationRequests />} />
              <Route path="energy-requests" element={<EnergyRequests />} />
              <Route path="rewards" element={<AdminRewardTransactions />} />
              <Route path="certificates" element={<AdminCertificates />} />
              <Route path="predictions" element={<AdminPredictions />} />
              <Route path="marketplace" element={<AdminMarketplace />} />
              <Route path="withdrawals" element={<AdminWithdrawals />} />
            </Route>
          </Route>
          {}
          <Route path="/vendor/register" element={<VendorRegister />} />
          <Route path="/vendor/login" element={<VendorLogin />} />
          <Route path="/vendor/email-verification-sent" element={<VendorEmailVerificationSent />} />
          <Route path="/vendor/forgot-password" element={<VendorForgotPassword />} />
          <Route path="/vendor/reset-password" element={<VendorResetPassword />} />
          <Route path="/vendor" element={<VendorRoute />}>
            <Route path="company-onboarding" element={<VendorCompanyOnboarding />} />
            <Route element={<VendorLayout />}>
              <Route path="dashboard" element={<VendorDashboard />} />
              <Route path="wallet" element={<VendorWallet />} />
              <Route path="installations" element={<VendorInstallations />} />
              <Route path="usage-import" element={<VendorUsageImport />} />
              <Route path="profile" element={<VendorProfile />} />
              <Route path="marketplace" element={<VendorMarketplaceDashboard />} />
              <Route path="marketplace/coupons/create" element={<VendorCreateCoupon />} />
              <Route path="marketplace/coupons" element={<VendorCoupons />} />
            </Route>
          </Route>
          {}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};
export default App;
