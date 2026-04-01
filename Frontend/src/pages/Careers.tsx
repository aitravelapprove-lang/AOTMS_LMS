import { motion } from "framer-motion";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import LowPolyBackground from "@/components/landing/LowPolyBackground";
import { Briefcase, MapPin, Clock, ArrowRight, TrendingUp, Users, Target, Zap, Sparkles } from "lucide-react";

const Careers = () => {
    const jobs = [
        {
            title: "Senior Full Stack Instructor",
            department: "Applied Tech",
            type: "Full-time",
            location: "Vijayawada",
            salary: "Competitive",
            tags: ["React", "Node.js", "System Design"],
            experience: "5+ Years"
        },
        {
            title: "Student Success Counselor",
            department: "Admissions",
            type: "Full-time",
            location: "Remote / On-site",
            salary: "Performance Bonus",
            tags: ["Communication", "Counseling"],
            experience: "1+ Years"
        },
        {
            title: "UI/UX Curriculum Designer",
            department: "Design Academy",
            type: "Contract",
            location: "Flexible",
            salary: "Project Based",
            tags: ["Figma", "Research", "Education"],
            experience: "3+ Years"
        }
    ];

    return (
        <div className="min-h-screen relative overflow-x-hidden bg-white">
            <LowPolyBackground />
            <Header />

            <main className="relative z-10 pt-32 pb-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Hero Section */}
                    <div className="text-center max-w-4xl mx-auto mb-20 px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-[#FD5A1A] text-[10px] font-black uppercase tracking-[0.2em] mb-6 shadow-sm"
                        >
                            <Sparkles className="w-4 h-4 mr-2" />
                            JOIN THE MISSION
                        </motion.div>
                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-7xl font-black text-slate-900 mb-6 leading-tight tracking-tight font-heading"
                        >
                            Build the Future of <br className="hidden md:block" />
                            <span className="text-[#0075CF]">Education with Us</span>
                        </motion.h1>
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-slate-500 text-lg md:text-xl font-medium leading-relaxed max-w-2xl mx-auto mb-12"
                        >
                            We're looking for passionate educators, technology enthusiasts, 
                            and visionary thinkers to help us transform careers in Vijayawada and beyond.
                        </motion.p>
                        
                        <div className="flex flex-wrap justify-center gap-6">
                            {[
                                { label: "Tech Mentors", icon: Zap },
                                { label: "Design Thinkers", icon: Target },
                                { label: "Career Strategists", icon: TrendingUp }
                            ].map((badge, i) => (
                                <div key={i} className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50 text-slate-800 font-bold text-sm">
                                    <badge.icon className="w-4 h-4 text-[#0075CF]" />
                                    {badge.label}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Why AOTMS Section */}
                    <div className="grid md:grid-cols-3 gap-10 mb-32">
                        {[
                            { title: "Impact Driven", desc: "Our work directly transforms the livelihoods of thousands of students across AP.", icon: Users },
                            { title: "Rapid Growth", desc: "We are scaling fast. Your growth trajectory with us will be unprecedented.", icon: TrendingUp },
                            { title: "Skill First", desc: "No red tape. We value your technical expertise more than your degrees.", icon: Zap }
                        ].map((card, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white/60 backdrop-blur-2xl p-10 rounded-[3rem] border border-slate-100 text-center hover:bg-white hover:shadow-2xl transition-all duration-500 shadow-xl shadow-slate-100/50 group"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-[#E6F2FA] text-[#0075CF] flex items-center justify-center mx-auto mb-8 shadow-inner group-hover:scale-110 transition-transform">
                                    <card.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 mb-4">{card.title}</h3>
                                <p className="text-slate-500 font-medium leading-relaxed text-sm">{card.desc}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Open Positions */}
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center justify-between mb-12">
                            <h2 className="text-3xl font-black text-slate-900 font-heading">Open Roles</h2>
                            <span className="px-4 py-1.5 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">{jobs.length} Positions</span>
                        </div>

                        <div className="space-y-6">
                            {jobs.map((job, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="group relative bg-white p-8 md:p-10 rounded-[3rem] border border-slate-100 hover:border-[#0075CF] transition-all duration-500 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-[#0075CF]/10 cursor-pointer overflow-hidden"
                                >
                                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-xl md:text-2xl font-black text-slate-900 group-hover:text-[#0075CF] transition-colors">{job.title}</h3>
                                                <span className="px-3 py-1 rounded-full bg-[#FD5A1A]/10 text-[#FD5A1A] text-[10px] font-black uppercase tracking-widest">{job.department}</span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-4 text-slate-400 text-xs font-bold">
                                                <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {job.location}</div>
                                                <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {job.type}</div>
                                                <div className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" /> {job.experience} exp</div>
                                            </div>
                                            <div className="flex flex-wrap gap-2 pt-2">
                                                {job.tags.map((tag, i) => (
                                                    <span key={i} className="text-[10px] font-black text-slate-400 uppercase tracking-widest">#{tag}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <button className="h-14 px-10 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest group-hover:bg-[#0075CF] transition-colors flex items-center justify-center gap-2 group/btn active:scale-95 whitespace-nowrap">
                                            Apply Now <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Referral Banner */}
                        <div className="mt-20 bg-[#0075CF] p-10 md:p-12 rounded-[3.5rem] text-white flex flex-col md:flex-row items-center gap-10 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-64 h-64 bg-white/20 rounded-full blur-[100px] -ml-32 -mt-32" />
                            <div className="flex-1 space-y-4 text-center md:text-left relative z-10">
                                <h4 className="text-2xl font-black">Not looking for a role?</h4>
                                <p className="text-white/80 font-medium text-lg leading-relaxed">Refer a friend who fits our vision and earn a referral bonus up to ₹25,000 upon successful hire.</p>
                            </div>
                            <button className="h-16 px-10 rounded-2xl bg-white text-[#0075CF] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl relative z-10 whitespace-nowrap">
                                Refer a Hero
                            </button>
                        </div>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Careers;
