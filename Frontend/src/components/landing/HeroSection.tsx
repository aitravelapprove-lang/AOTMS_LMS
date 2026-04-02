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
  </svg>
);

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16">
      {/* Low-poly geometric background */}
      <LowPolyBackground />

      {/* Overlay for readability — kept light so patterns show through */}
      <div className="absolute inset-0 bg-slate-950/20" />

      <div className="container-width section-padding relative z-10 w-full">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white/90 text-sm font-bold mb-8 tracking-wide uppercase shadow-lg">
              <span className="w-2 h-2 rounded-full bg-[#FD5A1A] animate-pulse" />
              Vijayawada's #1 Skill Engineering Platform
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-heading text-4xl sm:text-6xl lg:text-8xl leading-none tracking-tight mb-6 text-center text-white drop-shadow-2xl px-2 font-extrabold"
          >
            SMART LEARNING
            <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0075CF] via-[#FDFEFE] to-[#0075CF]">
              {" "}
              MANAGEMENT SYSTEM
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm md:text-lg text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed font-medium"
          >
            AOTMS is Vijayawada's premier learning management system offering
            online courses, live classes, secure exams, mock tests, and
            ATS-based skill evaluation. Join thousands of students building
            real-world careers.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              size="xl"
              className="h-14 px-10 rounded-2xl bg-[#0075CF] hover:bg-[#0066B3] text-[#FDFEFE] font-black text-base shadow-2xl hover:scale-105 active:scale-95 transition-all group gap-2"
              onClick={() => navigate("/login")}
            >
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="xl"
              className="h-14 px-10 rounded-2xl bg-[#FD5A1A] hover:bg-[#E34D14] text-[#FDFEFE] font-black text-base shadow-2xl hover:scale-105 active:scale-95 transition-all gap-2 backdrop-blur"
              onClick={() => navigate("/student-dashboard")}
            >
              <Play className="w-5 h-5 fill-current" />
              Explore Platform
            </Button>
          </motion.div>

          {/* Feature Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex flex-wrap items-center justify-center gap-3 mt-10"
          >
            {[
              { icon: BookOpen, text: "100+ Courses" },
              { icon: Users, text: "10K+ Students" },
              { icon: Trophy, text: "95% Placement" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur border border-white/20 text-[#FDFEFE]/90 text-sm font-bold tracking-wide"
              >
                <item.icon className="w-4 h-4 text-[#FD5A1A]" />
                {item.text}
              </div>
            ))}
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="grid grid-cols-2 md:flex md:flex-wrap justify-items-center md:justify-center gap-y-8 gap-x-4 md:gap-16 mt-16 pt-8 border-t border-white/20"
          >
            {[
              { value: "10K+", label: "Active Students" },
              { value: "50+", label: "Expert Instructors" },
              { value: "100+", label: "Courses" },
              { value: "95%", label: "Success Rate" },
            ].map((stat) => (
              <div key={stat.label} className="text-center w-full md:w-auto">
                <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white drop-shadow">
                  {stat.value}
                </p>
                <p className="text-[10px] md:text-sm text-white/60 mt-1 font-semibold tracking-wider uppercase">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
