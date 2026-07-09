import React from "react";
import { motion } from "framer-motion";

/**
 * CompanyCarousel — Refactored to Premium Text Marquee
 * Replaces the logo carousel with a high-fidelity, infinite text scale
 * for better visibility and a more professional look.
 */
const CompanyCarousel: React.FC = () => {
  const partners = [
    "MICROSOFT", "GOOGLE", "AMAZON", "TCS", "INFOSYS", "WIPRO", "ACCENTURE", 
    "IBM", "CAPGEMINI", "TECH MAHINDRA", "SAP", "HCL", "ORACLE", "DELOITTE"
  ];

  return (
    <section className="relative py-20 overflow-hidden bg-white border-t border-b border-slate-100">
      {/* Ambient glows for depth - hidden on mobile for performance */}
      <div className="hidden md:block absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[350px] h-full bg-blue-500/5 blur-[80px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[350px] h-full bg-orange-500/5 blur-[80px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-16 text-center relative z-10">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-6 shadow-sm"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
          Our Placement Ecosystem
        </motion.span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-tight">
          Our Graduates Shaping <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0075CF] to-[#FD5A1A]">Global Success Stories</span>.
        </h2>
      </div>

      {/* Modern Text Marquee */}
      <div className="relative flex whitespace-nowrap py-10 overflow-hidden">
        <motion.div 
          animate={{ x: ["0%", "-50%"] }}
          transition={{ 
            duration: 40, 
            repeat: Infinity, 
            ease: "linear",
            repeatType: "loop"
          }}
          style={{ willChange: "transform" }}
          className="flex items-center gap-16 md:gap-32 pr-16 md:pr-32 py-4"
        >
          {partners.map((company, i) => (
            <React.Fragment key={i}>
              <h4 className={`text-4xl md:text-8xl font-black text-slate-900 transition-colors cursor-default tracking-tighter ${
                i % 2 === 0 ? "hover:text-[#0075CF]" : "hover:text-[#FD5A1A]"
              }`}>
                {company}
              </h4>
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#0075CF] to-[#FD5A1A] shadow-sm" />
            </React.Fragment>
          ))}
          {/* Loop Set */}
          {partners.map((company, i) => (
            <React.Fragment key={`lp-${i}`}>
              <h4 className={`text-4xl md:text-8xl font-black text-slate-900 transition-colors cursor-default tracking-tighter ${
                i % 2 === 0 ? "hover:text-[#0075CF]" : "hover:text-[#FD5A1A]"
              }`}>
                {company}
              </h4>
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#0075CF] to-[#FD5A1A] shadow-sm" />
            </React.Fragment>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default CompanyCarousel;
