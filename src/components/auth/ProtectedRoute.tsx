import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabaseAuthService } from '@/lib/supabaseAuthService';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const user = await supabaseAuthService.getCurrentUser();
    setAuthenticated(!!user);
    
    // Check if user has completed onboarding
    if (user) {
      const onboardingComplete = localStorage.getItem('onboarding_complete');
      setNeedsOnboarding(!onboardingComplete);
    }
    
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect to onboarding if not completed (except if already on onboarding page)
  if (needsOnboarding && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
