import { motion } from "framer-motion";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import LowPolyBackground from "@/components/landing/LowPolyBackground";
import { Book, ChevronRight, Search, PlayCircle, Shield, Zap, Terminal, Sparkles, Layout, Database } from "lucide-react";

interface DocSection {
  title: string;
  items: { title: string; link: string }[];
}

const Docs = () => {
  const sections: DocSection[] = [
    {
      title: "Getting Started",
      items: [
        { title: "Introduction", link: "#intro" },
        { title: "Quick Start Guide", link: "#quick" },
        { title: "Platform Overview", link: "#overview" }
      ]
    },
    {
      title: "Core Features",
      items: [
        { title: "Live Classes", link: "#live" },
        { title: "Course Management", link: "#courses" },
        { title: "Student Leaderboard", link: "#ranking" },
        { title: "Secure Exams", link: "#exams" }
      ]
    },
    {
      title: "Account & Security",
      items: [
        { title: "Two-Factor Auth", link: "#2fa" },
        { title: "Password Management", link: "#pass" },
        { title: "Data Privacy", link: "#privacy" }
      ]
    }
  ];

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-white">
      <LowPolyBackground />
      <Header />

      <main className="relative z-10 pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Sidebar Navigation */}
            <aside className="w-full lg:w-72 lg:flex-shrink-0">
              <div className="sticky top-32 space-y-10">
                
                {/* Search Bar */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Search className="w-4 h-4 text-slate-400" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Search docs..."
                    className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white border border-slate-100 focus:outline-none focus:border-[#0075CF] shadow-sm font-bold text-sm"
                  />
                </div>

                <nav className="space-y-10">
                  {sections.map((sec, idx) => (
                    <div key={idx}>
                      <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#0075CF] mb-4">{sec.title}</h4>
                      <ul className="space-y-3">
                        {sec.items.map((item, i) => (
                          <li key={i}>
                            <a 
                              href={item.link}
                              className="text-slate-500 hover:text-slate-900 font-bold text-sm flex items-center gap-2 group transition-colors"
                            >
                              <div className="w-1 h-1 rounded-full bg-slate-300 group-hover:bg-[#FD5A1A] transition-colors" />
                              {item.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </nav>

                <div className="bg-[#FD5A1A]/5 rounded-3xl p-6 border border-[#FD5A1A]/10">
                    <Sparkles className="w-6 h-6 text-[#FD5A1A] mb-3" />
                    <p className="text-xs font-black text-[#FD5A1A] uppercase tracking-widest mb-1">New Feature</p>
                    <h5 className="font-bold text-slate-900 text-sm mb-2">AI-Driven Assessments</h5>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">Learn how our new AI models grade your performance automatically.</p>
                </div>
              </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 lg:max-w-4xl">
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-16"
              >
                <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] mb-8 shadow-xl">
                  DOCUMENTATION HUB
                </div>
                <h1 className="text-4xl md:text-7xl font-black text-slate-900 mb-6 leading-tight tracking-tight font-heading">
                  Platform <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0075CF] to-[#FD5A1A]">Handbook</span>
                </h1>
                <p className="text-slate-500 text-xl font-medium leading-relaxed max-w-3xl">
                  Learn how to master AOTMS's tools, maximize your learning experience, 
                  and reach your career milestones with our official documentation.
                </p>
              </motion.div>

              {/* Quick Grid */}
              <div className="grid sm:grid-cols-2 gap-8 mb-20">
                {[
                  { title: "For Students", icon: Book, color: "bg-blue-500", desc: "Setting up your account, choosing paths & exams." },
                  { title: "For Instructors", icon: Zap, color: "bg-orange-500", desc: "Batch management, live streaming & assessments." },
                  { title: "Technical API", icon: Terminal, color: "bg-slate-900", desc: "Webhooks, SDK integrations & custom data export." },
                  { title: "Security Guide", icon: Shield, color: "bg-emerald-500", desc: "Compliance, data protection & session security." }
                ].map((card, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="group bg-white p-8 rounded-[3rem] border border-slate-100 hover:border-[#0075CF]/20 hover:shadow-2xl hover:shadow-[#0075CF]/10 transition-all cursor-pointer"
                  >
                    <div className={`w-12 h-12 rounded-2xl ${card.color} text-white flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                      <card.icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{card.title}</h3>
                    <p className="text-slate-500 font-medium text-sm leading-relaxed mb-6">{card.desc}</p>
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#0075CF]">
                      Explore Docs <ChevronRight className="w-4 h-4" />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Sample Documentation Text */}
              <div className="space-y-16">
                <section id="intro">
                  <h2 className="text-3xl font-black text-slate-900 mb-8 font-heading">Introduction</h2>
                  <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-p:leading-relaxed prose-p:font-medium prose-p:text-lg">
                    <p>Welcome to AOTMS LMS. Our platform is designed to provide a seamless learning experience bridging technical education with direct career outcomes. Whether you're a fresh student looking for your first tech job or a professional looking to upskill, this documentation covers everything you need to know.</p>
                    <p className="mt-8">We focus on high-performance learning through live interactive sessions, real-time feedback, and automated grading systems that ensure you mastery of every concept before moving forward.</p>
                  </div>
                </section>

                <section id="features" className="bg-slate-50 p-12 rounded-[3.5rem] border border-slate-100">
                    <h3 className="text-2xl font-black text-slate-900 mb-10">Platform Capabilities</h3>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { title: "Live Sync", icon: Layout, desc: "Ultra-low latency streaming for live classes." },
                            { title: "Auto-Grading", icon: Database, desc: "Instant feedback on code & theory exams." },
                            { title: "Smart Resume", icon: Sparkles, desc: "AI-based ATS optimization for jobs." }
                        ].map((feat, i) => (
                            <div key={i} className="text-center">
                                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
                                    <feat.icon className="w-6 h-6 text-[#0075CF]" />
                                </div>
                                <h4 className="font-bold text-slate-900 mb-2">{feat.title}</h4>
                                <p className="text-xs text-slate-500 font-medium leading-relaxed">{feat.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>
              </div>

            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Docs;
