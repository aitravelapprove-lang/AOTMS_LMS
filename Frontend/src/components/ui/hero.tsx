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
import logo from "@/assets/logo.png";

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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check, { passive: true });
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen relative overflow-hidden flex items-center justify-center bg-[#011B33]"
    >
      {/* Branded Background - CSS gradient on mobile, WebGL shader on desktop */}
      {isMobile ? (
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#011B33] via-[#0044a8] to-[#011B33]" />
      ) : (
        <MeshGradient
          className="absolute inset-0 w-full h-full opacity-80"
          colors={["#011B33", "#0075CF", "#FD5A1A", "#011B33", "#0075CF"]}
          speed={0.07}
        />
      )}

      <main className="relative z-20 container-width mx-auto px-6 flex flex-col lg:flex-row items-center justify-between gap-12 w-full pt-24 sm:pt-32 lg:pt-36 pb-20">
        {/* Left side: Content */}
        <div className="w-full lg:w-1/2 text-center lg:text-left">
          <motion.h1
            className="text-[3.25rem] leading-[0.85] sm:text-7xl lg:text-8xl font-black text-white mb-6 tracking-tighter drop-shadow-2xl flex flex-col items-center lg:items-start"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="block">SMART</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-[#0075CF] block">
              LEARNING
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FD5A1A] via-orange-300 to-[#FF7A00] block">
              SYSTEM
            </span>
          </motion.h1>

          <motion.p
            className="text-sm md:text-xl font-medium text-white/80 mb-10 leading-relaxed max-w-sm sm:max-w-xl mx-auto lg:mx-0 px-4 sm:px-0"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            AOTMS is Vijayawada's premier learning platform offering interactive
            courses, live classes, and industry-mapped skill evaluation.
          </motion.p>

          <motion.div
            className="flex items-center justify-center lg:justify-start gap-4 sm:gap-6 flex-wrap px-4 sm:px-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Button
              size="lg"
              className="h-14 sm:h-16 px-8 sm:px-10 rounded-xl sm:rounded-2xl bg-white text-[#0075CF] font-black text-sm sm:text-lg hover:bg-slate-100 transition-all shadow-xl hover:scale-105 w-full sm:w-auto"
              onClick={() => navigate("/auth")}
            >
              Get Started
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 sm:h-16 px-8 sm:px-10 rounded-xl sm:rounded-2xl bg-white/10 border-white/20 text-white font-black text-sm sm:text-lg hover:bg-white/20 transition-all backdrop-blur-md hover:scale-105 w-full sm:w-auto"
              onClick={() => (window.location.href = "https://www.aotms.in/#/courses")}
            >
              Explore Catalog
            </Button>
          </motion.div>
        </div>

        {/* ─── MOBILE ORBIT ─────────────────────────────────────────────────────
             Compact, CSS-only rotation — runs on compositor thread, zero JS cost.
             Only renders on mobile (< md). Uses 2 rings × 4 icons = 8 icons total.
        ──────────────────────────────────────────────────────────────────────── */}
        <div className="flex md:hidden w-full items-center justify-center mt-2 pb-6">
          <div className="relative flex items-center justify-center" style={{ width: 220, height: 220 }}>

            {/* Center logo */}
            <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 shadow-[0_0_30px_rgba(0,117,207,0.4)] flex items-center justify-center z-30 p-2.5 absolute">
              <img src="/favicon.png" alt="AOTMS" className="w-full h-full object-contain" />
            </div>

            {/* Ring 1 — CW, radius ~68px */}
            <div
              className="absolute rounded-full border border-white/30 border-dashed"
              style={{ width: 136, height: 136, animation: "orbit-cw 14s linear infinite", willChange: "transform" }}
            >
              {[
                { Icon: FaReact, color: "#61DAFB" }, { Icon: FaNodeJs, color: "#339933" },
                { Icon: SiTypescript, color: "#3178C6" }, { Icon: FaDocker, color: "#2496ED" },
              ].map((cfg, i) => {
                const angle = (i / 4) * 2 * Math.PI;
                return (
                  <div
                    key={i}
                    className="absolute bg-white/10 rounded-full p-1.5 border border-white/15"
                    style={{
                      left: `${50 + 50 * Math.cos(angle)}%`,
                      top: `${50 + 50 * Math.sin(angle)}%`,
                      transform: "translate(-50%, -50%)",
                      animation: "counter-orbit-cw 14s linear infinite",
                      willChange: "transform",
                    }}
                  >
                    <cfg.Icon className="w-4 h-4" style={{ color: cfg.color }} />
                  </div>
                );
              })}
            </div>

            {/* Ring 2 — CCW, radius ~108px */}
            <div
              className="absolute rounded-full border border-white/20 border-dashed"
              style={{ width: 216, height: 216, animation: "orbit-ccw 22s linear infinite", willChange: "transform" }}
            >
              {[
                { Icon: FaAws, color: "#FF9900" }, { Icon: FaLinkedin, color: "#0077B5" },
                { Icon: SiNextdotjs, color: "#FFFFFF" }, { Icon: FaGithub, color: "#FFFFFF" },
              ].map((cfg, i) => {
                const angle = (i / 4) * 2 * Math.PI;
                return (
                  <div
                    key={i}
                    className="absolute bg-white/10 rounded-full p-1.5 border border-white/15"
                    style={{
                      left: `${50 + 50 * Math.cos(angle)}%`,
                      top: `${50 + 50 * Math.sin(angle)}%`,
                      transform: "translate(-50%, -50%)",
                      animation: "counter-orbit-ccw 22s linear infinite",
                      willChange: "transform",
                    }}
                  >
                    <cfg.Icon className="w-4 h-4" style={{ color: cfg.color }} />
                  </div>
                );
              })}
            </div>

          </div>
        </div>

        {/* ─── DESKTOP ORBIT ── full framer-motion version, unchanged ──────── */}
        <div className="hidden md:flex w-full lg:w-1/2 items-center justify-center relative min-h-[400px] lg:min-h-[600px]">
          <div className="relative w-full max-w-[500px] aspect-square flex items-center justify-center scale-75 sm:scale-100">
            {/* Center Node */}
            <motion.div
              className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_0_50px_rgba(0,117,207,0.3)] flex items-center justify-center z-30 p-4"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <img
                src="/favicon.png"
                alt="AOTMS Favicon"
                className="w-full h-full object-contain"
              />
            </motion.div>

            {/* Generate Orbits */}
            {[...Array(orbitCount)].map((_, orbitIdx) => {
              const radius = 100 + orbitIdx * 60;
              const duration = 15 + orbitIdx * 10;
              const angleStep = (2 * Math.PI) / iconsPerOrbit;

              return (
                <motion.div
                  key={orbitIdx}
                  className="absolute rounded-full border border-white/40 border-dashed"
                  style={{ width: radius * 2, height: radius * 2 }}
                  animate={{ rotate: orbitIdx % 2 ? -360 : 360 }}
                  transition={{ duration: duration, repeat: Infinity, ease: "linear" }}
                >
                  {iconConfigs
                    .slice(orbitIdx * iconsPerOrbit, (orbitIdx + 1) * iconsPerOrbit)
                    .map((cfg, iconIdx) => {
                      const angle = iconIdx * angleStep;
                      const x = 50 + 50 * Math.cos(angle);
                      const y = 50 + 50 * Math.sin(angle);
                      return (
                        <div
                          key={iconIdx}
                          className="absolute bg-white/5 backdrop-blur-lg border border-white/10 rounded-full p-2 shadow-xl hover:scale-125 transition-transform duration-300"
                          style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
                        >
                          {cfg.Icon && (
                            <cfg.Icon className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: cfg.color }} />
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
