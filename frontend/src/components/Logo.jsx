import React from 'react';

/**
 * VaisoVerse Technology logo — a purple 3-D "V" mark matching the brand identity.
 * The `size` prop controls the icon square dimension in pixels.
 * The optional `showText` prop renders the "VAISO VERSE" wordmark beneath the mark.
 */
const Logo = ({ size = 32, className = '', showText = false }) => {
  return (
    <div className={`flex items-center ${showText ? 'flex-col gap-0.5' : ''} ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Left half of V — lighter purple */}
          <linearGradient id="vv-left" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#9333ea" />
          </linearGradient>
          {/* Right notch / inner V — darker purple */}
          <linearGradient id="vv-right" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7e22ce" />
            <stop offset="100%" stopColor="#581c87" />
          </linearGradient>
          {/* Top-right secondary mark */}
          <linearGradient id="vv-accent" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d8b4fe" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
          <filter id="vv-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#7c3aed" floodOpacity="0.35" />
          </filter>
        </defs>

        {/* ── Outer left wing of the big V ── */}
        <path
          d="M 8 12 L 42 82 L 50 68 L 26 12 Z"
          fill="url(#vv-left)"
          filter="url(#vv-shadow)"
        />

        {/* ── Outer right wing of the big V ── */}
        <path
          d="M 92 12 L 58 82 L 50 68 L 74 12 Z"
          fill="url(#vv-right)"
          filter="url(#vv-shadow)"
        />

        {/* ── Inner lighter facet (3-D depth) ── */}
        <path
          d="M 26 12 L 50 68 L 74 12 L 62 12 L 50 48 L 38 12 Z"
          fill="url(#vv-accent)"
          opacity="0.85"
        />

        {/* ── Small secondary "i" / accent mark top-right ── */}
        <path
          d="M 68 8 L 82 8 L 90 28 L 76 28 Z"
          fill="url(#vv-right)"
          opacity="0.9"
        />
        <path
          d="M 70 10 L 80 10 L 88 26 L 78 26 Z"
          fill="url(#vv-accent)"
          opacity="0.6"
        />

        {/* ── Highlight sheen ── */}
        <path
          d="M 14 14 L 28 14 L 48 58 L 42 70 Z"
          fill="rgba(255,255,255,0.15)"
        />
      </svg>

      {showText && (
        <div style={{ lineHeight: 1, textAlign: 'center' }}>
          <p
            style={{
              fontSize: size * 0.28,
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 800,
              letterSpacing: '0.12em',
              background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: 0,
            }}
          >
            VAISO VERSE
          </p>
          <p
            style={{
              fontSize: size * 0.14,
              fontFamily: 'DM Sans, sans-serif',
              fontWeight: 500,
              letterSpacing: '0.22em',
              color: '#94a3b8',
              margin: 0,
            }}
          >
            TECHNOLOGY
          </p>
        </div>
      )}
    </div>
  );
};

export default Logo;
