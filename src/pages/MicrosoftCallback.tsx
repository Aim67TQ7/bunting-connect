import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import BuntingLogo from '@/components/BuntingLogo';
import AuthCard from '@/components/AuthCard';
import { supabase } from '@/lib/supabase';
import { getReturnUrl } from '@/lib/auth';

const MicrosoftCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('Processing your login...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const errorParam = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        if (errorParam) {
          setError(errorDescription || 'Authentication failed');
          return;
        }

        setStatus('Verifying your credentials...');

        // Get session from Supabase - this handles the OAuth callback automatically
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          throw sessionError;
        }
        
        if (!session) {
          // Wait a moment and try again - OAuth callback may still be processing
          await new Promise(resolve => setTimeout(resolve, 1000));
          const { data: { session: retrySession }, error: retryError } = await supabase.auth.getSession();
          
          if (retryError || !retrySession) {
            throw new Error('No session created. Please try logging in again.');
          }
        }

        setStatus('Login successful! Redirecting...');
        
        // Get return URL from sessionStorage or fallback
        const storedReturnUrl = sessionStorage.getItem('auth_return_url');
        sessionStorage.removeItem('auth_return_url');
        const returnUrl = storedReturnUrl || getReturnUrl();
        
        // Small delay for UX
        setTimeout(() => {
          window.location.href = returnUrl;
        }, 1000);

      } catch (err) {
        console.error('Callback error:', err);
        setError('An error occurred during login. Please try again.');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="flex justify-center">
            <BuntingLogo size="lg" />
          </div>
          
          <AuthCard>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">
                Authentication Error
              </h2>
              <p className="text-muted-foreground mb-6">
                {error}
              </p>
              <button
                onClick={() => navigate('/')}
                className="text-primary hover:underline"
              >
                Return to login
              </button>
            </div>
          </AuthCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex justify-center">
          <BuntingLogo size="lg" />
        </div>
        
        <AuthCard>
          <div className="text-center">
            <Loader2 className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
            <h2 className="text-xl font-bold text-foreground mb-2">
              Signing you in
            </h2>
            <p className="text-muted-foreground">
              {status}
            </p>
          </div>
        </AuthCard>
      </div>
    </div>
  );
};

export default MicrosoftCallback;
