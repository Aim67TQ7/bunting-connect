import React from 'react';

interface BuntingLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-10',
  md: 'h-16',
  lg: 'h-24',
};

const BuntingLogo: React.FC<BuntingLogoProps> = ({ size = 'md', className = '' }) => {
  return (
    <img 
      src="/bunting-logo.png" 
      alt="Bunting Magnetics" 
      className={`${sizeClasses[size]} w-auto object-contain ${className}`}
    />
  );
};

export default BuntingLogo;