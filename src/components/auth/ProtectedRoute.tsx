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
    
    // Check if user has completed onboarding from Supabase user metadata
    if (user) {
      try {
        const { supabase } = await import('@/lib/supabase');
        const { data: { user: fullUser } } = await supabase.auth.getUser();
        const onboardingComplete = fullUser?.user_metadata?.onboarding_complete;
        setNeedsOnboarding(!onboardingComplete);
      } catch (error) {
        console.error('Failed to check onboarding status:', error);
        setNeedsOnboarding(false); // Default to not needing onboarding on error
      }
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
