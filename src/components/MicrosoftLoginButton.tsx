import React from 'react';
import { Button } from '@/components/ui/button';

interface MicrosoftLoginButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

const MicrosoftIcon = () => (
  <svg viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
    <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
    <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
    <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
    <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
  </svg>
);

const MicrosoftLoginButton: React.FC<MicrosoftLoginButtonProps> = ({ 
  onClick, 
  disabled = false,
  loading = false 
}) => {
  return (
    <Button
      variant="outline"
      size="xl"
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full relative bg-[#2F2F2F] hover:bg-[#3a3a3a] border-[#3a3a3a] text-white"
    >
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <MicrosoftIcon />
          <span>Sign in with Microsoft</span>
        </>
      )}
    </Button>
  );
};

export default MicrosoftLoginButton;
