import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
const TestBg = () => (
  <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 1200 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <linearGradient id="test-bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#E6F2FA" />
        <stop offset="45%" stopColor="#FDFEFE" />
        <stop offset="100%" stopColor="#FFF2EC" />
      </linearGradient>
    </defs>
    <rect width="1200" height="900" fill="url(#test-bg)" />

    {/* Top left cluster */}
    <polygon points="0,0 180,0 90,130" fill="#0075CF" opacity="0.11" />
    <polygon points="180,0 300,0 240,130" fill="#3391D9" opacity="0.10" />
    <polygon points="90,130 180,0 240,130" fill="#AADBFA" opacity="0.09" />

    {/* Top right cluster */}
    <polygon points="1200,0 1020,0 1110,130" fill="#FD5A1A" opacity="0.11" />
    <polygon points="1020,0 900,0 960,130" fill="#FD8C5E" opacity="0.10" />
    <polygon points="1110,130 1020,0 960,130" fill="#FEEDEA" opacity="0.09" />

    {/* Center top crown */}
    <polygon points="520,0 600,0 560,100" fill="#0075CF" opacity="0.09" />
    <polygon points="600,0 680,0 640,100" fill="#0075CF" opacity="0.09" />

    {/* Bottom left gradient */}
    <polygon points="0,620 200,680 100,800" fill="#FD5A1A" opacity="0.10" />

    {/* Bottom right gradient */}
    <polygon points="1200,620 1000,680 1100,800" fill="#0075CF" opacity="0.10" />

    {/* Constellation node dots */}
    <circle cx="0"    cy="0"   r="4"   fill="#0075CF" opacity="0.32" />
    <circle cx="180"  cy="0"   r="3.5" fill="#0075CF" opacity="0.28" />
    <circle cx="1200" cy="0"   r="4"   fill="#FD5A1A" opacity="0.32" />
    <circle cx="1020" cy="0"   r="3.5" fill="#FD5A1A" opacity="0.28" />
  </svg>
);

const testimonials = [
  { 
    name: "Aditya Krishnan", 
    role: "SDE-1 @ Microsoft", 
    course: "Full Stack Dev", 
    text: "AOTMS transformed my career. The live classes and hands-on projects helped me land my dream job within 6 months.", 
    avatar: "AK", 
    rating: 5,
    stats: { score: "98%", hirable: "READY", time: "180 Days" }
  },
  { 
    name: "Meera Nair", 
    role: "Data Analyst @ Infosys", 
    course: "Data Science", 
    text: "The curriculum is perfectly aligned with industry needs. The ATS resume scoring feature was a complete game-changer.", 
    avatar: "MN", 
    rating: 5,
    stats: { score: "94%", hirable: "PREMIUM", time: "120 Days" }
  },
  { 
    name: "Sanjay Gupta", 
    role: "Cloud Architect @ TCS", 
    course: "Cloud Computing", 
    text: "Excellent instructors. The secure exam system built my confidence and the placement support was outstanding.", 
    avatar: "SG", 
    rating: 5,
    stats: { score: "96%", hirable: "VERIFIED", time: "145 Days" }
  },
  { 
    name: "Lakshmi Devi", 
    role: "UI Developer @ Wipro", 
    course: "UI/UX Design", 
    text: "Zero design experience to a UI Developer role — AOTMS's structured program and mentors made it possible.", 
    avatar: "LD", 
    rating: 5,
    stats: { score: "99%", hirable: "EXPERT", time: "90 Days" }
  },
];

const Testimonials = () => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right

  const paginate = useCallback((newDirection: number) => {
    setDirection(newDirection);
    setCurrent((prev) => (prev + newDirection + testimonials.length) % testimonials.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      paginate(1);
    }, 5000); // Auto-play every 5 seconds

    return () => clearInterval(timer);
  }, [paginate]);

  const t = testimonials[current];

  return (
    <section id="testimonials" className="relative py-24 lg:py-40 bg-transparent overflow-hidden">
      {/* Background patterns sourced from global mesh */}
      
      {/* Dynamic Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#0075CF]/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          whileInView={{ opacity: 1, scale: 1 }} 
          viewport={{ once: true }} 
          className="text-center mb-20 lg:mb-32"
        >
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white border border-[#0075CF]/10 shadow-xl shadow-slate-200/50 text-[#0075CF] text-xs font-black uppercase tracking-[0.3em] mb-8">
            <span className="w-2 h-2 rounded-full bg-[#FD5A1A] animate-ping" />
            Verified Career Results
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-slate-900 mb-8 leading-[1.1] tracking-tighter">
            Impact That <span className="text-[#0075CF]">Speaks</span> <br className="hidden md:block"/>
            <span className="text-[#FD5A1A]">For Itself</span>
          </h2>
          <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
            Join the elite circle of graduates in Vijayawada who transformed their aspirations into career-defining roles.
          </p>
        </motion.div>

        <div className="relative flex flex-col items-center">
          {/* Main Kinetic Stage */}
          <div className="relative w-full max-w-5xl aspect-[16/10] md:aspect-[16/8] flex items-center justify-center">
            
            {/* Background "Ghost" Cards */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none scale-110 blur-sm">
                <div className="w-full h-full border-[10px] border-[#0075CF]/20 rounded-[4rem] rotate-2" />
            </div>

            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                initial={{ opacity: 0, x: direction > 0 ? 100 : -100, scale: 0.8, rotateY: direction > 0 ? 15 : -15 }}
                animate={{ opacity: 1, x: 0, scale: 1, rotateY: 0 }}
                exit={{ opacity: 0, x: direction > 0 ? -100 : 100, scale: 0.8, rotateY: direction > 0 ? -15 : 15 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full h-full"
              >
                <div className="w-full h-full bg-white rounded-[3rem] md:rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,117,207,0.15)] border border-white p-8 md:p-16 flex flex-col lg:flex-row items-center gap-10 lg:gap-20 overflow-hidden">
                  
                  {/* Decorative Shard */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-bl-[10rem] -z-10 group-hover:bg-[#0075CF]/5 transition-colors" />

                  {/* Left: Portait & Stats */}
                  <div className="w-full lg:w-1/3 flex flex-col items-center lg:items-start">
                    <div className="relative mb-8">
                       <div className="w-32 h-32 md:w-48 md:h-48 rounded-[2.5rem] bg-gradient-to-br from-[#0075CF] to-[#3391D9] flex items-center justify-center text-white text-4xl md:text-6xl font-black shadow-2xl relative z-10">
                         {t.avatar}
                       </div>
                       {/* Animated orbit */}
                       <div className="absolute -inset-4 border border-dashed border-[#0075CF]/20 rounded-[3rem] animate-[spin_10s_linear_infinite]" />
                    </div>
                    
                    {/* Telemetry Grid */}
                    <div className="grid grid-cols-2 gap-3 w-full">
                       <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Score</p>
                         <p className="text-xl font-black text-[#0075CF]">{t.stats.score}</p>
                       </div>
                       <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Rank</p>
                         <p className="text-xl font-black text-[#FD5A1A]">{t.stats.hirable}</p>
                       </div>
                    </div>
                  </div>

                  {/* Right: Testimony */}
                  <div className="w-full lg:w-2/3 flex flex-col">
                    <div className="flex items-center gap-2 mb-6">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-[#FD5A1A] text-[#FD5A1A]" />
                      ))}
                    </div>

                    <p className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 leading-[1.2] tracking-tight mb-10 italic">
                      "{t.text}"
                    </p>

                    <div className="mt-auto flex items-end justify-between border-t border-slate-100 pt-8">
                      <div>
                        <h4 className="text-2xl font-black text-slate-900 mb-1">{t.name}</h4>
                        <p className="text-[#0075CF] font-bold tracking-tight">{t.role}</p>
                      </div>
                      <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Verification</p>
                        <div className="px-4 py-1.5 bg-[#E6F2FA] text-[#0075CF] text-[10px] font-black rounded-full border border-[#0075CF]/10">
                          {t.stats.time} TO HIRED
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Orbitals */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 md:px-0 pointer-events-none">
              <button 
                onClick={() => paginate(-1)}
                className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white shadow-2xl flex items-center justify-center border border-slate-100 text-slate-400 hover:text-[#0075CF] hover:border-[#0075CF] hover:scale-110 active:scale-95 transition-all pointer-events-auto -ml-8 md:-ml-10"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button 
                onClick={() => paginate(1)}
                className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white shadow-2xl flex items-center justify-center border border-slate-100 text-slate-400 hover:text-[#FD5A1A] hover:border-[#FD5A1A] hover:scale-110 active:scale-95 transition-all pointer-events-auto -mr-8 md:-mr-10"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </div>
          </div>

          {/* Timeline Indicators */}
          <div className="mt-16 flex items-center gap-4">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setDirection(i > current ? 1 : -1);
                  setCurrent(i);
                }}
                className={`relative h-1.5 transition-all duration-700 rounded-full overflow-hidden ${
                  i === current ? "w-20" : "w-10 bg-slate-100"
                }`}
              >
                {i === current && (
                  <motion.div 
                    initial={{ x: "-100%" }}
                    animate={{ x: "0%" }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 bg-[#0075CF]"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
