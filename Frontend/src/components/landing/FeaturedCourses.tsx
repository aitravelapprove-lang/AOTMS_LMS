import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useCourses, Course } from '@/hooks/useCourses';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FeaturedCourses() {
  const { courses, fetchCourses, loading } = useCourses();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses(1, 'all', true);
  }, [fetchCourses]);

  const featured = courses.slice(0, 6);

  if (loading && courses.length === 0) return null;

  return (
    <section id="courses" className="py-24 bg-white relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute top-0 left-0 w-full h-w bg-gradient-to-b from-slate-50 to-white" />
      <div className="absolute top-40 -left-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-40 -right-20 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />

      <div className="container-width section-padding relative z-10">
        <div className="text-center mb-16 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-4 py-1.5 text-sm font-bold tracking-wider uppercase mb-4">
              Explore Programs
            </Badge>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-slate-950 tracking-tighter leading-tight">
              Master In-Demand <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0075CF] to-[#FD5A1A]">Tech Skills</span>.
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg font-medium mt-4">
              Choose from our curated selection of professional engineering courses designed by industry experts.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Continuous Auto-Play Marquee — Ultra Professional Loop (Edge-to-Edge) */}
      <div className="relative w-full overflow-hidden group/marquee py-10 mt-10">
        {/* Faded edges for depth */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-20 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-20 pointer-events-none" />
        
        <motion.div 
          className="flex gap-8 px-4"
          animate={{ 
            x: [0, -1 * (featured.length * 360 + featured.length * 32)] 
          }}
          transition={{ 
            duration: 50, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          whileHover={{ transition: { duration: 150 } }}
        >
          {[...featured, ...featured].map((course, idx) => (
            <div
              key={`${course.id}-${idx}`}
              className="w-[300px] sm:w-[360px] flex-shrink-0 group/card"
            >
              <Card 
                className="pro-card h-[520px] overflow-hidden border border-slate-200 shadow-lg hover:shadow-2xl hover:border-primary/20 transition-all duration-500 cursor-pointer bg-white group-hover/card:-translate-y-2"
                onClick={() => window.open("https://www.aotms.in/#/courses", "_blank", "noopener,noreferrer")}
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
                  
                  <Badge 
                    className="absolute top-4 left-4 border-none font-black shadow-lg text-[10px] tracking-widest uppercase py-1 px-3"
                    style={{ backgroundColor: course.theme_color || '#0075CF' }}
                  >
                    {course.category}
                  </Badge>
  
                  <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-lg">
                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-black text-slate-800">{course.rating}</span>
                  </div>
                </div>
  
                <CardContent className="p-8 space-y-6 flex flex-col justify-between h-[calc(100%-14rem)]">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                       <div className="w-8 h-1 rounded-full bg-primary/20" />
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{course.level}</span>
                    </div>
                    <h3 className="font-bold text-xl md:text-2xl text-slate-900 group-hover/card:text-primary transition-colors line-clamp-2 leading-tight">
                      {course.title}
                    </h3>
                    <p className="text-sm text-slate-500 mt-3 line-clamp-2 font-medium leading-relaxed">
                      Industry-recognized certification program with hands-on lab sessions and real-world project builds.
                    </p>
                  </div>
  
                  <div className="space-y-6 pt-4 border-t border-slate-50">
                    <div className="flex items-center justify-between text-xs font-black text-slate-600 uppercase tracking-widest">
                       <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> {course.duration}</span>
                       <span className="text-primary text-sm">
                         {course.price?.toString().includes('$') 
                           ? course.price.replace('$', '₹') 
                           : `₹${course.price}`}
                       </span>
                    </div>
  
                    <Button variant="ghost" className="w-full justify-between px-0 hover:bg-transparent text-[#0075CF] font-black group/btn text-xs uppercase tracking-widest">
                       Enroll Progress
                       <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-2 transition-transform" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </motion.div>
      </div>

      <div className="container-width section-padding relative z-10">
        <div className="text-center mt-6">
          <Button 
            size="xl" 
            className="pro-button-primary h-16 px-14 rounded-2xl shadow-[0_20px_50px_rgba(0,117,207,0.3)] hover:shadow-[0_25px_60px_rgba(0,117,207,0.4)] hover:scale-105 active:scale-95 transition-all text-sm font-black uppercase tracking-widest gap-3"
            onClick={() => window.open("https://www.aotms.in/#/courses", "_blank", "noopener,noreferrer")}
          >
            Explore Full Catalog
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}
