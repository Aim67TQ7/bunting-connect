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
    // Check for error in query params first
    const errorParam = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    
    if (errorParam) {
      setError(errorDescription || 'Authentication failed');
      return;
    }

    // Check for error in hash fragment (Supabase returns errors here too)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const hashError = hashParams.get('error');
    const hashErrorDescription = hashParams.get('error_description');
    
    if (hashError) {
      setError(hashErrorDescription || hashError || 'Authentication failed');
      return;
    }

    setStatus('Verifying your credentials...');

    // Set up auth state listener - this fires when Supabase processes the hash
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('[Callback] Auth event:', event);
        
        if (event === 'SIGNED_IN' && session) {
          setStatus('Login successful! Redirecting...');
          
          // Get return URL from sessionStorage or fallback
          const storedReturnUrl = sessionStorage.getItem('auth_return_url');
          sessionStorage.removeItem('auth_return_url');
          const returnUrl = storedReturnUrl || getReturnUrl();
          
          // Small delay for UX, then redirect
          setTimeout(() => {
            window.location.href = returnUrl;
          }, 1000);
        }
      }
    );

    // Fallback timeout - if no auth event after 10 seconds, show error
    const timeout = setTimeout(() => {
      setError('Authentication timed out. Please try again.');
    }, 10000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
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
