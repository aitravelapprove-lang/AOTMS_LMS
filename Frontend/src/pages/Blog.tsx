import { motion } from "framer-motion";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import LowPolyBackground from "@/components/landing/LowPolyBackground";
import { Search, Calendar, ChevronRight, ArrowUpRight, MessageSquare, Heart, Clock, Bookmark, Sparkles } from "lucide-react";

interface Post {
    id: number;
    title: string;
    category: string;
    author: string;
    date: string;
    readTime: string;
    excerpt: string;
    image: string;
    tag: string;
}

const Blog = () => {
    const categories = ["All Tech", "Success Stories", "Dev Tips", "AI & Data", "Industry News"];
    
    const posts: Post[] = [
        {
            id: 1,
            title: "How to Build a Portfolio that Actually Gets You Hired in 2026",
            category: "Career Support",
            author: "Pavan Kumar",
            date: "Mar 28, 2026",
            readTime: "8 min read",
            excerpt: "Learn the specific strategies the top 1% of graduates use to land six-figure roles in modern tech environments...",
            image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800",
            tag: "High Growth"
        },
        {
            id: 2,
            title: "10 Reasons Why Full Stack Development is the Future of Tech Education",
            category: "Dev Tips",
            author: "Ananya Sharma",
            date: "Mar 25, 2026",
            readTime: "6 min read",
            excerpt: "From AI-powered IDEs to serverless scaling, why being a full stack engineer is more valuable than ever before...",
            image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80&w=800",
            tag: "Must Read"
        },
        {
            id: 3,
            title: "From Student to Software Engineer: AOTMS Alumni Success Story",
            category: "Success Stories",
            author: "Sandeep Das",
            date: "Mar 20, 2026",
            readTime: "12 min read",
            excerpt: "Venkatesh shares his journey from a complete beginner to a lead developer at a top-tier MNC with AOTMS...",
            image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800",
            tag: "Inspiring"
        }
    ];

    return (
        <div className="min-h-screen relative overflow-x-hidden bg-white">
            <LowPolyBackground />
            <Header />

            <main className="relative z-10 pt-32 pb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Hero Section */}
                    <div className="text-center max-w-4xl mx-auto mb-20 px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#0075CF]/10 border border-[#0075CF]/20 text-[#0075CF] text-[10px] font-black uppercase tracking-[0.2em] mb-6 shadow-sm"
                        >
                            <Sparkles className="w-4 h-4 mr-2" />
                            AOTMS TECH BLOG
                        </motion.div>
                        <h1 className="text-4xl md:text-7xl font-black text-slate-900 mb-6 leading-tight tracking-[0.01em] font-heading">
                            Insight, Innovation & <span className="text-[#0075CF]">Inspiration</span>
                        </h1>
                        <p className="text-slate-500 text-lg md:text-xl font-medium leading-relaxed max-w-2xl mx-auto mb-12">
                            Stay up to date with the latest industry trends, student stories, 
                            and professional development tips from our academy experts.
                        </p>

                        {/* Search & Categories Bar */}
                        <div className="bg-slate-50/80 backdrop-blur-md p-4 rounded-[2.5rem] border border-slate-100 flex flex-col md:flex-row items-center gap-4 shadow-2xl shadow-slate-200/50 max-w-5xl mx-auto">
                            <div className="relative flex-1 group w-full md:w-auto">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-[#0075CF] transition-colors" />
                                <input 
                                    type="text" 
                                    placeholder="Search articles..."
                                    className="w-full h-14 pl-14 pr-6 rounded-[1.5rem] bg-white border border-slate-100 focus:outline-none focus:border-[#0075CF] transition-all font-bold text-sm tracking-tight"
                                />
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide w-full md:w-auto justify-center">
                                {categories.map((cat, idx) => (
                                    <button 
                                        key={idx}
                                        className={`px-6 h-12 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${idx === 0 ? "bg-[#0075CF] text-white shadow-lg shadow-blue-500/20" : "bg-white text-slate-500 border border-slate-100 hover:text-[#0075CF] hover:border-[#0075CF]"}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-10 mb-20">
                        {posts.map((post, idx) => (
                            <motion.article
                                key={post.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="group bg-white rounded-[2.5rem] border border-slate-100 hover:border-[#0075CF]/20 overflow-hidden shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-[#0075CF]/10 transition-all duration-500"
                            >
                                <div className="relative h-64 overflow-hidden">
                                    <img 
                                        src={post.image} 
                                        alt={post.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute top-6 left-6 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-[#0075CF] text-[10px] font-black uppercase tracking-widest shadow-lg">
                                        {post.tag}
                                    </div>
                                    <button className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center hover:bg-white hover:text-[#0075CF] transition-all">
                                        <Bookmark className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="p-8">
                                    <div className="flex items-center gap-3 mb-4 text-[10px] font-black uppercase tracking-[0.15em] text-[#FD5A1A]">
                                        <span className="px-3 py-1 rounded-full bg-[#FD5A1A]/10">{post.category}</span>
                                        <div className="flex items-center gap-1 text-slate-400">
                                            <Calendar className="w-3 h-3" /> {post.date}
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 mb-4 leading-snug group-hover:text-[#0075CF] transition-colors line-clamp-2">
                                        {post.title}
                                    </h3>
                                    <p className="text-slate-500 font-medium text-sm leading-relaxed mb-8 line-clamp-3 text-balance">
                                        {post.excerpt}
                                    </p>
                                    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                                                <Heart className="w-4 h-4 hover:text-red-500 cursor-pointer" /> 124
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                                                <MessageSquare className="w-4 h-4 hover:text-[#0075CF] cursor-pointer" /> 18
                                            </div>
                                        </div>
                                        <button className="flex items-center gap-1.5 text-[#0075CF] text-[10px] font-black uppercase tracking-widest hover:gap-2.5 transition-all">
                                            READ POST <ArrowUpRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </motion.article>
                        ))}
                    </div>

                    {/* Newsletter / Subscription Section */}
                    <div className="bg-gradient-to-br from-[#0075CF] to-[#005CAD] rounded-[3.5rem] p-10 md:p-20 relative overflow-hidden text-center shadow-2xl shadow-[#0075CF]/20">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -mr-48 -mt-48" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#FD5A1A]/20 rounded-full blur-[80px] -ml-32 -mb-32" />
                        
                        <div className="relative z-10 max-w-2xl mx-auto">
                            <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight tracking-tight font-heading">Master Tech Every Week</h2>
                            <p className="text-white/80 text-lg md:text-xl font-medium mb-12 leading-relaxed">
                                Get the latest blog posts and exclusive career guides delivered straight to your inbox. No spam, only insights.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                                <input 
                                    type="email" 
                                    placeholder="Enter your work email"
                                    className="flex-1 h-16 px-8 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-[#FD5A1A] font-bold transition-all text-sm"
                                />
                                <button className="h-16 px-10 rounded-2xl bg-gradient-to-r from-[#FD5A1A] to-[#FF7A00] text-white font-black uppercase tracking-widest shadow-xl shadow-orange-500/20 transition-all hover:scale-105 active:scale-95 whitespace-nowrap">
                                    Join List
                                </button>
                            </div>
                            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mt-8">
                                Joined by 4,500+ future builders in Vijayawada
                            </p>
                        </div>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Blog;
