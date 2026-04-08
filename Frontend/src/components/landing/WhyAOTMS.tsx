import { motion } from "framer-motion";
import {
  GraduationCap,
  Users,
  Briefcase,
  Trophy,
  Clock,
  HeadphonesIcon,
  Sparkles,
} from "lucide-react";

/**
 * WhyAOTMS — Neural Network Low-Poly
 * Dense triangular mesh with blue circle nodes + hairline connections
 */
const WhyBg = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {/* Professional Grid Pattern */}
    <div
      className="absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage: `linear-gradient(#0075CF 1px, transparent 1px), linear-gradient(90deg, #0075CF 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
      }}
    />

    {/* Subtle Tech Glows */}
    <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#0075CF]/5 blur-[120px] rounded-full" />
    <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-[#FD5A1A]/5 blur-[120px] rounded-full" />
  </div>
);

const features = [
  {
    icon: GraduationCap,
    title: "Industry-Ready Curriculum",
    description:
      "Updated quarterly with latest tech stacks and real employer requirements.",
    color: "from-[#0075CF] to-[#3391D9]",
  },
  {
    icon: Users,
    title: "Expert Industry Trainers",
    description:
      "Learn from working professionals with 8–15 years of real-world experience.",
    color: "from-[#FD5A1A] to-[#FD8C5E]",
  },
  {
    icon: Briefcase,
    title: "100% Placement Support",
    description:
      "Career cell with 2000+ successful placements across top tech companies.",
    color: "from-[#0075CF] to-[#3391D9]",
  },
  {
    icon: Trophy,
    title: "Hands-On Projects",
    description:
      "Build 3–5 portfolio projects per course that instantly impress recruiters.",
    color: "from-[#FD5A1A] to-[#FD8C5E]",
  },
  {
    icon: Clock,
    title: "Flexible Timings",
    description:
      "Morning, afternoon, evening & weekend batches for every lifestyle.",
    color: "from-[#0075CF] to-[#3391D9]",
  },
  {
    icon: HeadphonesIcon,
    title: "Lifetime Support",
    description:
      "Post-course mentorship, community access, and career guidance — forever.",
    color: "from-[#FD5A1A] to-[#FD8C5E]",
  },
];

const WhyAOTMS = () => (
  <section
    id="about"
    className="relative pt-24 md:pt-32 pb-12 md:pb-16 overflow-hidden bg-white"
  >
    <WhyBg />

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-20 md:mb-28"
      >
        <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-slate-100 border border-slate-200 text-[#0075CF] text-[10px] font-black uppercase tracking-[0.2em] mb-8 shadow-sm">
          <Sparkles className="w-4 h-4" /> Why Choose AOTMS
        </span>
        <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-slate-950 mb-7 leading-[1.05] tracking-tighter">
          Mastering Tech with <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0075CF] to-[#FD5A1A]">
            Professional Precision
          </span>
          .
        </h2>
        <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
          We bridge the gap between classroom learning and industry excellence
          through a meticulously designed ecosystem.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-x-12 md:gap-y-16 mb-16">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="group"
          >
            <div className="relative h-full border border-slate-200 rounded-[2rem] p-8 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-500">
              {/* Animated Accent Bar */}
              <div
                className={`absolute top-0 left-0 w-16 h-1.5 bg-gradient-to-r ${f.color} rounded-full transition-all duration-500 group-hover:w-full`}
              />

              <div className="pt-2">
                <div className="flex items-start justify-between mb-8">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}
                  >
                    <f.icon className="w-7 h-7 text-white" />
                  </div>
                </div>

                <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tighter group-hover:text-[#0075CF] transition-colors">
                  {f.title}
                </h3>
                <p className="text-slate-500 text-base leading-relaxed font-medium mb-6">
                  {f.description}
                </p>

                <div className="h-px w-12 bg-slate-200 group-hover:w-20 group-hover:bg-[#0075CF] transition-all duration-500" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative group "
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-[#0075CF]/20 via-[#FD5A1A]/20 to-[#0075CF]/20 rounded-[3rem] blur-xl opacity-50 group-hover:opacity-100 transition duration-1000" />
        <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 bg-white border border-slate-100 rounded-[2.5rem] sm:rounded-[3rem] p-6 sm:p-10 md:p-16 shadow-2xl">
          {[
            {
              value: "2000+",
              label: "Elite Grads Placed",
              color: "text-[#0075CF]",
            },
            {
              value: "85%",
              label: "Career Growth Rate",
              color: "text-[#FD5A1A]",
            },
            {
              value: "100+",
              label: "MNC Hiring Partners",
              color: "text-[#0075CF]",
            },
            {
              value: "4.9/5",
              label: "Mentor Satisfaction",
              color: "text-[#FD5A1A]",
            },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div
                className={`text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black ${s.color} tracking-tighter mb-1 overflow-visible sm:overflow-hidden`}
              >
                <motion.span
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="block"
                >
                  {s.value}
                </motion.span>
              </div>
              <div className="text-[8px] sm:text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.1em] sm:tracking-[0.2em] leading-tight">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  </section>
);

export default WhyAOTMS;
