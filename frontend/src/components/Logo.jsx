import React, { useState } from 'react';

const Logo = ({ size = 32, className = '', color = '#7c3aed', src = '/acerute-logo.png' }) => {
  // Default behavior: use the uploaded Acerute logo from public/acerute-logo.png
  // If it isn't available, fall back to the built-in SVG.
  const [hasError, setHasError] = useState(false);
  const resolvedSrc = hasError ? null : src;

  if (resolvedSrc) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
        <img
          src={resolvedSrc}
          alt="Logo"
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          onError={() => setHasError(true)}
        />
      </div>
    );
  }

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
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="55%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
          <linearGradient id="logo-shade" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Main V */}
        <path
          d="M 14 20 L 50 78 L 86 20 L 70 20 L 50 58 L 30 20 Z"
          fill="url(#logo-gradient)"
          stroke="rgba(0,0,0,0.08)"
          strokeWidth="2"
        />

        {/* Top highlight */}
        <path
          d="M 42 22 L 50 47 L 58 22 L 52 22 L 50 35 L 48 22 Z"
          fill="url(#logo-shade)"
        />

        {/* Inner shadow */}
        <path
          d="M 20 24 L 50 68 L 80 24 L 72 24 L 50 58 L 28 24 Z"
          fill="rgba(0,0,0,0.08)"
          opacity="0.18"
        />
      </svg>
    </div>
  );
};

export default Logo;
