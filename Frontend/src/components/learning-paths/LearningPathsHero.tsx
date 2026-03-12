import { motion } from "framer-motion";

const LearningPathsHero = () => {
  return (
    <section className="section-padding bg-transparent relative overflow-hidden">
      <div className="container-width relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-4xl mx-auto pt-8 md:pt-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E6F2FA] text-[#0075CF] text-xs font-bold uppercase tracking-widest mb-6">
            Curated For Success
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 mb-6 leading-tight tracking-tight font-heading">
            Career-Focused <span className="text-[#0075CF]">Learning Paths</span>
          </h1>
          <p className="text-slate-600 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
            Structured programs designed to take you from fundamentals to real-world job readiness. 
            Choose your path and start building your future today.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default LearningPathsHero;
