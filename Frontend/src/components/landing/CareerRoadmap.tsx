import { motion } from "framer-motion";
import { 
  Rocket, 
  Target, 
  Zap, 
  Trophy, 
  ChevronRight, 
  MapPin,
  CheckCircle2
} from "lucide-react";

const roadmapSteps = [
  {
    stage: "Phase 01",
    title: "Foundational Mastery",
    icon: Target,
    items: ["Logic Building", "Core Fundamentals", "Industry Standards"],
    color: "from-[#0075CF] to-[#3391D9]",
    description: "Start with a solid base. We focus on problem-solving before syntax."
  },
  {
    stage: "Phase 02",
    title: "Professional Build",
    icon: Zap,
    items: ["Advanced Tech Stacks", "Real-world Projects", "Architecture"],
    color: "from-[#FD5A1A] to-[#FD8C5E]",
    description: "Construct enterprise-grade applications with modern frameworks."
  },
  {
    stage: "Phase 03",
    title: "Career Acceleration",
    icon: Rocket,
    items: ["Mock Interviews", "ATS Resume Build", "Soft Skills"],
    color: "from-[#0075CF] to-[#3391D9]",
    description: "Refine your profile and prepare for high-pressure technical rounds."
  },
  {
    stage: "Phase 04",
    title: "Industry Placement",
    icon: Trophy,
    items: ["MNC Referrals", "Negotiation Support", "Alumni Network"],
    color: "from-[#FD5A1A] to-[#FD8C5E]",
    description: "Land your dream role and join our global network of engineers."
  }
];

export default function CareerRoadmap() {
  return (
    <section id="roadmap" className="relative py-24 md:py-32 bg-white overflow-hidden">
      {/* Dynamic Grid Background */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
        style={{ 
          backgroundImage: `radial-gradient(#0075CF 1px, transparent 1px)`,
          backgroundSize: '30px 30px' 
        }} 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-slate-100 border border-slate-200 text-[#0075CF] text-[10px] font-black uppercase tracking-[0.2em] mb-8 shadow-sm">
            <MapPin className="w-4 h-4" /> Career Roadmap
          </span>
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-slate-950 mb-7 leading-[1.05] tracking-tighter">
            Your Journey from <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0075CF] to-[#3391D9]">Student to Professional</span>.
          </h2>
          <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
            A structured pathway designed to transform absolute beginners into industry-ready engineers.
          </p>
        </motion.div>

        {/* Roadmap Steps */}
        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {roadmapSteps.map((step, idx) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="group"
              >
                <div className="relative h-full bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl hover:border-primary/20 transition-all duration-500 flex flex-col items-center text-center">
                  
                  {/* Step Number Bubble */}
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-white mb-8 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                    <step.icon className="w-8 h-8" />
                  </div>

                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    {step.stage}
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tighter group-hover:text-primary transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed mb-8 flex-1">
                    {step.description}
                  </p>

                  {/* Checklist */}
                  <ul className="w-full space-y-3 mb-8 text-left">
                    {step.items.map((item) => (
                      <li key={item} className="flex items-center gap-3 text-sm font-bold text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        {item}
                      </li>
                    ))}
                  </ul>

                  <div className={`mt-auto w-full py-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs font-black text-slate-400 uppercase tracking-widest group-hover:bg-primary group-hover:text-white transition-all`}>
                    Phase Complete
                  </div>
                </div>

                {/* Desktop Arrow */}
                {idx < roadmapSteps.length - 1 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-6 translate-x-1/2 -translate-y-1/2 items-center justify-center text-slate-200">
                    <ChevronRight className="w-8 h-8" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
