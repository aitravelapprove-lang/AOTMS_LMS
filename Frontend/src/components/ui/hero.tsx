"use client";
import { useEffect, useRef, useState } from "react";
import { MeshGradient, PulsingBorder } from "@paper-design/shaders-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function ShaderShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleMouseEnter = () => setIsActive(true);
    const handleMouseLeave = () => setIsActive(false);

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mouseenter", handleMouseEnter);
      container.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      if (container) {
        container.removeEventListener("mouseenter", handleMouseEnter);
        container.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen relative overflow-hidden flex items-center justify-center"
    >
      {/* Dynamic Background Mesh Component */}
      <MeshGradient
        className="absolute inset-0 w-full h-full"
        colors={["#011B33", "#0075cf", "#3391d9", "#fd8c5e", "#fd5a1a"]}
        speed={0.15}
      />
      <MeshGradient
        className="absolute inset-0 w-full h-full opacity-30 mix-blend-overlay"
        colors={["#000000", "#ffffff", "#0075cf", "#fd5a1a"]}
        speed={0.1}
      />

      {/* SVG Definitions for Shaders */}
      <svg className="absolute inset-0 w-0 h-0">
        <defs>
          <filter
            id="glass-effect"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feTurbulence baseFrequency="0.005" numOctaves="1" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.3" />
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0.02
                      0 1 0 0 0.02
                      0 0 1 0 0.05
                      0 0 0 0.9 0"
              result="tint"
            />
          </filter>
          <filter id="text-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      <main className="relative z-20 max-w-5xl mx-auto px-6 text-center w-full pt-10">
        <motion.h1
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white mb-8 leading-[0.95] tracking-tight drop-shadow-2xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          SMART LEARNING
          <br className="hidden md:block" />
          <span className="block font-black text-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)]">
            MANAGEMENT SYSTEM
          </span>
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl font-medium text-white/90 mb-12 leading-relaxed max-w-3xl mx-auto drop-shadow-md px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          AOTMS is Vijayawada's premier learning management system offering
          interactive courses, live classes, secure exams, and ATS-driven skill
          evaluation mapped to actual industry needs.
        </motion.p>

        <motion.div
          className="flex items-center justify-center gap-6 flex-wrap"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          <motion.button
            className="px-12 py-5 rounded-2xl bg-gradient-to-r from-[#0075CF] to-[#3391D9] text-white font-black text-lg transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl hover:shadow-[0_10px_40px_rgba(0,117,207,0.5)] cursor-pointer tracking-wider"
            onClick={() => navigate("/auth")}
          >
            Get Started
          </motion.button>
          <motion.button
            className="px-12 py-5 rounded-2xl bg-white/10 border-2 border-white/20 text-white font-black text-lg transition-all duration-300 hover:bg-white/20 hover:border-white/40 cursor-pointer backdrop-blur-md hover:scale-105 active:scale-95 tracking-wider"
            onClick={() => navigate("/student-dashboard")}
          >
            Explore Platform
          </motion.button>
        </motion.div>
      </main>

      {/* Decorative Rotating Orbital Logo at bottom right */}
      <div className="absolute bottom-10 right-10 md:bottom-16 md:right-16 z-30 opacity-70 hover:opacity-100 transition-opacity hidden md:flex">
        <div className="relative w-24 h-24 flex items-center justify-center">
          <PulsingBorder
            colors={[
              "#0075CF",
              "#3391D9",
              "#FDFEFE",
              "#FD5A1A",
              "#FD8C5E",
              "#E6F2FA",
              "#ffffff",
            ]}
            speed={1.5}
            roundness={1}
            thickness={0.15}
            softness={0.2}
            intensity={4}
            style={{
              width: "70px",
              height: "70px",
              borderRadius: "50%",
            }}
          />

          <motion.svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
            animate={{ rotate: 360 }}
            transition={{
              duration: 25,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            style={{ transform: "scale(1.5)" }}
          >
            <defs>
              <path
                id="orbital-path"
                d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0"
              />
            </defs>
            <text className="text-[12px] fill-white/90 font-black tracking-widest uppercase">
              <textPath href="#orbital-path" startOffset="0%">
                Advance Online Training • Management System •
              </textPath>
            </text>
          </motion.svg>
        </div>
      </div>
    </div>
  );
}
