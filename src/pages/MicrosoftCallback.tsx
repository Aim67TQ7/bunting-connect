import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import BuntingLogo from '@/components/BuntingLogo';
import AuthCard from '@/components/AuthCard';
import { supabase } from '@/lib/supabase';
import { isDevelopment } from '@/lib/auth';

const MicrosoftCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('Processing your login...');

  // Debug mode check - runs before anything else
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
          const match = document.cookie.match(/auth_return_url=([^;]+)/);
          alert(`Return URL Cookie: ${match ? decodeURIComponent(match[1]) : 'NOT SET'}`);
        }}>Check Return URL</button>
        <br/><br/>
        <button onClick={() => {
          window.location.href = 'https://self.buntinggpt.com?debug=stop';
        }}>Go to self.buntinggpt.com (with debug)</button>
        <br/><br/>
        <button onClick={() => {
          document.cookie.split(';').forEach(c => {
            const name = c.trim().split('=')[0];
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.buntinggpt.com`;
          });
          alert('Cleared all cookies');
        }}>🔥 Nuclear Clear</button>
      </div>
    );
  }

  // Helper: Get return URL from cookie only
  const getReturnUrlFromCookie = (): string => {
    const match = document.cookie.match(/auth_return_url=([^;]+)/);
    // Default: stay on login hub - don't redirect to main domain
    return match ? decodeURIComponent(match[1]) : '/';
  };

  // Helper: Clear return URL cookie
  const clearReturnUrlCookie = () => {
    const domain = isDevelopment() ? '' : '; domain=.buntinggpt.com';
    document.cookie = `auth_return_url=; path=/; max-age=0${domain}`;
  };

  // Helper: Redirect to destination
  const redirectToDestination = () => {
    const returnUrl = getReturnUrlFromCookie();
    clearReturnUrlCookie();
    window.location.href = returnUrl;
  };

  useEffect(() => {
    // Check for error in query params
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setError(searchParams.get('error_description') || 'Authentication failed');
      return;
    }

    // Check for error in hash fragment
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const hashError = hashParams.get('error');
    if (hashError) {
      setError(hashParams.get('error_description') || hashError);
      return;
    }

    setStatus('Verifying your credentials...');

    // Immediate session check - handles race condition where Supabase already processed tokens
    const checkExistingSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setStatus('Login successful! Redirecting...');
        setTimeout(redirectToDestination, 500);
        return true;
      }
      return false;
    };

    checkExistingSession();

    // Listen for auth state change (backup if immediate check misses it)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setStatus('Login successful! Redirecting...');
        setTimeout(redirectToDestination, 500);
      }
    });

    // Timeout after 10 seconds
    const timeout = setTimeout(() => {
      setError('Authentication timed out. Please try again.');
    }, 10000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [searchParams]);

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
