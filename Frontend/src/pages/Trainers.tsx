import { motion } from "framer-motion";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import LowPolyBackground from "@/components/landing/LowPolyBackground";
import { Linkedin, Twitter, Globe, Star, Users, Brain, BookOpen, GraduationCap, ChevronRight, Mail, Sparkles } from "lucide-react";

interface Trainer {
  id: number;
  name: string;
  role: string;
  experience: string;
  expertise: string[];
  studentsLabel: string;
  image: string;
  bio: string;
  rating: number;
}

const Trainers = () => {
    const trainers: Trainer[] = [
        {
          id: 1,
          name: "Venkatesh Prasad",
          role: "Lead Full Stack Architect",
          experience: "12+ Years",
          expertise: ["MERN Stack", "System Design", "Cloud Native"],
          studentsLabel: "2,500+ Mentored",
          image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
          bio: "Formerly a Senior Architect at a top-5 tech giant in Bangalore, Venkatesh brings high-level enterprise coding practices directly to our classrooms.",
          rating: 4.9
        },
        {
          id: 2,
          name: "Deepika Reddy",
          role: "AI & Data Science Head",
          experience: "8+ Years",
          expertise: ["Python", "TensorFlow", "Pandas", "NLP"],
          studentsLabel: "1,200+ Mentored",
          image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400",
          bio: "A data science researcher turned educator, Deepika specializes in making complex mathematical models understandable for real-world application.",
          rating: 4.8
        },
        {
          id: 3,
          name: "Sai Kiran",
          role: "DevOps & Cloud Mentor",
          experience: "10+ Years",
          expertise: ["AWS", "Docker", "Kubernetes", "CI/CD"],
          studentsLabel: "1,800+ Mentored",
          image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400",
          bio: "Expert in scalable infrastructure. Sai ensures our students are job-ready for the world of automated deployment and reliability engineering.",
          rating: 4.9
        }
    ];

    return (
        <div className="min-h-screen relative overflow-x-hidden bg-white">
            <LowPolyBackground />
            <Header />

            <main className="relative z-10 pt-32 pb-40 px-4">
                <div className="max-w-7xl mx-auto">
                    
                    {/* Hero Section */}
                    <div className="text-center max-w-4xl mx-auto mb-20">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#0075CF]/10 border border-[#0075CF]/20 text-[#0075CF] text-[10px] font-black uppercase tracking-[0.2em] mb-6 shadow-sm"
                        >
                            <Brain className="w-4 h-4 mr-2" />
                            LEARN FROM THE BEST
                        </motion.div>
                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-7xl font-black text-slate-900 mb-6 leading-tight tracking-tight font-heading"
                        >
                            Meet Your <span className="text-[#0075CF]">Industry Mentors</span>
                        </motion.h1>
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-slate-500 text-lg md:text-xl font-medium leading-relaxed max-w-2xl mx-auto"
                        >
                            Our trainers aren't just teachers—they are seasoned industry veterans 
                            who have built systems at scale and managed global tech teams.
                        </motion.p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12 mb-32">
                        {trainers.map((trainer, idx) => (
                            <motion.div
                                key={trainer.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="group relative bg-white rounded-[3rem] border border-slate-100 hover:border-[#0075CF]/20 overflow-hidden shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-[#0075CF]/10 transition-all duration-500"
                            >
                                <div className="p-8 pb-0">
                                    <div className="relative aspect-square rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white mb-8">
                                        <img 
                                            src={trainer.image} 
                                            alt={trainer.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md shadow-lg text-[10px] font-black uppercase tracking-widest text-[#FD5A1A]">
                                            <Star className="w-3 h-3 fill-current" /> {trainer.rating} Rating
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-black text-slate-900 leading-none group-hover:text-[#0075CF] transition-colors">{trainer.name}</h3>
                                        <p className="text-[#0075CF] text-xs font-black uppercase tracking-widest">{trainer.role}</p>
                                    </div>
                                </div>
                                <div className="p-8 pt-6">
                                    <p className="text-slate-500 font-medium text-sm leading-relaxed mb-6 line-clamp-3">
                                        {trainer.bio}
                                    </p>
                                    <div className="flex flex-wrap gap-2 mb-8">
                                        {trainer.expertise.map((skill, i) => (
                                          <span key={i} className="px-3 py-1 rounded-full bg-slate-50 border border-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                                            {skill}
                                          </span>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                        <div className="flex items-center gap-3">
                                            <a href="#" className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-[#E6F2FA] hover:text-[#0075CF] transition-all">
                                                <Linkedin className="w-4 h-4" />
                                            </a>
                                            <a href="#" className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-[#E6F2FA] hover:text-[#0075CF] transition-all">
                                                <Mail className="w-4 h-4" />
                                            </a>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Experience</span>
                                            <span className="text-sm font-black text-slate-900 group-hover:text-[#0075CF] transition-colors">{trainer.experience}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="max-w-5xl mx-auto bg-slate-900 rounded-[4rem] p-12 md:p-20 text-white relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center gap-16">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-[#0075CF]/20 rounded-full blur-[100px] -mr-40 -mt-40" />
                        <div className="relative z-10 flex-1 space-y-8 text-center md:text-left">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-black uppercase tracking-[0.2em]"
                            >
                                <Sparkles className="w-4 h-4 mr-2 text-yellow-400" />
                                JOIN OUR MENTOR PANEL
                            </motion.div>
                            <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight">Aspire to teach with us?</h2>
                            <p className="text-white/70 text-lg md:text-xl font-medium leading-relaxed">
                                Share your industry expertise and empower the next generation of engineers. Our platform allows professionals to teach part-time or full-time with global reach.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center md:justify-start">
                                <button className="h-16 px-10 rounded-2xl bg-[#0075CF] hover:bg-blue-600 text-white font-black uppercase tracking-widest shadow-xl shadow-black/20 transition-all flex items-center justify-center gap-2 group whitespace-nowrap active:scale-95">
                                    Become Instructor <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                                </button>
                                <button className="h-16 px-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-black uppercase tracking-widest transition-all hover:bg-white/20 active:scale-95 whitespace-nowrap">
                                    Mentor Program
                                </button>
                            </div>
                        </div>

                        <div className="relative z-10 grid grid-cols-2 gap-4 w-full md:w-auto">
                            {[
                                { val: "50+", label: "Instructors", icon: Users },
                                { val: "100%", label: "Skilled", icon: BookOpen },
                                { val: "15+", label: "Industries", icon: GraduationCap },
                                { val: "24/7", label: "Support", icon: Mail }
                            ].map((stat, i) => (
                                <div key={i} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-center shadow-lg hover:-translate-y-1 transition-all duration-300">
                                    <stat.icon className="w-6 h-6 text-[#FD5A1A] mx-auto mb-3" />
                                    <div className="text-2xl font-black text-white">{stat.val}</div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-white/50">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Trainers;
