import { motion } from "framer-motion";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import LowPolyBackground from "@/components/landing/LowPolyBackground";
import { FileText, Gavel, Scale, ShieldCheck, UserPlus, Info, CreditCard } from "lucide-react";

const Terms = () => {
    const terms = [
        {
            title: "User Agreement",
            icon: UserPlus,
            content: "By accessing or using AOTMS LMS services, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, you may not access or use our platform. You must be at least 18 years old or under parental supervision to use our services."
        },
        {
            title: "Academic Integrity",
            icon: Scale,
            content: "We uphold the highest academic standards. Any form of cheating, plagiarism, or misuse of course materials is strictly prohibited. Engaging in such activities will result in immediate termination of access without refund and possible legal action."
        },
        {
            title: "Payment & Refunds",
            icon: CreditCard,
            content: "Payments made for course enrollments are non-refundable unless stated otherwise. If a course is canceled by us, a full refund will be processed within 10-15 business days. Installment plans must be followed strictly as per the agreed schedule."
        }
    ];

    return (
        <div className="min-h-screen relative overflow-x-hidden bg-white">
            <LowPolyBackground />
            <Header />

            <main className="relative z-10 pt-32 pb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Header Section */}
                    <div className="text-center max-w-3xl mx-auto mb-20 px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#0075CF]/10 border border-[#0075CF]/20 text-[#0075CF] text-[10px] font-black uppercase tracking-[0.2em] mb-6 shadow-sm"
                        >
                            <Gavel className="w-4 h-4 mr-2" />
                            LEGAL FRAMEWORK
                        </motion.div>
                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-6xl font-black text-slate-900 mb-6 leading-tight"
                        >
                            Terms <span className="text-[#0075CF]">of Service</span>
                        </motion.h1>
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-slate-500 text-lg sm:text-xl font-medium leading-relaxed"
                        >
                            Last Updated: April 1, 2026. Please read these terms carefully 
                            to understand your rights and responsibilities as a user of AOTMS LMS.
                        </motion.p>
                    </div>

                    <div className="max-w-4xl mx-auto space-y-12 mb-20 px-4">
                        {terms.map((term, idx) => (
                            <motion.section 
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="bg-white/80 backdrop-blur-md p-8 md:p-12 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 hover:border-[#0075CF]/20 transition-all duration-300"
                            >
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-50 text-[#0075CF] flex items-center justify-center shadow-inner border border-slate-100">
                                        <term.icon className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{term.title}</h2>
                                </div>
                                <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-p:leading-relaxed prose-p:font-medium prose-p:text-lg">
                                    <p>{term.content}</p>
                                    <p className="mt-4">
                                        You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. AOTMS reserves the right to modify these terms at any time without prior notice.
                                    </p>
                                </div>
                            </motion.section>
                        ))}

                        <div className="bg-gradient-to-br from-[#0075CF] to-[#005CAD] rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl shadow-[#0075CF]/20">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#FD5A1A]/20 rounded-full blur-3xl -ml-24 -mb-24" />
                            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 justify-between">
                                <div className="max-w-xl text-center md:text-left">
                                    <h3 className="text-2xl md:text-3xl font-black mb-4">Have Questions?</h3>
                                    <p className="text-white/70 font-medium text-lg">
                                        Our legal and support team is available to clarify any aspects of our service agreements.
                                    </p>
                                </div>
                                <button className="h-16 px-10 rounded-2xl bg-gradient-to-r from-[#FD5A1A] to-[#FF7A00] text-white font-black uppercase tracking-widest transition-all shadow-xl shadow-orange-900/40 active:scale-95 whitespace-nowrap">
                                    Contact Support
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

export default Terms;
