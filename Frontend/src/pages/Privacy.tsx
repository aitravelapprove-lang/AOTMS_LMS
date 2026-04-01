import { motion } from "framer-motion";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import LowPolyBackground from "@/components/landing/LowPolyBackground";
import { Shield, Lock, Eye, EyeOff, FileText, UserCheck, ShieldCheck } from "lucide-react";

const Privacy = () => {
    const sections = [
        {
            title: "Information Collection",
            icon: Eye,
            content: "We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us. This information may include name, email, phone number, postal address, profile picture, payment method, and other information you choose to provide."
        },
        {
            title: "Data Protection",
            icon: Lock,
            content: "We take the security of your data seriously. AOTMS uses industry-standard encryption protocols (SSL/TLS) to protect your personal information during transmission. We also implement stringent access controls and regular security audits to ensure your data remains protected from unauthorized access or disclosure."
        },
        {
            title: "How We Use Your Data",
            icon: UserCheck,
            content: "We use the information we collect to provide, maintain, and improve our services, such as to facilitate course enrolments, process payments, send you technical notices, updates, security alerts, and support and administrative messages. We also use it to personalize your learning experience and track your progress."
        },
        {
            title: "Compliance & Safety",
            icon: ShieldCheck,
            content: "We may disclose your information if we believe it is required by applicable law, regulation, operating agreement, legal process or governmental request, or where the disclosure is otherwise appropriate due to safety or similar concerns."
        }
    ];

    return (
        <div className="min-h-screen relative overflow-x-hidden bg-white">
            <LowPolyBackground />
            <Header />

            <main className="relative z-10 pt-32 pb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Hero Section */}
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em] mb-6"
                        >
                            <Shield className="w-4 h-4 mr-2" />
                            TRUST & PRIVACY
                        </motion.div>
                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-6xl font-black text-slate-900 mb-6 leading-tight"
                        >
                            Privacy <span className="text-[#0075CF]">Policy</span>
                        </motion.h1>
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-slate-500 text-lg font-medium leading-relaxed"
                        >
                            Last Updated: April 1, 2026. Your privacy is our priority. 
                            Understand how we handle and protect your personal information at AOTMS.
                        </motion.p>
                    </div>

                    <div className="grid lg:grid-cols-4 gap-12">
                        {/* Sidebar */}
                        <div className="hidden lg:block">
                            <div className="sticky top-32 space-y-4">
                                <p className="text-xs font-black uppercase tracking-widest text-[#0075CF] mb-4">ON THIS PAGE</p>
                                {sections.map((section, idx) => (
                                    <a 
                                        key={idx} 
                                        href={`#section-${idx}`}
                                        className="block text-sm font-bold text-slate-500 hover:text-[#0075CF] transition-colors py-2 border-l-2 border-transparent hover:border-[#0075CF] pl-4"
                                    >
                                        {section.title}
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="lg:col-span-3 space-y-16">
                            {sections.map((section, idx) => (
                                <motion.section 
                                    key={idx}
                                    id={`section-${idx}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="bg-white/80 backdrop-blur-md p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100"
                                >
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 rounded-2xl bg-[#E6F2FA] text-[#0075CF] flex items-center justify-center">
                                            <section.icon className="w-6 h-6" />
                                        </div>
                                        <h2 className="text-2xl font-black text-slate-900">{section.title}</h2>
                                    </div>
                                    <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-p:leading-relaxed prose-p:font-medium prose-p:text-lg">
                                        <p>{section.content}</p>
                                        <p className="mt-4">
                                            We follow strict industry standards to ensure full compliance with global data protection regulations (GDPR/APD) and local laws in India. 
                                            Our infrastructure is monitored 24/7 for any unusual activity.
                                        </p>
                                    </div>
                                </motion.section>
                            ))}

                            <div className="bg-[#0075CF] rounded-[3rem] p-12 text-white text-center relative overflow-hidden shadow-2xl">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
                                <h3 className="text-3xl font-black mb-6">Security Question?</h3>
                                <p className="text-white/80 font-medium mb-10 max-w-2xl mx-auto text-lg leading-relaxed">
                                    If you have concerns about your data or want to request a data deletion, contact our Data Security Officer at 
                                    <strong className="text-white block mt-2 text-xl underline-offset-4 underline decoration-[#FD5A1A]/40">Security@aotms.in</strong>
                                </p>
                                <button className="px-10 h-16 rounded-2xl bg-white text-[#0075CF] font-black uppercase tracking-widest hover:shadow-2xl hover:scale-105 transition-all">
                                    Download Full PDF
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Privacy;
