import { motion } from "framer-motion";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import LowPolyBackground from "@/components/landing/LowPolyBackground";
import { Newspaper, ChevronRight, Share2, Download, Image as ImageIcon, Video, Calendar, ArrowUpRight, Sparkles } from "lucide-react";

const Press = () => {
    const pressReleases = [
        {
            date: "March 15, 2026",
            title: "AOTMS Secures Series A Funding to Expand AI-Driven Technical Education in AP",
            source: "Economic Times",
            summary: "Leading ed-tech startup Academy of Tech Masters announced a $20M Series A round to scale their hybrid learning model across tier-2 cities in India."
        },
        {
            date: "February 28, 2026",
            title: "New Smart Campus Launch: Bringing Silicon Valley Learning Standards to Vijayawada",
            source: "The Hindu",
            summary: "AOTMS opens its flagship tech center at Pothuri Towers, featuring high-speed 5G infrastructure and state-of-the-art interactive coding labs for students."
        },
        {
            date: "January 10, 2026",
            title: "AOTMS Alumni Hits 1,000+ Placements Across Top MNCs in Q4 2025",
            source: "NDTV Profit",
            summary: "The academy celebrates a record-breaking placement season with graduates securing roles at companies like Microsoft, Amazon, and Google."
        }
    ];

    return (
        <div className="min-h-screen relative overflow-x-hidden bg-white">
            <LowPolyBackground />
            <Header />

            <main className="relative z-10 pt-32 pb-40 px-4">
                <div className="max-w-7xl mx-auto">
                    
                    {/* Hero Section */}
                    <div className="text-center max-w-4xl mx-auto mb-20 px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#0075CF]/10 border border-[#0075CF]/20 text-[#0075CF] text-[10px] font-black uppercase tracking-[0.2em] mb-6 shadow-sm"
                        >
                            <Newspaper className="w-4 h-4 mr-2" />
                            AOTMS PRESS CENTER
                        </motion.div>
                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-7xl font-black text-slate-900 mb-6 leading-tight tracking-tight font-heading"
                        >
                            Latest News & <br className="hidden md:block" />
                            <span className="text-[#0075CF]">Media Announcements</span>
                        </motion.h1>
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-slate-500 text-lg md:text-xl font-medium leading-relaxed max-w-2xl mx-auto mb-10"
                        >
                            Get the official updates on our journey as we bridge the gap 
                            between technical education and industry-leading careers.
                        </motion.p>
                        
                        <div className="flex flex-wrap justify-center gap-4">
                            <button className="h-14 px-8 rounded-2xl bg-[#0075CF] text-white font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-blue-500/20 active:scale-95 flex items-center gap-2">
                                <Download className="w-4 h-4" /> Media Kit
                            </button>
                            <button className="h-14 px-8 rounded-2xl bg-white border border-slate-100 text-slate-800 font-black uppercase tracking-widest hover:border-[#0075CF] transition-all shadow-xl shadow-slate-200/50 active:scale-95 flex items-center gap-2">
                                <Share2 className="w-4 h-4" /> Contact PR
                            </button>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-4 gap-12 mb-32">
                        {/* News Feed */}
                        <div className="lg:col-span-3 space-y-8">
                            <h2 className="text-2xl font-black text-slate-900 mb-8 border-b-2 border-slate-50 pb-4 inline-block">Press Releases</h2>
                            {pressReleases.map((release, idx) => (
                                <motion.article
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="group bg-white p-10 rounded-[3rem] border border-slate-100 hover:border-[#0075CF]/20 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-[#0075CF]/10 transition-all duration-500 overflow-hidden"
                                >
                                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                        <div className="space-y-4 max-w-2xl">
                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#FD5A1A]">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {release.date}
                                                <span className="mx-2 text-slate-300">|</span>
                                                <span className="text-[#0075CF]">{release.source}</span>
                                            </div>
                                            <h3 className="text-2xl font-black text-slate-900 group-hover:text-[#0075CF] transition-colors leading-snug">
                                                {release.title}
                                            </h3>
                                            <p className="text-slate-500 font-medium text-sm leading-relaxed line-clamp-2">
                                                {release.summary}
                                            </p>
                                        </div>
                                        <button className="flex items-center gap-1.5 text-[#0075CF] text-[10px] font-black uppercase tracking-widest hover:gap-3 transition-all whitespace-nowrap">
                                            VIEW RELEASE <ArrowUpRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                </motion.article>
                            ))}
                            
                            <div className="pt-10 text-center">
                                <button className="h-16 px-12 rounded-2xl bg-slate-50 border border-slate-100 text-slate-500 font-black uppercase tracking-widest hover:bg-white hover:text-[#0075CF] hover:border-[#0075CF] transition-all">
                                    Load More Updates
                                </button>
                            </div>
                        </div>

                        {/* Media Resources */}
                        <aside className="space-y-12">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 mb-8 font-heading">Resources</h2>
                                <div className="space-y-4">
                                    {[
                                        { title: "Official Logotypes", icon: ImageIcon, size: "12.4 MB" },
                                        { title: "Campus Photos", icon: ImageIcon, size: "45.0 MB" },
                                        { title: "Academy Video Kit", icon: Video, size: "120.2 MB" },
                                        { title: "Brand Guidelines", icon: Newspaper, size: "5.1 MB" }
                                    ].map((res, i) => (
                                        <div key={i} className="group bg-white p-6 rounded-3xl border border-slate-100 hover:border-[#FD5A1A] transition-all shadow-sm shadow-slate-200/50 cursor-pointer">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-[#FD5A1A]/10 group-hover:text-[#FD5A1A] transition-all flex items-center justify-center">
                                                    <res.icon className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-slate-800 text-xs mb-1">{res.title}</h4>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{res.size}</p>
                                                </div>
                                                <Download className="w-4 h-4 text-slate-300 group-hover:text-[#FD5A1A]" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-[#0075CF] p-8 rounded-[3rem] text-white overflow-hidden relative shadow-2xl">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />
                                <Sparkles className="w-8 h-8 text-yellow-400 mb-6" />
                                <h3 className="text-xl font-black mb-4 leading-tight">PR Inquiries?</h3>
                                <p className="text-white/70 font-medium text-sm leading-relaxed mb-6">
                                    For press passes to our campus events or interview requests with our founders.
                                </p>
                                <a href="mailto:Press@aotms.in" className="text-xs font-black uppercase tracking-widest hover:underline flex items-center gap-2">
                                    Email PR Team <ChevronRight className="w-4 h-4 text-orange-400" />
                                </a>
                            </div>
                        </aside>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Press;
