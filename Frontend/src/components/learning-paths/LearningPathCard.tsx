import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, BookOpen, ArrowRight, Star } from "lucide-react";

interface LearningPathCardProps {
  title: string;
  description: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  courseCount: number;
  isPopular?: boolean;
  onViewPath: () => void;
}

const LearningPathCard = ({
  title,
  description,
  level,
  duration,
  courseCount,
  isPopular,
  onViewPath,
}: LearningPathCardProps) => {
  const levelColors = {
    Beginner: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Intermediate: "bg-sky-100 text-sky-700 border-sky-200",
    Advanced: "bg-amber-100 text-amber-700 border-amber-200",
  };

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="group relative bg-white/70 backdrop-blur-2xl rounded-[2.5rem] border border-slate-900/10 p-8 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-[#0075CF]/10 transition-all duration-300 flex flex-col h-full"
    >
      {isPopular && (
        <div className="absolute -top-3 right-8">
          <Badge className="bg-[#FD5A1A] text-white border-0 py-1 px-4 rounded-full font-extrabold text-[10px] uppercase tracking-widest shadow-lg shadow-[#FD5A1A]/30">
            <Star className="w-3 h-3 fill-current mr-1 text-white" />
            Most Chosen
          </Badge>
        </div>
      )}

      <div className="mb-4">
        <Badge variant="outline" className={levelColors[level]}>
          {level}
        </Badge>
      </div>

      <h3 className="text-2xl font-extrabold text-slate-900 mb-3 tracking-tight group-hover:text-[#0075CF] transition-colors leading-tight font-heading">
        {title}
      </h3>
      
      <p className="text-slate-600 text-base leading-relaxed flex-1 font-medium mb-6">
        {description}
      </p>

      <div className="flex items-center gap-6 text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#FD5A1A]" />
          <span>{duration}</span>
        </div>
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#0075CF]" />
          <span>{courseCount} modules</span>
        </div>
      </div>

      <Button 
        className="w-full h-14 rounded-2xl bg-[#0075CF] hover:bg-[#005A9C] text-white font-extrabold uppercase tracking-widest text-xs shadow-lg shadow-[#0075CF]/20 transition-all border-0"
        onClick={onViewPath}
      >
        View Path
        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
      </Button>
    </motion.div>
  );
};

export default LearningPathCard;
