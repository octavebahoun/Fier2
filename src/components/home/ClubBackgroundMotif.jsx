import React from 'react';

export default function ClubBackgroundMotif({ kicker }) {
  switch (kicker) {
    case 'Robotique et Automatisation':
      return (
        <svg className="absolute -bottom-10 -right-10 w-80 h-80 opacity-15 text-accent-primary pointer-events-none z-0 select-none animate-[spin_40s_linear_infinite]" viewBox="0 0 200 200" fill="none" stroke="currentColor">
          <circle cx="100" cy="100" r="70" strokeWidth="1" strokeDasharray="4 6" />
          <circle cx="100" cy="100" r="60" strokeWidth="1.5" />
          <circle cx="100" cy="100" r="45" strokeWidth="0.8" strokeDasharray="12 4" />
          {[...Array(12)].map((_, i) => {
            const angle = (i * 30 * Math.PI) / 180;
            const x1 = 100 + 60 * Math.cos(angle);
            const y1 = 100 + 60 * Math.sin(angle);
            const x2 = 100 + 72 * Math.cos(angle);
            const y2 = 100 + 72 * Math.sin(angle);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth="2.5" strokeLinecap="round" />;
          })}
          <circle cx="100" cy="100" r="15" strokeWidth="1" />
          <path d="M 100 100 L 140 100 M 100 100 L 100 60" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'Informatique Industrielle & IoT':
      return (
        <svg className="absolute -bottom-10 -right-10 w-80 h-80 opacity-15 text-accent-secondary pointer-events-none z-0 select-none" viewBox="0 0 200 200" fill="none" stroke="currentColor">
          <circle cx="100" cy="100" r="40" strokeWidth="1" className="animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" />
          <circle cx="100" cy="100" r="60" strokeWidth="1.2" strokeDasharray="3 3" className="animate-[ping_4.5s_cubic-bezier(0,0,0.2,1)_infinite]" />
          <circle cx="100" cy="100" r="80" strokeWidth="0.8" />
          <circle cx="100" cy="100" r="12" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />
          {[...Array(8)].map((_, i) => {
            const angle = (i * 45 * Math.PI) / 180;
            const x1 = 100 + 12 * Math.cos(angle);
            const y1 = 100 + 12 * Math.sin(angle);
            const x2 = 100 + 90 * Math.cos(angle);
            const y2 = 100 + 90 * Math.sin(angle);
            return (
              <g key={i}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth="0.8" />
                <circle cx={x2} cy={y2} r="3" fill="currentColor" />
              </g>
            );
          })}
        </svg>
      );
    case 'Éco-Énergie & Climatisation':
      return (
        <svg className="absolute -bottom-10 -right-10 w-80 h-80 opacity-15 text-accent-tertiary pointer-events-none z-0 select-none" viewBox="0 0 200 200" fill="none" stroke="currentColor">
          <ellipse cx="100" cy="100" rx="85" ry="30" strokeWidth="1.2" strokeDasharray="5 5" className="animate-[spin_24s_linear_infinite]" />
          <ellipse cx="100" cy="100" rx="85" ry="30" strokeWidth="1.2" className="animate-[spin_24s_linear_infinite]" style={{ transform: 'rotate(60deg)', transformOrigin: 'center' }} />
          <ellipse cx="100" cy="100" rx="85" ry="30" strokeWidth="1.2" className="animate-[spin_24s_linear_infinite]" style={{ transform: 'rotate(120deg)', transformOrigin: 'center' }} />
          <circle cx="100" cy="100" r="18" strokeWidth="1.5" />
          <circle cx="100" cy="100" r="6" fill="currentColor" />
        </svg>
      );
    case 'Construction 4.0':
      return (
        <svg className="absolute -bottom-10 -right-10 w-80 h-80 opacity-15 text-accent-primary pointer-events-none z-0 select-none animate-[pulse_4s_ease-in-out_infinite]" viewBox="0 0 200 200" fill="none" stroke="currentColor">
          <path d="M 10 70 L 100 25 L 190 70 L 100 115 Z" strokeWidth="1.2" />
          <path d="M 10 130 L 100 85 L 190 130 L 100 175 Z" strokeWidth="1.2" />
          <line x1="10" y1="70" x2="10" y2="130" strokeWidth="1.2" />
          <line x1="100" y1="25" x2="100" y2="85" strokeWidth="1.2" />
          <line x1="190" y1="70" x2="190" y2="130" strokeWidth="1.2" />
          <line x1="100" y1="115" x2="100" y2="175" strokeWidth="1.2" strokeDasharray="3 3" />
          <path d="M 20 40 L 50 15 M 180 40 L 150 15" strokeWidth="0.8" strokeDasharray="2 2" />
        </svg>
      );
    case 'Intelligence Artificielle':
      return (
        <svg className="absolute -bottom-10 -right-10 w-80 h-80 opacity-15 text-accent-secondary pointer-events-none z-0 select-none" viewBox="0 0 200 200" fill="none" stroke="currentColor">
          <g className="animate-[pulse_3.5s_ease-in-out_infinite]">
            <circle cx="50" cy="80" r="5" fill="currentColor" />
            <circle cx="100" cy="50" r="6" fill="currentColor" />
            <circle cx="150" cy="80" r="5" fill="currentColor" />
            <circle cx="150" cy="130" r="5" fill="currentColor" />
            <circle cx="100" cy="160" r="6" fill="currentColor" />
            <circle cx="50" cy="130" r="5" fill="currentColor" />
            <circle cx="100" cy="105" r="8" fill="currentColor" />
            <line x1="50" y1="80" x2="100" y2="50" strokeWidth="1.5" />
            <line x1="100" y1="50" x2="150" y2="80" strokeWidth="1.5" />
            <line x1="150" y1="80" x2="150" y2="130" strokeWidth="1.5" />
            <line x1="150" y1="130" x2="100" y2="160" strokeWidth="1.5" />
            <line x1="100" y1="160" x2="50" y2="130" strokeWidth="1.5" />
            <line x1="100" y1="160" x2="100" y2="105" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="50" y1="130" x2="50" y2="80" strokeWidth="1.5" />
            <line x1="50" y1="80" x2="100" y2="105" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="100" y1="50" x2="100" y2="105" strokeWidth="1" />
            <line x1="150" y1="80" x2="100" y2="105" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="150" y1="130" x2="100" y2="105" strokeWidth="1" />
            <line x1="50" y1="130" x2="100" y2="105" strokeWidth="1" />
          </g>
        </svg>
      );
    case 'Innovation Tech & Entrepreneuriat':
      return (
        <svg className="absolute -bottom-10 -right-10 w-80 h-80 opacity-15 text-accent-tertiary pointer-events-none z-0 select-none animate-[spin_50s_linear_infinite]" viewBox="0 0 200 200" fill="none" stroke="currentColor">
          <circle cx="100" cy="100" r="80" strokeWidth="1" />
          <circle cx="100" cy="100" r="60" strokeWidth="1.2" strokeDasharray="10 5" />
          <circle cx="100" cy="100" r="40" strokeWidth="1.5" />
          <path d="M 20 100 A 80 80 0 0 1 180 100" strokeWidth="2" strokeLinecap="round" />
          <path d="M 100 20 A 80 80 0 0 1 100 180" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}
