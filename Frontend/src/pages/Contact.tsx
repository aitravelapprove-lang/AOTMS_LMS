import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageSquare,
  Clock,
  ArrowRight,
  ChevronDown,
  BookOpen,
  User,
} from "lucide-react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import LowPolyBackground from "@/components/landing/LowPolyBackground";

const Contact = () => {
  const contactInfo = [
    {
      icon: Phone,
      title: "Phone Support",
      details: "+91 80199 52233",
      sub: "Mon - Sat: 9 AM - 8 PM",
      color: "bg-[#0075CF]",
      link: "tel:+918019952233",
    },
    {
      icon: Mail,
      title: "Email Inquiry",
      details: "Info@aotms.in",
      sub: "24/7 Support Response",
      color: "bg-[#FD5A1A]",
      link: "mailto:Info@aotms.in",
    },
    {
      icon: MapPin,
      title: "Main Campus",
      details: "Pothuri Towers, MG Rd",
      sub: "Vijayawada, AP 520010",
      color: "bg-slate-900",
      link: "https://maps.app.goo.gl/TfWZLrSgHVzRruKv7",
    },
  ];

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-white">
      <LowPolyBackground />
      <Header />

      <main className="relative z-10 pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="text-center max-w-3xl mx-auto mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#0075CF]/10 border border-[#0075CF]/20 text-[#0075CF] text-[10px] font-black uppercase tracking-[0.2em] mb-6"
            >
              GET IN TOUCH
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-7xl font-black text-slate-900 mb-6 leading-[1.05] tracking-tight font-heading"
            >
              Get in{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0075CF] to-[#FD5A1A]">
                Touch
              </span>
              .
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-slate-600 text-lg font-medium leading-relaxed"
            >
              Have questions about our courses, placements, or enrollment? Our
              team is here to guide you toward your tech career goals.
            </motion.p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-20">
            {contactInfo.map((info, idx) => (
              <motion.a
                key={idx}
                href={info.link}
                target={info.icon === MapPin ? "_blank" : "_self"}
                rel={info.icon === MapPin ? "noopener noreferrer" : ""}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
                className="group relative bg-white/70 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-200 hover:border-[#0075CF] hover:shadow-2xl hover:shadow-[#0075CF]/10 transition-all duration-500 overflow-hidden"
              >
                <div
                  className={`w-14 h-14 rounded-2xl ${info.color} flex items-center justify-center text-white mb-6 shadow-lg rotate-3 group-hover:rotate-0 transition-transform duration-500`}
                >
                  <info.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {info.title}
                </h3>
                <p className="text-lg font-black text-slate-800 mb-1">
                  {info.details}
                </p>
                <p className="text-sm font-medium text-slate-500">{info.sub}</p>
                <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-5 h-5 text-[#0075CF]" />
                </div>
              </motion.a>
            ))}
          </div>

          {/* Google Maps Section */}
          <div className="mb-20 rounded-[3rem] overflow-hidden shadow-2xl border border-slate-100 h-[350px] md:h-[500px] relative z-10 bg-slate-100">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3825.5237806079026!2d80.6485184!3d16.4996341!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a35fb43b8f6af1d%3A0x18151e18505cbaf8!2sAcademy%20Of%20Tech%20Masters!5e0!3m2!1sen!2sin!4v1775024509855!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="AOTMS Academy Location"
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Contact Form Wrapper - Premium Branded Border */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative p-0.5 rounded-[3.5rem] bg-gradient-to-br from-[#0075CF] via-white to-[#FD5A1A]/30 shadow-[0_32px_64px_-16px_rgba(0,117,207,0.15)] group"
            >
              <div className="bg-white/95 backdrop-blur-3xl p-8 md:p-14 rounded-[calc(3.5rem-2px)] relative overflow-hidden">
                {/* Visual Decorative Layer */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0075CF] to-[#FD5A1A]" />
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#0075CF]/5 blur-[80px] rounded-full" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#FD5A1A]/5 blur-[80px] rounded-full" />

                <div className="mb-12 relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-1 w-10 bg-[#0075CF] rounded-full" />
                    <span className="text-[10px] font-black text-[#0075CF] uppercase tracking-[0.3em]">Direct Channel</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tighter leading-none">
                    Start a <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0075CF] to-[#FD5A1A]">Conversation</span>.
                  </h2>
                  <p className="text-slate-500 font-medium leading-relaxed max-w-sm">
                    Have a vision or a question? Our team translates your goals into a learning roadmap.
                  </p>
                </div>

                <form className="space-y-8 relative z-10" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Name field */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Your Name</label>
                      <div className="relative group/field transition-all">
                        <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within/field:text-[#0075CF] group-focus-within/field:scale-110 transition-all duration-300" />
                        <input
                          type="text"
                          placeholder="Full Name"
                          className="w-full h-16 pl-14 pr-6 rounded-2xl bg-slate-50/50 border-2 border-slate-100 focus:border-[#0075CF] focus:bg-white focus:shadow-[0_0_20px_rgba(0,117,207,0.05)] focus:outline-none transition-all duration-300 font-bold text-slate-900 placeholder:text-slate-300"
                        />
                      </div>
                    </div>

                    {/* Email field */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Email Identity</label>
                      <div className="relative group/field transition-all">
                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within/field:text-[#0075CF] group-focus-within/field:scale-110 transition-all duration-300" />
                        <input
                          type="email"
                          placeholder="john@example.com"
                          className="w-full h-16 pl-14 pr-6 rounded-2xl bg-slate-50/50 border-2 border-slate-100 focus:border-[#0075CF] focus:bg-white focus:shadow-[0_0_20px_rgba(0,117,207,0.05)] focus:outline-none transition-all duration-300 font-bold text-slate-900 placeholder:text-slate-300"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Subject Selection */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Enquiry Category</label>
                    <div className="relative group/field transition-all">
                      <BookOpen className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within/field:text-[#0075CF] group-focus-within/field:scale-110 transition-all duration-300 z-10" />
                      <select className="w-full h-16 pl-14 pr-10 rounded-2xl bg-slate-50/50 border-2 border-slate-100 focus:border-[#0075CF] focus:bg-white focus:shadow-[0_0_20px_rgba(0,117,207,0.05)] focus:outline-none transition-all duration-300 font-bold text-slate-900 appearance-none">
                        <option>General Inquiry</option>
                        <option>Course Admissions</option>
                        <option>Corporate Training</option>
                        <option>Placement Support</option>
                        <option>Technical Support</option>
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <ChevronDown className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  {/* Message Textarea */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Your Thoughts</label>
                    <div className="relative group/field transition-all">
                      <MessageSquare className="absolute left-5 top-6 w-5 h-5 text-slate-300 group-focus-within/field:text-[#FD5A1A] group-focus-within/field:scale-110 transition-all duration-300" />
                      <textarea
                        rows={5}
                        placeholder="How can we help you achieve your goals?"
                        className="w-full p-6 pl-14 rounded-3xl bg-slate-50/50 border-2 border-slate-100 focus:border-[#FD5A1A] focus:bg-white focus:shadow-[0_0_20px_rgba(253,90,26,0.05)] focus:outline-none transition-all duration-300 font-bold text-slate-900 placeholder:text-slate-300 resize-none leading-relaxed"
                      ></textarea>
                    </div>
                  </div>

                  {/* Submit Action */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full h-20 bg-gradient-to-r from-[#0075CF] to-[#FD5A1A] hover:shadow-[0_20px_50px_rgba(0,117,207,0.3)] text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm overflow-hidden transition-all flex items-center justify-center gap-4 relative group/btn"
                  >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                    <span className="relative z-10 flex items-center gap-4">
                      Send Message
                      <Send className="w-5 h-5 transition-transform group-hover/btn:translate-x-2 group-hover/btn:-translate-y-2 duration-300" />
                    </span>
                  </motion.button>

                  <p className="text-center text-[9px] font-black text-slate-300 uppercase tracking-widest">
                    Data Privacy Protected • Encrypted Connection
                  </p>
                </form>
              </div>
            </motion.div>

            {/* Additional Info */}
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gradient-to-br from-[#0075CF] to-[#005CAD] rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-[#0075CF]/20"
              >
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl" />

                <MessageSquare className="w-12 h-12 mb-6 text-orange-400" />
                <h3 className="text-2xl font-black mb-4">
                  Fastest Response Guarantee
                </h3>
                <p className="text-white/80 font-medium leading-relaxed mb-6">
                  We value your time. Our dedicated counselor team ensures that
                  every student query is addressed within 2 hours during
                  business schedules.
                </p>
                <div className="flex items-center gap-3 text-sm font-bold">
                  <Clock className="w-5 h-5 text-orange-400" />
                  Avg. Response Time: 45 Mins
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-slate-50 rounded-[3rem] p-10 border border-slate-100"
              >
                <h3 className="text-xl font-bold text-slate-900 mb-6">
                  Our Institute Location
                </h3>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <MapPin className="w-5 h-5 text-[#FD5A1A]" />
                    <div>
                      <p className="font-bold text-slate-800">
                        Academy of Tech Masters
                      </p>
                      <p className="text-sm text-slate-500">
                        2nd Floor, Pothuri Towers, MG Rd
                      </p>
                      <p className="text-sm text-slate-500">
                        Vijayawada, Andhra Pradesh 520010
                      </p>
                    </div>
                  </div>
                  <a
                    href="https://maps.app.goo.gl/TfWZLrSgHVzRruKv7"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-[#0075CF] font-black text-xs uppercase tracking-widest mt-2 hover:underline"
                  >
                    View on Google Maps
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
