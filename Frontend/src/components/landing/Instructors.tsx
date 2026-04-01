import { motion } from "framer-motion";
import { Users, Sparkles } from "lucide-react";
import { TestimonialSlider } from "@/components/ui/testimonial-slider-1";

const mentors = [
  {
    id: 1,
    name: "V. Adilakshmi",
    affiliation: "Data Analytics Expert • 8+ Yrs Exp",
    quote:
      "Empowering students with the power of data. My goal is to bridge the gap between complex algorithms and real-world business insights.",
    imageSrc:
      "https://res.cloudinary.com/dbhuezxh0/image/upload/v1769142934/mentos-1_ch1jur_yyy4gk.jpg",
    thumbnailSrc:
      "https://res.cloudinary.com/dbhuezxh0/image/upload/v1769142934/mentos-1_ch1jur_yyy4gk.jpg",
  },
  {
    id: 2,
    name: "Intiaz Shaik",
    affiliation: "Cyber Security Specialist • 6+ Yrs Exp",
    quote:
      "In the digital age, security is not an option—it's a necessity. I mentor the next generation of ethical hackers to secure our global future.",
    imageSrc:
      "https://res.cloudinary.com/dbhuezxh0/image/upload/v1769142934/mentos-2_hod2iu_stcqlv.jpg",
    thumbnailSrc:
      "https://res.cloudinary.com/dbhuezxh0/image/upload/v1769142934/mentos-2_hod2iu_stcqlv.jpg",
  },
  {
    id: 3,
    name: "B. Rohith",
    affiliation: "QA Automation Expert • 12+ Yrs Exp",
    quote:
      "Precision and automation are the backbones of modern software. I teach the art of building unbreakable systems through rigorous testing.",
    imageSrc:
      "https://res.cloudinary.com/dbhuezxh0/image/upload/v1774935695/Mentor_dvgns5_cumvsj.png",
    thumbnailSrc:
      "https://res.cloudinary.com/dbhuezxh0/image/upload/v1774935695/Mentor_dvgns5_cumvsj.png",
  },
  {
    id: 4,
    name: "Divya Rani",
    affiliation: "Software Development Lead • 10+ Yrs Exp",
    quote:
      "Coding is about solving problems elegantly. I focus on technical fundamentals and architectural patterns that define world-class engineers.",
    imageSrc:
      "https://res.cloudinary.com/dbhuezxh0/image/upload/v1769142934/mentor-5_a4t9yq_xvspck.jpg",
    thumbnailSrc:
      "https://res.cloudinary.com/dbhuezxh0/image/upload/v1769142934/mentor-5_a4t9yq_xvspck.jpg",
  },
];

const Instructors = () => {
  return (
    <section
      id="trainers"
      className="relative py-24 lg:py-40 overflow-hidden bg-white"
    >
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0075CF]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#FD5A1A]/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20 lg:mb-32"
        >
          <span className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-slate-50 border border-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-8">
            <Sparkles className="w-4 h-4 text-[#0075CF]" /> Meet Your Mentors
          </span>
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-slate-950 mb-8 leading-[1.05] tracking-tighter">
            Learn From The <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0075CF] to-[#3391D9]">
              Elite Builders
            </span>
            .
          </h2>
          <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
            Our mentors aren't just teachers; they are industry veterans from
            top tech firms dedicated to your career success.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          {/* Main Slider Integration */}
          <TestimonialSlider reviews={mentors} className="bg-transparent" />

          {/* Floating Credentials Decoration */}
          <div className="absolute -top-10 -right-10 hidden xl:flex flex-col gap-4">
            <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 transform rotate-6 hover:rotate-0 transition-transform duration-500">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Global Students
                  </p>
                  <p className="text-xl font-black text-slate-900">2K+</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Instructors;
