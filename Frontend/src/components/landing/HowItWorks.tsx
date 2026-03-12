import { motion } from "framer-motion";
import {
  UserPlus,
  BookMarked,
  Video,
  ClipboardCheck,
  Trophy,
  Zap,
} from "lucide-react";

/**
 * HowItWorks — Data Pipeline Flow Low-Poly
 * Left-to-right flowing triangles like data streams, teal/green palette
 */
const HowBg = () => (
  <svg
    className="absolute inset-0 w-full h-full"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 1200 1000"
    preserveAspectRatio="xMidYMid slice"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="how-bg" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#E6F2FA" />
        <stop offset="50%" stopColor="#FDFEFE" />
        <stop offset="100%" stopColor="#FFF2EC" />
      </linearGradient>
    </defs>
    <rect width="1200" height="1000" fill="url(#how-bg)" />

    {/* Left input funnel — blue triangles */}
    <polygon points="0,0 120,0 0,100" fill="#0075CF" opacity="0.13" />
    <polygon points="0,100 120,0 120,200" fill="#3391D9" opacity="0.11" />
    <polygon points="0,200 120,200 0,300" fill="#0066B3" opacity="0.12" />

    {/* Right output funnel — orange triangles */}
    <polygon points="1200,0 1080,0 1200,100" fill="#FD5A1A" opacity="0.13" />
    <polygon points="1200,100 1080,0 1080,200" fill="#FD8C5E" opacity="0.11" />
    <polygon
      points="1200,200 1080,200 1200,300"
      fill="#E34D14"
      opacity="0.12"
    />

    <line
      x1="120"
      y1="0"
      x2="120"
      y2="1000"
      stroke="#0075CF"
      strokeWidth="1.2"
      opacity="0.14"
    />
    <line
      x1="1080"
      y1="0"
      x2="1080"
      y2="1000"
      stroke="#FD5A1A"
      strokeWidth="1.2"
      opacity="0.14"
    />
  </svg>
);

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Sign Up & Profile",
    description: "Create your account and set up your learning profile",
    color: "bg-[#0075CF]",
    label: "text-[#0075CF]",
  },
  {
    icon: BookMarked,
    step: "02",
    title: "Choose Your Course",
    description: "Browse and enroll in courses that match your goals",
    color: "bg-[#FD5A1A]",
    label: "text-[#FD5A1A]",
  },
  {
    icon: Video,
    step: "03",
    title: "Attend Classes",
    description: "Join live sessions or watch recorded lectures",
    color: "bg-[#0075CF]",
    label: "text-[#0075CF]",
  },
  {
    icon: ClipboardCheck,
    step: "04",
    title: "Practice Mock Tests",
    description: "Sharpen your skills with hands-on test assessments",
    color: "bg-[#FD5A1A]",
    label: "text-[#FD5A1A]",
  },
  {
    icon: Trophy,
    step: "05",
    title: "Track Your Rank",
    description: "Complete exams and climb the competitive leaderboard",
    color: "bg-[#0075CF]",
    label: "text-[#0075CF]",
  },
];

const HowItWorks = () => (
  <section
    id="how-it-works"
    className="relative py-20 lg:py-32 overflow-hidden bg-transparent"
  >
    {/* Global background visibility */}
    {/* Central Blur Decor */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#0075CF]/5 blur-[120px] rounded-full pointer-events-none" />

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-20 lg:mb-32"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E6F2FA] border border-[#0075CF]/10 text-[#0075CF] text-xs font-black uppercase tracking-[0.2em] mb-6">
          <Zap className="w-3 h-3" /> The Roadmap
        </div>
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 mb-6 leading-[1.1] tracking-tight">
          Your Bridge to a <br className="hidden sm:block" />
          <span className="text-[#FD5A1A]">Tech Career</span>
        </h2>
        <p className="text-slate-600 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
          A structured 5-step evolution from learning to landing your dream job.
        </p>
      </motion.div>

      <div className="relative">
        {/* Central Path SVG (Visible on Desktop) */}
        <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 hidden lg:block w-px">
          <div className="h-full w-px bg-gradient-to-b from-[#0075CF]/20 via-[#FD5A1A]/20 to-[#0075CF]/20" />
          {/* Animated Glow Dot */}
          <motion.div
            animate={{ top: ["0%", "100%"] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-white rounded-full blur-sm z-20 shadow-[0_0_15px_rgba(0,117,207,0.8)]"
          />
        </div>

        <div className="space-y-12 lg:space-y-0 relative">
          {steps.map((step, i) => (
            <div
              key={step.step}
              className={`relative flex flex-col lg:flex-row items-center ${i % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"} lg:min-h-[220px]`}
            >
              {/* Card Container */}
              <motion.div
                initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, delay: i * 0.1 }}
                className="w-full lg:w-1/2 flex justify-center lg:justify-end px-4 lg:px-16"
              >
                <div
                  className={`group relative w-full max-w-md p-1 rounded-[2.5rem] transition-all duration-500 hover:-translate-y-2 ${i % 2 === 0 ? "lg:text-right" : "lg:text-left"}`}
                >
                  <div
                    className={`absolute -inset-0.5 bg-gradient-to-r ${i % 2 === 0 ? "from-[#0075CF] to-[#3391D9]" : "from-[#FD5A1A] to-[#FD8C5E]"} rounded-[2.5rem] opacity-0 group-hover:opacity-100 blur-md transition duration-500`}
                  />

                  <div className="relative bg-white/70 backdrop-blur-2xl border border-slate-900/10 p-6 md:p-8 rounded-[2rem] md:rounded-[2.4rem] shadow-xl shadow-slate-200/50 flex flex-col items-center lg:items-start overflow-hidden">
                    {/* Background number */}
                    <span className="absolute -bottom-4 -right-2 md:-bottom-8 md:-right-4 text-[6rem] md:text-[10rem] font-black text-slate-50 opacity-10 pointer-events-none group-hover:text-slate-100 group-hover:opacity-20 transition-all duration-500">
                      {step.step}
                    </span>

                    <div
                      className={`w-16 h-16 rounded-[1.2rem] ${step.color} flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}
                    >
                      <step.icon className="w-8 h-8 text-white" />
                    </div>

                    <div
                      className={`inline-flex items-center gap-2 mb-3 ${i % 2 === 0 ? "lg:self-end" : "lg:self-start"}`}
                    >
                      <span
                        className={`text-xs font-black uppercase tracking-[0.2em] ${step.label}`}
                      >
                        Step {step.step}
                      </span>
                    </div>

                    <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight group-hover:text-[#0075CF] transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-slate-500 font-medium leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Central Node (Visible on Desktop) */}
              <div className="absolute left-1/2 -translate-x-1/2 hidden lg:flex items-center justify-center z-10">
                <motion.div
                  whileInView={{ scale: [0, 1.2, 1] }}
                  viewport={{ once: true }}
                  className={`w-10 h-10 rounded-full bg-white border-4 ${i % 2 === 0 ? "border-[#0075CF]" : "border-[#FD5A1A]"} shadow-lg flex items-center justify-center overflow-hidden`}
                >
                  <div
                    className={`w-3 h-3 rounded-full ${i % 2 === 0 ? "bg-[#0075CF]" : "bg-[#FD5A1A]"} animate-pulse`}
                  />
                </motion.div>

                {/* Connector Line to Card */}
                <div
                  className={`absolute w-16 h-px bg-gradient-to-r ${i % 2 === 0 ? "right-full from-transparent to-[#0075CF]/40" : "left-full from-[#FD5A1A]/40 to-transparent"}`}
                />
              </div>

              {/* Spacer for the other side on desktop */}
              <div className="hidden lg:block lg:w-1/2" />
            </div>
          ))}
        </div>
      </div>

      {/* Trust Quote */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mt-32 text-center"
      >
        <div className="inline-block px-10 py-8 rounded-[3rem] bg-[#FDFEFE] border border-[#0075CF]/10 shadow-2xl shadow-slate-200/50">
          <p className="text-xl md:text-2xl font-black text-slate-900 leading-tight">
            Ready to start <span className="text-[#0075CF]">your own</span>{" "}
            success story?
          </p>
        </div>
      </motion.div>
    </div>
  </section>
);

export default HowItWorks;
