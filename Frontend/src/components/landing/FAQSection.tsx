import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import {
  HelpCircle,
  ChevronDown,
  GraduationCap,
  BookOpen,
  Briefcase,
  Award,
  LayoutDashboard,
} from "lucide-react";

/**
 * FAQSection — Blueprint / Technical Grid Low-Poly
 * Cyan grid subdivided into triangles, like an engineering drawing with circuit nodes
 */
const FAQBg = () => {
  const cols = [0, 150, 300, 450, 600, 750, 900, 1050, 1200];
  const rows = [0, 125, 250, 375, 500, 625, 750, 875, 1000];
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1200 1000"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="faq-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E6F2FA" />
          <stop offset="50%" stopColor="#FDFEFE" />
          <stop offset="100%" stopColor="#FFF2EC" />
        </linearGradient>
      </defs>
      <rect width="1200" height="1000" fill="url(#faq-bg)" />

      {/* Grid lines — blueprint feel */}
      {cols.map((x) => (
        <line
          key={`v-${x}`}
          x1={x}
          y1="0"
          x2={x}
          y2="1000"
          stroke="#0075CF"
          strokeWidth="0.4"
          opacity="0.10"
        />
      ))}
      {rows.map((y) => (
        <line
          key={`h-${y}`}
          x1="0"
          y1={y}
          x2="1200"
          y2={y}
          stroke="#0075CF"
          strokeWidth="0.4"
          opacity="0.10"
        />
      ))}

      {/* Diagonal triangles subdividing the grid — primary colors tones */}
      {[0, 2, 4, 6].map((ci) =>
        [0, 2, 4, 6].map((ri) => {
          const x1 = cols[ci],
            y1 = rows[ri];
          const x2 = cols[ci + 1] ?? x1,
            y2 = rows[ri + 1] ?? y1;
          return (
            <polygon
              key={`tri-${ci}-${ri}`}
              points={`${x1},${y1} ${x2},${y1} ${x1},${y2}`}
              fill="#0075CF"
              opacity="0.06"
            />
          );
        }),
      )}
      {[1, 3, 5, 7].map((ci) =>
        [1, 3, 5, 7].map((ri) => {
          const x1 = cols[ci] ?? 0,
            y1 = rows[ri] ?? 0;
          const x2 = cols[ci + 1] ?? x1,
            y2 = rows[ri + 1] ?? y1;
          return (
            <polygon
              key={`tri2-${ci}-${ri}`}
              points={`${x1},${y1} ${x2},${y2} ${x1},${y2}`}
              fill="#FD5A1A"
              opacity="0.05"
            />
          );
        }),
      )}

      {/* Top accent — spikes */}
      <polygon points="0,0 150,0 75,80" fill="#0075CF" opacity="0.13" />
      <polygon points="150,0 300,0 225,80" fill="#FD5A1A" opacity="0.11" />
      <polygon points="300,0 450,0 375,80" fill="#0075CF" opacity="0.12" />

      {/* Grid intersection nodes */}
      {cols.map((x) =>
        rows
          .slice(0, 4)
          .map((y) => (
            <rect
              key={`pad-${x}-${y}`}
              x={x - 3}
              y={y - 3}
              width="6"
              height="6"
              rx="1.5"
              fill="#0075CF"
              opacity="0.20"
            />
          )),
      )}
      {/* Top spike nodes */}
      {[75, 225, 375, 525, 675, 825, 975, 1125].map((x) => (
        <circle
          key={`spike-${x}`}
          cx={x}
          cy={80}
          r="3"
          fill="#0075CF"
          opacity="0.28"
        />
      ))}
      {/* Bottom orange nodes */}
      {[75, 225, 375, 525, 675, 825, 975, 1125].map((x) => (
        <circle
          key={`bot-${x}`}
          cx={x}
          cy={920}
          r="3"
          fill="#FD5A1A"
          opacity="0.26"
        />
      ))}
    </svg>
  );
};

const faqGroups = [
  {
    category: "General",
    icon: LayoutDashboard,
    color: "bg-[#0075CF]",
    questions: [
      {
        q: "What is the AOTMS LMS portal?",
        a: "A professional ecosystem designed to deliver high-quality technical education through secure video streaming, AI assessments, and real-time mentor interaction.",
      },
      {
        q: "Does AOTMS offer placement assistance?",
        a: "Yes! Every student receives 100% placement support, including resume building, mock interviews, and referrals to our 250+ hiring partners.",
      },
    ],
  },
  {
    category: "LMS Access",
    icon: GraduationCap,
    color: "bg-[#FD5A1A]",
    questions: [
      {
        q: "How do I activate my LMS account?",
        a: "New accounts are set to 'Pending' after signup. Our administration verifies registration within 2-4 hours before granting full access.",
      },
      {
        q: "What user roles are available in the portal?",
        a: "The portal supports Students (learning), Instructors (teaching), Managers (ops), and Admins (system control).",
      },
    ],
  },
  {
    category: "Courses",
    icon: BookOpen,
    color: "bg-[#0075CF]",
    questions: [
      {
        q: "How can I track my course progress?",
        a: "Our tracking engine monitors video watch-time and assessment scores in real-time. View your progress in the 'Academic Grid' on your dashboard.",
      },
      {
        q: "Where are the course materials located?",
        a: "Every course contains a 'Resources' tab with downloadable PDFs, code repositories, and engineering guides.",
      },
    ],
  },
  {
    category: "Payments",
    icon: Award,
    color: "bg-[#FD5A1A]",
    questions: [
      {
        q: "How do I pay for a course enrollment?",
        a: "Navigate to 'Courses', select your path, and click 'Purchase'. Scan the secure UPI QR code and upload your transaction receipt.",
      },
      {
        q: "How long does verification take?",
        a: "Billing verifies your receipt against bank records. This typically takes 30 minutes to 3 hours during business hours.",
      },
    ],
  },
  {
    category: "Technical Support",
    icon: Briefcase,
    color: "bg-[#0075CF]",
    questions: [
      {
        q: "What should I do if a video is buffering?",
        a: "Our player requires a stable 2Mbps connection. Try lowering the resolution or clearing your browser cache if the issue persists.",
      },
      {
        q: "How does 'Quantum Persistence' protect my exam?",
        a: "If your internet fails during an exam, progress is saved locally and synced automatically once your connection returns.",
      },
    ],
  },
];

const FAQSection = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [openId, setOpenId] = useState<number | null>(null);

  const toggle = (i: number) => setOpenId(openId === i ? null : i);
  const activeGroup = faqGroups[activeTab];

  return (
    <section
      id="faq"
      className="relative py-20 lg:py-32 overflow-hidden bg-transparent"
    >
      {/* Global background is active */}
      {/* Dynamic Background Glow */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] blur-[120px] rounded-full pointer-events-none transition-colors duration-1000 ${activeTab % 2 === 0 ? "bg-[#0075CF]/5" : "bg-[#FD5A1A]/5"}`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 lg:mb-24"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E6F2FA] border border-[#0075CF]/10 text-[#0075CF] text-xs font-black uppercase tracking-[0.2em] mb-6">
            <HelpCircle className="w-3 h-3" /> Knowledge Base
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
            Have Any <span className="text-[#0075CF]">Questions?</span>
          </h2>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
          {/* Category Sidebar */}
          <div className="w-full lg:w-1/3">
            <div className="sticky top-24 flex flex-col gap-3 overflow-visible pb-4 lg:pb-0 scrollbar-hide">
              {faqGroups.map((group, i) => (
                <button
                  key={group.category}
                  onClick={() => {
                    setActiveTab(i);
                    setOpenId(null);
                  }}
                  className={`flex items-center gap-4 px-6 py-5 rounded-[1.5rem] border transition-all duration-300 text-left w-full ${
                    activeTab === i
                      ? "bg-white/80 border-[#0075CF] shadow-xl shadow-[#0075CF]/10 scale-[1.02]"
                      : "bg-white/30 border-slate-900/10 hover:bg-white/50 backdrop-blur-sm"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      activeTab === i
                        ? group.color
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    <group.icon
                      className={`w-6 h-6 ${activeTab === i ? "text-white" : ""}`}
                    />
                  </div>
                  <div className="flex-1">
                    <p
                      className={`text-xs font-black uppercase tracking-widest ${activeTab === i ? group.color.replace("bg-", "text-") : "text-slate-400"}`}
                    >
                      Category {i + 1}
                    </p>
                    <h4 className="font-bold text-slate-900">
                      {group.category}
                    </h4>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Question List */}
          <div className="w-full lg:w-2/3 space-y-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="space-y-5"
              >
                {activeGroup.questions.map((item, qi) => (
                  <div
                    key={qi}
                    className={`group relative rounded-[2rem] border transition-all duration-300 ${
                      openId === qi
                        ? "bg-white/80 backdrop-blur-md border-[#0075CF] shadow-2xl shadow-[#0075CF]/5"
                        : "bg-white/40 backdrop-blur-sm border-slate-900/10 hover:border-slate-200"
                    }`}
                  >
                    <button
                      onClick={() => toggle(qi)}
                      className="w-full flex items-center gap-6 px-8 py-7 text-left"
                    >
                      {/* Technical ID */}
                      <span className="hidden sm:block text-[10px] font-black text-slate-300 uppercase tracking-tighter">
                        {activeGroup.category.substring(0, 2)}-{qi + 1}
                      </span>

                      <h3
                        className={`flex-1 text-base md:text-lg font-bold transition-colors ${
                          openId === qi ? "text-[#0075CF]" : "text-slate-800"
                        }`}
                      >
                        {item.q}
                      </h3>

                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                          openId === qi
                            ? "bg-[#0075CF] text-white rotate-180"
                            : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                        }`}
                      >
                        <ChevronDown className="w-5 h-5" />
                      </div>
                    </button>

                    <AnimatePresence>
                      {openId === qi && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="px-8 pb-8 pt-0 lg:ml-16">
                            <div className="h-px w-full bg-slate-100 mb-6" />
                            <p className="text-slate-600 text-base md:text-lg leading-relaxed font-medium">
                              {item.a}
                            </p>

                            {/* Visual Decor */}
                            <div className="mt-8 flex items-center gap-3">
                              <div className="w-1.5 h-1.5 rounded-full bg-[#FD5A1A]" />
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                End of Entry
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
