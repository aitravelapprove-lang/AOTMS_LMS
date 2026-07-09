import { motion } from "framer-motion";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import LowPolyBackground from "@/components/landing/LowPolyBackground";
import { PlayCircle, ShieldCheck, Trophy, BadgeCheck, Video, Layout, Zap, Sparkles, ArrowRight } from "lucide-react";

const Features = () => {
    const featureList = [
        {
            id: "live",
            title: "Live Interactive Classes",
            icon: Video,
            color: "bg-blue-500",
            desc: "Join real-time sessions with industry experts. Ask questions, participate in polls, and solve problems collaboratively with classmates.",
            points: ["Low latency streaming", "Interactive whiteboards", "Class recordings", "Live Q&A"]
        },
        {
            id: "recorded",
            title: "Recorded Video Library",
            icon: PlayCircle,
            color: "bg-orange-500",
            desc: "Missed a class? No problem. Access our high-definition library of all previous sessions, organized by topic and difficulty.",
            points: ["Lifetime access", "Search by topic", "Offline viewing", "Smart progress sync"]
        },
        {
            id: "exams",
            title: "Secure Online Exams",
            icon: ShieldCheck,
            color: "bg-emerald-500",
            desc: "Our rigorous assessment system includes anti-cheat monitoring and automated grading for both theoretical and coding challenges.",
            points: ["Proctored environment", "Instant feedback", "Performance analytics", "Skill certification"]
        },
        {
            id: "leaderboard",
            title: "Dynamic Leaderboard",
            icon: Trophy,
            color: "bg-yellow-500",
            desc: "Stay motivated and compete with peers across India. Earn XP, badges, and professional reputation as you master new skills.",
            points: ["Real-time rankings", "Weekly challenges", "Badge system", "Peer comparisons"]
        },
        {
            id: "resume",
            title: "ATS Resume Scoring",
            icon: BadgeCheck,
            color: "bg-slate-900",
            desc: "Get your resume ready for top-tier recruiters. Our AI-driven tool scores your resume against actual vacancy requirements.",
            points: ["Keyword optimization", "Formatting analysis", "Comparison with peers", "Expert advice"]
        }
    ];

    return (
        <div className="min-h-screen relative overflow-x-hidden bg-white">
            <LowPolyBackground />
            <Header />

            <main className="relative z-10 pt-32 pb-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Hero */}
                    <div className="text-center max-w-4xl mx-auto mb-24 px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#0075CF]/10 border border-[#0075CF]/20 text-[#0075CF] text-[10px] font-black uppercase tracking-[0.2em] mb-6 shadow-sm"
                        >
                            <Sparkles className="w-4 h-4 mr-2" />
                            THE AOTMS ECOSYSTEM
                        </motion.div>
                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-7xl font-black text-slate-900 mb-6 leading-tight tracking-tight font-heading"
                        >
                            Powerful Features for <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0075CF] to-[#FD5A1A]">Modern Builders</span>
                        </motion.h1>
                        <motion.p 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="text-slate-500 text-lg md:text-xl font-medium leading-relaxed max-w-2xl mx-auto mb-10"
                        >
                          From interactive classrooms to AI-powered career tools, 
                          discover the technology stack that powers your educational journey.
                        </motion.p>
                    </div>

                    <div className="space-y-32">
                        {featureList.map((feat, idx) => (
                            <motion.div 
                                key={feat.id}
                                id={feat.id}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                                viewport={{ once: true }}
                                className={`flex flex-col lg:items-center gap-16 ${idx % 2 === 1 ? "lg:flex-row-reverse" : "lg:flex-row"}`}
                            >
                                <div className="flex-1 space-y-8">
                                    <div className={`w-16 h-16 rounded-[2rem] ${feat.color} text-white flex items-center justify-center shadow-2xl shadow-slate-300`}>
                                        <feat.icon className="w-8 h-8" />
                                    </div>
                                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight font-heading">{feat.title}</h2>
                                    <p className="text-slate-500 text-lg font-medium leading-relaxed bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                                        {feat.desc}
                                    </p>
                                    <ul className="grid sm:grid-cols-2 gap-4">
                                        {feat.points.map((point, i) => (
                                            <li key={i} className="flex items-center gap-3 text-slate-700 font-bold text-sm">
                                                <div className="w-2 h-2 rounded-full bg-[#0075CF]/30" />
                                                {point}
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="pt-4">
                                        <button className="h-14 px-8 rounded-2xl bg-gradient-to-r from-[#0075CF] to-[#3391D9] text-white font-black uppercase tracking-widest hover:shadow-lg hover:shadow-blue-500/20 transition-all flex items-center gap-2 group active:scale-95">
                                            Try it Now <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex-1 relative aspect-video bg-slate-100 rounded-[3rem] overflow-hidden border border-slate-200/50 group shadow-2xl">
                                    <div className="absolute inset-0 bg-gradient-to-br from-slate-200/20 to-transparent group-hover:scale-105 transition-transform duration-700" />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-40">
                                        <feat.icon className="w-32 h-32 text-slate-300" />
                                    </div>
                                    <div className="absolute bottom-8 left-8 right-8 p-6 bg-white/80 backdrop-blur-md rounded-2xl border border-white/50 shadow-lg">
                                        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#0075CF] mb-1">PRO PREVIEW</p>
                                        <p className="font-bold text-slate-900">{feat.title} interface designed for maximum engagement.</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Final CTA */}
                    <div className="mt-40 bg-gradient-to-br from-[#0075CF] to-[#005CAD] rounded-[4rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-[#0075CF]/20">
                        <div className="absolute inset-0 bg-[#0075CF]/10 blur-[120px] -mr-64 -mt-64" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#FD5A1A]/20 rounded-full blur-[80px] -ml-32 -mb-32" />

                        <h2 className="relative z-10 text-3xl md:text-6xl font-black text-white mb-10 leading-[1.1] tracking-tight font-heading">Ready to experience <br /> the future of learning?</h2>
                        <div className="relative z-10 flex flex-col sm:flex-row justify-center gap-4">
                            <button className="h-16 px-12 rounded-2xl bg-gradient-to-r from-[#FD5A1A] to-[#FF7A00] text-white font-black uppercase tracking-widest shadow-xl shadow-orange-500/20 hover:scale-105 transition-all active:scale-95">Sign Up Free</button>
                            <button className="h-16 px-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-black uppercase tracking-widest hover:bg-white/20 transition-all">Request Demo</button>
                        </div>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Features;
