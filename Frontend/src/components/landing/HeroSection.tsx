import ShaderShowcase from "@/components/ui/hero";

const HeroSection = () => {
  return (
<<<<<<< HEAD
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16">
      {/* Low-poly geometric background */}
      <LowPolyBackground />

      {/* Overlay for readability — kept light so patterns show through */}
      <div className="absolute inset-0 bg-slate-950/20" />

      <div className="container-width section-padding relative z-10 w-full">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white/90 text-sm font-bold mb-8 tracking-wide uppercase shadow-lg">
              <span className="w-2 h-2 rounded-full bg-[#FD5A1A] animate-pulse" />
              Vijayawada's #1 Skill Engineering Platform
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-heading text-4xl sm:text-6xl lg:text-8xl leading-none tracking-tight mb-6 text-center text-white drop-shadow-2xl px-2 font-extrabold"
          >
            SMART LEARNING
            <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0075CF] via-[#FDFEFE] to-[#0075CF]">
              {" "}
              MANAGEMENT SYSTEM
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm md:text-lg text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed font-medium"
          >
            AOTMS is Vijayawada's premier learning management system offering
            online courses, live classes, secure exams, mock tests, and
            ATS-based skill evaluation. Join thousands of students building
            real-world careers.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              size="xl"
              className="h-14 px-10 rounded-2xl bg-[#0075CF] hover:bg-[#0066B3] text-[#FDFEFE] font-black text-base shadow-2xl hover:scale-105 active:scale-95 transition-all group gap-2"
              onClick={() => navigate("/login")}
            >
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="xl"
              className="h-14 px-10 rounded-2xl bg-[#FD5A1A] hover:bg-[#E34D14] text-[#FDFEFE] font-black text-base shadow-2xl hover:scale-105 active:scale-95 transition-all gap-2 backdrop-blur"
              onClick={() => navigate("/student-dashboard")}
            >
              <Play className="w-5 h-5 fill-current" />
              Explore Platform
            </Button>
          </motion.div>

          {/* Feature Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex flex-wrap items-center justify-center gap-3 mt-10"
          >
            {[
              { icon: BookOpen, text: "100+ Courses" },
              { icon: Users, text: "10K+ Students" },
              { icon: Trophy, text: "95% Placement" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur border border-white/20 text-[#FDFEFE]/90 text-sm font-bold tracking-wide"
              >
                <item.icon className="w-4 h-4 text-[#FD5A1A]" />
                {item.text}
              </div>
            ))}
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="grid grid-cols-2 md:flex md:flex-wrap justify-items-center md:justify-center gap-y-8 gap-x-4 md:gap-16 mt-16 pt-8 border-t border-white/20"
          >
            {[
              { value: "10K+", label: "Active Students" },
              { value: "50+", label: "Expert Instructors" },
              { value: "100+", label: "Courses" },
              { value: "95%", label: "Success Rate" },
            ].map((stat) => (
              <div key={stat.label} className="text-center w-full md:w-auto">
                <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white drop-shadow">
                  {stat.value}
                </p>
                <p className="text-[10px] md:text-sm text-white/60 mt-1 font-semibold tracking-wider uppercase">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
=======
    <section className="relative min-h-screen w-full">
      <ShaderShowcase />
>>>>>>> 64e4f5cb41d8eb1c167ca83c2721a66949b948ed
    </section>
  );
};

export default HeroSection;
