import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import LowPolyBackground from "@/components/landing/LowPolyBackground";
import {
  BookOpen,
  Target,
  Users,
  Award,
  CheckCircle,
  Globe,
  TrendingUp,
  MapPin,
  Shield,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";

const About = () => {
  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <LowPolyBackground />
      <Header />

      <main className="relative z-10 w-full pt-20 pb-16">
        {/* 1. Introduction (H1) */}
        <section className="container-width section-padding">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-medium text-sm"
            >
              About Us
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-slate-900 leading-tight tracking-tight font-heading"
            >
              Building the Future of{" "}
              <span className="text-[#0075CF]">Learning</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-muted-foreground leading-relaxed"
            >
              We are a premier{" "}
              <strong className="text-foreground">
                Learning Management System
              </strong>{" "}
              based in <strong className="text-foreground">Vijayawada</strong>,
              dedicated to bridging the gap between education and employment.
              AOTMS LMS empowers learners with career-focused skills through a
              modern, accessible, and structured online platform.
            </motion.p>
          </div>
        </section>

        {/* 2. Mission Statement (H2) */}
        <section className="container-width section-padding bg-muted/30 my-12 rounded-3xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Target className="w-6 h-6" />
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight">
                Our Mission
              </h2>
              <p className="text-lg text-slate-600 font-medium leading-relaxed">
                Our mission is to democratize access to high-quality technical
                education. We exist to transform aspiring students into
                industry-ready professionals by focusing strictly on{" "}
                <strong className="text-slate-900">
                  skill-based and career-oriented education
                </strong>{" "}
                rather than just theoretical knowledge.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We believe in real-world learning outcomes—where every course
                completion leads to tangible career growth and confidence.
              </p>
            </div>
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl bg-black/5 border border-white/10">
              {/* Placeholder for Mission Image or Graphic */}
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
                <span className="text-muted-foreground/50 font-medium">
                  Mission Visualization
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. What AOTMS LMS Offers (H2) */}
        <section className="container-width section-padding">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              What AOTMS LMS Offers
            </h2>
            <p className="text-muted-foreground">
              Comprehensive tools designed for your success.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: BookOpen,
                title: "Structured Learning Paths",
                desc: "Step-by-step curriculum guided by industry experts to ensure comprehensive skill mastery.",
              },
              {
                icon: Zap,
                title: "Live & Recorded Classes",
                desc: "Flexible learning options with interactive live sessions and high-quality recorded library.",
              },
              {
                icon: CheckCircle,
                title: "Online Exams & Mock Tests",
                desc: "Rigorous assessments designed to test your real-world application of knowledge.",
              },
              {
                icon: TrendingUp,
                title: "Progress Tracking",
                desc: "Detailed analytics and leaderboards to monitor your growth and stay motivated.",
              },
              {
                icon: Award,
                title: "ATS-Based Resume Scoring",
                desc: "Smart tools to optimize your resume for applicant tracking systems and recruiters.",
              },
              {
                icon: Globe,
                title: "Community & Support",
                desc: "A vibrant community of learners and mentors to support your educational journey.",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/70 backdrop-blur-2xl p-8 rounded-[2rem] border border-slate-900/10 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-[#0075CF]/10 transition-all duration-500"
              >
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent mb-4">
                  <item.icon className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-slate-600 font-medium text-sm leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 4. Who AOTMS LMS Is For (H2) */}
        <section className="container-width section-padding bg-primary/5 my-12 py-20">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight mb-4 font-heading">
              Who Is <span className="text-[#0075CF]">AOTMS LMS</span> For?
            </h2>
            <p className="text-muted-foreground">
              Our platform caters to a diverse range of ambitious learners.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Students",
                desc: "Seeking to build a strong foundation alongside their academic studies.",
              },
              {
                title: "Fresh Graduates",
                desc: "Looking for job-ready skills to launch their careers immediately.",
              },
              {
                title: "Working Professionals",
                desc: "Wanting to upskill or switch careers with convenient, flexible learning.",
              },
              {
                title: "Instructors",
                desc: "Passionate experts wanting to share knowledge and impact lives.",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white/70 backdrop-blur-2xl p-8 rounded-[2rem] border border-slate-900/10 text-center shadow-xl shadow-slate-200/50 hover:-translate-y-2 transition-all duration-500"
              >
                <div className="w-16 h-16 mx-auto rounded-2xl bg-[#E6F2FA] flex items-center justify-center text-[#0075CF] mb-6 shadow-lg">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Why Choose AOTMS LMS (H2) */}
        <section className="container-width section-padding">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight mb-8 font-heading">
                Why Choose <span className="text-[#0075CF]">AOTMS LMS?</span>
              </h2>
              <div className="space-y-6">
                {[
                  {
                    title: "Career-Oriented Approach",
                    desc: "We don't just teach topics; we prepare you for specific job roles and industry demands.",
                  },
                  {
                    title: "Performance-Driven",
                    desc: "Our assessments are tough but fair, ensuring that your certification truly means expertise.",
                  },
                  {
                    title: "Quality Assurance",
                    desc: "Strict verification for instructors and content ensures you only learn from the best.",
                  },
                  {
                    title: "Scalable & Secure",
                    desc: "A robust platform that grows with you, keeping your data and progress safe.",
                  },
                ].map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="mt-1">
                      <Shield className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{item.title}</h3>
                      <p className="text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary to-accent opacity-20 blur-2xl rounded-full" />
              <div className="relative bg-white/80 backdrop-blur-3xl border border-slate-900/10 rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/60">
                <h3 className="text-3xl font-extrabold text-slate-900 mb-6 tracking-tight font-heading">
                  The <span className="text-[#0075CF]">AOTMS</span> Advantage
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-5 bg-[#E6F2FA]/50 rounded-2xl border border-[#0075CF]/5">
                    <span className="font-bold text-slate-700">
                      Placement Rate
                    </span>
                    <span className="text-2xl font-black text-[#FD5A1A]">
                      85%+
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-5 bg-[#FFF2EC]/50 rounded-2xl border border-[#FD5A1A]/5">
                    <span className="font-bold text-slate-700">
                      Satisfaction
                    </span>
                    <span className="text-2xl font-black text-[#0075CF]">
                      4.8/5
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-5 bg-slate-50/80 rounded-2xl border border-slate-200/50">
                    <span className="font-bold text-slate-700">
                      Practical Focus
                    </span>
                    <span className="text-2xl font-black text-slate-900">
                      100%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Local Presence & Reach (H2) */}
        <section className="container-width section-padding bg-black text-white rounded-3xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent"></div>
          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center p-8 md:p-12">
            <div>
              <div className="flex items-center gap-2 mb-4 text-primary-foreground/80">
                <MapPin className="w-5 h-5" />
                <span className="uppercase tracking-wider text-sm font-semibold">
                  Local Roots, Global Purpose
                </span>
              </div>
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6">
                Based in Vijayawada
              </h2>
              <p className="text-lg text-white/80 leading-relaxed max-w-xl">
                While we operate as a digital-first global learning platform,
                our heart and development base are in{" "}
                <strong className="text-white">Vijayawada</strong>. We are proud
                to contribute to the city's growing status as an educational
                hub, serving learners across Vijayawada, Andhra Pradesh, and
                beyond.
              </p>
            </div>
            <div className="flex justify-center md:justify-end">
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 max-w-sm">
                <h4 className="font-bold text-xl mb-2">Visit Us</h4>
                <p className="text-white/70">
                  Auram Creative Center, 19th Floor
                  <br />
                  Vijayawada, Andhra Pradesh
                  <br />
                  India - 520001
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Future Vision (H2) */}
        <section className="container-width section-padding text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6">
              Our Future Vision
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              We are constantly evolving. Our roadmap includes enhanced mobile
              learning experiences, advanced AI-driven performance analytics,
              and deeper industry partnerships to ensure AOTMS LMS remains at
              the forefront of ed-tech innovation.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
