import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, BookOpen, Trophy, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Low-poly triangle mosaic background pattern (matching the blue-to-orange screenshot)
const LowPolyBackground = () => (
  <svg
    className="absolute inset-0 w-full h-full"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 1200 700"
    preserveAspectRatio="xMidYMid slice"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="bg-grad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#0075CF" />
        <stop offset="35%" stopColor="#3391D9" />
        <stop offset="55%" stopColor="#FDFEFE" />
        <stop offset="75%" stopColor="#FD8C5E" />
        <stop offset="100%" stopColor="#FD5A1A" />
      </linearGradient>
      <filter id="noise" x="0%" y="0%" width="100%" height="100%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.65"
          numOctaves="3"
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
        <feBlend in="SourceGraphic" mode="multiply" result="blend" />
        <feComposite in="blend" in2="SourceGraphic" operator="in" />
      </filter>
      <radialGradient id="vignette-shadow" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stopColor="transparent" />
        <stop offset="100%" stopColor="#011B33" stopOpacity="0.4" />
      </radialGradient>
    </defs>
    {/* Base gradient fill */}
    <rect width="1200" height="700" fill="url(#bg-grad)" />
    {/* Top row – blue tones */}
    <polygon points="0,0 120,80 0,160" fill="#0066B3" opacity="0.85" />
    <polygon points="0,0 200,0 120,80" fill="#0075CF" opacity="0.9" />
    <polygon points="200,0 320,90 120,80" fill="#005A9C" opacity="0.8" />
    <polygon points="200,0 400,0 320,90" fill="#0084EA" opacity="0.85" />
    <polygon points="400,0 480,75 320,90" fill="#1A83D4" opacity="0.9" />
    <polygon points="400,0 600,0 480,75" fill="#006BBF" opacity="0.8" />
    <polygon points="600,0 640,80 480,75" fill="#208CD9" opacity="0.75" />
    <polygon points="600,0 800,0 640,80" fill="#005EAD" opacity="0.85" />
    <polygon points="800,0 860,70 640,80" fill="#007ACC" opacity="0.8" />
    <polygon points="800,0 1000,0 860,70" fill="#006EB3" opacity="0.9" />
    <polygon points="1000,0 1080,85 860,70" fill="#005A9C" opacity="0.85" />
    <polygon points="1000,0 1200,0 1080,85" fill="#007DCF" opacity="0.8" />
    <polygon points="1200,0 1200,150 1080,85" fill="#005286" opacity="0.9" />
    {/* Second row – transitioning to lighter blue/grey */}
    <polygon points="0,160 120,80 200,170" fill="#3391D9" opacity="0.8" />
    <polygon points="0,160 200,170 0,280" fill="#4DA7E2" opacity="0.75" />
    <polygon points="120,80 320,90 200,170" fill="#2686C9" opacity="0.85" />
    <polygon points="200,170 320,90 440,180" fill="#66BDEC" opacity="0.8" />
    <polygon points="320,90 480,75 440,180" fill="#409AD4" opacity="0.75" />
    <polygon points="440,180 480,75 620,170" fill="#80CEF3" opacity="0.8" />
    <polygon points="480,75 640,80 620,170" fill="#66BDEC" opacity="0.85" />
    <polygon points="620,170 640,80 800,160" fill="#99DFF9" opacity="0.8" />
    <polygon points="640,80 860,70 800,160" fill="#80CEF3" opacity="0.75" />
    <polygon points="800,160 860,70 1000,175" fill="#A6E5FA" opacity="0.8" />
    <polygon points="860,70 1080,85 1000,175" fill="#80CEF3" opacity="0.85" />
    <polygon points="1000,175 1080,85 1200,150" fill="#66BDEC" opacity="0.8" />
    <polygon
      points="1000,175 1200,150 1200,280"
      fill="#99DFF9"
      opacity="0.75"
    />
    {/* Middle row – warm white/light transition */}
    <polygon points="0,280 200,170 240,300" fill="#FDFEFE" opacity="0.7" />
    <polygon points="0,280 240,300 0,420" fill="#FDFEFE" opacity="0.75" />
    <polygon points="200,170 440,180 350,310" fill="#FDFEFE" opacity="0.7" />
    <polygon points="200,170 350,310 240,300" fill="#FDFEFE" opacity="0.75" />
    <polygon points="440,180 620,170 540,305" fill="#FDFEFE" opacity="0.8" />
    <polygon points="350,310 440,180 540,305" fill="#FDFEFE" opacity="0.75" />
    <polygon points="540,305 620,170 760,300" fill="#FDFEFE" opacity="0.8" />
    <polygon points="620,170 800,160 760,300" fill="#FDFEFE" opacity="0.75" />
    <polygon points="760,300 800,160 980,295" fill="#FDFEFE" opacity="0.8" />
    <polygon points="800,160 1000,175 980,295" fill="#FDFEFE" opacity="0.75" />
    <polygon points="980,295 1000,175 1200,280" fill="#FDFEFE" opacity="0.8" />
    <polygon points="980,295 1200,280 1200,400" fill="#FDFEFE" opacity="0.7" />
    {/* Lower middle – orange transition */}
    <polygon points="0,420 240,300 280,440" fill="#FD8C5E" opacity="0.8" />
    <polygon points="0,420 280,440 0,540" fill="#FD7A45" opacity="0.85" />
    <polygon points="240,300 540,305 420,435" fill="#FD9C73" opacity="0.8" />
    <polygon points="240,300 420,435 280,440" fill="#FD7A45" opacity="0.75" />
    <polygon points="420,435 540,305 680,430" fill="#FD8C5E" opacity="0.8" />
    <polygon points="540,305 760,300 680,430" fill="#FD7A45" opacity="0.75" />
    <polygon points="680,430 760,300 900,425" fill="#FD8C5E" opacity="0.8" />
    <polygon points="760,300 980,295 900,425" fill="#FD7A45" opacity="0.75" />
    <polygon points="900,425 980,295 1200,400" fill="#FD8C5E" opacity="0.8" />
    <polygon points="900,425 1200,400 1200,530" fill="#FD7A45" opacity="0.75" />
    {/* Bottom – deep orange */}
    <polygon points="0,540 280,440 320,560" fill="#FD5A1A" opacity="0.9" />
    <polygon points="0,540 320,560 0,700" fill="#E34D14" opacity="0.85" />
    <polygon points="280,440 420,435 400,570" fill="#FD6D33" opacity="0.85" />
    <polygon points="280,440 400,570 320,560" fill="#FD5A1A" opacity="0.9" />
    <polygon points="400,570 420,435 600,555" fill="#FD6D33" opacity="0.85" />
    <polygon points="420,435 680,430 600,555" fill="#FD5A1A" opacity="0.9" />
    <polygon points="600,555 680,430 840,550" fill="#FD6D33" opacity="0.85" />
    <polygon points="680,430 900,425 840,550" fill="#FD5A1A" opacity="0.9" />
    <polygon points="840,550 900,425 1100,545" fill="#FD6D33" opacity="0.85" />
    <polygon points="900,425 1200,530 1100,545" fill="#FD5A1A" opacity="0.9" />
    <polygon
      points="1100,545 1200,530 1200,700"
      fill="#E34D14"
      opacity="0.85"
    />
    <polygon points="0,700 320,560 400,700" fill="#CC4511" opacity="0.9" />
    <polygon points="320,560 600,555 500,700" fill="#E34D14" opacity="0.85" />
    <polygon points="600,555 840,550 700,700" fill="#CC4511" opacity="0.9" />
    <polygon points="840,550 1100,545 900,700" fill="#E34D14" opacity="0.85" />
    <polygon points="1100,545 1200,700 1000,700" fill="#FD5A1A" opacity="0.9" />
    <polygon points="400,700 500,700 0,700" fill="#B23C0F" opacity="0.85" />
    <polygon points="500,700 700,700 600,700" fill="#E34D14" opacity="0.8" />
    <polygon points="700,700 900,700 800,700" fill="#B23C0F" opacity="0.85" />
    <polygon points="900,700 1000,700 1200,700" fill="#E34D14" opacity="0.8" />
    <rect width="1200" height="700" fill="url(#vignette-shadow)" pointerEvents="none" />
  </svg>
);

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-28 pb-20">
      {/* Low-poly geometric background */}
      <LowPolyBackground />

      <div className="container-width px-6 relative z-10 w-full">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs sm:text-sm font-bold mb-8 tracking-[0.1em] uppercase shadow-2xl">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse shadow-[0_0_12px_#ffffff]" />
              Vijayawada's #1 Skill Engineering Platform
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-heading text-4xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight mb-8 text-center text-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)] px-2 font-black"
          >
            SMART LEARNING
            <br className="hidden md:block" />
            <span className="text-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)]">
              {" "}
              MANAGEMENT SYSTEM
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-white max-w-3xl mx-auto mb-12 leading-relaxed font-semibold drop-shadow-md px-4"
          >
            AOTMS is Vijayawada's premier learning management system offering
            online courses, live classes, secure exams, mock tests, and
            ATS-based skill evaluation. Join thousands of students building
            real-world careers.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-5 px-4"
          >
            <Button
              size="lg"
              className="w-full sm:w-auto h-16 px-12 rounded-2xl bg-[#0075CF] hover:bg-[#0084EA] text-white font-black text-lg shadow-[0_10px_30px_-5px_rgba(0,117,207,0.4)] hover:shadow-[0_15px_35px_-5px_rgba(0,117,207,0.6)] hover:scale-[1.03] active:scale-95 transition-all group gap-3 border-b-4 border-[#005A9C]"
              onClick={() => navigate("/auth")}
            >
              Get Started
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1.5 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto h-16 px-12 rounded-2xl bg-[#FD5A1A]/10 backdrop-blur-xl border-2 border-[#FD5A1A] hover:bg-[#FD5A1A] text-white font-black text-lg shadow-xl hover:scale-[1.03] active:scale-95 transition-all gap-3 overflow-hidden group"
              onClick={() => navigate("/student-dashboard")}
            >
              <Play className="w-6 h-6 fill-current group-hover:scale-110 transition-transform" />
              Explore Platform
            </Button>
          </motion.div>

          {/* Feature Pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-12 px-4"
          >
            {[
              { icon: BookOpen, text: "100+ Courses" },
              { icon: Users, text: "10K+ Students" },
              { icon: Trophy, text: "95% Placement" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 text-white text-sm font-bold tracking-wide shadow-xl hover:bg-white/30 transition-all hover:scale-105"
              >
                <item.icon className="w-5 h-5 text-white drop-shadow-md" />
                {item.text}
              </div>
            ))}
          </motion.div>

          {/* Stats Section with improved layout and legibility */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-20 pt-10 border-t border-white/20"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-x-0 md:divide-x divide-white/10">
              {[
                { value: "10K+", label: "Active Students" },
                { value: "50+", label: "Expert Instructors" },
                { value: "100+", label: "Premium Courses" },
                { value: "95%", label: "Success Rate" },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center justify-center px-4">
                  <div className="relative">
                    <span className="text-3xl sm:text-4xl md:text-5xl font-black text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
                      {stat.value}
                    </span>
                    <div className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FD5A1A] to-transparent opacity-50" />
                  </div>
                  <p className="text-[10px] sm:text-xs md:text-sm text-white/80 mt-3 font-black tracking-[0.2em] uppercase">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
