import { lazy, Suspense } from "react";
import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";

// Lazy-load below-the-fold sections to reduce initial mobile JS bundle
const WhyAOTMS = lazy(() => import("@/components/landing/WhyAOTMS"));
const CompanyCarousel = lazy(() => import("@/components/landing/CompanyCarousel"));
const FeaturedCourses = lazy(() => import("@/components/landing/FeaturedCourses"));
const CareerRoadmap = lazy(() => import("@/components/landing/CareerRoadmap"));
const KeyFeatures = lazy(() => import("@/components/landing/KeyFeatures"));
const EnrollmentForm = lazy(() => import("@/components/landing/EnrollmentForm"));
const Instructors = lazy(() => import("@/components/landing/Instructors"));
const Testimonials = lazy(() => import("@/components/landing/Testimonials"));
const Footer = lazy(() => import("@/components/landing/Footer"));
const ScrollBot = lazy(() => import("@/components/landing/ScrollBot"));

const Home = () => {

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-white">
      <div id="home-content" className="relative z-10 w-full bg-white">
        <Header />
        <main>
          <div id="main-content">
            <HeroSection />
          </div>
          <Suspense fallback={<div className="h-32" />}>
            <WhyAOTMS />
            <CompanyCarousel />
            <FeaturedCourses />
            <CareerRoadmap />
            <KeyFeatures />
            <EnrollmentForm />
            <Instructors />
            <Testimonials />
          </Suspense>
        </main>
        <Suspense fallback={null}>
          <Footer />
          <ScrollBot />
        </Suspense>
      </div>
    </div>
  );
};

export default Home;
