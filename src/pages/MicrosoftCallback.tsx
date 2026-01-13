import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import BuntingLogo from '@/components/BuntingLogo';
import AuthCard from '@/components/AuthCard';
import { supabase } from '@/lib/supabase';
import { isDevelopment } from '@/lib/auth';

// Read return URL from cookie
const getCookieReturnUrl = (): string | null => {
  const match = document.cookie.match(/auth_return_url=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
};

// Clear return URL from both storage locations
const clearReturnUrlStorage = () => {
  sessionStorage.removeItem('auth_return_url');
  const domain = isDevelopment() ? '' : '; domain=.buntinggpt.com';
  document.cookie = `auth_return_url=; path=/${domain}; max-age=0`;
};


const MicrosoftCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('Processing your login...');

  // At the VERY TOP of the component, before anything else
  const [debugStop] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('debug') === 'stop';
  });

  if (debugStop) {
    return (
      <div style={{ padding: '20px', fontFamily: 'monospace' }}>
        <h1>DEBUG MODE - Redirects Disabled</h1>
        <button onClick={async () => {
          const { data } = await supabase.auth.getSession();
          alert(`Session: ${data.session ? 'YES - ' + data.session.user.email : 'NO'}`);
        }}>Check Session</button>
        <br/><br/>
        <button onClick={() => {
          alert(`Cookies: ${document.cookie}`);
        }}>Check Cookies</button>
        <br/><br/>
        <button onClick={() => {
          const params = new URLSearchParams(window.location.search);
          alert(`returnUrl param: ${params.get('returnUrl')}`);
        }}>Check returnUrl</button>
        <br/><br/>
        <button onClick={() => {
          window.location.href = 'https://self.buntinggpt.com?debug=stop';
        }}>Go to self.buntinggpt.com (with debug)</button>
      </div>
    );
  }

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

    // Helper function to get return URL and redirect
    const redirectToReturnUrl = () => {
      const cookieUrl = getCookieReturnUrl();
      const sessionUrl = sessionStorage.getItem('auth_return_url');
      
      // Cookie first (most reliable across OAuth), then sessionStorage, then fallback
      const returnUrl = cookieUrl || sessionUrl || 'https://buntinggpt.com';
      
      console.log('[Callback] Redirecting to:', returnUrl);
      clearReturnUrlStorage();
      window.location.href = returnUrl;
    };

    let subscription: { unsubscribe: () => void } | null = null;
    let timeout: NodeJS.Timeout | null = null;

    // IIFE to handle async session check
    (async () => {
      // CRITICAL: Check for existing session immediately
      // This handles the race condition where Supabase already processed the hash
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log('[Callback] Found existing session immediately');
        setStatus('Login successful! Redirecting...');
        setTimeout(() => redirectToReturnUrl(), 500);
        return;
      }

      // Set up auth state listener for when Supabase processes the hash
      const authListener = supabase.auth.onAuthStateChange(
        (event, session) => {
          console.log('[Callback] Auth event:', event);
          
          if (event === 'SIGNED_IN' && session) {
            setStatus('Login successful! Redirecting...');
            setTimeout(() => redirectToReturnUrl(), 500);
          }
        }
      );
      subscription = authListener.data.subscription;

      // Fallback timeout - if no auth event after 10 seconds, show error
      timeout = setTimeout(() => {
        setError('Authentication timed out. Please try again.');
      }, 10000);
    })();

    return () => {
      subscription?.unsubscribe();
      if (timeout) clearTimeout(timeout);
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
