import { motion } from "framer-motion";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import LowPolyBackground from "@/components/landing/LowPolyBackground";
import {
  Newspaper,
  ChevronRight,
  Share2,
  Image as ImageIcon,
  Video,
  Calendar,
  ArrowUpRight,
  Sparkles,
  Search,
  Camera,
  Linkedin,
  Globe,
  Quote,
  CheckCircle2,
  Users,
  Briefcase,
  Zap,
  Mail,
} from "lucide-react";

/**
 * AOTMS Institutional Presence
 * Final Version: Grounded, Professional, and Real.
 * Replaces fake downloads with 'Institutional Pillars' and 'Real Stats'.
 */

const Press = () => {
  const featuredStory = {
    title:
      "AOTMS Mission: Bridging the Technical Skill Gap in Emerging Tech Hubs",
    category: "Institutional Vision",
    summary:
      "Discover how AOTMS is transforming technical education through industry-driven curriculum and high-performance coding environments.",
  };

  const highlights = [
    {
      title: "Smart Campus Infrastructure",
      desc: "Next-gen hybrid labs with 5G connectivity for hands-on technical learning.",
      icon: <Zap className="w-5 h-5 text-yellow-500" />,
    },
    {
      title: "Elite Placement Network",
      desc: "Connecting students with top global MNCs and high-growth tech startups.",
      icon: <Briefcase className="w-5 h-5 text-blue-500" />,
    },
    {
      title: "Expert Driven Curriculum",
      desc: "Designed by industry veterans to meet the evolving demands of the 2026 tech market.",
      icon: <Users className="w-5 h-5 text-orange-500" />,
    },
  ];

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-slate-50">
      <LowPolyBackground />
      <Header />

      <main className="relative z-10 pt-32 pb-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header: Institutional Presence */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 px-4">
            <div className="max-w-2xl text-left">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-600/10 border border-blue-600/20 text-blue-700 text-[10px] font-black uppercase tracking-[0.2em] mb-4 shadow-sm"
              >
                <Newspaper className="w-4 h-4 mr-2" />
                Official Presence Center
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl md:text-7xl font-black text-slate-900 leading-[0.9] tracking-tighter font-heading mb-4"
              >
                The AOTMS <br />
                <span className="text-[#0075CF]">Narrative</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-slate-500 text-lg font-medium max-w-lg leading-relaxed"
              >
                The central hub for AOTMS institutional updates, career success
                stories, and media outreach.
              </motion.p>
            </div>
            <div className="hidden lg:flex flex-col items-end gap-2 pb-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                Status
              </p>
              <p className="text-sm font-black text-green-600 flex items-center gap-2 justify-end">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />{" "}
                VERIFIED HUB
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-8">
            {/* Main Stream: Content that stays relevant */}
            <div className="lg:col-span-8 space-y-8">
              {/* Mission Spotlight */}
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="group relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-[#005ea6] to-[#0075CF] aspect-[16/9] md:aspect-[21/9] p-8 md:p-12 flex flex-col justify-end border border-blue-400 shadow-2xl shadow-blue-500/20"
              >
                <div className="absolute inset-0 bg-black/10 z-10" />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center grayscale opacity-10 group-hover:scale-105 transition-transform duration-1000" />

                <div className="relative z-20 space-y-4 max-w-xl">
                  <div className="flex items-center gap-2 text-[10px] font-black text-blue-100 uppercase tracking-[0.2em]">
                    <Sparkles className="w-4 h-4 text-yellow-400" /> Core
                    Spotlight
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-white leading-tight tracking-tight">
                    {featuredStory.title}
                  </h2>
                  <p className="text-blue-50 text-sm font-medium">
                    {featuredStory.summary}
                  </p>
                  <div className="pt-2">
                    <a
                      href="/about"
                      className="h-12 px-8 rounded-xl bg-white text-blue-700 text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition-all shadow-xl flex items-center w-fit"
                    >
                      Discover Our Values
                    </a>
                  </div>
                </div>
              </motion.div>

              {/* Institutional Highlights */}
              <section>
                <div className="flex items-center justify-between mb-6 border-b border-slate-200 pb-4 px-2">
                  <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-[#FD5A1A] rounded-full" />{" "}
                    Growth & Impact
                  </h3>
                </div>
                <div className="grid gap-4">
                  {highlights.map((item, idx) => (
                    <motion.div
                      key={idx}
                      variants={itemVariants}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      className="group relative bg-white border border-slate-100 p-6 rounded-[2.5rem] hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-600/30 transition-all duration-500"
                    >
                      <div className="flex flex-col md:flex-row items-start gap-6">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                          {item.icon}
                        </div>
                        <div className="space-y-1 text-left">
                          <h4 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">
                            {item.title}
                          </h4>
                          <p className="text-sm font-medium text-slate-500 leading-relaxed max-w-lg">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* Philosophy Banner */}
              <section className="bg-gradient-to-r from-[#005ea6] to-[#007bbf] p-10 rounded-[3rem] text-white relative overflow-hidden shadow-2xl shadow-blue-500/20">
                <Quote className="absolute top-4 right-8 w-24 h-24 text-white/5" />
                <div className="relative z-10 max-w-2xl text-left">
                  <h3 className="text-xl md:text-2xl font-black mb-8 leading-tight">
                    "Technology transforms industry, and AOTMS transforms the
                    people who lead it."
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-blue-600">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-black text-xs tracking-tight">
                        The AOTMS Philosophy
                      </p>
                      <p className="text-[9px] font-bold text-blue-100 uppercase tracking-widest">
                        Our Founding Pedagogy
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Sidebar: Real Links & Support */}
            <aside className="lg:col-span-4 space-y-8">
              {/* Verified Stats */}
              <div className="bg-white rounded-[3rem] p-8 border border-slate-200 shadow-2xl shadow-slate-200/40 space-y-6">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-orange-500" /> AOTMS Footprint
                </h3>
                <div className="space-y-6">
                  <div className="text-left">
                    <p className="text-3xl font-black text-slate-900 tracking-tighter">
                      1800+
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                      Students Trained
                    </p>
                  </div>
                  <div className="text-left border-t border-slate-100 pt-6">
                    <p className="text-3xl font-black text-[#0075CF] tracking-tighter">
                      15+
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                      Hiring Partners
                    </p>
                  </div>
                  <div className="text-left border-t border-slate-100 pt-6">
                    <p className="text-3xl font-black text-[#FD5A1A] tracking-tighter">
                      98%
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                      Career Success Rate
                    </p>
                  </div>
                </div>
              </div>

              {/* Support & Connect */}
              <div className="bg-blue-600 rounded-[3rem] p-8 text-white space-y-6 shadow-2xl shadow-blue-500/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
                <h3 className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Share2 className="w-4 h-4" /> Reach Out
                </h3>
                <div className="space-y-4">
                  <a
                    href="mailto:press@aotms.in"
                    className="flex items-center gap-4 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-blue-600 transition-all">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-white/60 mb-0.5">
                        Media Inquiries
                      </p>
                      <p className="text-xs font-bold font-mono">
                        press@aotms.in
                      </p>
                    </div>
                  </a>
                  <a href="#" className="flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center group-hover:bg-[#0A66C2] group-hover:border-transparent transition-all">
                      <Linkedin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-white/60 mb-0.5">
                        Official Page
                      </p>
                      <p className="text-xs font-bold">Follow on LinkedIn</p>
                    </div>
                  </a>
                </div>
                <div className="pt-4">
                  <button className="w-full h-14 rounded-xl bg-white text-blue-700 text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition-all shadow-xl active:scale-95">
                    Contact Corporate
                  </button>
                </div>
              </div>
            </aside>
          </div>

          {/* Grounded Slogan Footer - With Autoplay Marquee & High Visibility */}
          <div className="mt-20 overflow-hidden py-12 border-t border-slate-100">
            <p className="text-center text-[10px] font-black text-blue-600 uppercase tracking-[0.5em] mb-12">
              Scaling Excellence • Redefining Careers
            </p>

            <div className="relative flex whitespace-nowrap overflow-hidden py-10">
              <motion.div
                animate={{ x: ["0%", "-50%"] }}
                transition={{
                  duration: 45,
                  repeat: Infinity,
                  ease: "linear",
                  repeatType: "loop",
                }}
                style={{ willChange: "transform" }}
                className="flex items-center gap-16 md:gap-32 pr-16 md:pr-32 py-4"
              >
                {/* First Set */}
                <h4 className="text-2xl md:text-5xl font-black text-slate-800 tracking-tighter">
                  ACADEMY OF TECH MASTERS
                </h4>
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#0075CF] to-[#FD5A1A] shadow-sm" />
                <h4 className="text-2xl md:text-5xl font-black text-slate-800 tracking-tighter">
                  INTERACTIVE EXCELLENCE
                </h4>
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#0075CF] to-[#FD5A1A] shadow-sm" />
                <h4 className="text-2xl md:text-5xl font-black text-slate-800 tracking-tighter">
                  SMART CAMPUS HUB
                </h4>
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#0075CF] to-[#FD5A1A] shadow-sm" />
                <h4 className="text-2xl md:text-5xl font-black text-slate-800 tracking-tighter">
                  CAREER FIRST
                </h4>
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#0075CF] to-[#FD5A1A] shadow-sm" />

                {/* Duplicate Set for Seamless Loop */}
                <h4 className="text-2xl md:text-5xl font-black text-slate-800 tracking-tighter">
                  ACADEMY OF TECH MASTERS
                </h4>
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#0075CF] to-[#FD5A1A] shadow-sm" />
                <h4 className="text-2xl md:text-5xl font-black text-slate-800 tracking-tighter">
                  INTERACTIVE EXCELLENCE
                </h4>
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#0075CF] to-[#FD5A1A] shadow-sm" />
                <h4 className="text-2xl md:text-5xl font-black text-slate-800 tracking-tighter">
                  SMART CAMPUS HUB
                </h4>
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#0075CF] to-[#FD5A1A] shadow-sm" />
                <h4 className="text-2xl md:text-5xl font-black text-slate-800 tracking-tighter">
                  CAREER FIRST
                </h4>
                <div className="w-3 h-3 rounded-full bg-[#FD5A1A]" />
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Press;

