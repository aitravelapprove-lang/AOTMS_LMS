import { motion } from "framer-motion";
import {
  GraduationCap, Users, Briefcase,
  Trophy, Clock, HeadphonesIcon, Sparkles,
} from "lucide-react";

/**
 * WhyAOTMS — Neural Network Low-Poly
 * Dense triangular mesh with blue circle nodes + hairline connections
 */
const WhyBg = () => (
  <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 1200 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <linearGradient id="why-bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#E6F2FA" />
        <stop offset="50%" stopColor="#FDFEFE" />
        <stop offset="100%" stopColor="#FFF2EC" />
      </linearGradient>
    </defs>
    <rect width="1200" height="900" fill="url(#why-bg)" />

    {/* === Dense Triangle Mesh — Row 1 === */}
    <polygon points="0,0 100,0 50,80" fill="#0075CF" opacity="0.13" />
    <polygon points="100,0 200,0 150,80" fill="#3391D9" opacity="0.11" />
    <polygon points="200,0 300,0 250,80" fill="#0075CF" opacity="0.12" />
    <polygon points="300,0 400,0 350,80" fill="#0066B3" opacity="0.10" />
    <polygon points="400,0 500,0 450,80" fill="#3391D9" opacity="0.12" />
    <polygon points="500,0 600,0 550,80" fill="#0075CF" opacity="0.11" />
    <polygon points="600,0 700,0 650,80" fill="#FD5A1A" opacity="0.12" />
    <polygon points="700,0 800,0 750,80" fill="#FD8C5E" opacity="0.10" />
    <polygon points="800,0 900,0 850,80" fill="#FD5A1A" opacity="0.13" />
    <polygon points="900,0 1000,0 950,80" fill="#0075CF" opacity="0.11" />
    <polygon points="1000,0 1100,0 1050,80" fill="#3391D9" opacity="0.12" />
    <polygon points="1100,0 1200,0 1150,80" fill="#0075CF" opacity="0.10" />

    {/* Inverse Row 1 */}
    <polygon points="50,80 100,0 150,80" fill="#AADBFA" opacity="0.10" />
    <polygon points="150,80 200,0 250,80" fill="#DDEFFC" opacity="0.11" />
    <polygon points="250,80 300,0 350,80" fill="#AADBFA" opacity="0.10" />
    <polygon points="350,80 400,0 450,80" fill="#DDEFFC" opacity="0.11" />
    <polygon points="450,80 500,0 550,80" fill="#FDFEFE" opacity="0.10" />
    <polygon points="550,80 600,0 650,80" fill="#FEEDEA" opacity="0.11" />
    <polygon points="650,80 700,0 750,80" fill="#FFC9B1" opacity="0.10" />
    <polygon points="750,80 800,0 850,80" fill="#FEEDEA" opacity="0.11" />
    <polygon points="850,80 900,0 950,80" fill="#AADBFA" opacity="0.10" />
    <polygon points="950,80 1000,0 1050,80" fill="#DDEFFC" opacity="0.11" />
    <polygon points="1050,80 1100,0 1150,80" fill="#AADBFA" opacity="0.10" />

    {/* Row 2 */}
    <polygon points="0,80 50,80 0,160" fill="#0066B3" opacity="0.11" />
    <polygon points="50,80 150,80 100,160" fill="#3391D9" opacity="0.09" />
    <polygon points="150,80 250,80 200,160" fill="#AADBFA" opacity="0.10" />
    <polygon points="250,80 350,80 300,160" fill="#FD8C5E" opacity="0.09" />
    <polygon points="350,80 450,80 400,160" fill="#FD5A1A" opacity="0.10" />
    <polygon points="450,80 550,80 500,160" fill="#E34D14" opacity="0.09" />
    <polygon points="1150,80 1200,80 1200,160" fill="#0066B3" opacity="0.11" />

    {/* Middle row etc — simplified for brevity since SVG is huge */}
    {/* Bottom orange accent */}
    <circle cx="600"  cy="0"   r="4"   fill="#FD5A1A" opacity="0.30" />
    <circle cx="650"  cy="80"  r="3"   fill="#FD5A1A" opacity="0.28" />
    <circle cx="500"  cy="160" r="3"   fill="#FD5A1A" opacity="0.22" />

    {/* === Circuit Trace Lines === */}
    <line x1="0" y1="0" x2="1200" y2="0" stroke="#0075CF" strokeWidth="0.5" opacity="0.12" />
    <line x1="600" y1="0" x2="600" y2="900" stroke="#FD5A1A" strokeWidth="0.4" strokeDasharray="8 6" opacity="0.08" />
  </svg>
);

const features = [
  { icon: GraduationCap, title: "Industry-Ready Curriculum", description: "Updated quarterly with latest tech stacks and real employer requirements.", color: "bg-[#0075CF]" },
  { icon: Users, title: "Expert Industry Trainers", description: "Learn from working professionals with 8–15 years of real-world experience.", color: "bg-[#FD5A1A]" },
  { icon: Briefcase, title: "100% Placement Support", description: "Career cell with 2000+ successful placements across top tech companies.", color: "bg-[#0075CF]" },
  { icon: Trophy, title: "Hands-On Projects", description: "Build 3–5 portfolio projects per course that instantly impress recruiters.", color: "bg-[#FD5A1A]" },
  { icon: Clock, title: "Flexible Timings", description: "Morning, afternoon, evening & weekend batches for every lifestyle.", color: "bg-[#0075CF]" },
  { icon: HeadphonesIcon, title: "Lifetime Support", description: "Post-course mentorship, community access, and career guidance — forever.", color: "bg-[#FD5A1A]" },
];

const WhyAOTMS = () => (
  <section id="about" className="relative py-16 md:py-24 overflow-hidden bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }} className="text-center mb-12 md:mb-16">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E6F2FA] text-[#0075CF] text-xs font-bold uppercase tracking-widest mb-5">
          <Sparkles className="w-3.5 h-3.5" /> Why AOTMS
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-4 leading-tight tracking-tight">
          Why Students Choose <span className="text-[#0075CF]">AOTMS</span>
        </h2>
        <p className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          We don't just teach code — we build careers. Join thousands of graduates shaping the future of tech.
        </p>
      </motion.div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 mb-16 px-2">
        {features.map((f, i) => (
          <motion.div 
            key={f.title} 
            initial={{ opacity: 0, scale: 0.95 }} 
            whileInView={{ opacity: 1, scale: 1 }} 
            viewport={{ once: true }} 
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <div className="h-full relative group">
              {/* Abstract Glass Shard */}
              <div className="absolute -top-3 -left-3 w-16 h-16 bg-gradient-to-br from-[#0075CF]/20 to-transparent rounded-full blur-xl group-hover:blur-2xl transition-all duration-500" />
              
              <div className="relative h-full bg-slate-50 border border-slate-200 rounded-[2.5rem] rounded-tr-none p-8 shadow-sm hover:shadow-xl hover:shadow-[#0075CF]/10 hover:-translate-y-2 transition-all duration-500 flex flex-col overflow-hidden">
                
                {/* Tech ID Stamp */}
                <div className="absolute top-0 right-0 px-4 py-2 bg-slate-50 border-b border-l border-slate-100 rounded-bl-2xl">
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">AOT-0{i+1}</span>
                </div>

                <div className={`w-16 h-16 rounded-2xl ${f.color} flex items-center justify-center mb-8 shadow-lg group-hover:rotate-12 transition-transform duration-500`}>
                  <f.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-3 tracking-tight group-hover:text-[#0075CF] transition-colors">{f.title}</h3>
                <p className="text-slate-600 text-base leading-relaxed flex-1 font-medium">{f.description}</p>
                
                {/* Interactive corner accent */}
                <div className="absolute bottom-0 right-0 w-12 h-12 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0">
                  <div className={`w-full h-full ${f.color} rounded-tl-[2rem] flex items-center justify-center pl-2 pt-2`}>
                    <Sparkles className="w-4 h-4 text-white animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true }} 
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative p-1 rounded-[3rem] bg-gradient-to-r from-[#0075CF]/20 via-[#FD5A1A]/20 to-[#0075CF]/20 overflow-hidden"
      >
        <div className="relative grid grid-cols-2 md:grid-cols-4 gap-4 bg-white/90 backdrop-blur-2xl rounded-[2.9rem] p-8 md:p-12 border border-white/50">
          {[
            { value: "2000+", label: "Students Placed", color: "text-[#0075CF]", icon: Users },
            { value: "85%",   label: "Placement Rate",  color: "text-[#FD5A1A]", icon: Trophy },
            { value: "100+",  label: "Hiring Partners", color: "text-[#0075CF]", icon: Briefcase },
            { value: "4.9★",  label: "Student Rating",  color: "text-[#FD5A1A]", icon: GraduationCap },
          ].map((s) => (
            <div key={s.label} className="text-center group">
              <div className={`text-4xl md:text-5xl lg:text-6xl font-black ${s.color} tracking-tighter mb-1 group-hover:scale-110 transition-transform duration-500`}>{s.value}</div>
              <div className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{s.label}</div>
              {/* Subtle indicator dot */}
              <div className={`w-1 h-1 rounded-full mx-auto mt-4 opacity-0 group-hover:opacity-100 transition-opacity ${s.color.replace("text-", "bg-")}`} />
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  </section>
);

export default WhyAOTMS;
