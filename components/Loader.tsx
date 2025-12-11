import React from 'react';
import { Settings, Hexagon } from 'lucide-react';

interface LoaderProps {
  text?: string;
  progress?: number; // 0 to 100
  className?: string;
}

export const Loader: React.FC<LoaderProps> = ({ text, progress, className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <div className="relative flex items-center justify-center w-24 h-24">
        {/* Outer Rotating Gear Effect */}
        <div className="absolute inset-0 border-4 border-gray-100 dark:border-gray-800 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-t-orange-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>

        {/* Anti-clockwise Inner Ring */}
        <div className="absolute inset-2 border-2 border-gray-100 dark:border-gray-800 rounded-full"></div>
        <div className="absolute inset-2 border-2 border-b-orange-400 border-t-transparent border-r-transparent border-l-transparent rounded-full animate-spin-reverse opacity-70"></div>

        {/* Central Pulsing Icon */}
        <div className="relative z-10 p-4 bg-white dark:bg-gray-900 rounded-full shadow-lg animate-pulse-slow">
          <Settings className="w-8 h-8 text-orange-600 animate-spin-slow" />
        </div>

        {/* Glow Effect */}
        <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full animate-pulse"></div>
      </div>

      {/* Text & Progress */}
      <div className="mt-8 flex flex-col items-center gap-4 max-w-xs w-full">
        {text && (
          <div className="flex flex-col items-center gap-1">
            <h3 className="text-gray-900 dark:text-white font-bold text-sm tracking-[0.2em] uppercase">
              {text}
            </h3>
            <div className="flex gap-1">
              <span className="w-1 h-1 bg-orange-500 rounded-full animate-bounce delay-0"></span>
              <span className="w-1 h-1 bg-orange-500 rounded-full animate-bounce delay-100"></span>
              <span className="w-1 h-1 bg-orange-500 rounded-full animate-bounce delay-200"></span>
            </div>
          </div>
        )}

        {/* Sleek Progress Bar */}
        {progress !== undefined && (
          <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden relative">
            {/* Animated Stripes Background */}
            <div className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: 'linear-gradient(45deg,rgba(0,0,0,.1) 25%,transparent 25%,transparent 50%,rgba(0,0,0,.1) 50%,rgba(0,0,0,.1) 75%,transparent 75%,transparent)',
                backgroundSize: '1rem 1rem'
              }}>
            </div>

            <div
              className="h-full bg-gradient-to-r from-orange-600 to-orange-400 transition-all duration-300 ease-out rounded-full shadow-[0_0_15px_rgba(249,115,22,0.5)] relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 w-full h-full bg-white/20 animate-progress-stripes" style={{ backgroundSize: '20px 20px', backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)' }}></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};