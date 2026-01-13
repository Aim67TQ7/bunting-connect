import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import BuntingLogo from '@/components/BuntingLogo';
import DevBanner from '@/components/DevBanner';
import AuthCard from '@/components/AuthCard';
import MicrosoftLoginButton from '@/components/MicrosoftLoginButton';
import BadgeLoginButton from '@/components/BadgeLoginButton';
import { isDevelopment, getReturnUrl } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  
  const message = searchParams.get('message');
  const returnUrl = getReturnUrl();

  const handleMicrosoftLogin = async () => {
    setIsLoading(true);
    try {
      // Store return URL for after OAuth callback
      sessionStorage.setItem('auth_return_url', returnUrl);
      
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
    navigate(`/badge-login?return_url=${encodeURIComponent(returnUrl)}`);
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

            {/* Additional Links */}
            <div className="mt-8 space-y-4 text-center text-sm">
              <div>
                <span className="text-muted-foreground">Already have an email account? </span>
                <a href="#" className="text-primary hover:underline">Sign in with email</a>
              </div>
              
              <div>
                <a href="#" className="text-primary hover:underline">Forgot your password?</a>
              </div>
              
              <div className="pt-2 border-t border-border">
                <span className="text-muted-foreground">Don't have an account? </span>
                <a href="#" className="text-primary hover:underline">Sign up</a>
              </div>
            </div>
          </AuthCard>
        </div>
      </main>
    </div>
  );
};

export default Login;
