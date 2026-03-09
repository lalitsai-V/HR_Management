import React from 'react';

const Logo = ({ size = 32, className = '', color = '#7c3aed' }) => {
  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{ width: size, height: size, color }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.9" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* Trace-style 'V' mark (matches the attached traceout style) */}
        <path
          d="M 20 18 L 45 70 L 70 18 L 58 18 L 45 50 L 32 18 Z"
          stroke="url(#logo-gradient)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Top-right accent block */}
        <path
          d="M 52 18 L 58 18 L 52 32 L 46 32 Z"
          fill="url(#logo-gradient)"
        />
      </svg>
    </div>
  );
};

export default Logo;
