import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageSquare, User, BookOpen, Search, Filter, Loader2, Sparkles, Trophy, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useInstructorRatings, CourseRating } from '@/hooks/useInstructorData';

export function PulseRatingsManager() {
  const { data: ratings = [], isLoading } = useInstructorRatings();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState<number | null>(null);

  const filteredRatings = ratings.filter(r => {
    const matchesSearch = 
      r.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.course_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.review?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = filterRating === null || r.rating === filterRating;
    return matchesSearch && matchesRating;
  });

  const avgRating = ratings.length > 0
    ? (ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none px-3 py-1 font-black text-[10px] uppercase tracking-widest mb-2">Pulse Monitor</Badge>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Student Pulse Ratings</h2>
          <p className="text-slate-500 font-bold italic">Global feedback stream across all academy instructors</p>
        </div>

        <div className="flex items-center gap-4 bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
           <div className="h-12 w-12 rounded-2xl bg-amber-400 flex items-center justify-center text-white shadow-lg shadow-amber-400/20">
              <Trophy className="h-6 w-6 fill-white" />
           </div>
           <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Average Platform Pulse</div>
              <div className="flex items-baseline gap-2">
                 <span className="text-2xl font-black text-slate-900">{avgRating}</span>
                 <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={`h-3 w-3 ${s <= Math.round(Number(avgRating)) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input 
            placeholder="Search by student, course, or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-14 pl-12 rounded-2xl border-none bg-white shadow-sm font-bold text-slate-700 focus-visible:ring-primary/20 transition-all placeholder:text-slate-400"
          />
        </div>
        <div className="flex items-center gap-2 bg-white px-4 rounded-2xl shadow-sm border border-slate-100">
          <Filter className="h-5 w-5 text-slate-400 shrink-0" />
          <div className="flex-1 flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button 
                key={star}
                onClick={() => setFilterRating(filterRating === star ? null : star)}
                className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all ${filterRating === star ? 'bg-amber-400 text-white shadow-md' : 'hover:bg-slate-50 text-slate-400'}`}
              >
                <Star className={`h-4 w-4 ${filterRating === star ? 'fill-current' : ''}`} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Syncing Feedback Loop...</p>
        </div>
      ) : filteredRatings.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center">
          <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
             <MessageSquare className="h-8 w-8 text-slate-200" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">No Pulse Detected</h3>
          <p className="text-slate-500 font-medium max-w-sm mt-2">Adjust your filters or wait for students to provide their insights.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRatings.map((rating, idx) => (
            <motion.div
              key={rating.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="pro-card group cursor-default p-0 overflow-hidden relative"
            >
              <div className="p-8 space-y-6">
                <div className="flex items-start justify-between">
                   <div className="flex items-center gap-4">
                      <Avatar className="h-14 w-14 border-4 border-white shadow-xl">
                        <AvatarImage src={rating.user_avatar || ''} />
                        <AvatarFallback className="bg-primary/10 text-primary font-black uppercase">{rating.user_name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                         <h4 className="font-black text-slate-900 text-lg leading-tight">{rating.user_name}</h4>
                         <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(rating.created_at).toLocaleDateString()}
                         </div>
                      </div>
                   </div>
                   <div className="flex flex-col items-end gap-1">
                      <div className="bg-slate-900 text-white rounded-lg px-2 py-1 text-xs font-black flex items-center gap-1">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        {rating.rating.toFixed(1)}
                      </div>
                      <Badge className="bg-emerald-50 text-emerald-600 border-none text-[8px] font-black uppercase tracking-tighter">Verified</Badge>
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <BookOpen className="h-4 w-4 text-primary/60 shrink-0" />
                      <span className="text-[11px] font-bold text-slate-600 truncate">{rating.course_title}</span>
                   </div>
                   
                   <div className="relative">
                      <div className="absolute -left-2 top-0 text-slate-100 pointer-events-none">
                         <MessageSquare className="h-12 w-12 opacity-50" />
                      </div>
                      <p className="relative z-10 text-sm font-medium text-slate-700 leading-relaxed italic line-clamp-4 pl-1">
                        "{rating.review || "The instructional flow was exceptionally clear. Highly recommend for dedicated scholars seeking professional growth."}"
                      </p>
                   </div>
                </div>

                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                       <Sparkles className="h-3 w-3 text-amber-400" />
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Platform Pulse</span>
                    </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
