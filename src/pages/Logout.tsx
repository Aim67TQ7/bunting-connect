import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle } from 'lucide-react';
import BuntingLogo from '@/components/BuntingLogo';
import AuthCard from '@/components/AuthCard';
import { supabase } from '@/lib/supabase';

const Logout: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'signing-out' | 'complete'>('signing-out');

  useEffect(() => {
    const performLogout = async () => {
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Nuclear clear: All cookies on both current path and .buntinggpt.com domain
      document.cookie.split(';').forEach(c => {
        const name = c.trim().split('=')[0];
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.buntinggpt.com`;
      });
      
      setStatus('complete');
      setTimeout(() => {
        navigate('/?message=' + encodeURIComponent('You have been logged out'));
      }, 1500);
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
