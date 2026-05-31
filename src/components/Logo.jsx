import React from 'react';

export default function Logo({ className = "h-8" }) {
  return (
    <svg 
      viewBox="0 0 85 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      <defs>
        <linearGradient id="logo-blue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1B6FD8" />
          <stop offset="100%" stopColor="#1B4F8A" />
        </linearGradient>
        <linearGradient id="logo-orange" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F5821F" />
          <stop offset="100%" stopColor="#F5A623" />
        </linearGradient>
      </defs>
      <text
        x="0"
        y="18"
        fontFamily="'Plus Jakarta Sans', sans-serif"
        fontSize="19"
        fontWeight="800"
        letterSpacing="-0.5"
      >
        <tspan fill="url(#logo-blue)">F</tspan>
        <tspan fill="url(#logo-blue)">I</tspan>
        <tspan fill="url(#logo-orange)">E</tspan>
        <tspan fill="url(#logo-blue)">R</tspan>
        <tspan fill="url(#logo-orange)">I</tspan>
      </text>
    </svg>
  );
}
