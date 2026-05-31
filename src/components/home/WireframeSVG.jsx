import React from 'react';

export default function WireframeSVG({ type, accentColor = '#1B6FD8' }) {
  switch (type) {
    case 'cube':
      return (
        <svg className="absolute bottom-[-15%] right-[-15%] w-48 h-48 opacity-[0.12] pointer-events-none group-hover/card:scale-110 group-hover/card:opacity-[0.22] transition-all duration-500" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 15 L80 32 L80 68 L50 85 L20 68 L20 32 Z" stroke={accentColor} strokeWidth="0.8" strokeDasharray="2,2" />
          <path d="M50 15 L50 85" stroke={accentColor} strokeWidth="0.5" />
          <path d="M20 32 L50 50 L80 32" stroke={accentColor} strokeWidth="0.8" />
          <path d="M20 68 L50 50 L80 68" stroke={accentColor} strokeWidth="0.5" />
          <circle cx="50" cy="50" r="3" fill={accentColor} className="animate-pulse" />
          <circle cx="50" cy="15" r="1.5" fill={accentColor} />
          <circle cx="80" cy="32" r="1.5" fill={accentColor} />
          <circle cx="80" cy="68" r="1.5" fill={accentColor} />
          <circle cx="50" cy="85" r="1.5" fill={accentColor} />
          <circle cx="20" cy="68" r="1.5" fill={accentColor} />
          <circle cx="20" cy="32" r="1.5" fill={accentColor} />
        </svg>
      );
    case 'radar':
      return (
        <svg className="absolute bottom-[-10%] right-[-10%] w-48 h-48 opacity-[0.12] pointer-events-none group-hover/card:scale-115 group-hover/card:opacity-[0.22] transition-all duration-500" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="40" stroke={accentColor} strokeWidth="0.6" strokeDasharray="3,3" />
          <circle cx="50" cy="50" r="28" stroke={accentColor} strokeWidth="0.6" />
          <circle cx="50" cy="50" r="16" stroke={accentColor} strokeWidth="0.8" />
          <circle cx="50" cy="50" r="6" stroke={accentColor} strokeWidth="0.5" />
          <line x1="50" y1="10" x2="50" y2="90" stroke={accentColor} strokeWidth="0.5" strokeDasharray="2,2" />
          <line x1="10" y1="50" x2="90" y2="50" stroke={accentColor} strokeWidth="0.5" strokeDasharray="2,2" />
          <line x1="20" y1="20" x2="80" y2="80" stroke={accentColor} strokeWidth="0.4" />
          <line x1="80" y1="20" x2="20" y2="80" stroke={accentColor} strokeWidth="0.4" />
          <circle cx="50" cy="22" r="2" fill={accentColor} className="animate-ping" />
        </svg>
      );
    case 'tetrahedron':
      return (
        <svg className="absolute bottom-[-15%] right-[-15%] w-48 h-48 opacity-[0.12] pointer-events-none group-hover/card:scale-110 group-hover/card:opacity-[0.22] transition-all duration-500" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 10 L85 75 L15 75 Z" stroke={accentColor} strokeWidth="0.8" />
          <path d="M50 10 L50 52 L85 75" stroke={accentColor} strokeWidth="0.6" strokeDasharray="1,2" />
          <path d="M15 75 L50 52" stroke={accentColor} strokeWidth="0.8" />
          <circle cx="50" cy="52" r="2.5" fill={accentColor} />
          <circle cx="50" cy="10" r="1.5" fill={accentColor} />
          <circle cx="85" cy="75" r="1.5" fill={accentColor} />
          <circle cx="15" cy="75" r="1.5" fill={accentColor} />
        </svg>
      );
    default:
      return null;
  }
}
