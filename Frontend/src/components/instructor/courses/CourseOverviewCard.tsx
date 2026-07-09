import { motion } from 'framer-motion';
import { Video, Clock, Users, TrendingUp, PlayCircle, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface CourseOverviewCardProps {
  title: string;
  description?: string | null;
  videoCount: number;
  totalDurationMinutes: number;
  enrolledStudents: number;
  completionRate: number;
  thumbnailUrl?: string | null;
  onClick?: () => void;
}

const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours} hour${hours > 1 ? 's' : ''}`;
};

export function CourseOverviewCard({
  title,
  description,
  videoCount,
  totalDurationMinutes,
  enrolledStudents,
  completionRate,
  thumbnailUrl,
  onClick
}: CourseOverviewCardProps) {
  
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = thumbnailUrl ? getYouTubeId(thumbnailUrl) : null;
  const isS3Image = thumbnailUrl && !videoId && (thumbnailUrl.includes('s3') || thumbnailUrl.includes('blob') || thumbnailUrl.includes('http'));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className="overflow-hidden bg-gradient-to-br from-card to-card/80 border-border/50 hover:border-border transition-all cursor-pointer group"
        onClick={onClick}
      >
        <div className="relative aspect-video bg-muted">
          {videoId ? (
            <img
              src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
              }}
            />
          ) : isS3Image ? (
            <img
              src={thumbnailUrl || ''}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
              <PlayCircle className="w-16 h-16 text-primary/40" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <Badge variant="secondary" className="bg-primary/90 text-white hover:bg-primary">
              <FileText className="w-3 h-3 mr-1" />
              Course Overview
            </Badge>
          </div>
        </div>

        <CardContent className="p-5 space-y-4">
          <div>
            <h3 className="font-bold text-lg line-clamp-1 group-hover:text-primary transition-colors">
              {title}
            </h3>
            {description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50">
              <div className="p-1.5 rounded-md bg-primary/10">
                <Video className="w-3.5 h-3.5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Videos</p>
                <p className="font-semibold text-sm">{videoCount}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50">
              <div className="p-1.5 rounded-md bg-blue-500/10">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Duration</p>
                <p className="font-semibold text-sm">{formatDuration(totalDurationMinutes)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50">
              <div className="p-1.5 rounded-md bg-green-500/10">
                <Users className="w-3.5 h-3.5 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Enrolled</p>
                <p className="font-semibold text-sm">{enrolledStudents}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50">
              <div className="p-1.5 rounded-md bg-amber-500/10">
                <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Completion</p>
                <p className="font-semibold text-sm">{completionRate}%</p>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Course Progress</span>
              <span className="font-medium">{completionRate}%</span>
            </div>
            <Progress 
              value={completionRate} 
              className="h-2 bg-muted"
              indicatorClassName={completionRate >= 70 ? 'bg-green-500' : completionRate >= 40 ? 'bg-amber-500' : 'bg-red-500'}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
