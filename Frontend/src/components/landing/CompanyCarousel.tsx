import React from "react";
import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";
import { motion } from "framer-motion";

type Logo = {
  src: string;
  alt: string;
};

const logos: Logo[] = [
  {
    src: "https://svgl.app/library/google.svg",
    alt: "Google",
  },
  {
    src: "https://svgl.app/library/microsoft.svg",
    alt: "Microsoft",
  },
  {
    src: "https://svgl.app/library/amazon.svg",
    alt: "Amazon",
  },
  {
    src: "https://svgl.app/library/nvidia.svg",
    alt: "Nvidia",
  },
  {
    src: "https://svgl.app/library/ibm.svg",
    alt: "IBM",
  },
  {
    src: "https://svgl.app/library/intel.svg",
    alt: "Intel",
  },
  {
    src: "https://svgl.app/library/wipro.svg",
    alt: "Wipro",
  },
  {
    src: "https://svgl.app/library/infosys.svg",
    alt: "Infosys",
  },
  {
    src: "https://svgl.app/library/accenture.svg",
    alt: "Accenture",
  },
  {
    src: "https://svgl.app/library/capgemini.svg",
    alt: "Capgemini",
  },
  {
    src: "https://svgl.app/library/tcs.svg",
    alt: "TCS",
  },
  {
    src: "https://svgl.app/library/sap.svg",
    alt: "SAP",
  },
];

// Fallback text logos for companies not on svgl
const textLogos = [
  { alt: "Wipro",          color: "#7B46B2", bg: "#F7F0FF" },
  { alt: "Tech Mahindra",  color: "#D0021B", bg: "#FFF0F2" },
  { alt: "TCS",            color: "#0062AC", bg: "#F0F6FF" },
  { alt: "Infosys",        color: "#007CC3", bg: "#F0F8FF" },
];

/**
 * CompanyCarousel — Premium logo marquee using InfiniteSlider + ProgressiveBlur
 * Placed as a standalone section AFTER the WhyAOTMS block.
 */
const CompanyCarousel: React.FC = () => {
  return (
    <section className="relative py-16 sm:py-24 overflow-hidden bg-white border-t border-b border-slate-100">
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[300px] bg-[#0075CF]/6 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[300px] bg-[#FD5A1A]/6 blur-[100px] rounded-full" />
      </div>

      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-14 sm:mb-20 text-center relative z-10"
      >
        <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-[#0075CF] animate-pulse" />
          Trusted by Top Employers
        </span>
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-tight">
          Our Graduates Power
          <br className="hidden sm:block" />{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0075CF] to-[#FD5A1A]">
            the World's Best Companies
          </span>
        </h2>
        <p className="mt-5 text-slate-400 font-medium text-sm sm:text-lg max-w-xl mx-auto leading-relaxed">
          2000+ alumni placed across global tech leaders — MNCs, Fortune 500, and fast-growing unicorns.
        </p>
      </motion.div>

      {/* Logo Cloud */}
      <div className="relative mx-auto max-w-6xl px-0">
        <InfiniteSlider gap={48} speed={60} speedOnHover={20}>
          {logos.map((logo) => (
            <div
              key={logo.alt}
              className="group flex items-center justify-center px-6 py-4 sm:px-10 sm:py-6 rounded-2xl bg-white border border-slate-100 shadow-[0_2px_16px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300 cursor-default min-w-[100px] sm:min-w-[140px]"
            >
              <img
                alt={logo.alt}
                className="h-6 sm:h-9 w-auto object-contain select-none pointer-events-none grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                loading="lazy"
                src={logo.src}
                onError={(e) => {
                  // Fallback: hide broken image, show text
                  const img = e.currentTarget;
                  img.style.display = "none";
                  const parent = img.parentElement;
                  if (parent && !parent.querySelector(".fallback-text")) {
                    const span = document.createElement("span");
                    span.className = "fallback-text text-xs font-black text-slate-500 uppercase tracking-widest";
                    span.textContent = logo.alt;
                    parent.appendChild(span);
                  }
                }}
              />
            </div>
          ))}
        </InfiniteSlider>

        {/* Progressive blur edges */}
        <ProgressiveBlur
          blurIntensity={0.8}
          className="pointer-events-none absolute top-0 left-0 h-full w-[100px] sm:w-[180px]"
          direction="left"
        />
        <ProgressiveBlur
          blurIntensity={0.8}
          className="pointer-events-none absolute top-0 right-0 h-full w-[100px] sm:w-[180px]"
          direction="right"
        />
      </div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-16 sm:mt-20 max-w-3xl mx-auto px-4 grid grid-cols-3 gap-4 sm:gap-8 text-center relative z-10"
      >
        {[
          { value: "2000+", label: "Alumni Placed" },
          { value: "100+",  label: "Hiring Partners" },
          { value: "95%",   label: "Placement Rate" },
        ].map((stat) => (
          <div key={stat.label} className="flex flex-col items-center gap-1">
            <span className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tighter">
              {stat.value}
            </span>
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">
              {stat.label}
            </span>
          </div>
        ))}
      </motion.div>
    </section>
  );
};

export default CompanyCarousel;
