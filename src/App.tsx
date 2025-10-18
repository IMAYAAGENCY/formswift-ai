import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import AIAssistant from "./pages/AIAssistant";
import Analytics from "./pages/Analytics";
import Templates from "./pages/Templates";
import Teams from "./pages/Teams";
import Webhooks from "./pages/Webhooks";
import SmartForms from "./pages/SmartForms";
import AIAutomation from "./pages/AIAutomation";
import Security from "./pages/Security";
import FormBuilder from "./pages/FormBuilder";
import Collaboration from "./pages/Collaboration";
import WhiteLabel from "./pages/WhiteLabel";
import APIMarketplace from "./pages/APIMarketplace";
import Consulting from "./pages/Consulting";
import ABTesting from "./pages/ABTesting";
import ConditionalLogic from "./pages/ConditionalLogic";
import PaymentIntegration from "./pages/PaymentIntegration";
import EmailIntegration from "./pages/EmailIntegration";
import CRMIntegration from "./pages/CRMIntegration";
import ProgressiveProfiling from "./pages/ProgressiveProfiling";
import CollaborationWorkflow from "./pages/CollaborationWorkflow";
import UserExperience from "./pages/UserExperience";
import AdvancedAnalytics from "./pages/AdvancedAnalytics";
import { KeyboardShortcuts } from "./components/KeyboardShortcuts";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <KeyboardShortcuts />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/webhooks" element={<Webhooks />} />
          <Route path="/smart-forms" element={<SmartForms />} />
          <Route path="/ai-automation" element={<AIAutomation />} />
          <Route path="/security" element={<Security />} />
          <Route path="/form-builder" element={<FormBuilder />} />
          <Route path="/collaboration" element={<Collaboration />} />
          <Route path="/white-label" element={<WhiteLabel />} />
          <Route path="/api-marketplace" element={<APIMarketplace />} />
          <Route path="/consulting" element={<Consulting />} />
          <Route path="/ab-testing" element={<ABTesting />} />
          <Route path="/conditional-logic" element={<ConditionalLogic />} />
          <Route path="/payment-integration" element={<PaymentIntegration />} />
          <Route path="/email-integration" element={<EmailIntegration />} />
          <Route path="/crm-integration" element={<CRMIntegration />} />
          <Route path="/progressive-profiling" element={<ProgressiveProfiling />} />
          <Route path="/collaboration-workflow" element={<CollaborationWorkflow />} />
          <Route path="/user-experience" element={<UserExperience />} />
          <Route path="/advanced-analytics" element={<AdvancedAnalytics />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
