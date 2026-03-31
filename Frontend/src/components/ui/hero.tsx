import { useEffect, useRef, useState } from "react";
import { MeshGradient, PulsingBorder } from "@paper-design/shaders-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  FaReact,
  FaAws,
  FaDocker,
  FaNodeJs,
  FaGithub,
  FaTwitter,
  FaLinkedin,
  FaInstagram,
  FaGoogle,
  FaApple,
} from "react-icons/fa";
import {
  SiNextdotjs,
  SiVercel,
  SiRedux,
  SiTypescript,
  SiFacebook,
} from "react-icons/si";

const iconConfigs = [
  { Icon: FaReact, color: "#61DAFB" },
  { Icon: FaAws, color: "#FF9900" },
  { Icon: FaDocker, color: "#2496ED" },
  { Icon: FaNodeJs, color: "#339933" },
  { Icon: SiNextdotjs, color: "#FFFFFF" },
  { Icon: SiVercel, color: "#FFFFFF" },
  { Icon: SiRedux, color: "#764ABC" },
  { Icon: SiTypescript, color: "#3178C6" },
  { Icon: FaGithub, color: "#FFFFFF" },
  { Icon: FaTwitter, color: "#1DA1F2" },
  { Icon: FaLinkedin, color: "#0077B5" },
  { Icon: FaInstagram, color: "#E1306C" },
  { Icon: FaGoogle, color: "#DB4437" },
  { Icon: FaApple, color: "#FFFFFF" },
  { Icon: SiFacebook, color: "#1877F2" },
];

export default function ShaderShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const orbitCount = 3;
  const iconsPerOrbit = 5;

  return (
    <div
      ref={containerRef}
      className="min-h-screen relative overflow-hidden flex items-center justify-center bg-[#011B33]"
    >
      {/* Optimized Background Mesh Component */}
      <MeshGradient
        className="absolute inset-0 w-full h-full opacity-60"
        colors={["#011B33", "#0075cf", "#3391d9", "#fd8c5e", "#fd5a1a"]}
        speed={0.08}
      />

      <main className="relative z-20 container-width mx-auto px-6 flex flex-col lg:flex-row items-center justify-between gap-12 w-full py-20">
        {/* Left side: Content */}
        <div className="w-full lg:w-1/2 text-center lg:text-left">
          <motion.h1
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white mb-8 leading-[0.95] tracking-tight drop-shadow-2xl"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            SMART <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
              LEARNING
            </span>
            <br className="hidden md:block" />
            <span className="text-[#FD5A1A]">SYSTEM</span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl font-medium text-white/80 mb-12 leading-relaxed max-w-xl mx-auto lg:mx-0"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            AOTMS is Vijayawada's premier learning platform offering interactive
            courses, live classes, and industry-mapped skill evaluation.
          </motion.p>

          <motion.div
            className="flex items-center justify-center lg:justify-start gap-6 flex-wrap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Button
              size="lg"
              className="h-16 px-10 rounded-2xl bg-white text-[#0075CF] font-black text-lg hover:bg-slate-100 transition-all shadow-xl hover:scale-105"
              onClick={() => navigate("/auth")}
            >
              Get Started
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-16 px-10 rounded-2xl bg-white/10 border-white/20 text-white font-black text-lg hover:bg-white/20 transition-all backdrop-blur-md hover:scale-105"
              onClick={() => navigate("/courses")}
            >
              Explore Catalog
            </Button>
          </motion.div>
        </div>

        {/* Right side: Orbit Animation */}
        <div className="w-full lg:w-1/2 flex items-center justify-center relative min-h-[400px] lg:min-h-[600px]">
          <div className="relative w-full max-w-[500px] aspect-square flex items-center justify-center scale-75 sm:scale-100">
            {/* Center Node */}
            <motion.div
              className="w-24 h-24 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl flex items-center justify-center z-30 p-2"
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <img src="/favicon.png" alt="AOTMS Favicon" className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]" />
            </motion.div>

            {/* Generate Orbits */}
            {[...Array(orbitCount)].map((_, orbitIdx) => {
              const radius = 100 + orbitIdx * 60; // Responsive radius
              const duration = 15 + orbitIdx * 10;
              const angleStep = (2 * Math.PI) / iconsPerOrbit;

              return (
                <motion.div
                  key={orbitIdx}
                  className="absolute rounded-full border border-white/10 border-dashed"
                  style={{
                    width: radius * 2,
                    height: radius * 2,
                  }}
                  animate={{ rotate: orbitIdx % 2 ? -360 : 360 }}
                  transition={{
                    duration: duration,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  {iconConfigs
                    .slice(
                      orbitIdx * iconsPerOrbit,
                      (orbitIdx + 1) * iconsPerOrbit,
                    )
                    .map((cfg, iconIdx) => {
                      const angle = iconIdx * angleStep;
                      const x = 50 + 50 * Math.cos(angle);
                      const y = 50 + 50 * Math.sin(angle);

                      return (
                        <div
                          key={iconIdx}
                          className="absolute bg-white/5 backdrop-blur-lg border border-white/10 rounded-full p-2 shadow-xl hover:scale-125 transition-transform duration-300"
                          style={{
                            left: `${x}%`,
                            top: `${y}%`,
                            transform: "translate(-50%, -50%)",
                          }}
                        >
                          {cfg.Icon && (
                            <cfg.Icon
                              className="w-6 h-6 sm:w-8 sm:h-8"
                              style={{ color: cfg.color }}
                            />
                          )}
                        </div>
                      );
                    })}
                </motion.div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Decorative Rotating Orbital Logo at bottom right - Simplified for Performance */}
      <div className="absolute bottom-10 right-10 z-30 opacity-40 hidden md:flex pointer-events-none">
        <div className="relative w-24 h-24 flex items-center justify-center">
          <PulsingBorder
            colors={["#0075CF", "#FD5A1A", "#ffffff"]}
            speed={2}
            roundness={1}
            thickness={0.1}
            intensity={2}
            style={{ width: "60px", height: "60px", borderRadius: "50%" }}
          />
        </div>
      </div>
    </div>
  );
}
