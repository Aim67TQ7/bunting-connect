import React from 'react';

interface BuntingLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const BuntingLogo: React.FC<BuntingLogoProps> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-16',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Stylized Bunting Magnetics Logo */}
      <div className={`${sizeClasses[size]} aspect-square relative`}>
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Magnet shape */}
          <path
            d="M12 16C12 10.4772 16.4772 6 22 6H42C47.5228 6 52 10.4772 52 16V32C52 43.0457 43.0457 52 32 52C20.9543 52 12 43.0457 12 32V16Z"
            className="fill-primary"
          />
          {/* North pole */}
          <rect x="12" y="6" width="18" height="12" rx="4" className="fill-destructive" />
          {/* South pole */}
          <rect x="34" y="6" width="18" height="12" rx="4" className="fill-secondary" />
          {/* Magnetic field lines */}
          <path
            d="M32 58C32 58 8 48 8 32C8 16 18 8 32 8"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="4 4"
            className="text-muted-foreground/50"
            fill="none"
          />
          <path
            d="M32 58C32 58 56 48 56 32C56 16 46 8 32 8"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="4 4"
            className="text-muted-foreground/50"
            fill="none"
          />
        </svg>
      </div>
      <div className="flex flex-col">
        <span className={`font-bold tracking-tight text-foreground ${size === 'sm' ? 'text-lg' : size === 'md' ? 'text-xl' : 'text-2xl'}`}>
          BUNTING
        </span>
        <span className={`text-muted-foreground font-medium -mt-1 ${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'}`}>
          MAGNETICS
        </span>
      </div>
    </div>
  );
};

export default BuntingLogo;
