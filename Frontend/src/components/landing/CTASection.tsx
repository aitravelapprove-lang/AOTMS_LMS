import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Phone, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CTABackground = () => (
  <svg
    className="absolute inset-0 w-full h-full"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 1200 600"
    preserveAspectRatio="xMidYMid slice"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="cta-blue-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#0075CF" />
        <stop offset="100%" stopColor="#3391D9" />
      </linearGradient>
      <linearGradient id="cta-orange-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FD5A1A" />
        <stop offset="100%" stopColor="#FD8C5E" />
      </linearGradient>
    </defs>
    {/* Geometric shards */}
    <path d="M0,0 L600,0 L300,300 Z" fill="url(#cta-blue-grad)" opacity="0.8" />
    <path
      d="M600,0 L1200,0 L900,300 Z"
      fill="url(#cta-orange-grad)"
      opacity="0.8"
    />
    <path
      d="M0,600 L600,600 L300,300 Z"
      fill="url(#cta-orange-grad)"
      opacity="0.8"
    />
    <path
      d="M600,600 L1200,600 L900,300 Z"
      fill="url(#cta-blue-grad)"
      opacity="0.8"
    />
    <path
      d="M300,300 L600,0 L900,300 L600,600 Z"
      fill="#FDFEFE"
      opacity="0.05"
    />
  </svg>
);

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 lg:py-32 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Floating Decoration Card (Behind main) */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#FD5A1A]/10 blur-3xl rounded-full" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-[#0075CF]/10 blur-3xl rounded-full" />

        {/* Main CTA Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-[2.5rem] md:rounded-[3rem] md:rounded-tl-[10rem] md:rounded-br-[10rem] min-h-[400px] md:min-h-[500px] flex items-center justify-center shadow-2xl bg-[#0075CF] border border-white/20"
        >
          <CTABackground />

          <div className="relative z-10 px-6 sm:px-12 md:px-24 py-12 md:py-24 text-center">
            {/* Pulsing Status Badge */}
            <div className="flex justify-center mb-6">
              <span className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 rounded-full bg-white/10 border border-white/20 text-[#FDFEFE] text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] backdrop-blur-md">
                <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-white"></span>
                </span>
                Active Enrollment 2024
              </span>
            </div>

            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black text-white mb-6 md:mb-10 leading-[0.95] tracking-tighter">
              Launch Your <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-[#FD5A1A]">Future In Tech</span>.
            </h2>
            
            <p className="text-white/80 text-lg md:text-2xl max-w-2xl mx-auto mb-16 leading-relaxed font-medium font-jakarta">
              Join the elite circle of graduates in Vijayawada who transformed their careers through our industry-backed learning ecosystem.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button
                onClick={() => navigate("/auth")}
                className="group w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-5 rounded-[2rem] bg-white text-[#0075CF] font-black text-lg hover:bg-[#FD5A1A] hover:text-white transition-all duration-500 shadow-2xl hover:shadow-[0_0_40px_rgba(253,90,26,0.6)]"
              >
                Start My Journey
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </button>
              
              <button
                onClick={() => navigate("/auth")}
                className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-5 rounded-[2rem] bg-white/10 border border-white/20 text-[#FDFEFE] font-black text-lg hover:bg-white/20 transition-all backdrop-blur-xl"
              >
                <BookOpen className="w-6 h-6" /> Explore Track
              </button>
            </div>

            {/* Support Hotline */}
            <div className="mt-16 pt-10 border-t border-white/10 flex flex-wrap items-center justify-center gap-8">
              <a href="tel:+918019952233" className="flex items-center gap-3 text-[#FDFEFE]/70 hover:text-[#FDFEFE] transition-all group">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-[#FD5A1A] transition-all">
                  <Phone className="w-4 h-4" />
                </div>
                <span className="font-bold tracking-widest text-xs">+91 80199 52233</span>
              </a>
              <a href="mailto:Info@aotms.in" className="flex items-center gap-3 text-[#FDFEFE]/70 hover:text-[#FDFEFE] transition-all group">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-[#FD5A1A]/10 transition-colors">
                  <Mail className="w-4 h-4 text-[#FD5A1A]" />
                </div>
                <span className="font-bold tracking-widest text-xs">Info@aotms.in</span>
              </a>
            </div>
          </div>

          {/* Abstract corner shard decoration */}
          <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-white/5 blur-2xl transform rotate-45" />
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
