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
import NotFound from "./pages/NotFound";
import TestRunner from "./test-runner";
import { MobileOptimizedFieldDashboard } from "./components/soilsati/MobileOptimizedFieldDashboard";
import { AIAdvisorFAB } from "./components/layout/AIAdvisorFAB";
import { blackBoxService } from "@/lib/blackBoxService";
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
  }, []);

  return (
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/soilsati" element={<SoilSati />} />
              <Route path="/soilsati/map-field" element={<FieldMapping />} />
              <Route path="/soilsati/field/:fieldId" element={<FieldDetails />} />
              <Route path="/soilsati/field-mobile/:fieldId" element={<MobileOptimizedFieldDashboard />} />
              <Route path="/disease" element={<DiseaseDetection />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/marketplace/product/:productId" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/schemes" element={<Schemes />} />
              <Route path="/weather" element={<Weather />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings/ai" element={<AISettingsPage />} />
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
