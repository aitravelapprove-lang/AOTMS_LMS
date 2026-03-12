import React from "react";

const LowPolyBackground = () => (
  <div className="fixed inset-0 -z-50 pointer-events-none overflow-hidden bg-slate-50">
    <svg
      className="w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1200 3200"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="bg-grad-global" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#005A9C" />
          <stop offset="15%" stopColor="#0075CF" />
          <stop offset="35%" stopColor="#FDFEFE" />
          <stop offset="65%" stopColor="#FDFEFE" />
          <stop offset="85%" stopColor="#FD7A45" />
          <stop offset="100%" stopColor="#E34D14" />
        </linearGradient>
        
        {/* Glow Filters */}
        <filter id="glow-blue" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="70" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="glow-orange" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="60" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      {/* Dynamic Gradient Base */}
      <rect width="1200" height="3200" fill="url(#bg-grad-global)" />

      {/* ULTRA-DENSE LOW-POLY TRIANGLE MESH - Maximum Visibility */}
      <g opacity="0.9">
        {/* TOP BLUE SECTION */}
        <polygon points="0,0 400,0 200,300" fill="#004C85" opacity="0.8" stroke="#0075CF" strokeWidth="0.5" />
        <polygon points="400,0 800,0 600,250" fill="#0066B3" opacity="0.7" stroke="#3391D9" strokeWidth="0.5" />
        <polygon points="800,0 1200,0 1000,300" fill="#1b507e" opacity="0.8" stroke="#0075CF" strokeWidth="0.5" />
        
        <polygon points="0,300 400,400 200,600" fill="#0075CF" opacity="0.6" stroke="#FFFFFF" strokeWidth="0.2" />
        <polygon points="400,400 800,350 600,650" fill="#005A9C" opacity="0.7" stroke="#FFFFFF" strokeWidth="0.2" />
        <polygon points="800,350 1200,400 1000,600" fill="#1d5b8e" opacity="0.6" stroke="#FFFFFF" strokeWidth="0.2" />

        {/* MIDDLE TRANSITION - Blueprint Grid Sub-patterns */}
        <polygon points="0,1000 300,1200 0,1400" fill="#D1E9F6" opacity="0.9" stroke="#0075CF" strokeWidth="1" strokeOpacity="0.1" />
        <polygon points="300,1200 900,1300 600,1600" fill="#FDFEFE" opacity="1" stroke="#0075CF" strokeWidth="1" strokeOpacity="0.05" />
        <polygon points="900,1300 1200,1200 1200,1500" fill="#D1E9F6" opacity="0.9" stroke="#0075CF" strokeWidth="1" strokeOpacity="0.1" />
        
        <polygon points="0,1600 600,1800 1200,1600" fill="#FDFEFE" opacity="0.8" stroke="#FD5A1A" strokeWidth="1" strokeOpacity="0.05" />

        {/* BOTTOM ORANGE SECTION */}
        <polygon points="0,2400 300,2600 0,2800" fill="#E34D14" opacity="0.7" stroke="#FD5A1A" strokeWidth="0.5" />
        <polygon points="300,2600 900,2700 600,3000" fill="#FD5A1A" opacity="0.8" stroke="#FFFFFF" strokeWidth="0.3" />
        <polygon points="900,2700 1200,2600 1200,2900" fill="#B23C0F" opacity="0.7" stroke="#FD8C5E" strokeWidth="0.5" />
        
        <polygon points="0,2800 600,3000 1200,2800" fill="#CC4511" opacity="0.6" stroke="#FFFFFF" strokeWidth="0.2" />
        <polygon points="0,3200 600,3200 300,3000" fill="#8E2D0B" opacity="0.8" stroke="#FD5A1A" strokeWidth="0.5" />
        <polygon points="1200,3200 600,3200 900,3000" fill="#B23C0F" opacity="0.8" stroke="#FD5A1A" strokeWidth="0.5" />
      </g>

      {/* INTENSE GLOW ORBS */}
      <circle cx="150" cy="400" r="300" fill="#0075CF" opacity="0.35" filter="url(#glow-blue)" />
      <circle cx="1050" cy="300" r="350" fill="#005A9C" opacity="0.3" filter="url(#glow-blue)" />
      <circle cx="1150" cy="2700" r="400" fill="#E34D14" opacity="0.35" filter="url(#glow-orange)" />
      <circle cx="50" cy="2850" r="350" fill="#FD5A1A" opacity="0.3" filter="url(#glow-orange)" />
    </svg>
    
    {/* High-Contrast Digital Grid Overlay */}
    <div className="absolute inset-0 opacity-[0.1] pointer-events-none" 
         style={{ backgroundImage: `linear-gradient(#0075CF 1px, transparent 1px), linear-gradient(90#0075CF 1px, transparent 1px)`, backgroundSize: '100px 100px', transform: 'rotate(5deg) scale(2)' }} />
    
    {/* Global Grain Texture for Depth */}
    <div className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay" 
         style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
  </div>
);

export default LowPolyBackground;
