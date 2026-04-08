import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import WhyAOTMS from "@/components/landing/WhyAOTMS";
import CompanyCarousel from "@/components/landing/CompanyCarousel";
import KeyFeatures from "@/components/landing/KeyFeatures";
import FeaturedCourses from "@/components/landing/FeaturedCourses";
import CareerRoadmap from "@/components/landing/CareerRoadmap";
import Instructors from "@/components/landing/Instructors";
import Testimonials from "@/components/landing/Testimonials";
import Footer from "@/components/landing/Footer";
import ScrollBot from "@/components/landing/ScrollBot";
import EnrollmentForm from "@/components/landing/EnrollmentForm";

const Home = () => {

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-white">
      <div id="home-content" className="relative z-10 w-full bg-white">
        <Header />
        <main>
          <div id="main-content">
            <HeroSection />
          </div>
          <WhyAOTMS />
          <CompanyCarousel />
          <FeaturedCourses />
          <CareerRoadmap />
          <KeyFeatures />
          <EnrollmentForm />

          <Instructors />
          <Testimonials />
        </main>
        <Footer />
        <ScrollBot />
      </div>
    </div>
  );
};

export default Home;
