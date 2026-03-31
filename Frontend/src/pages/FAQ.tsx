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
import LowPolyBackground from "@/components/landing/LowPolyBackground";

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

const FAQ = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [openId, setOpenId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const toggle = (i: number) => setOpenId(openId === i ? null : i);
  
  const filteredGroups = searchQuery.trim() === "" 
    ? faqGroups 
    : faqGroups.map(group => ({
        ...group,
        questions: group.questions.filter(q => 
          q.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
          q.a.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(group => group.questions.length > 0);

  const activeGroup = filteredGroups[activeTab] || filteredGroups[0];

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-white">
      <LowPolyBackground />
      <div className="relative z-10">
        <Header />
        
        <main className="pt-32 pb-20">
          {/* FAQ Hero Section */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16 lg:mb-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E6F2FA] text-[#0075CF] text-xs font-black uppercase tracking-widest mb-6">
                <HelpCircle className="w-3.5 h-3.5" /> Support Center
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-slate-900 mb-8 leading-[0.95] tracking-tight">
                Frequently Asked <span className="text-[#0075CF]">Questions</span>
              </h1>
              <p className="text-slate-600 text-lg md:text-xl max-w-2xl mx-auto font-medium mb-12">
                Find quick answers to common questions about admissions, training, placements, and more.
              </p>

              {/* Search Bar */}
              <div className="max-w-xl mx-auto relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                  <Search className="w-5 h-5 text-slate-400 group-focus-within:text-[#0075CF] transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Search your question here..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-16 pl-14 pr-8 rounded-2xl bg-white border border-slate-200 shadow-xl shadow-slate-200/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0075CF]/20 focus:border-[#0075CF] transition-all text-base md:text-lg font-medium"
                />
              </div>
            </motion.div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {filteredGroups.length > 0 ? (
              <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
                {/* Category Sidebar */}
                <div className="w-full lg:w-1/3">
                  <div className="sticky top-28 flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 scrollbar-hide">
                    {filteredGroups.map((group, i) => (
                      <button
                        key={group.category}
                        onClick={() => {
                          setActiveTab(i);
                          setOpenId(null);
                        }}
                        className={`flex-shrink-0 flex items-center gap-4 px-6 py-5 rounded-[1.5rem] border transition-all duration-300 text-left ${
                          activeTab === i
                            ? "bg-white border-[#0075CF] shadow-xl shadow-[#0075CF]/10 scale-[1.02]"
                            : "bg-white/50 border-slate-900/5 hover:bg-white backdrop-blur-sm"
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
                            className={`text-[10px] font-black uppercase tracking-widest ${activeTab === i ? group.color.replace("bg-", "text-") : "text-slate-400"}`}
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
                    {activeGroup && (
                      <motion.div
                        key={activeGroup.category}
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
                                ? "bg-white border-[#0075CF] shadow-2xl shadow-[#0075CF]/5"
                                : "bg-white/60 border-slate-900/5 hover:border-slate-200"
                            }`}
                          >
                            <button
                              onClick={() => toggle(qi)}
                              className="w-full flex items-center gap-6 px-8 py-7 text-left"
                            >
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
                                    <p className="text-slate-600 text-base md:text-lg leading-relaxed font-semibold">
                                      {item.a}
                                    </p>
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
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                <HelpCircle className="w-16 h-16 text-slate-300 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-slate-900 mb-2">No results found</h3>
                <p className="text-slate-500">Try searching for a different keyword or category.</p>
                <button 
                  onClick={() => setSearchQuery("")}
                  className="mt-6 font-bold text-[#0075CF] hover:underline"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
};

export default FAQ;
