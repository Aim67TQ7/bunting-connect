import React from 'react';
import { cn } from '@/lib/utils';

interface AuthCardProps {
  children: React.ReactNode;
  className?: string;
}

const AuthCard: React.FC<AuthCardProps> = ({ children, className }) => {
  return (
    <div className={cn(
      "bg-card rounded-2xl shadow-auth-xl border border-border p-8 w-full max-w-md animate-slide-up",
      className
    )}>
      {children}
    </div>
  );
};

export default AuthCard;
