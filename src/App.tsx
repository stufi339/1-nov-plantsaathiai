import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/hooks/useLanguage";
import Dashboard from "./pages/Dashboard";
import Notifications from "./pages/Notifications";
import SoilSati from "./pages/SoilSati";
import FieldMapping from "./pages/FieldMapping";
import FieldDetails from "./pages/FieldDetails";
import DiseaseDetection from "./pages/DiseaseDetection";
import Marketplace from "./pages/Marketplace";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Admin from "./pages/Admin";
import Schemes from "./pages/Schemes";
import Weather from "./pages/Weather";
import Profile from "./pages/Profile";
import { AISettingsPage } from "./pages/AISettingsPage";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";
import TestRunner from "./test-runner";
import { MobileOptimizedFieldDashboard } from "./components/soilsati/MobileOptimizedFieldDashboard";
import { AIAdvisorFAB } from "./components/layout/AIAdvisorFAB";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import CropRotation from "./pages/CropRotation";
import { MandiPrices } from "./pages/MandiPrices";
import { blackBoxService } from "@/lib/blackBoxService";
import { supabaseAnalyticsService } from "@/lib/supabaseAnalyticsService";
import { useEffect } from "react";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Initialize black box service and log app start
    blackBoxService.logUserInteraction('session_start', 'app_initialization', undefined, {
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      url: window.location.href
    });

    // Also log to Supabase for persistence
    supabaseAnalyticsService.logEvent('session_start', {
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      url: window.location.href
    });
  }, []);

  return (
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
              
              {/* Protected routes */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
              <Route path="/soilsati" element={<ProtectedRoute><SoilSati /></ProtectedRoute>} />
              <Route path="/soilsati/map-field" element={<ProtectedRoute><FieldMapping /></ProtectedRoute>} />
              <Route path="/soilsati/field/:fieldId" element={<ProtectedRoute><FieldDetails /></ProtectedRoute>} />
              <Route path="/soilsati/field-mobile/:fieldId" element={<ProtectedRoute><MobileOptimizedFieldDashboard /></ProtectedRoute>} />
              <Route path="/crop-rotation/:fieldId" element={<ProtectedRoute><CropRotation /></ProtectedRoute>} />
              <Route path="/disease" element={<ProtectedRoute><DiseaseDetection /></ProtectedRoute>} />
              <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
              <Route path="/marketplace/product/:productId" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
              <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
              <Route path="/schemes" element={<ProtectedRoute><Schemes /></ProtectedRoute>} />
              <Route path="/weather" element={<ProtectedRoute><Weather /></ProtectedRoute>} />
              <Route path="/mandi-prices" element={<ProtectedRoute><MandiPrices /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/settings/ai" element={<ProtectedRoute><AISettingsPage /></ProtectedRoute>} />
              <Route path="/test" element={<TestRunner />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            
            {/* AI Assistant Floating Action Button */}
            <AIAdvisorFAB />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </LanguageProvider>
  );
};

export default App;
