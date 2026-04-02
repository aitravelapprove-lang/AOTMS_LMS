"use client";

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const SQRT_5000 = Math.sqrt(5000);

const rawTestimonials = [
  { message: "The placement support at AOTMS is unparalleled. I was mentored by industry giants and landed a job at a top MNC within weeks of finishing the Full Stack course.", name: "Sai Krishna", role: "Full Stack Developer", rating: 5 },
  { message: "The hands-on projects and mock interviews gave me the confidence to face tough technical rounds. Their curriculum is perfectly aligned with what the industry needs.", name: "Rakesh Varma", role: "Cloud Engineer", rating: 4 },
  { message: "Transitioning to Data Science felt daunting, but the mentors here made it seamless. The lifetime career support ensures I always have a roadmap for my growth.", name: "Swathi Reddy", role: "Data Scientist", rating: 3 },
  { message: "They don't just teach code; they teach problem-solving and industry standards. The mock interviews were as real as the actual ones I faced at startups.", name: "Dinesh Babu", role: "QA Automation Engineer", rating: 5 },
  { message: "The resume building sessions were a game-changer. My profile started getting picked up by top tech firms almost immediately after the overhaul.", name: "Anusha M", role: "UI/UX Designer", rating: 4 },
  { message: "If you're looking for a place that cares about your career as much as you do, AOTMS is it. The teachers are approachable and extremely knowledgeable.", name: "Lakshmi Prasanna", role: "Software Engineer", rating: 5 },
  { message: "Real-world projects are at the heart of their training. I built a full-scale enterprise app that became the star highlight of my portfolio.", name: "Venkatesh R", role: "Software Architect", rating: 3 },
  { message: "The diversity of courses and the quality of instructors is amazing. I particularly loved the classroom management sessions for my teaching certification.", name: "Sravani K", role: "Technical Trainer", rating: 4 },
  { message: "Excellent experience! The team understands the local job market in Vijayawada perfectly and bridges the gap to international standards.", name: "Pavan Kalyan", role: "DevOps Professional", rating: 5 },
].map(item => ({ ...item, email: "anonymous@example.com", category: "Course Content" }));

const testimonials = rawTestimonials.map((item, index) => ({
  tempId: index,
  testimonial: item.message,
  by: `${item.name}, ${item.role}`
}));

const getInitials = (by: string) => {
  const name = by.split(',')[0].trim();
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

interface TestimonialCardProps {
  position: number;
  testimonial: typeof testimonials[0];
  handleMove: (steps: number) => void;
  cardSize: number;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ 
  position, 
  testimonial, 
  handleMove, 
  cardSize 
}) => {
  const isCenter = position === 0;

  return (
    <div
      onClick={() => handleMove(position)}
      className={cn(
        "absolute left-1/2 top-1/2 cursor-pointer border p-6 sm:p-8 transition-all duration-500 ease-in-out rounded-lg",
        isCenter 
          ? "z-10 bg-[#0075CF] text-white border-white/40 shadow-[-30px_0_50px_-20px_rgba(0,117,207,0.5)]" 
          : "z-0 bg-white text-slate-800 border-slate-300 hover:border-[#0075CF]/50 shadow-xl"
      )}
      style={{
        width: cardSize,
        height: cardSize,
        clipPath: `polygon(50px 0%, calc(100% - 50px) 0%, 100% 50px, 100% 100%, calc(100% - 50px) 100%, 50px 100%, 0 100%, 0 0)`,
        transform: `
          translate(-50%, -50%) 
          translateX(${(cardSize / 1.5) * position}px)
          translateY(${isCenter ? -30 : position % 2 ? 15 : -15}px)
          scale(${isCenter ? 1 : 0.85})
          rotate(${isCenter ? 0 : position % 2 ? 2.5 : -2.5}deg)
        `,
        boxShadow: isCenter ? "0px 10px 30px rgba(0,0,0,0.15)" : "0px 5px 15px rgba(0,0,0,0.05)"
      }}
    >
      <span
        className={cn(
          "absolute block origin-top-right rotate-45",
          isCenter ? "bg-white/20" : "bg-slate-200 dark:bg-slate-700"
        )}
        style={{
          right: -2,
          top: 48,
          width: SQRT_5000,
          height: 1
        }}
      />
      <div
        className={cn(
          "mb-4 h-16 w-16 sm:h-20 sm:w-20 rounded-full flex items-center justify-center text-xl sm:text-2xl font-black border-2 transition-colors",
          isCenter 
            ? "bg-white text-[#0075CF] border-white/50" 
            : "bg-[#0075CF] text-white border-white/20"
        )}
        style={{
          boxShadow: isCenter ? "4px 4px 0px rgba(255,255,255,0.2)" : "4px 4px 0px rgba(0,0,0,0.05)"
        }}
      >
        {getInitials(testimonial.by)}
      </div>
      <h3 className={cn(
        "text-sm sm:text-lg font-bold leading-snug line-clamp-4",
        isCenter ? "text-white" : "text-slate-800 dark:text-slate-200"
      )}>
        "{testimonial.testimonial}"
      </h3>
      <p className={cn(
        "absolute bottom-6 left-6 sm:bottom-8 sm:left-8 right-8 mt-2 text-xs sm:text-sm italic font-medium",
        isCenter ? "text-white/80" : "text-slate-500 dark:text-slate-400"
      )}>
        - {testimonial.by}
      </p>
    </div>
  );
};

export const StaggerTestimonials: React.FC = () => {
  const [cardSize, setCardSize] = useState(360);
  const [testimonialsList, setTestimonialsList] = useState(testimonials);

  const handleMove = (steps: number) => {
    setTestimonialsList((prev) => {
      const newList = [...prev];
      if (steps > 0) {
        for (let i = steps; i > 0; i--) {
          const item = newList.shift();
          if (!item) return prev;
          newList.push({ ...item, tempId: Math.random() });
        }
      } else {
        for (let i = steps; i < 0; i++) {
          const item = newList.pop();
          if (!item) return prev;
          newList.unshift({ ...item, tempId: Math.random() });
        }
      }
      return newList;
    });
  };

  useEffect(() => {
    const timer = setInterval(() => {
      handleMove(1); // Auto move right
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const updateSize = () => {
      if (window.innerWidth < 640) {
        setCardSize(260);
      } else if (window.innerWidth < 1024) {
        setCardSize(320);
      } else {
        setCardSize(380);
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height: 500 }}
    >
      {testimonialsList.map((testimonial, index) => {
        const position = testimonialsList.length % 2
          ? index - (testimonialsList.length - 1) / 2
          : index - testimonialsList.length / 2;
        return (
          <TestimonialCard
            key={testimonial.tempId}
            testimonial={testimonial}
            handleMove={handleMove}
            position={position}
            cardSize={cardSize}
          />
        );
      })}

      <div className="absolute bottom-0 left-1/2 flex -translate-x-1/2 gap-4">
        <button
          onClick={() => handleMove(-1)}
          className={cn(
            "flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center text-xl sm:text-2xl transition-all duration-300 rounded-full",
            "bg-white border text-slate-700 shadow-md hover:bg-[#0075CF] hover:text-white hover:border-[#0075CF] hover:shadow-lg",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          )}
          aria-label="Previous testimonial"
        >
          <ChevronLeft />
        </button>
        <button
          onClick={() => handleMove(1)}
          className={cn(
            "flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center text-xl sm:text-2xl transition-all duration-300 rounded-full",
            "bg-white border text-slate-700 shadow-md hover:bg-[#0075CF] hover:text-white hover:border-[#0075CF] hover:shadow-lg",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          )}
          aria-label="Next testimonial"
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
};
