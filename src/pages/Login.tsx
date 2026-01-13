import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import BuntingLogo from '@/components/BuntingLogo';
import DevBanner from '@/components/DevBanner';
import AuthCard from '@/components/AuthCard';
import MicrosoftLoginButton from '@/components/MicrosoftLoginButton';
import BadgeLoginButton from '@/components/BadgeLoginButton';
import { isDevelopment, getReturnUrl } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// Store return URL in a domain-scoped cookie for reliable persistence across OAuth
const storeReturnUrlCookie = (url: string) => {
  const domain = isDevelopment() ? '' : '; domain=.buntinggpt.com';
  const secure = isDevelopment() ? '' : '; Secure';
  document.cookie = `auth_return_url=${encodeURIComponent(url)}; path=/${domain}; max-age=300; SameSite=Lax${secure}`;
};

const Login: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  
  const message = searchParams.get('message');
  const returnUrl = getReturnUrl();

  // Check if already authenticated and redirect immediately
  useEffect(() => {
    const redirectIfAuthenticated = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('[Login] Session check:', session ? 'FOUND' : 'NONE');
        
        if (session) {
          const returnUrl = getReturnUrl(); // Get it here, not from state
          console.log('[Login] Already authenticated, redirecting to:', returnUrl);
          window.location.href = returnUrl;
          return;
        }
      } catch (error) {
        console.error('[Login] Session check error:', error);
      }
      setIsCheckingSession(false);
    };
    
    redirectIfAuthenticated();
  }, []); // Empty dependency array - runs once on mount

  // Show loading spinner while checking session
  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleMicrosoftLogin = async () => {
    setIsLoading(true);
    try {
      // Read returnUrl fresh from URL params (not from state which may be stale)
      const params = new URLSearchParams(window.location.search);
      const freshReturnUrl = params.get('returnUrl') || params.get('return_url') || 'https://buntinggpt.com';
      
      // Store in BOTH sessionStorage (fast) and cookie (reliable fallback)
      sessionStorage.setItem('auth_return_url', freshReturnUrl);
      storeReturnUrlCookie(freshReturnUrl);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: {
          scopes: 'email profile openid',
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            prompt: 'select_account',
          },
        },
      });
      
      if (error) {
        console.error('Microsoft OAuth error:', error);
        toast.error('Unable to sign in with Microsoft', {
          description: error.message,
        });
      }
    } catch (error) {
      console.error('Microsoft login error:', error);
      toast.error('Unable to connect. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBadgeLogin = () => {
    // Redirect to the badge login app
    window.location.href = `https://badge.buntinggpt.com?return_url=${encodeURIComponent(returnUrl)}`;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DevBanner />
      
      <main className={`flex-1 flex items-center justify-center p-4 ${isDevelopment() ? 'pt-12' : ''}`}>
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          {/* Logo */}
          <div className="flex justify-center">
            <BuntingLogo size="lg" />
          </div>
          
          {/* Auth Card */}
          <AuthCard>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Login
              </h1>
              <p className="text-muted-foreground text-sm">
                Enter your buntingmagnetics.com email to sign in to your account
              </p>
            </div>

            {/* Status Message */}
            {message && (
              <div className="mb-6 p-3 bg-muted rounded-lg text-center text-sm text-muted-foreground">
                {message}
              </div>
            )}

            {/* Login Options */}
            <div className="space-y-4">
              <MicrosoftLoginButton 
                onClick={handleMicrosoftLogin}
                loading={isLoading}
                disabled={isLoading}
              />
              
              <div className="auth-divider">
                <span>OR</span>
              </div>
              
              <BadgeLoginButton 
                onClick={handleBadgeLogin}
                disabled={isLoading}
              />
              
              <p className="text-center text-xs text-muted-foreground">
                For employees without company email access
              </p>
            </div>
          </AuthCard>
        </div>
      </main>
    </div>
  );
};

export default Login;
