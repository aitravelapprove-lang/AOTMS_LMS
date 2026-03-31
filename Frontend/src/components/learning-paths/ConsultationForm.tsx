import { motion } from "framer-motion";
import {
  Send,
  Zap,
  Cpu,
  ShieldCheck,
  Mail,
  User,
  Phone,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const ConsultationForm = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Inquiry Transmitted",
        description:
          "Your career consultation request has been securely received. Our tech mentors will reach out within 24 hours.",
        className: "bg-[#0075CF] text-white border-none rounded-2xl shadow-2xl",
      });
    }, 1500);
  };

  return (
    <section className="relative py-24 lg:py-40 bg-transparent overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#0075CF]/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* Left Column: Tech Copy */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4 shadow-sm border border-slate-100">
                <span className="w-2 h-2 rounded-full bg-[#FD5A1A] animate-ping" />
                Secure Portal
              </div>

              <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-950 leading-[1.05] tracking-tighter">
                Map Your <span className="text-[#0075CF]">Future</span> <br />
                <span className="text-[#FD5A1A]">Engineered</span> Success.
              </h2>

              <p className="text-slate-500 text-lg md:text-xl leading-relaxed font-medium max-w-xl">
                Not sure which path to choose? Connect with our Lead Architects
                for a data-driven career blueprint tailored to your aspirations.
              </p>

              <div className="space-y-6 pt-4">
                {[
                  {
                    icon: Cpu,
                    text: "Personalized Skill Gap Analysis",
                    color: "text-[#0075CF]",
                  },
                  {
                    icon: Zap,
                    text: "Industry Trend Forecasting",
                    color: "text-[#FD5A1A]",
                  },
                  {
                    icon: ShieldCheck,
                    text: "Verified Career Roadmap",
                    color: "text-[#0075CF]",
                  },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-4 group"
                  >
                    <div
                      className={`w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform ${item.color}`}
                    >
                      <item.icon className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-slate-700 tracking-tight">
                      {item.text}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right Column: The Techy Form */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative group p-1"
            >
              {/* Animated Glow Border */}
              <div className="absolute -inset-1 bg-gradient-to-r from-[#0075CF] via-[#FD5A1A] to-[#0075CF] rounded-[3rem] opacity-20 blur-xl group-hover:opacity-40 transition-opacity duration-1000" />

                <div className="relative bg-white border border-slate-300 rounded-[2.9rem] p-8 md:p-12 shadow-2xl overflow-hidden">
                  {/* Visual ID Tag */}
                  <div className="absolute top-0 right-0 px-6 py-2 bg-slate-100 border-b border-l border-slate-300 rounded-bl-2xl">
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                      FORM: AOTMS-001
                    </span>
                  </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-700 uppercase tracking-widest ml-1">
                        Full Identity
                      </label>
                      <div className="relative group/field">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within/field:text-[#0075CF] transition-colors" />
                        <Input
                          required
                          placeholder="Your Legal Name"
                          className="pl-12 h-14 rounded-2xl bg-slate-100/50 border-slate-300 focus:border-[#0075CF] focus:ring-[#0075CF]/20 font-bold transition-all placeholder:text-slate-500 text-slate-900"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-700 uppercase tracking-widest ml-1">
                        Communication Relay
                      </label>
                      <div className="relative group/field">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within/field:text-[#FD5A1A] transition-colors" />
                        <Input
                          required
                          type="email"
                          placeholder="example@aotms.com"
                          className="pl-12 h-14 rounded-2xl bg-slate-100/50 border-slate-300 focus:border-[#FD5A1A] focus:ring-[#FD5A1A]/20 font-bold transition-all placeholder:text-slate-500 text-slate-900"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-700 uppercase tracking-widest ml-1">
                        Phone Signal
                      </label>
                      <div className="relative group/field">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within/field:text-[#0075CF] transition-colors" />
                        <Input
                          required
                          type="tel"
                          placeholder="+91 - XXXXX - XXXXX"
                          className="pl-12 h-14 rounded-2xl bg-slate-100/50 border-slate-300 focus:border-[#0075CF] focus:ring-[#0075CF]/20 font-bold transition-all placeholder:text-slate-500 text-slate-900"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-700 uppercase tracking-widest ml-1">
                        Target Trajectory
                      </label>
                      <select className="flex h-14 w-full rounded-2xl border border-slate-300 bg-slate-100/50 px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#FD5A1A]/20 focus:border-[#FD5A1A] disabled:cursor-not-allowed disabled:opacity-50 transition-all appearance-none cursor-pointer text-slate-900">
                        <option>Choose Desired Program</option>
                        <option>Full Stack Developer</option>
                        <option>Data Science & AI</option>
                        <option>Python Developer</option>
                        <option>Frontend Master</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-700 uppercase tracking-widest ml-1">
                      Mission Requirement (Optional)
                    </label>
                    <textarea
                      placeholder="Briefly describe your career goals and technical interest..."
                      className="w-full min-h-[120px] rounded-[2rem] bg-slate-100/50 border border-slate-300 p-6 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#0075CF]/20 focus:border-[#0075CF] transition-all placeholder:text-slate-500 text-slate-900"
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading}
                    className="w-full h-16 rounded-[2rem] bg-gradient-to-r from-[#0075CF] to-[#3391D9] text-white font-black uppercase tracking-[0.2em] text-[13px] flex items-center justify-center gap-3 shadow-xl hover:shadow-[#0075CF]/30 transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <Zap className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Initialize Consultation
                        <Send className="w-5 h-5" />
                      </>
                    )}
                  </motion.button>

                  <div className="flex items-center justify-center gap-2 pt-4">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      Secure Signal — End-to-End Encryption
                    </span>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConsultationForm;
