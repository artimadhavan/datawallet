import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "", size = 40, showText = false }) => {
  return (
    <div className={`flex items-center gap-3 group ${className}`}>
      <div 
        style={{ width: size, height: size }}
        className="relative flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-[-4deg]"
      >
        {/* Advanced Glow */}
        <div className="absolute inset-0 bg-indigo-500/30 blur-2xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-2xl"
        >
          {/* Abstract "D" form / Wallet Fold */}
          <path
            d="M25 15C25 12.2386 27.2386 10 30 10H60C76.5685 10 90 23.4315 90 40V60C90 76.5685 76.5685 90 60 90H30C27.2386 90 25 87.7614 25 85V15Z"
            fill="url(#logo-gradient-pro)"
          />
          
          {/* Inner Analytics Bars */}
          <rect x="40" y="55" width="8" height="20" rx="4" fill="white" fillOpacity="0.9" />
          <rect x="52" y="45" width="8" height="30" rx="4" fill="white" fillOpacity="0.9" />
          <rect x="64" y="35" width="8" height="40" rx="4" fill="white" fillOpacity="0.9" />
          
          {/* Wallet Slot Accent */}
          <path
            d="M25 35H45C47.7614 35 50 37.2386 50 40V50C50 52.7614 47.7614 55 45 55H25"
            fill="white"
            fillOpacity="0.1"
          />

          <defs>
            <linearGradient id="logo-gradient-pro" x1="25" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
              <stop stopColor="#4f46e5" />
              <stop offset="1" stopColor="#2563eb" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      {showText && (
        <span className="font-black text-2xl tracking-tighter gradient-text select-none drop-shadow-sm">
          DataWallet
        </span>
      )}
    </div>
  );
};

export default Logo;
