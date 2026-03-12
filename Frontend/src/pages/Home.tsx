import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import WhyAOTMS from "@/components/landing/WhyAOTMS";
import HowItWorks from "@/components/landing/HowItWorks";
import KeyFeatures from "@/components/landing/KeyFeatures";

import Instructors from "@/components/landing/Instructors";
import Testimonials from "@/components/landing/Testimonials";
import FAQSection from "@/components/landing/FAQSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";
import ScrollBot from "@/components/landing/ScrollBot";
import LowPolyBackground from "@/components/landing/LowPolyBackground";

const Home = () => {
  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* GLOBAL FIXED BACKGROUND */}
      <LowPolyBackground />
      
      <div id="home-content" className="relative z-10 w-full">
        <Header />
        <main>
          <div id="main-content">
            <HeroSection />
          </div>
          <WhyAOTMS />
          <HowItWorks />
          <KeyFeatures />

          <Instructors />
          <Testimonials />
          <FAQSection />
          <CTASection />
        </main>
        <Footer />
        <ScrollBot />
      </div>
    </div>
  );
};

export default Home;
