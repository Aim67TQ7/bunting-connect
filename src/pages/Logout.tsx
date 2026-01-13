import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle } from 'lucide-react';
import BuntingLogo from '@/components/BuntingLogo';
import AuthCard from '@/components/AuthCard';
import { cookieStorage, isDevelopment } from '@/lib/auth';

const Logout: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'signing-out' | 'complete'>('signing-out');

  useEffect(() => {
    const performLogout = async () => {
      try {
        // TODO: Sign out from Supabase
        // await supabase.auth.signOut();

        // Clear all session cookies
        const cookiesToClear = [
          'sb-auth-token',
          'sb-auth-token.0',
          'sb-auth-token.1',
          'sb-auth-token.2',
          'sb-access-token',
          'sb-refresh-token',
        ];

        if (isDevelopment()) {
          // Clear localStorage in development
          cookiesToClear.forEach(key => {
            localStorage.removeItem(key);
          });
        } else {
          // Clear cookies in production
          cookiesToClear.forEach(key => {
            cookieStorage.removeItem(key);
          });
        }

        setStatus('complete');

        // Redirect to login after a short delay
        setTimeout(() => {
          navigate('/?message=' + encodeURIComponent('You have been logged out'));
        }, 1500);

      } catch (error) {
        console.error('Logout error:', error);
        // Still redirect even on error
        navigate('/?message=' + encodeURIComponent('You have been logged out'));
      }
    };

    performLogout();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex justify-center">
          <BuntingLogo size="lg" />
        </div>
        
        <AuthCard>
          <div className="text-center">
            {status === 'signing-out' ? (
              <>
                <Loader2 className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
                <h2 className="text-xl font-bold text-foreground mb-2">
                  Signing out
                </h2>
                <p className="text-muted-foreground">
                  Please wait...
                </p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-success" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">
                  Signed Out
                </h2>
                <p className="text-muted-foreground">
                  You have been successfully logged out
                </p>
              </>
            )}
          </div>
        </AuthCard>
      </div>
    </div>
  );
};

export default Logout;
