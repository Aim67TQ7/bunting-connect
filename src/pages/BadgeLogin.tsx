import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import BuntingLogo from '@/components/BuntingLogo';
import DevBanner from '@/components/DevBanner';
import AuthCard from '@/components/AuthCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { isDevelopment, getReturnUrl, checkRateLimit } from '@/lib/auth';
import { toast } from 'sonner';

const BadgeLogin: React.FC = () => {
  const navigate = useNavigate();
  const [badgeNumber, setBadgeNumber] = useState('');
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const returnUrl = getReturnUrl();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate inputs
    if (!badgeNumber.trim()) {
      setError('Please enter your badge number');
      return;
    }
    if (!pin || pin.length !== 4) {
      setError('Please enter your 4-digit PIN');
      return;
    }

    // Check rate limit
    const rateLimit = checkRateLimit(badgeNumber);
    if (!rateLimit.allowed) {
      setError(`Too many attempts. Please wait ${rateLimit.waitTime} minutes and try again.`);
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Implement badge authentication with Supabase Edge Function
      // The edge function will:
      // 1. Look up badge in employee_badges table
      // 2. Verify badge is_active = true
      // 3. Compare PIN hash using bcrypt
      // 4. Create Supabase session for linked user
      
      toast.info('Badge authentication requires Supabase configuration', {
        description: 'Connect Supabase and create the employee_badges table',
      });

      // Simulated response for demo
      // In production, this would be:
      // const { data, error } = await supabase.functions.invoke('validate-badge', {
      //   body: { badgeNumber, pin }
      // });

    } catch (error) {
      console.error('Badge login error:', error);
      setError('Unable to connect. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setPin(value);
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
            {/* Back Button */}
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back to login options</span>
            </button>

            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Badge Login
              </h1>
              <p className="text-muted-foreground text-sm">
                Enter your badge number and PIN to sign in
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-center text-sm text-destructive animate-shake">
                {error}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="badgeNumber">Badge Number</Label>
                <Input
                  id="badgeNumber"
                  type="text"
                  placeholder="Enter your badge number"
                  value={badgeNumber}
                  onChange={(e) => setBadgeNumber(e.target.value.toUpperCase())}
                  disabled={isLoading}
                  className="h-12 text-lg"
                  autoComplete="off"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pin">PIN</Label>
                <Input
                  id="pin"
                  type="password"
                  placeholder="• • • •"
                  value={pin}
                  onChange={handlePinChange}
                  disabled={isLoading}
                  className="h-12 text-lg tracking-[0.5em] text-center"
                  inputMode="numeric"
                  maxLength={4}
                  autoComplete="off"
                />
                <p className="text-xs text-muted-foreground text-center">
                  4-digit PIN
                </p>
              </div>

              <Button
                type="submit"
                size="xl"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </Button>
            </form>

            {/* Help Text */}
            <p className="mt-6 text-center text-xs text-muted-foreground">
              Don't have a badge linked?{' '}
              <a 
                href="mailto:it@buntingmagnetics.com" 
                className="text-primary hover:underline"
              >
                Contact your administrator
              </a>
            </p>
          </AuthCard>
        </div>
      </main>
    </div>
  );
};

export default BadgeLogin;
