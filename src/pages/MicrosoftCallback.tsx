import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import BuntingLogo from '@/components/BuntingLogo';
import AuthCard from '@/components/AuthCard';
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

        // TODO: Handle Supabase OAuth callback
        // When Supabase is connected, this will automatically:
        // 1. Exchange the OAuth code for tokens
        // 2. Create/update the user in Supabase Auth
        // 3. Create a session
        
        // const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        // if (sessionError) throw sessionError;
        // if (!session) throw new Error('No session created');

        setStatus('Login successful! Redirecting...');
        
        // Get return URL and redirect
        const returnUrl = getReturnUrl();
        
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
