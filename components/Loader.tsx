import React from 'react';
import { Logo } from './Logo';

interface LoaderProps {
  text?: string;
  progress?: number;
  className?: string;
  size?: number;
}

export const Loader: React.FC<LoaderProps> = ({ text, progress, className = '', size = 24 }) => {
  return (
    <div className={`flex flex-col items-center justify-center p-6 ${className}`}>
      <div className="relative flex items-center justify-center">
        {/* Pulsing Background */}
        <div className="absolute inset-0 bg-orange-500/10 rounded-full animate-ping opacity-75"></div>

        {/* Brand Logo */}
        <div className="relative z-10 animate-pulse">
          <Logo
            className="transform transition-transform duration-500"
            style={{ height: size * 2.5, width: size * 2.5 }}
            variant="brand"
          />
        </div>
      </div>

      {/* Progress Bar Section */}
      {(text || progress !== undefined) && (
        <div className="mt-6 w-48 flex flex-col items-center gap-3">
          {text && (
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 tracking-wider uppercase text-center animate-pulse">
              {text}
            </p>
          )}

          {progress !== undefined && (
            <div className="h-1 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-600 transition-all duration-300 ease-out relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute top-0 right-0 bottom-0 w-24 bg-gradient-to-r from-transparent to-white/30 skew-x-12 animate-shimmer"></div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};