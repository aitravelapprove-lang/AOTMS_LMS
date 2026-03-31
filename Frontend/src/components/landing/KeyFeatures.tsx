import { motion } from "framer-motion";
import { Video, Play, ShieldCheck, Trophy, FileSearch, BarChart3, Headphones, MonitorPlay, ClipboardList, Medal, FileText, LineChart, Zap } from "lucide-react";

/**
 * KeyFeatures — PCB / Circuit Board Low-Poly
 * Orange amber traces on warm honey base with L-shaped circuit pads
 */
const KeyFeatBg = () => (
  <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 1200 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <linearGradient id="kf-bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FFF2EC" />
        <stop offset="50%" stopColor="#FDFEFE" />
        <stop offset="100%" stopColor="#E6F2FA" />
      </linearGradient>
    </defs>
    <rect width="1200" height="900" fill="url(#kf-bg)" />

    {/* Top rows — dense chevrons */}
    <polygon points="0,0 100,0 50,75" fill="#FD5A1A" opacity="0.13" />
    <polygon points="100,0 200,0 150,75" fill="#FD8C5E" opacity="0.11" />
    <polygon points="200,0 300,0 250,75" fill="#0075CF" opacity="0.12" />
    <polygon points="300,0 400,0 350,75" fill="#FD5A1A" opacity="0.11" />
    <polygon points="400,0 500,0 450,75" fill="#0075CF" opacity="0.12" />
    <polygon points="500,0 600,0 550,75" fill="#AADBFA" opacity="0.11" />
    <polygon points="600,0 700,0 650,75" fill="#FD5A1A" opacity="0.12" />
    <polygon points="700,0 800,0 750,75" fill="#0075CF" opacity="0.11" />
    <polygon points="800,0 900,0 850,75" fill="#FD5A1A" opacity="0.12" />

    {/* Row 2 */}
    <polygon points="0,75 50,75 0,150" fill="#0075CF" opacity="0.11" />
    <polygon points="50,75 150,75 100,150" fill="#FD5A1A" opacity="0.10" />

    {/* Blue accent — bottom left */}
    <polygon points="0,650 150,600 0,800" fill="#AADBFA" opacity="0.11" />
    <polygon points="150,600 350,650 200,800" fill="#0075CF" opacity="0.10" />
    <polygon points="0,800 200,800 100,900" fill="#0066B3" opacity="0.11" />

    {/* Solder joints */}
    {[0,100,200,300,400,500,600,700,800,900,1000,1100,1200].map((x, i) => (
      <rect key={`top-pad-${i}`} x={x-4} y={-4} width="8" height="8" rx="2" fill="#FD5A1A" opacity="0.28" />
    ))}

    {/* Circuit trace lines */}
    <line x1="0" y1="0" x2="1200" y2="0" stroke="#FD5A1A" strokeWidth="1" opacity="0.14" />
    <line x1="600"  y1="0" x2="600"  y2="300" stroke="#0075CF" strokeWidth="0.5" strokeDasharray="4 5" opacity="0.09" />
  </svg>
);

const features = [
  { icon: Video,       secondaryIcon: Headphones,     title: "Live Classes",      description: "Interactive expert sessions via Zoom & Google Meet", gradient: "from-[#0075CF] to-[#3391D9]" },
  { icon: MonitorPlay, secondaryIcon: Play,            title: "Recorded Videos",   description: "HD course content accessible anytime, on any device", gradient: "from-[#FD5A1A] to-[#FD8C5E]" },
  { icon: ShieldCheck, secondaryIcon: ClipboardList,   title: "Secure Exams",      description: "AI-proctored assessments with full anti-cheating systems", gradient: "from-[#0075CF] to-[#3391D9]" },
  { icon: Trophy,      secondaryIcon: Medal,           title: "Leaderboard",       description: "Real-time peer ranking to motivate daily growth", gradient: "from-[#FD5A1A] to-[#FD8C5E]" },
  { icon: FileSearch,  secondaryIcon: FileText,        title: "ATS Resume Score",  description: "AI analysis to optimize your resume for recruiters", gradient: "from-[#0075CF] to-[#3391D9]" },
  { icon: BarChart3,   secondaryIcon: LineChart,       title: "Progress Tracking", description: "Detailed analytics to monitor performance over time", gradient: "from-[#FD5A1A] to-[#FD8C5E]" },
];

const KeyFeatures = () => (
  <section id="features" className="relative py-16 md:py-24 overflow-hidden bg-transparent">
    <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]" />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-24 lg:mb-32"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-6 shadow-sm">
          <Zap className="w-3 h-3 text-[#FD5A1A]" /> Platform Features
        </div>
        <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-950 mb-7 leading-[1.05] tracking-tighter">
          Everything You Need to <br className="hidden md:block" />
          <span className="text-[#FD5A1A]">Succeed</span>.
        </h2>
        <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
          Live classes, secure exams, AI resume scoring, and more — all inside one powerful platform.
        </p>
      </motion.div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
        {features.map((f, i) => (
          <motion.div 
            key={f.title} 
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }} 
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <div className="h-full relative group p-1">
              {/* Outer glow/border effect on hover */}
              <div className={`absolute -inset-0.5 bg-gradient-to-br ${f.gradient} rounded-[2.5rem] opacity-0 group-hover:opacity-20 blur-md transition duration-500`} />
              
              <div className="relative h-full bg-white/70 backdrop-blur-2xl border border-slate-900/10 rounded-[2rem] rounded-tl-[4rem] rounded-br-[4rem] p-8 shadow-xl shadow-slate-200/50 group-hover:shadow-2xl group-hover:shadow-[#0075CF]/20 group-hover:-translate-y-2 transition-all duration-500 flex flex-col overflow-hidden">
                
                {/* Tech chip corner decoration */}
                <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none opacity-10 group-hover:opacity-20 transition-opacity">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <path d="M100,0 L100,20 L80,20 L80,0 Z M80,20 L80,40 L60,40 L60,20 Z" fill="currentColor" className={i % 2 === 0 ? "text-[#0075CF]" : "text-[#FD5A1A]"} />
                    <circle cx="90" cy="10" r="4" fill="currentColor" className={i % 2 === 0 ? "text-[#0075CF]" : "text-[#FD5A1A]"} />
                  </svg>
                </div>

                <div className="flex items-start justify-between mb-8">
                  <div className="relative">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform duration-500`}>
                      <f.icon className="w-8 h-8 text-[#FDFEFE]" />
                    </div>
                    {/* Pulsing decoration */}
                    <div className={`absolute -inset-1 rounded-2xl bg-gradient-to-br ${f.gradient} opacity-20 animate-pulse`} />
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-[#FDFEFE] border border-slate-100 shadow-lg flex items-center justify-center group-hover:-rotate-12 transition-transform duration-500">
                      <f.secondaryIcon className={`w-4 h-4 ${i % 2 === 0 ? "text-[#0075CF]" : "text-[#FD5A1A]"}`} />
                    </div>
                  </div>
                </div>

                <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-3 leading-tight tracking-tight group-hover:text-[#0075CF] transition-colors">{f.title}</h3>
                <p className="text-slate-600 text-base leading-relaxed flex-1 font-medium">{f.description}</p>
                
                {/* Visual indicator bar */}
                <div className="mt-6 flex items-center gap-2">
                  <div className={`h-1.5 w-12 rounded-full bg-gradient-to-r ${f.gradient}`} />
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-200" />
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-200 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default KeyFeatures;
