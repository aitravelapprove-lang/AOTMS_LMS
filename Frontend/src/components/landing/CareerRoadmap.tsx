import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Rocket, 
  Target, 
  Zap, 
  Trophy, 
  ChevronRight, 
  MapPin,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  GraduationCap
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activePhase, setActivePhase] = useState<typeof roadmapSteps[0] | null>(null);

  const handlePhaseClick = (phase: typeof roadmapSteps[0]) => {
    setActivePhase(phase);
    setIsModalOpen(true);
  };

  const scrollToEnroll = () => {
    setIsModalOpen(false);
    const element = document.getElementById("enroll");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section id="roadmap" className="relative pt-12 md:pt-16 pb-12 md:pb-16 bg-white overflow-hidden">
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
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0075CF] to-[#FD5A1A]">Student to Professional</span>.
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
                transition={{ delay: idx * 0.05, duration: 0.4 }}
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

                  <button 
                    onClick={() => handlePhaseClick(step)}
                    className={`mt-auto w-full py-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs font-black text-slate-400 uppercase tracking-widest group-hover:bg-primary group-hover:text-white group-hover:border-primary group-hover:shadow-lg group-hover:shadow-primary/20 transition-all cursor-pointer flex items-center justify-center gap-2`}
                  >
                    Phase Complete
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>

        <DialogContent className="w-[95vw] sm:max-w-[450px] border-0 rounded-[2rem] sm:rounded-[2.5rem] bg-white p-0 shadow-2xl !overflow-hidden [&>button:last-child]:text-white [&>button:last-child]:bg-white/10 [&>button:last-child]:hover:bg-white/20 [&>button:last-child]:rounded-full [&>button:last-child]:p-1.5 [&>button:last-child]:right-8 [&>button:last-child]:top-8 [&>button:last-child]:transition-all [&>button:last-child]:z-[60]">
          <ScrollArea className="max-h-[85vh] w-full">
            {/* Decorative Header (Compacted) */}
            <div className="relative h-28 sm:h-40 w-full bg-gradient-to-br from-[#0075CF] to-[#001F3D] flex items-center justify-center overflow-hidden rounded-t-[2rem] sm:rounded-t-[2.5rem]">
               <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '15px 15px' }} />
               
               <div className="relative z-10 flex flex-col items-center gap-2 sm:gap-3 text-center">
                  <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl">
                     <GraduationCap className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div className="px-3 py-1 bg-white/10 rounded-full border border-white/20">
                     <p className="text-[7px] sm:text-[9px] font-black text-white uppercase tracking-[0.3em]">Official AOTMS Portal</p>
                  </div>
               </div>
               
               <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#FD5A1A]/20 blur-[40px] rounded-full" />
               <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#0075CF]/30 blur-[40px] rounded-full" />
            </div>

            <div className="p-6 sm:p-8 space-y-5 sm:space-y-6 text-center pt-6 sm:pt-7 pb-8 sm:pb-10">
              <DialogHeader className="space-y-1.5 sm:space-y-2">
                <DialogTitle className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight leading-tight uppercase italic">
                  Ready for the <br/>
                  <span className="text-[#0075CF]">Next Evolution?</span>
                </DialogTitle>
                <DialogDescription className="text-slate-500 text-[10px] sm:text-xs font-medium leading-relaxed max-w-[280px] mx-auto">
                  Join our elite LMS platform today and unlock the tools and network to dominate the industry.
                </DialogDescription>
              </DialogHeader>

              <div className="bg-slate-50 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-slate-100 flex items-center justify-around">
                 <div className="text-center">
                    <p className="text-base sm:text-xl font-black text-slate-900 leading-none">2K+</p>
                    <p className="text-[7px] sm:text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Students</p>
                 </div>
                 <div className="h-6 sm:h-8 w-px bg-slate-200" />
                 <div className="text-center">
                    <p className="text-base sm:text-xl font-black text-[#FD5A1A] leading-none">98%</p>
                    <p className="text-[7px] sm:text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Success Rate</p>
                 </div>
              </div>

              <div className="flex flex-col gap-2.5 sm:gap-3.5">
                 <Button 
                  onClick={scrollToEnroll}
                  className="w-full h-13 sm:h-14 rounded-xl sm:rounded-2xl bg-[#0075CF] hover:bg-[#0075CF]/90 text-white font-black text-xs sm:text-sm shadow-lg shadow-[#0075CF]/20 transition-all active:scale-[0.98] group"
                 >
                   <span>Enroll Now</span>
                   <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-2 transition-transform" />
                 </Button>
                 <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-[9px] sm:text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
                 >
                   I'll explore more first
                 </button>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </section>
  );
}
