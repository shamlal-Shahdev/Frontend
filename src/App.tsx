import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import Dashboard from "./pages/Dashboard";
import Wallet from "./pages/Wallet";
import InstallToEarn from "./pages/InstallToEarn";
import KYC from "./pages/KYC";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import Energy from "./pages/Energy";
import Certificates from "./pages/Certificates";
import CarbonOffset from "./pages/CarbonOffset";
import Marketplace from "./pages/Marketplace";
import Predict from "./pages/Predict";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* <Route path="/" element={<Landing />} /> */}
          <Route path="/" element={<Auth />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/install" element={<InstallToEarn />} />
          <Route path="/kyc" element={<KYC />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/energy" element={<Energy />} />
          <Route path="/certificates" element={<Certificates />} />
          <Route path="/carbon" element={<CarbonOffset />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/predict" element={<Predict />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
