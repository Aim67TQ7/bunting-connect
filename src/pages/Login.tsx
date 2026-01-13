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

const Login: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  
  const message = searchParams.get('message');

  // Check if already authenticated
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        window.location.href = getReturnUrl();
        return;
      }
      setIsCheckingSession(false);
    };
    checkSession();
  }, []);

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
      // Store returnUrl in cookie ONLY (survives OAuth redirect)
      const returnUrl = getReturnUrl();
      const domain = isDevelopment() ? '' : '; domain=.buntinggpt.com';
      const secure = isDevelopment() ? '' : '; Secure';
      document.cookie = `auth_return_url=${encodeURIComponent(returnUrl)}; path=/; max-age=300; SameSite=Lax${domain}${secure}`;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: {
          scopes: 'email profile openid',
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: { prompt: 'select_account' },
        },
      });
      
      if (error) {
        toast.error('Unable to sign in with Microsoft', { description: error.message });
      }
    } catch (error) {
      toast.error('Unable to connect. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBadgeLogin = () => {
    const returnUrl = getReturnUrl();
    window.location.href = `https://badge.buntinggpt.com?return_url=${encodeURIComponent(returnUrl)}`;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DevBanner />
      
      <main className={`flex-1 flex items-center justify-center p-4 ${isDevelopment() ? 'pt-12' : ''}`}>
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          <div className="flex justify-center">
            <BuntingLogo size="lg" />
          </div>
          
          <AuthCard>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Login
              </h1>
              <p className="text-muted-foreground text-sm">
                Enter your buntingmagnetics.com email to sign in to your account
              </p>
            </div>

            {message && (
              <div className="mb-6 p-3 bg-muted rounded-lg text-center text-sm text-muted-foreground">
                {message}
              </div>
            )}

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
