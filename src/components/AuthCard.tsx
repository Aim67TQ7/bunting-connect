import React from 'react';
import { cn } from '@/lib/utils';

interface AuthCardProps {
  children: React.ReactNode;
  className?: string;
}

const AuthCard: React.FC<AuthCardProps> = ({ children, className }) => {
  return (
    <div className={cn(
      "bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-8 shadow-xl w-full max-w-md animate-fade-in",
      className
    )}>
      {children}
    </div>
  );
};

export default AuthCard;