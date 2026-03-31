import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import WhyAOTMS from "@/components/landing/WhyAOTMS";
import HowItWorks from "@/components/landing/HowItWorks";
import KeyFeatures from "@/components/landing/KeyFeatures";
import FeaturedCourses from "@/components/landing/FeaturedCourses";

import Instructors from "@/components/landing/Instructors";
import Testimonials from "@/components/landing/Testimonials";
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
          <FeaturedCourses />
          <HowItWorks />
          <KeyFeatures />

          <Instructors />
          <Testimonials />
          <CTASection />
        </main>
        <Footer />
        <ScrollBot />
      </div>
    </div>
  );
};

export default Home;
