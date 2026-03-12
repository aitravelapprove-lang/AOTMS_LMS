import React from "react";

const LowPolyBackground = () => (
  <div className="fixed inset-0 -z-50 pointer-events-none overflow-hidden bg-[#f0f4f8]">
    <svg
      className="w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1200 3200"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="bg-grad-global" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#004C85" />
          <stop offset="15%" stopColor="#0075CF" />
          <stop offset="30%" stopColor="#E6F2FA" />
          <stop offset="50%" stopColor="#F8FAFC" />
          <stop offset="70%" stopColor="#FFF2EC" />
          <stop offset="85%" stopColor="#FD7A45" />
          <stop offset="100%" stopColor="#E34D14" />
        </linearGradient>

        {/* Glow Filters */}
        <filter id="glow-blue" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="80" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="glow-orange" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="70" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Dynamic Gradient Base */}
      <rect width="1200" height="3200" fill="url(#bg-grad-global)" />

      {/* ULTRA-DENSE LOW-POLY TRIANGLE MESH - Maximum Visibility */}
      <g opacity="1">
        {/* TOP BLUE SECTION */}
        <polygon
          points="0,0 600,0 0,600"
          fill="#0075CF"
          opacity="0.75"
          stroke="#0075CF"
          strokeWidth="5"
          className="drop-shadow-[0_0_15px_rgba(0,117,207,0.4)]"
        />
        <polygon
          points="1200,0 600,0 1200,600"
          fill="#0075CF"
          opacity="0.75"
          stroke="#0075CF"
          strokeWidth="5"
          className="drop-shadow-[0_0_15px_rgba(0,117,207,0.4)]"
        />
        <polygon
          points="600,0 0,600 1200,600"
          fill="#005A9C"
          opacity="0.65"
          stroke="#0075CF"
          strokeWidth="5"
        />

        {/* MIDDLE SECTION - BLUEPRINT FEEL */}
        <path
          d="M0,800 L400,1000 L0,1200 Z"
          fill="#0075CF"
          opacity="0.6"
          stroke="#0075CF"
          strokeWidth="5"
        />
        <path
          d="M1200,800 L800,1000 L1200,1200 Z"
          fill="#0075CF"
          opacity="0.6"
          stroke="#0075CF"
          strokeWidth="5"
        />
        <path
          d="M400,1000 L800,1000 L600,1400 Z"
          fill="#0075CF"
          opacity="0.55"
          stroke="#0075CF"
          strokeWidth="4.5"
        />

        <polygon
          points="0,1400 300,1600 0,1800"
          fill="#0075CF"
          opacity="0.52"
          stroke="#0075CF"
          strokeWidth="5"
        />
        <polygon
          points="1200,1400 900,1600 1200,1800"
          fill="#FD5A1A"
          opacity="0.52"
          stroke="#FD5A1A"
          strokeWidth="5"
        />
        <polygon
          points="300,1600 900,1600 600,2000"
          fill="#0075CF"
          opacity="0.45"
          stroke="#0075CF"
          strokeWidth="4.5"
        />

        {/* EXTRA INTERMEDIATE SHARDS */}
        <polygon points="200,400 400,500 200,600" fill="#0075CF" opacity="0.4" stroke="#0075CF" strokeWidth="3" />
        <polygon points="1000,400 800,500 1000,600" fill="#0075CF" opacity="0.4" stroke="#0075CF" strokeWidth="3" />

        {/* BOTTOM ORANGE SECTION */}
        <polygon
          points="0,2600 600,2600 0,3200"
          fill="#FD5A1A"
          opacity="0.65"
          stroke="#FD5A1A"
          strokeWidth="5"
          className="drop-shadow-[0_0_15px_rgba(253,90,26,0.4)]"
        />
        <polygon
          points="1200,2600 600,2600 1200,3200"
          fill="#FD5A1A"
          opacity="0.65"
          stroke="#FD5A1A"
          strokeWidth="5"
          className="drop-shadow-[0_0_15px_rgba(253,90,26,0.4)]"
        />
        <polygon
          points="600,2600 0,3200 1200,3200"
          fill="#E34D14"
          opacity="0.6"
          stroke="#FD5A1A"
          strokeWidth="5"
        />
      </g>

      {/* ADDITIONAL CONNECTING LINES FOR "TECH" FEEL */}
      <g stroke="#0075CF" strokeWidth="2" opacity="0.35">
        <line x1="0" y1="0" x2="1200" y2="3200" />
        <line x1="1200" y1="0" x2="0" y2="3200" />
        <line x1="600" y1="0" x2="600" y2="3200" />
        <line x1="0" y1="1600" x2="1200" y2="1600" strokeDasharray="10 10" />
      </g>

      {/* INTENSE GLOW ORBS */}
      <circle
        cx="200"
        cy="500"
        r="400"
        fill="#0075CF"
        opacity="0.6"
        filter="url(#glow-blue)"
      />
      <circle
        cx="1000"
        cy="1200"
        r="450"
        fill="#0075CF"
        opacity="0.45"
        filter="url(#glow-blue)"
      />
      <circle
        cx="1100"
        cy="2700"
        r="500"
        fill="#E34D14"
        opacity="0.6"
        filter="url(#glow-orange)"
      />
      <circle
        cx="100"
        cy="2200"
        r="400"
        fill="#FD5A1A"
        opacity="0.45"
        filter="url(#glow-orange)"
      />
    </svg>

    {/* High-Contrast Digital Grid Overlay */}
    <div
      className="absolute inset-0 opacity-[0.25] pointer-events-none"
      style={{
        backgroundImage: `linear-gradient(#0075CF 1px, transparent 1px), linear-gradient(90deg, #0075CF 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
      }}
    />

    {/* Global Grain Texture for Depth */}
    <div
      className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      }}
    />
  </div>
);

export default LowPolyBackground;
