import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, Clock, CheckCircle2, AlertTriangle, ChevronDown, 
  BarChart3, TrendingUp, TrendingDown, Minus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface VideoAnalytics {
  videoId: string;
  videoTitle: string;
  totalViews: number;
  averageWatchTimeSeconds: number;
  completionRate: number;
  dropOffTimeSeconds: number;
  dropOffPercentage: number;
  viewsTrend?: number;
  watchTimeTrend?: number;
  completionTrend?: number;
}

interface StudentWatchData {
  id: string;
  studentName: string;
  studentEmail: string;
  watchedPercentage: number;
  lastWatchedAt: string;
  status: 'completed' | 'watching' | 'stuck';
}

interface VideoAnalyticsPanelProps {
  analytics: VideoAnalytics;
  watchData?: StudentWatchData[];
  isLoading?: boolean;
}

const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const minutes = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return secs > 0 ? `${minutes}m ${secs}s` : `${minutes}m`;
};

const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

const TrendIndicator = ({ value }: { value?: number }) => {
  if (!value || value === 0) {
    return <Minus className="w-3 h-3 text-muted-foreground" />;
  }
  const isPositive = value > 0;
  return isPositive ? (
    <TrendingUp className="w-3 h-3 text-green-500" />
  ) : (
    <TrendingDown className="w-3 h-3 text-red-500" />
  );
};

export function VideoAnalyticsPanel({
  analytics,
  watchData = [],
  isLoading = false
}: VideoAnalyticsPanelProps) {
  const [expanded, setExpanded] = useState(false);

  const completedStudents = watchData.filter(s => s.status === 'completed');
  const watchingStudents = watchData.filter(s => s.status === 'watching');
  const stuckStudents = watchData.filter(s => s.status === 'stuck');

  const getStatusColor = (status: StudentWatchData['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'watching': return 'bg-blue-500';
      case 'stuck': return 'bg-amber-500';
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <BarChart3 className="w-4 h-4 text-primary" />
            </div>
            <CardTitle className="text-base">Video Analytics</CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setExpanded(!expanded)}
            className="gap-1"
          >
            {expanded ? (
              <>Less <ChevronDown className="w-4 h-4 rotate-180" /></>
            ) : (
              <>More <ChevronDown className="w-4 h-4" /></>
            )}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground truncate">
          {analytics.videoTitle}
        </p>
      </CardHeader>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CardContent className="pt-0 space-y-4">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="students">Students</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-3">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-default">
                            <div className="flex items-center gap-2 mb-1">
                              <Eye className="w-4 h-4 text-blue-500" />
                              <span className="text-xs text-muted-foreground">Total Views</span>
                            </div>
                            <p className="text-xl font-bold">{analytics.totalViews.toLocaleString()}</p>
                            {analytics.viewsTrend !== undefined && (
                              <div className="flex items-center gap-1 mt-1">
                                <TrendIndicator value={analytics.viewsTrend} />
                                <span className={`text-xs ${analytics.viewsTrend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                  {Math.abs(analytics.viewsTrend || 0)}%
                                </span>
                              </div>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Total unique views</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-default">
                            <div className="flex items-center gap-2 mb-1">
                              <Clock className="w-4 h-4 text-purple-500" />
                              <span className="text-xs text-muted-foreground">Avg Watch Time</span>
                            </div>
                            <p className="text-xl font-bold">{formatDuration(analytics.averageWatchTimeSeconds)}</p>
                            {analytics.watchTimeTrend !== undefined && (
                              <div className="flex items-center gap-1 mt-1">
                                <TrendIndicator value={analytics.watchTimeTrend} />
                                <span className={`text-xs ${analytics.watchTimeTrend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                  {Math.abs(analytics.watchTimeTrend || 0)}%
                                </span>
                              </div>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Average time students spend watching</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-default">
                            <div className="flex items-center gap-2 mb-1">
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                              <span className="text-xs text-muted-foreground">Completion</span>
                            </div>
                            <p className="text-xl font-bold">{analytics.completionRate}%</p>
                            <Progress 
                              value={analytics.completionRate} 
                              className="h-1.5 mt-1 bg-muted" 
                              indicatorClassName={analytics.completionRate >= 70 ? 'bg-green-500' : analytics.completionRate >= 40 ? 'bg-amber-500' : 'bg-red-500'}
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Percentage of students who completed</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-default">
                            <div className="flex items-center gap-2 mb-1">
                              <AlertTriangle className="w-4 h-4 text-amber-500" />
                              <span className="text-xs text-muted-foreground">Drop-off</span>
                            </div>
                            <p className="text-xl font-bold">{formatDuration(analytics.dropOffTimeSeconds)}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {analytics.dropOffPercentage}% leave
                            </p>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Average time before students stop watching</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TabsContent>

                {/* Performance Tab Removed */}

                <TabsContent value="students" className="mt-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        {completedStudents.length} Completed
                      </Badge>
                      <Badge variant="secondary" className="gap-1">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        {watchingStudents.length} Watching
                      </Badge>
                      <Badge variant="secondary" className="gap-1">
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                        {stuckStudents.length} Stuck
                      </Badge>
                    </div>

                    <ScrollArea className="h-[200px]">
                      <div className="space-y-2">
                        {watchData.length > 0 ? (
                          watchData.map((student) => (
                            <div 
                              key={student.id}
                              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                            >
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs">
                                  {student.studentName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{student.studentName}</p>
                                <p className="text-xs text-muted-foreground">{formatTimeAgo(student.lastWatchedAt)}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Progress 
                                  value={student.watchedPercentage} 
                                  className="h-1.5 w-16"
                                  indicatorClassName={getStatusColor(student.status)}
                                />
                                <span className="text-xs font-medium w-10 text-right">
                                  {student.watchedPercentage}%
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <p className="text-sm">No student data yet</p>
                            <p className="text-xs">Students need to start watching for analytics</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>

      {!expanded && (
        <CardContent className="pt-0">
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <Eye className="w-4 h-4 mx-auto mb-1 text-blue-500" />
              <p className="text-sm font-bold">{analytics.totalViews}</p>
              <p className="text-[10px] text-muted-foreground">Views</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <Clock className="w-4 h-4 mx-auto mb-1 text-purple-500" />
              <p className="text-sm font-bold">{formatDuration(analytics.averageWatchTimeSeconds)}</p>
              <p className="text-[10px] text-muted-foreground">Watch Time</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-green-500" />
              <p className="text-sm font-bold">{analytics.completionRate}%</p>
              <p className="text-[10px] text-muted-foreground">Complete</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <AlertTriangle className="w-4 h-4 mx-auto mb-1 text-amber-500" />
              <p className="text-sm font-bold">{analytics.dropOffPercentage}%</p>
              <p className="text-[10px] text-muted-foreground">Drop-off</p>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export { type VideoAnalytics, type StudentWatchData };
