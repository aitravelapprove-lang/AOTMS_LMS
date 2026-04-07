import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  BookOpen,
  Send,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  course: z.string().min(1, "Please select a course"),
});

type FormData = z.infer<typeof formSchema>;

const EnrollmentForm = () => {
  const [isFocused, setIsFocused] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/public/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to submit enrollment');
      }

      toast.success("Success! Your journey with AOTMS has begun.");
      reset();
    } catch (error) {
      console.error("Enrollment Error:", error);
      toast.error("Something went wrong. Please try again later.");
    }
  };

  return (
    <section
      id="enroll"
      className="relative py-24 lg:py-32 overflow-hidden bg-white"
    >
      {/* Premium Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#0075CF]/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#FD5A1A]/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/4" />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(#0075CF 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="container-width px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16 md:mb-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-slate-50 border border-slate-100 text-[#0075CF] text-[10px] font-black uppercase tracking-[0.25em] mb-6 shadow-sm"
            >
              <Zap className="w-3.5 h-3.5 fill-[#0075CF]/20" /> Accelerated
              Enrollment
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-7xl font-black text-slate-950 mb-7 leading-[0.95] tracking-tighter"
            >
              Start Your <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0075CF] via-[#00aaff] to-[#FD5A1A]">
                Learning Journey Today
              </span>
              .
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-medium"
            >
              Transform your aspirations into a career-defining reality. Join
              2000+ graduates who have launched their futures through AOTMS.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            {/* Left Content: Trust & Benefits */}
            <div className="lg:col-span-5 space-y-10 py-4">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-8"
              >
                {[
                  {
                    icon: CheckCircle2,
                    title: "Curriculum Excellence",
                    desc: "Industry-mapped tracks updated every 90 days for current tech requirements.",
                    color: "bg-blue-50 text-[#0075CF]",
                  },
                  {
                    icon: ShieldCheck,
                    title: "Career Assurance",
                    desc: "Dedicated placement cell connecting you with 100+ MNC hiring partners.",
                    color: "bg-orange-50 text-[#FD5A1A]",
                  },
                  {
                    icon: Sparkles,
                    title: "Elite Mentorship",
                    desc: "Learn directly from tech leads and architects from top firms.",
                    color: "bg-blue-50 text-[#0075CF]",
                  },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ x: 10 }}
                    className="flex gap-5 group cursor-default"
                  >
                    <div
                      className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center flex-shrink-0 shadow-sm transition-transform group-hover:scale-110 group-hover:rotate-3`}
                    >
                      <item.icon className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-900 mb-1 tracking-tight">
                        {item.title}
                      </h4>
                      <p className="text-slate-500 font-medium leading-normal text-sm">
                        {item.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Trust Badge Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-slate-950 rounded-[2rem] p-8 text-white relative overflow-hidden group shadow-2xl shadow-blue-900/20"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#0075CF]/20 blur-3xl rounded-full group-hover:bg-[#FD5A1A]/20 transition-colors duration-700" />
                <div className="relative z-10 flex items-center gap-6">
                  <div className="w-16 h-16 rounded-full border-2 border-white/20 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-8 h-8 text-[#FD5A1A]" />
                  </div>
                  <div>
                    <p className="text-2xl font-black tracking-tight mb-0.5">
                      85% Success Rate
                    </p>
                    <p className="text-xs font-bold text-white/50 uppercase tracking-widest">
                      Average Graduate Salary Increase
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Side: Premium Glass Form */}
            <div className="lg:col-span-7">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative group "
              >
                {/* Visual Accent Layer */}
                <div className="absolute -inset-1 bg-gradient-to-r from-[#0075CF]/20 via-[#FD5A1A]/20 to-[#0075CF]/20 rounded-[3rem] blur-xl opacity-50 group-hover:opacity-100 transition duration-1000" />

                <div className="relative bg-white/70 backdrop-blur-2xl border border-white rounded-[3rem] p-10 md:p-14 shadow-2xl overflow-hidden">
                  {/* Subtle Grainy Overlay */}
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" />

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Name input */}
                      <div className="space-y-3">
                        <motion.label
                          animate={{
                            color: isFocused === "name" ? "#0075CF" : "#94a3b8",
                          }}
                          className="text-[10px] font-black uppercase tracking-[0.2em] ml-2"
                        >
                          Identity
                        </motion.label>
                        <div className="relative">
                          <User
                            className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-all duration-300 ${isFocused === "name" ? "text-[#0075CF] scale-110" : "text-slate-300"}`}
                          />
                          <Input
                            {...register("name")}
                            onFocus={() => setIsFocused("name")}
                            onBlur={() => setIsFocused(null)}
                            placeholder="Your full name"
                            className="pl-14 h-16 rounded-2xl bg-white/50 border-slate-100 focus:border-[#0075CF] focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all duration-300 text-slate-900 font-bold placeholder:text-slate-300 border-2"
                          />
                          <AnimatePresence>
                            {errors.name && (
                              <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="text-red-500 text-[9px] mt-2 ml-2 font-black uppercase tracking-tighter italic"
                              >
                                {errors.name.message}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* Email input */}
                      <div className="space-y-3">
                        <motion.label
                          animate={{
                            color:
                              isFocused === "email" ? "#0075CF" : "#94a3b8",
                          }}
                          className="text-[10px] font-black uppercase tracking-[0.2em] ml-2"
                        >
                          Communication
                        </motion.label>
                        <div className="relative">
                          <Mail
                            className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-all duration-300 ${isFocused === "email" ? "text-[#0075CF] scale-110" : "text-slate-300"}`}
                          />
                          <Input
                            {...register("email")}
                            onFocus={() => setIsFocused("email")}
                            onBlur={() => setIsFocused(null)}
                            placeholder="Email address"
                            className="pl-14 h-16 rounded-2xl bg-white/50 border-slate-100 focus:border-[#0075CF] focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all duration-300 text-slate-900 font-bold placeholder:text-slate-300 border-2"
                          />
                          <AnimatePresence>
                            {errors.email && (
                              <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="text-red-500 text-[9px] mt-2 ml-2 font-black uppercase tracking-tighter italic"
                              >
                                {errors.email.message}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Phone input */}
                      <div className="space-y-3">
                        <motion.label
                          animate={{
                            color:
                              isFocused === "phone" ? "#FD5A1A" : "#94a3b8",
                          }}
                          className="text-[10px] font-black uppercase tracking-[0.2em] ml-2"
                        >
                          Contact Mobile
                        </motion.label>
                        <div className="relative">
                          <Phone
                            className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-all duration-300 ${isFocused === "phone" ? "text-[#FD5A1A] scale-110" : "text-slate-300"}`}
                          />
                          <Input
                            {...register("phone")}
                            onFocus={() => setIsFocused("phone")}
                            onBlur={() => setIsFocused(null)}
                            placeholder="+91 Phone number"
                            className="pl-14 h-16 rounded-2xl bg-white/50 border-slate-100 focus:border-[#FD5A1A] focus:bg-white focus:ring-4 focus:ring-orange-500/5 transition-all duration-300 text-slate-900 font-bold placeholder:text-slate-300 border-2"
                          />
                          <AnimatePresence>
                            {errors.phone && (
                              <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="text-red-500 text-[9px] mt-2 ml-2 font-black uppercase tracking-tighter italic"
                              >
                                {errors.phone.message}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* Course select */}
                      <div className="space-y-3">
                        <motion.label
                          animate={{
                            color:
                              isFocused === "course" ? "#0075CF" : "#94a3b8",
                          }}
                          className="text-[10px] font-black uppercase tracking-[0.2em] ml-2"
                        >
                          Career Path
                        </motion.label>
                        <div className="relative group">
                          <BookOpen
                            className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 z-10 transition-all duration-300 ${isFocused === "course" ? "text-[#0075CF] scale-110" : "text-slate-300"}`}
                          />
                          <Select
                            onValueChange={(v) => {
                              setValue("course", v);
                              setIsFocused("course");
                            }}
                            onOpenChange={(open) => !open && setIsFocused(null)}
                          >
                            <SelectTrigger className="pl-14 h-16 rounded-2xl bg-white/50 border-slate-100 focus:border-[#0075CF] focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all duration-300 text-slate-900 font-bold border-2">
                              <SelectValue placeholder="Target specialized track" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-slate-100 shadow-2xl p-2">
                              <SelectItem
                                className="rounded-xl py-3 font-bold focus:bg-blue-50 focus:text-primary transition-colors"
                                value="fullstack"
                              >
                                Web Application Core (MERN)
                              </SelectItem>
                              <SelectItem
                                className="rounded-xl py-3 font-bold focus:bg-blue-50 focus:text-primary transition-colors"
                                value="datascience"
                              >
                                Data Intelligence & AI
                              </SelectItem>
                              <SelectItem
                                className="rounded-xl py-3 font-bold focus:bg-blue-50 focus:text-primary transition-colors"
                                value="cloud"
                              >
                                Cloud Architecture & AWS
                              </SelectItem>
                              <SelectItem
                                className="rounded-xl py-3 font-bold focus:bg-blue-50 focus:text-primary transition-colors"
                                value="cyber"
                              >
                                Advanced Cyber Resilience
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <AnimatePresence>
                            {errors.course && (
                              <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="text-red-500 text-[9px] mt-2 ml-2 font-black uppercase tracking-tighter italic"
                              >
                                {errors.course.message}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>

                    {/* Submit CTA */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="relative w-full h-20 rounded-[2rem] bg-gradient-to-r from-[#0075CF] via-[#00aaff] to-[#FD5A1A] animate-gradient-xy overflow-hidden shadow-[0_20px_50px_rgba(0,117,207,0.3)] hover:shadow-[0_25px_60px_rgba(253,90,26,0.4)] transition-all duration-500 disabled:opacity-70 group/btn"
                      >
                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" />
                        <span className="relative z-10 flex items-center justify-center gap-4 text-xl font-black text-white tracking-widest uppercase">
                          {isSubmitting ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                            >
                              <Sparkles className="w-8 h-8" />
                            </motion.div>
                          ) : (
                            <>
                              Transform My Career
                              <ArrowRight className="w-6 h-6 group-hover/btn:translate-x-3 transition-transform duration-500" />
                            </>
                          )}
                        </span>
                      </Button>
                    </motion.div>

                    <div className="flex items-center justify-center gap-8 pt-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Free Demo Class
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Expert Consultation
                        </span>
                      </div>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EnrollmentForm;
