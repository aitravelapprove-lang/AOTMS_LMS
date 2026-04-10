import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { StaggerTestimonials } from "@/components/ui/stagger-testimonials";

const Testimonials = () => {
  return (
    <section id="testimonials" className="relative pt-12 lg:pt-16 pb-24 lg:pb-32 bg-transparent overflow-hidden">
      
      {/* Decorative Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#0075CF]/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center">
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }} 
          className="text-center mb-16 lg:mb-24"
        >
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-white/70 text-[10px] font-black uppercase tracking-[0.3em] mb-8 shadow-sm dark:border dark:border-white/10 backdrop-blur-md">
            <Trophy className="w-4 h-4 text-[#FD5A1A]" />
            Verified Career Results
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-slate-950 dark:text-white mb-6 leading-[1.05] tracking-tighter px-4">
            Impact That <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0075CF] to-[#FD5A1A]">Speaks For Itself</span>.
          </h2>
          <p className="text-slate-500 dark:text-white/60 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
            Join the elite circle of graduates in Vijayawada who transformed their aspirations into career-defining roles.
          </p>
        </motion.div>
      </div>

      {/* FULL-WIDTH EDGE-TO-EDGE COMPONENT */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative w-full overflow-hidden"
      >
        {/* Adds a slight gradient backdrop behind the cards to make them pop against the global bg */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/50 dark:via-white/[0.02] to-transparent pointer-events-none" />
        <StaggerTestimonials />
      </motion.div>

    </section>
  );
};

export default Testimonials;
