import React from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';

interface BadgeLoginButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

const BadgeLoginButton: React.FC<BadgeLoginButtonProps> = ({ onClick, disabled = false }) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        variant="badge"
        size="xl"
        onClick={onClick}
        disabled={disabled}
        className="w-full"
      >
        <CreditCard className="w-5 h-5" />
        <span>Sign in with Badge Number</span>
      </Button>
      <p className="text-xs text-muted-foreground">
        For employees without company email
      </p>
    </div>
  );
};

export default BadgeLoginButton;
