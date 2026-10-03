import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Enterprise Loading Spinner & Skeleton Component
 */
export const LoadingSpinner = ({
  size = 'md',
  text,
  fullScreen = false,
  className = '',
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const content = (
    <div
      className={`flex flex-col items-center justify-center gap-2.5 text-slate-500 ${className}`}
    >
      <Loader2 className={`${sizes[size] || sizes.md} animate-spin text-slate-900`} />
      {text && <p className="text-xs font-medium text-slate-600">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-xs flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
