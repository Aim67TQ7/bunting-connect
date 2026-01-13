import React from 'react';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';

interface BadgeLoginButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

const BadgeLoginButton: React.FC<BadgeLoginButtonProps> = ({ onClick, disabled = false }) => {
  return (
    <Button
      variant="outline"
      size="xl"
      onClick={onClick}
      disabled={disabled}
      className="w-full border-muted-foreground/30 hover:bg-muted/50 hover:border-muted-foreground/50"
    >
      <Clock className="w-5 h-5" />
      <span>Use my Badge</span>
    </Button>
  );
};

export default BadgeLoginButton;