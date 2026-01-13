import React from 'react';
import { isDevelopment } from '@/lib/auth';
import { AlertTriangle } from 'lucide-react';

const DevBanner: React.FC = () => {
  if (!isDevelopment()) {
    return null;
  }

  return (
    <div className="dev-banner flex items-center justify-center gap-2">
      <AlertTriangle className="h-4 w-4" />
      <span>Development Mode - Using localStorage for sessions</span>
    </div>
  );
};

export default DevBanner;
