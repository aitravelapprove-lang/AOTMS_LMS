import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import {
  HelpCircle,
  ChevronDown,
  GraduationCap,
  BookOpen,
  Briefcase,
  Award,
  Search,
  LayoutDashboard,
} from "lucide-react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

const faqGroups = [
  {
    category: "General",
    icon: LayoutDashboard,
    color: "bg-[#0075CF]",
    questions: [
      {
        q: "What is the AOTMS LMS portal?",
        a: "The Academy of Tech Masters' Learning Management System (LMS) is a professional ecosystem designed to deliver high-quality technical education through secure video streaming, AI-driven assessments, and real-time mentor interaction.",
      },
      {
        q: "Who can enroll in AOTMS courses?",
        a: "Our courses are open to students, working professionals, and engineering graduates looking to master in-demand technical skills. We specifically focus on building practical expertise from the ground up.",
      },
      {
        q: "Does AOTMS offer placement assistance?",
        a: "Yes! Every enrolled student receives 100% placement support, including resume building, mock HR/Technical interviews, and direct referrals to our network of 250+ hiring partners.",
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
        a: "New accounts are automatically set to 'Pending' after signup. Our administration team verifies every registration within 2-4 hours. You will receive an email once your account is 'Approved' for full access.",
      },
      {
        q: "What user roles are available in the portal?",
        a: "The portal supports four primary roles: Students (learning/exams), Instructors (teaching/grading), Managers (operations/approvals), and Admins (system control).",
      },
      {
        q: "Can I use the same account on multiple devices?",
        a: "Yes, you can access your account from any device. However, for security reasons, active exam sessions and secure video playback are restricted to one active device at a time.",
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
        a: "Our specialized tracking engine monitors your video watch-time and assessment scores in real-time. You can view your completion percentage for each module in the 'Academic Grid' on your dashboard.",
      },
      {
        q: "Where are the course materials located?",
        a: "Every course contains a 'Resources' tab. Here you will find downloadable PDFs, code repositories, and engineering guides provided by your instructors.",
      },
      {
        q: "How do I join a Live Session?",
        a: "Scheduled live classes appear as active alerts on your dashboard and sidebar. Simply click 'Join Room' or 'Enter Bridge' to join the secure video conference.",
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
        a: "Navigate to the 'Courses' page, select your desired path, and click 'Purchase'. You can scan the secure UPI QR code and upload your transaction receipt for manual admin verification.",
      },
      {
        q: "How long does payment verification take?",
        a: "Once you upload your transaction proof, our billing department verifies the receipt against our bank records. This typically takes between 30 minutes to 3 hours during business hours.",
      },
      {
        q: "Are there any hidden charges for certificates?",
        a: "No. Your course enrollment fee covers the training, resources, placement support, and your official industry-recognized completion certificate.",
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
        a: "Our encrypted player requires a stable connection of at least 2Mbps. Try lowering the resolution in the player settings or clearing your browser cache if the issue persists.",
      },
      {
        q: "How does 'Quantum Persistence' protect my exam?",
        a: "In case of an internet outage during an assessment, our system locally buffers your answers and synchronizes them with the server automatically as soon as your connection is restored.",
      },
      {
        q: "How do I report a bug in the portal?",
        a: "Please use the 'Internal Support Ticket' system found in your User Settings menu. Provide a screenshot and a brief description of the issue for our dev team to investigate.",
      },
    ],
  },
];

const TechHeroBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none bg-[#0057B7]">
    {/* Warm Edge Glows - Moved outside SVG for full visibility */}
    <div
      className="absolute inset-0 z-0 mix-blend-screen"
      style={{
        background: `
          radial-gradient(ellipse 60% 80% at 0% 50%, rgba(253, 90, 26, 0.4) 0%, transparent 100%),
          radial-gradient(ellipse 60% 80% at 100% 50%, rgba(253, 90, 26, 0.4) 0%, transparent 100%)
        `,
      }}
    />

    {/* Subtle Grid Pattern */}
    <svg
      className="relative z-10 w-full h-full opacity-20"
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="faq-grid"
          width="30"
          height="30"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 30 0 L 0 0 0 30"
            fill="none"
            stroke="white"
            strokeWidth="0.5"
            opacity="0.4"
          />
        </pattern>
        <radialGradient id="vignette" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0057B7" stopOpacity="0" />
          <stop offset="100%" stopColor="#002D5F" stopOpacity="0.4" />
        </radialGradient>
      </defs>

      <rect width="100%" height="100%" fill="url(#faq-grid)" />
      <rect width="100%" height="100%" fill="url(#vignette)" />

      {/* Subtle orange accent node */}
      <circle cx="50" cy="400" r="6" fill="#FD5A1A" />
    </svg>
  </div>
);

const FAQ = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [openId, setOpenId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const toggle = (i: number) => setOpenId(openId === i ? null : i);

  const filteredGroups =
    searchQuery.trim() === ""
      ? faqGroups
      : faqGroups
          .map((group) => ({
            ...group,
            questions: group.questions.filter(
              (q) =>
                q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
                q.a.toLowerCase().includes(searchQuery.toLowerCase()),
            ),
          }))
          .filter((group) => group.questions.length > 0);

  const activeGroup = filteredGroups[activeTab] || filteredGroups[0];

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-white">
      <div className="relative z-10">
        <Header />

        <main className="relative pb-20">
          {/* FAQ Hero Section — Exactly as per reference image */}
          <div className="relative pt-32 pb-24 lg:pb-32 overflow-hidden shadow-2xl">
            <TechHeroBackground />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {/* Top Badge */}
                <div className="flex justify-center mb-8">
                  <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#0075CF]/30 border border-white/20 text-[#FDFEFE] text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md">
                    GOT QUESTIONS?
                  </span>
                </div>

                {/* Heading with Orange Suffix */}
                <h1 className="text-4xl sm:text-6xl md:text-[80px] font-bold mb-6 leading-none tracking-tight">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-[#cbd5e1]">
                    Frequently Asked
                  </span>
                  <br className="hidden md:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FD5A1A] to-[#FF7A00]">
                    Questions
                  </span>
                </h1>

                {/* Description */}
                <p className="text-[#FDFEFE]/80 text-sm sm:text-base md:text-lg max-w-3xl mx-auto font-medium mb-12 leading-relaxed">
                  Welcome to the AOTMS LMS Help Center. Find answers to common
                  questions about navigating your <br className="hidden md:block" />
                  dashboard, accessing course materials, tracking progress, 
                  and mastering our <br className="hidden md:block" />
                  advanced assessment tools.
                </p>

                {/* Info Pills */}
                <div className="flex flex-wrap justify-center gap-3 mb-12">
                  {[
                    { icon: "📍", text: "Pothuri Towers, MG Rd" },
                    { icon: "⏰", text: "Mon - Sat: 9 AM - 8 PM" },
                    { icon: "📞", text: "+91 80199 52233" },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#FDFEFE] text-xs font-bold whitespace-nowrap"
                    >
                      <span className="text-sm opacity-80">{item.icon}</span>
                      {item.text}
                    </div>
                  ))}
                </div>

                {/* Search Bar — Clean White Style */}
                <div className="max-w-xl mx-auto relative group">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                      <Search className="w-5 h-5 text-[#0057B7]" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search for questions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-14 md:h-16 pl-14 pr-8 rounded-full bg-white shadow-2xl text-slate-800 placeholder-slate-400 focus:outline-none transition-all text-sm md:text-base font-bold"
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
            {filteredGroups.length > 0 ? (
              <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
                {/* Category Sidebar — Professional Dashboard Style */}
                <div className="w-full lg:w-1/3">
                  <div className="sticky top-28 space-y-3 flex flex-col gap-3 overflow-visible pb-4 lg:pb-0 scrollbar-hide">
                    {filteredGroups.map((group, i) => (
                      <button
                        key={group.category}
                        onClick={() => {
                          setActiveTab(i);
                          setOpenId(null);
                        }}
                        className={`group relative flex items-center gap-4 px-6 py-5 rounded-2xl border transition-all duration-500 text-left w-full ${
                          activeTab === i
                            ? "bg-white border-[#0075CF]/20 shadow-[0_20px_50px_rgba(0,117,207,0.12)] -translate-y-1"
                            : "bg-slate-50/50 border-slate-100/50 hover:bg-white hover:border-slate-200 hover:shadow-lg"
                        }`}
                      >
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 ${
                            activeTab === i
                              ? group.color +
                                " shadow-lg shadow-black/10 scale-110"
                              : "bg-white text-slate-400 border border-slate-100"
                          }`}
                        >
                          <group.icon
                            className={`w-5 h-5 ${activeTab === i ? "text-white" : "group-hover:text-[#0075CF] transition-colors"}`}
                          />
                        </div>
                        <div className="flex-1 pr-6">
                          <p
                            className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1 ${activeTab === i ? "text-[#0075CF]" : "text-slate-400"}`}
                          >
                            Department {i + 1}
                          </p>
                          <h4 className="font-bold text-slate-900 text-base">
                            {group.category}
                          </h4>
                        </div>
                        {activeTab === i && (
                          <motion.div
                            layoutId="active-nav"
                            className="absolute right-6 w-1.5 h-1.5 rounded-full bg-[#0075CF]"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question List — Premium Accordion Style */}
                <div className="w-full lg:w-2/3 space-y-5">
                  <AnimatePresence mode="wait">
                    {activeGroup && (
                      <motion.div
                        key={activeGroup.category}
                        initial={{ opacity: 0, x: 20, filter: "blur(10px)" }}
                        animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, x: -20, filter: "blur(10px)" }}
                        transition={{ duration: 0.5, ease: "circOut" }}
                        className="space-y-6"
                      >
                        {activeGroup.questions.map((item, qi) => (
                          <div
                            key={qi}
                            className={`group relative rounded-[2rem] border transition-all duration-500 overflow-hidden ${
                              openId === qi
                                ? "bg-white border-[#0075CF] shadow-[0_30px_60px_-15px_rgba(0,117,207,0.1)]"
                                : "bg-white/50 border-slate-100 hover:border-slate-200 hover:bg-white/80"
                            }`}
                          >
                            <button
                              onClick={() => toggle(qi)}
                              className="w-full flex items-center gap-6 px-10 py-8 text-left outline-none"
                            >
                              <div
                                className={`hidden sm:flex w-10 h-10 rounded-full items-center justify-center text-[10px] font-black border transition-colors ${
                                  openId === qi
                                    ? "bg-[#E6F2FA] border-[#0075CF]/20 text-[#0075CF]"
                                    : "bg-slate-50 border-slate-100 text-slate-400"
                                }`}
                              >
                                {qi + 1}
                              </div>

                              <h3
                                className={`flex-1 text-lg md:text-xl font-bold tracking-tight transition-colors ${
                                  openId === qi
                                    ? "text-slate-900"
                                    : "text-slate-700 group-hover:text-slate-900"
                                }`}
                              >
                                {item.q}
                              </h3>

                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                                  openId === qi
                                    ? "bg-[#0075CF] text-white rotate-180 shadow-lg"
                                    : "bg-slate-100 text-slate-400 group-hover:scale-110"
                                }`}
                              >
                                <ChevronDown className="w-5 h-5 transition-transform" />
                              </div>
                            </button>

                            <AnimatePresence>
                              {openId === qi && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{
                                    duration: 0.4,
                                    ease: "circOut",
                                  }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-10 pb-10 pt-2 sm:ml-16">
                                    <div className="h-px w-full bg-slate-50 mb-8" />
                                    <div className="flex gap-6">
                                      <div className="w-1 rounded-full bg-[#FD5A1A]/20" />
                                      <p className="text-slate-600 text-lg md:text-xl leading-relaxed font-medium max-w-2xl">
                                        {item.a}
                                      </p>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="text-center py-24 bg-slate-50 rounded-[4rem] border-4 border-dashed border-slate-100">
                <HelpCircle className="w-20 h-20 text-slate-200 mx-auto mb-8" />
                <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">
                  No intelligence found.
                </h3>
                <p className="text-slate-400 text-lg">
                  Try adjusting your search criteria or contact our help desk.
                </p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-8 px-8 py-3 rounded-full bg-[#0075CF] text-white font-bold hover:shadow-xl hover:-translate-y-1 transition-all"
                >
                  Reset Query
                </button>
              </div>
            )}

            {/* Still Need Help Section — Final Call to Action */}
            <div className="mt-40 relative rounded-[3rem] p-12 lg:p-20 overflow-hidden group">
              <div className="absolute inset-0 bg-[#0057B7] transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
                <div className="text-center lg:text-left max-w-xl">
                  <h2 className="text-3xl sm:text-5xl font-black text-white mb-6 leading-[1.1] tracking-tight">
                    Still have <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-[#FD5A1A]">questions</span> <br />
                    about our academy?
                  </h2>
                  <p className="text-white/70 text-lg md:text-xl font-medium">
                    Our technical support team is available to help you navigate
                    the portal and maximize your learning experience.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="h-16 px-10 rounded-2xl bg-gradient-to-r from-[#FD5A1A] to-[#FF7A00] text-white font-black uppercase tracking-widest hover:shadow-xl hover:shadow-orange-500/20 transition-all hover:-translate-y-1 active:scale-95">
                    Contact Support
                  </button>
                  <button className="h-16 px-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-black uppercase tracking-widest hover:bg-white/20 transition-all">
                    Chat with AI
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default FAQ;
