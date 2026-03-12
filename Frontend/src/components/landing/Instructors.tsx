import { useState, useEffect } from "react";
import { Linkedin, Twitter, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const InstBg = () => (
  <svg
    className="absolute inset-0 w-full h-full"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 1200 800"
    preserveAspectRatio="xMidYMid slice"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="inst-bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#E6F2FA" />
        <stop offset="50%" stopColor="#FDFEFE" />
        <stop offset="100%" stopColor="#FFF2EC" />
      </linearGradient>
    </defs>
    <rect width="1200" height="800" fill="url(#inst-bg)" />
    {/* Left blue crystal pillar */}
    <polygon points="0,0 80,0 40,70" fill="#0075CF" opacity="0.14" />
    <polygon points="80,0 160,0 120,70" fill="#3391D9" opacity="0.12" />
    <polygon points="40,70 80,0 120,70" fill="#0066B3" opacity="0.11" />
    {/* Right orange crystal pillar */}
    <polygon points="1200,0 1120,0 1160,70" fill="#FD5A1A" opacity="0.14" />
    <polygon points="1120,0 1040,0 1080,70" fill="#FD8C5E" opacity="0.12" />
    <polygon points="1160,70 1120,0 1080,70" fill="#E34D14" opacity="0.11" />

    {/* Nodes */}
    <circle cx="0" cy="0" r="3.5" fill="#0075CF" opacity="0.28" />
    <circle cx="40" cy="70" r="3" fill="#0075CF" opacity="0.26" />
    <circle cx="1200" cy="0" r="3.5" fill="#FD5A1A" opacity="0.28" />
    <circle cx="1160" cy="70" r="3" fill="#FD5A1A" opacity="0.26" />

    {/* Edge lines */}
    <line
      x1="0"
      y1="0"
      x2="0"
      y2="800"
      stroke="#0075CF"
      strokeWidth="1.5"
      opacity="0.14"
    />
    <line
      x1="1200"
      y1="0"
      x2="1200"
      y2="800"
      stroke="#FD5A1A"
      strokeWidth="1.5"
      opacity="0.14"
    />
  </svg>
);

const initialInstructors = [
  {
    id: 1,
    name: "Dr. Rajesh Kumar",
    expertise: "Full Stack Dev",
    exp: "15+ Yrs",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: 2,
    name: "Priya Menon",
    expertise: "Data Science & AI",
    exp: "12+ Yrs",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: 3,
    name: "Amit Sharma",
    expertise: "Cloud & DevOps",
    exp: "10+ Yrs",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: 4,
    name: "Sneha Reddy",
    expertise: "UI/UX Design",
    exp: "8+ Yrs",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: 5,
    name: "Vikram Singh",
    expertise: "Cyber Security",
    exp: "11+ Yrs",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: 6,
    name: "Ananya Rao",
    expertise: "Digital Marketing",
    exp: "7+ Yrs",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face",
  },
];

const Instructors = () => {
  const [list, setList] = useState(initialInstructors);

  useEffect(() => {
    const timer = setInterval(() => {
      setList((prev) => {
        const newList = [...prev];
        const lastItem = newList.pop();
        if (lastItem) newList.unshift(lastItem);
        return newList;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section
      id="trainers"
      className="relative py-24 lg:py-32 overflow-hidden bg-transparent"
    >
      <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20 md:mb-24"
        >
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#E6F2FA] border border-[#0075CF]/10 text-[#0075CF] text-xs font-black uppercase tracking-[0.2em] mb-6">
            <Users className="w-4 h-4" /> Global Tech Mentors
          </span>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
            Learn From The <br />
            <span className="text-[#0075CF]">Best in Tech</span>
          </h2>
          <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
            Our mentors are industry veterans who have built systems used by
            millions.
          </p>
        </motion.div>

        <div className="relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
            <AnimatePresence mode="popLayout">
              {list.slice(0, 4).map((inst, i) => (
                <motion.div
                  key={inst.id}
                  layout
                  initial={{ opacity: 0, x: 50, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -50, scale: 0.9 }}
                  transition={{
                    duration: 0.8,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="group h-full"
                >
                  <div className="relative bg-white/90 backdrop-blur-xl rounded-[2.5rem] border border-white/50 shadow-2xl shadow-slate-200/50 hover:shadow-[#0075CF]/20 transition-all duration-500 overflow-hidden flex flex-col h-full">
                    {/* Image with diagonal cut */}
                    <div className="relative h-72 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <img
                        src={inst.image}
                        alt={inst.name}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                      />

                      {/* Asymmetrical Frame Overlay */}
                      <div className="absolute inset-0 border-[12px] border-white/10 group-hover:border-white/20 transition-all duration-500 z-20 pointer-events-none" />

                      {/* Float-in social tags */}
                      <div className="absolute top-6 right-6 flex flex-col gap-3 z-30 translate-x-16 group-hover:translate-x-0 transition-transform duration-500">
                        <a
                          href="#"
                          className="w-11 h-11 rounded-2xl bg-white/90 backdrop-blur-md flex items-center justify-center hover:bg-[#0075CF] hover:text-white transition-all shadow-xl"
                        >
                          <Linkedin className="w-5 h-5" />
                        </a>
                        <a
                          href="#"
                          className="w-11 h-11 rounded-2xl bg-white/90 backdrop-blur-md flex items-center justify-center hover:bg-[#FD5A1A] hover:text-white transition-all shadow-xl"
                        >
                          <Twitter className="w-5 h-5" />
                        </a>
                      </div>

                      {/* Stats Badge */}
                      <div className="absolute bottom-6 left-6 z-30 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                          Exp Level
                        </p>
                        <p className="text-xs font-black text-[#FD5A1A] uppercase tracking-tighter">
                          {inst.exp}
                        </p>
                      </div>
                    </div>

                    <div className="p-8 pb-10 flex flex-col flex-1">
                      <div className="w-10 h-1 bg-[#0075CF]/20 mb-6 rounded-full group-hover:w-20 group-hover:bg-[#0075CF] transition-all duration-500" />
                      <h3 className="font-black text-slate-900 text-xl mb-2 tracking-tight">
                        {inst.name}
                      </h3>
                      <p className="text-sm font-bold text-[#0075CF] uppercase tracking-widest">
                        {inst.expertise}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Rotation Indicator */}
        <div className="mt-16 flex justify-center items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#0075CF] animate-ping" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
            Rotating Active Mentors
          </span>
        </div>
      </div>
    </section>
  );
};

export default Instructors;
