import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import BuntingLogo from '@/components/BuntingLogo';
import DevBanner from '@/components/DevBanner';
import AuthCard from '@/components/AuthCard';
import MicrosoftLoginButton from '@/components/MicrosoftLoginButton';
import BadgeLoginButton from '@/components/BadgeLoginButton';
import { isDevelopment, getReturnUrl } from '@/lib/auth';
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
      // TODO: Implement Microsoft OAuth with Supabase
      // For now, show a toast indicating Supabase needs to be connected
      toast.info('Microsoft OAuth requires Supabase configuration', {
        description: 'Connect Supabase and configure Azure AD OAuth provider',
      });
      
      // When Supabase is connected, this will redirect to Microsoft OAuth:
      // const { error } = await supabase.auth.signInWithOAuth({
      //   provider: 'azure',
      //   options: {
      //     scopes: 'openid profile email',
      //     redirectTo: `${window.location.origin}/auth/callback?return_url=${encodeURIComponent(returnUrl)}`,
      //   }
      // });
      
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
                Welcome Back
              </h1>
              <p className="text-muted-foreground">
                Sign in to access the Bunting platform
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
                <span>or</span>
              </div>
              
              <BadgeLoginButton 
                onClick={handleBadgeLogin}
                disabled={isLoading}
              />
            </div>
          </AuthCard>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground">
            Protected by Bunting IT Security • Need help?{' '}
            <a 
              href="mailto:it@buntingmagnetics.com" 
              className="text-primary hover:underline"
            >
              Contact IT Support
            </a>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Login;
