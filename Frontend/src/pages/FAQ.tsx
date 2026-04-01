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
} from "lucide-react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

const faqGroups = [
  {
    category: "Admissions",
    icon: GraduationCap,
    color: "bg-[#0075CF]",
    questions: [
      {
        q: "What is the eligibility to join AOTMS?",
        a: "We welcome students from all backgrounds. Basic computer knowledge is helpful but not mandatory — we start from zero.",
      },
      {
        q: "Do I need a technical background?",
        a: "No! Our curriculum is designed for complete beginners. We start from fundamentals and build up progressively.",
      },
      {
        q: "How do I register for a course?",
        a: "Register online via our website or visit our Vijayawada campus. Counselors will guide you.",
      },
      {
        q: "Can I join with a career gap?",
        a: "Absolutely! We focus on skills and dedication, not your history.",
      },
    ],
  },
  {
    category: "Training",
    icon: BookOpen,
    color: "bg-[#FD5A1A]",
    questions: [
      {
        q: "Are classes online or offline?",
        a: "We offer both. Online for flexibility or offline at our campus — same quality either way.",
      },
      {
        q: "Do you provide hands-on projects?",
        a: "Yes! Every course includes 3–5 real-world portfolio projects you can show to employers.",
      },
      {
        q: "What if I miss a class?",
        a: "Recorded sessions are always available. You can also attend the same topic in a different batch.",
      },
      {
        q: "Do you have weekend batches?",
        a: "Yes, dedicated weekend batches are available for working professionals.",
      },
    ],
  },
  {
    category: "Placements",
    icon: Briefcase,
    color: "bg-[#0075CF]",
    questions: [
      {
        q: "Do you offer placement assistance?",
        a: "Yes — 100% placement support including job referrals, interview scheduling, and career counseling.",
      },
      {
        q: "Which companies hire from AOTMS?",
        a: "TCS, Infosys, Wipro, Accenture, Amazon and many high-growth startups actively hire our graduates.",
      },
      {
        q: "Do you conduct mock interviews?",
        a: "Yes! Regular HR and technical mock interviews with industry experts are part of preparation.",
      },
      {
        q: "Will you help with resume building?",
        a: "Yes. Our team creates ATS-friendly resumes and optimizes your LinkedIn for maximum visibility.",
      },
    ],
  },
  {
    category: "Fees & Certification",
    icon: Award,
    color: "bg-[#FD5A1A]",
    questions: [
      {
        q: "Do you offer EMI or installments?",
        a: "Yes, flexible EMI plans with 3–6 installments at zero extra charge.",
      },
      {
        q: "Will I receive a certificate?",
        a: "Yes — industry-recognized course completion + project certificates are issued upon finishing.",
      },
      {
        q: "Are there any scholarships?",
        a: "Merit-based scholarships up to 30% and regular early-bird discounts are offered.",
      },
      {
        q: "What is included in the course fee?",
        a: "Training, materials, project guidance, placement support, and lifetime resource access.",
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
                  <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#ffffff] via-[#f1f5f9] to-[#cbd5e1]">
                    Frequently Asked Questi
                  </span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#FF7A00] to-[#FF4500]">
                    ons
                  </span>
                </h1>

                {/* Description */}
                <p className="text-[#FDFEFE]/80 text-sm sm:text-base md:text-lg max-w-3xl mx-auto font-medium mb-12 leading-relaxed">
                  Your trusted IT training partner in Vijayawada. Find answers
                  to common <br className="hidden md:block" />
                  questions about our courses, admissions, placement support,
                  facilities, and <br className="hidden md:block" />
                  more at AOTMS Vijayawada.
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
                  <div className="sticky top-28 space-y-3 flex lg:flex-col gap-3 lg:gap-0 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 scrollbar-hide">
                    {filteredGroups.map((group, i) => (
                      <button
                        key={group.category}
                        onClick={() => {
                          setActiveTab(i);
                          setOpenId(null);
                        }}
                        className={`group relative flex-shrink-0 flex items-center gap-4 px-6 py-5 rounded-2xl border transition-all duration-500 text-left w-full ${
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
                    Still have questions <br />
                    about our academy?
                  </h2>
                  <p className="text-white/70 text-lg md:text-xl font-medium">
                    Our counselors are available 24/7 to help you choose the
                    right path and answer any technical queries.
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
