import { motion } from "framer-motion";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import LowPolyBackground from "@/components/landing/LowPolyBackground";
import { Linkedin, Star, Users, Brain, BookOpen, GraduationCap, ChevronRight, Mail, Sparkles } from "lucide-react";

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
          name: "V. Adilakshmi",
          role: "Data Analytics Expert",
          experience: "8+ Years",
          expertise: ["Data Analytics", "SQL", "Python", "Business Insights"],
          studentsLabel: "1,500+ Mentored",
          image: "https://res.cloudinary.com/dbhuezxh0/image/upload/v1769142934/mentos-1_ch1jur_yyy4gk.jpg",
          bio: "Empowering students with the power of data. My goal is to bridge the gap between complex algorithms and real-world business insights.",
          rating: 4.9
        },
        {
          id: 2,
          name: "Intiaz Shaik",
          role: "Cyber Security Specialist",
          experience: "6+ Years",
          expertise: ["Ethical Hacking", "Network Security", "Cyber Defense"],
          studentsLabel: "1,200+ Mentored",
          image: "https://res.cloudinary.com/dbhuezxh0/image/upload/v1769142934/mentos-2_hod2iu_stcqlv.jpg",
          bio: "In the digital age, security is not an option—it's a necessity. I mentor the next generation of ethical hackers to secure our global future.",
          rating: 4.8
        },
        {
          id: 3,
          name: "B. Rohith",
          role: "QA Automation Expert",
          experience: "12+ Years",
          expertise: ["Automation Testing", "System Reliability", "Quality Assurance"],
          studentsLabel: "2,000+ Mentored",
          image: "https://res.cloudinary.com/dbhuezxh0/image/upload/v1774935695/Mentor_dvgns5_cumvsj.png",
          bio: "Precision and automation are the backbones of modern software. I teach the art of building unbreakable systems through rigorous testing.",
          rating: 4.9
        },
        {
          id: 4,
          name: "Divya Rani",
          role: "Software Development Lead",
          experience: "10+ Years",
          expertise: ["Software Architecture", "Clean Code", "Design Patterns"],
          studentsLabel: "1,800+ Mentored",
          image: "https://res.cloudinary.com/dbhuezxh0/image/upload/v1769142934/mentor-5_a4t9yq_xvspck.jpg",
          bio: "Coding is about solving problems elegantly. I focus on technical fundamentals and architectural patterns that define world-class engineers.",
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

                    <div className="grid md:grid-cols-2 gap-10 lg:gap-12 mb-32 max-w-6xl mx-auto">
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
                                        <div className="absolute top-6 left-6 flex flex-col gap-2">
                                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md shadow-lg text-[10px] font-black uppercase tracking-widest text-[#FD5A1A]">
                                                <Star className="w-3 h-3 fill-current" /> {trainer.rating} Rating
                                            </div>
                                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md shadow-lg text-[10px] font-black uppercase tracking-widest text-[#0075CF]">
                                                <Users className="w-3 h-3" /> {trainer.studentsLabel}
                                            </div>
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

                    <div className="max-w-6xl mx-auto bg-gradient-to-br from-[#0075CF] to-[#005CAD] rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-16 lg:p-20 text-white relative overflow-hidden shadow-2xl flex flex-col lg:flex-row items-center gap-12 lg:gap-16 border border-white/5">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[120px] -mr-64 -mt-64" />
                        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#FD5A1A]/20 rounded-full blur-[100px] -ml-48 -mb-48" />
                        
                        <div className="relative z-10 flex-1 space-y-6 md:space-y-8 text-center lg:text-left">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.2em]"
                            >
                                <Sparkles className="w-4 h-4 mr-2 text-[#FD5A1A]" />
                                JOIN OUR MENTOR PANEL
                            </motion.div>
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-6 leading-[1.1] tracking-tight">
                                Aspire to teach <br className="hidden md:block" />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0075CF] to-[#3391D9]">with us?</span>
                            </h2>
                            <p className="text-white/60 text-base md:text-lg font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
                                Share your industry expertise and empower the next generation of engineers. Our platform allows professionals to teach part-time or full-time with global reach.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start">
                                <button className="h-14 md:h-16 px-8 md:px-10 rounded-2xl bg-gradient-to-r from-[#FD5A1A] to-[#FF7A00] hover:shadow-[0_0_30px_rgba(253,90,26,0.3)] text-white font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 group whitespace-nowrap active:scale-95">
                                    Become Instructor <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                                </button>
                                <button className="h-14 md:h-16 px-8 md:px-10 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 text-white font-black uppercase tracking-widest transition-all hover:bg-white/10 active:scale-95 whitespace-nowrap">
                                    Mentor Program
                                </button>
                            </div>
                        </div>

                        <div className="relative z-10 grid grid-cols-2 gap-3 md:gap-4 w-full sm:w-auto shrink-0">
                            {[
                                { val: "50+", label: "Instructors", icon: Users },
                                { val: "100%", label: "Skilled", icon: BookOpen },
                                { val: "15+", label: "Industries", icon: GraduationCap },
                                { val: "24/7", label: "Support", icon: Mail }
                            ].map((stat, i) => (
                                <div key={i} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-5 md:p-6 text-center shadow-lg hover:-translate-y-1 transition-all duration-300 min-w-[140px] md:min-w-[160px]">
                                    <div className="w-10 h-10 md:w-12 md:h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/5">
                                        <stat.icon className="w-5 h-5 md:w-6 md:h-6 text-[#FD5A1A]" />
                                    </div>
                                    <div className="text-xl md:text-2xl font-black text-white">{stat.val}</div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-white/40 mt-1">{stat.label}</div>
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
