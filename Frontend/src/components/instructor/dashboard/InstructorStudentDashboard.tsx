import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, Search, Filter, Download, Mail, MoreHorizontal, 
  BookOpen, Clock, CheckCircle2, AlertTriangle, PlayCircle,
  TrendingUp, TrendingDown, UserPlus, UserMinus, Activity,
  Eye, FileText, ChevronRight, RefreshCw, Bell, Loader2,
  Phone, Play, Upload, Link as LinkIcon, Image as ImageIcon, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter 
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel 
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { 
  useInstructorAllStudents, 
  useInstructorStudentStats, 
  useInstructorCourses,
  useStudentVideoProgress,
  useVideos,
  useSendReminder,
  type InstructorStudent,
  type Course,
  type CourseVideo,
  type VideoProgressDetail
} from '@/hooks/useInstructorData';

interface RecentActivity {
  id: string;
  studentId: string;
  studentName: string;
  action: 'started' | 'completed' | 'watching' | 'enrolled' | 'dropped';
  courseName: string;
  timestamp: string;
  details?: string;
}

const getStatusConfig = (status: InstructorStudent['status']) => {
  switch (status) {
    case 'active':
      return { color: 'bg-green-500', text: 'text-green-500', label: 'Active', bg: 'bg-green-500/10' };
    case 'completed':
      return { color: 'bg-blue-500', text: 'text-blue-500', label: 'Completed', bg: 'bg-blue-500/10' };
    case 'at-risk':
      return { color: 'bg-amber-500', text: 'text-amber-500', label: 'At Risk', bg: 'bg-amber-500/10' };
    case 'inactive':
      return { color: 'bg-gray-500', text: 'text-gray-500', label: 'Inactive', bg: 'bg-gray-500/10' };
  }
};

const getActivityIcon = (action: RecentActivity['action']) => {
  switch (action) {
    case 'started': return <UserPlus className="w-4 h-4 text-green-500" />;
    case 'completed': return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
    case 'watching': return <PlayCircle className="w-4 h-4 text-purple-500" />;
    case 'enrolled': return <UserPlus className="w-4 h-4 text-green-500" />;
    case 'dropped': return <UserMinus className="w-4 h-4 text-red-500" />;
  }
};

const formatWatchTime = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
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

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendValue, 
  color,
  loading 
}: { 
  title: string; 
  value: string | number; 
  icon: React.ElementType; 
  trend?: 'up' | 'down'; 
  trendValue?: string;
  color: string;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-muted animate-pulse h-9 w-9" />
          </div>
          <div className="mt-3 space-y-2">
            <div className="h-8 w-16 bg-muted animate-pulse rounded" />
            <div className="h-3 w-24 bg-muted animate-pulse rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
    >
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className={`p-2 rounded-lg ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            {trend && (
              <div className={`flex items-center gap-1 text-xs ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {trendValue}
              </div>
            )}
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{title}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function StudentRow({ student, onSendMessage, onViewDetails }: { 
  student: InstructorStudent; 
  onSendMessage: (id: string) => void;
  onViewDetails: (id: string) => void;
}) {
  const status = getStatusConfig(student.status);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-12 gap-4 items-center p-4 rounded-2xl border border-slate-100 hover:border-primary/20 hover:bg-slate-50/30 transition-all duration-300 group"
    >
      {/* 1. Student Identity (col-span-3) */}
      <div className="col-span-12 lg:col-span-3 flex items-center gap-3">
        <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-1 ring-slate-100">
          <AvatarImage src={student.avatarUrl ? (student.avatarUrl.startsWith('http') ? student.avatarUrl : `${import.meta.env.VITE_API_URL || 'https://aotms-lms-new.onrender.com/api'}/s3/public/${student.avatarUrl}`) : `https://api.dicebear.com/9.x/avataaars/svg?seed=${student.userId}`} />
          <AvatarFallback className="bg-primary/5 text-primary text-xs font-black">
            {student.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="font-black text-sm text-slate-900 truncate leading-none mb-1.5">{student.name}</p>
          <Badge variant="outline" className={cn(
            "h-5 px-2 text-[9px] font-black border-none uppercase tracking-tighter",
            status.bg,
            status.text
          )}>
            {status.label}
          </Badge>
        </div>
      </div>

      {/* 2. Contact Details (col-span-3) */}
      <div className="col-span-12 lg:col-span-3 space-y-1">
        <div className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors cursor-default">
          <Mail className="h-3 w-3 opacity-40" />
          <span className="text-[11px] font-bold truncate">{student.email}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-500">
          <Phone className="h-3 w-3 opacity-40" />
          <span className="text-[11px] font-bold">{student.mobileNumber || 'No Mobile'}</span>
        </div>
      </div>

      {/* 3. Enrollments (col-span-2) */}
      <div className="hidden lg:block col-span-2 text-center space-y-0.5">
        <div className="flex items-center justify-center gap-1.5 font-black text-slate-900 text-sm">
          <span>{student.enrolledCourses}</span>
          <BookOpen className="h-3 w-3 opacity-20" />
        </div>
        <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Courses</p>
      </div>

      {/* 4. Learning Progress (col-span-2) */}
      <div className="hidden lg:block col-span-2 space-y-2 px-2">
        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-tight">
          <span className="text-slate-400">Score</span>
          <span className="text-primary">{student.overallProgress}%</span>
        </div>
        <Progress 
          value={student.overallProgress} 
          className="h-1.5 bg-slate-100"
          indicatorClassName={
            student.status === 'completed' ? 'bg-green-500' :
            student.status === 'at-risk' ? 'bg-amber-500' : 'bg-primary'
          }
        />
      </div>

      {/* 5. Last Session & Actions (col-span-2) */}
      <div className="col-span-12 lg:col-span-2 flex items-center justify-between lg:justify-end gap-3 text-right">
        <div className="text-right flex flex-col items-end">
          <span className="text-[11px] font-black text-slate-600 leading-none mb-1">{formatTimeAgo(student.lastActiveAt)}</span>
          <span className="text-[9px] font-black uppercase text-slate-300 tracking-widest leading-none">Activity</span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white hover:shadow-md transition-all border-none bg-transparent">
              <MoreHorizontal className="w-4 h-4 text-slate-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2 border-slate-100 shadow-2xl">
            <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 py-2">Management</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="rounded-xl px-3 h-10 font-bold focus:bg-slate-900 focus:text-white transition-colors cursor-pointer" onClick={() => onViewDetails(student.userId)}>
              <Eye className="w-4 h-4 mr-2 opacity-40 text-blue-600" /> View Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-xl px-3 h-10 font-bold focus:bg-slate-900 focus:text-white transition-colors cursor-pointer" onClick={() => onSendMessage(student.userId)}>
              <Mail className="w-4 h-4 mr-2 opacity-40 text-emerald-600" /> Send Message
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="rounded-xl px-3 h-10 font-bold text-rose-600 focus:bg-slate-900 focus:text-white transition-colors cursor-pointer">
              <UserMinus className="w-4 h-4 mr-2 opacity-40" /> Drop Student
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>

  );
}

function ActivityFeed({ activities, students }: { activities: RecentActivity[]; students: InstructorStudent[] }) {
  const liveStudents = students.filter(s => {
    const lastActive = new Date(s.lastActiveAt).getTime();
    const hourAgo = Date.now() - (60 * 60 * 1000);
    return lastActive > hourAgo;
  });

  const recentCompletions = students
    .filter(s => s.status === 'completed')
    .slice(0, 3)
    .map(s => ({
      id: `completed-${s.userId}`,
      studentId: s.userId,
      studentName: s.name,
      action: 'completed' as const,
      courseName: s.courseEnrollments[0]?.courseTitle || 'Course',
      timestamp: formatTimeAgo(s.lastActiveAt)
    })) as RecentActivity[];

  const allActivities = [...activities, ...recentCompletions]
    .sort((a, b) => {
      const timeA = a.timestamp === 'Just now' ? 0 : a.timestamp.includes('m') ? parseInt(a.timestamp) * 60000 :
                    a.timestamp.includes('h') ? parseInt(a.timestamp) * 3600000 : parseInt(a.timestamp) * 86400000;
      const timeB = b.timestamp === 'Just now' ? 0 : b.timestamp.includes('m') ? parseInt(b.timestamp) * 60000 :
                    b.timestamp.includes('h') ? parseInt(b.timestamp) * 3600000 : parseInt(b.timestamp) * 86400000;
      return timeA - timeB;
    })
    .slice(0, 10);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            Live Activity
          </CardTitle>
          <Badge variant="outline" className="gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            {liveStudents.length} Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-2">
          <div className="space-y-3">
            {allActivities.length > 0 ? (
              allActivities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="mt-0.5">
                    {getActivityIcon(activity.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{activity.studentName}</span>{' '}
                      <span className="text-muted-foreground">
                        {activity.action === 'watching' ? 'is watching' : 
                         activity.action === 'completed' ? 'completed' :
                         activity.action === 'enrolled' ? 'enrolled in' :
                         activity.action === 'started' ? 'started' : 'dropped'}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{activity.courseName}</p>
                    {activity.details && (
                      <p className="text-xs text-amber-500 mt-0.5">{activity.details}</p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {activity.timestamp}
                  </span>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent activity</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function StudentCourseDetails({ studentId, courseId, courseName, progress }: { studentId: string; courseId: string; courseName: string; progress: number }) {
  const { data: videoProgress } = useStudentVideoProgress(studentId, courseId);
  const { data: videos } = useVideos(courseId);
  const [expanded, setExpanded] = useState(false);

  // Merge video data with progress
  const videoList = useMemo(() => {
    if (!videos) return [];
    const vds = videos as CourseVideo[];
    return vds.map((video: CourseVideo) => {
      const vps = videoProgress as VideoProgressDetail[];
      const p = vps?.find((vp: VideoProgressDetail) => vp.video_id === video.id);
      return {
        ...video,
        watched: p?.watched_seconds || 0,
        total: p?.total_seconds || video.duration_seconds || 0,
        completed: p?.completed || false,
        lastWatched: p?.last_watched_at
      };
    }).sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
  }, [videos, videoProgress]);

  return (
    <div className="p-4 rounded-xl border border-slate-100 bg-white">
      <div 
        className="flex items-center justify-between mb-2 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2 overflow-hidden">
            <Button variant="ghost" size="icon" className="h-6 w-6 p-0 hover:bg-slate-100">
                {expanded ? <ChevronRight className="h-4 w-4 rotate-90 transition-transform" /> : <ChevronRight className="h-4 w-4 transition-transform" />}
            </Button>
            <span className="text-sm font-bold text-slate-800 truncate pr-4">{courseName}</span>
        </div>
        <span className="text-xs font-black text-primary whitespace-nowrap">{progress}%</span>
      </div>
      <Progress value={progress} className="h-1.5 mb-2" indicatorClassName={progress === 100 ? 'bg-green-500' : 'bg-primary'} />
      
      {expanded && (
        <div className="mt-4 space-y-2 pl-2 border-l-2 border-slate-100 ml-2">
            {videoList.length > 0 ? (
                videoList.map((video) => (
                    <div key={video.id} className="flex items-center gap-3 text-xs py-1">
                        <div className={cn(
                            "h-4 w-4 rounded-full flex items-center justify-center flex-shrink-0",
                            video.completed ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-400"
                        )}>
                            {video.completed ? <CheckCircle2 className="h-3 w-3" /> : <PlayCircle className="h-3 w-3" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-700 truncate">{video.title}</p>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                <span>{formatWatchTime(Math.round(video.watched / 60))} / {formatWatchTime(Math.round(video.total / 60))}</span>
                                {video.lastWatched && (
                                    <span>• {formatTimeAgo(video.lastWatched)}</span>
                                )}
                            </div>
                        </div>
                        <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden flex-shrink-0">
                            <div 
                                className="h-full bg-blue-500 rounded-full" 
                                style={{ width: `${Math.min(100, (video.watched / video.total) * 100)}%` }}
                            />
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-xs text-muted-foreground italic pl-2">No videos found for this course.</p>
            )}
        </div>
      )}
    </div>
  );
}

export function InstructorStudentDashboard() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { data: students, isLoading: studentsLoading, refetch } = useInstructorAllStudents();
  const { data: courses, isLoading: coursesLoading } = useInstructorCourses();
  const { stats, isLoading: statsLoading } = useInstructorStudentStats();
  const sendReminder = useSendReminder();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activities] = useState<RecentActivity[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<InstructorStudent | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);


  const filteredStudents = useMemo(() => {
    if (!students) return [];
    
    return students.filter(student => {
      const matchesSearch = 
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
      const matchesCourse = courseFilter === 'all' || 
        student.courseEnrollments.some(e => e.courseId === courseFilter);
      return matchesSearch && matchesStatus && matchesCourse;
    });
  }, [students, searchQuery, statusFilter, courseFilter]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast({ title: 'Data refreshed', description: 'Student data has been updated' });
    } catch (error) {
      toast({ title: 'Error refreshing data', variant: 'destructive' });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSendMessage = (studentId: string) => {
    // Navigate to chat with student selected
    navigate(`/instructor/chat?recipientId=${studentId}&showProfile=true`);
  };

  const handleViewDetails = (studentId: string) => {
    const student = students?.find(s => s.userId === studentId);
    if (student) {
      setSelectedStudent(student);
      setIsDetailOpen(true);
    }
  };


  const loading = studentsLoading || statsLoading || coursesLoading;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Student Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor student progress and engagement across all your courses
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Students" 
          value={loading ? '...' : stats.totalStudents} 
          icon={Users} 
          color="bg-primary/10 text-primary"
          loading={loading}
        />
        <StatCard 
          title="Active Now" 
          value={loading ? '...' : stats.activeStudents} 
          icon={Activity} 
          color="bg-green-500/10 text-green-500"
          loading={loading}
        />
        <StatCard 
          title="Total Watch Time" 
          value={loading ? '...' : stats.totalWatchTimeMinutes} 
          icon={Clock} 
          color="bg-blue-500/10 text-blue-500"
          loading={loading}
        />
        <StatCard 
          title="Course Enrollments" 
          value={loading ? '...' : stats.totalEnrollments} 
          icon={BookOpen} 
          color="bg-purple-500/10 text-purple-500"
          loading={loading}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <CardTitle className="text-base">All Students ({filteredStudents.length})</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search students..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-9 w-[200px]"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[130px] h-9">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="hidden lg:grid grid-cols-12 gap-4 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b bg-slate-50/50 rounded-t-xl">
                <div className="col-span-3">Student Identity</div>
                <div className="col-span-3">Contact Details</div>
                <div className="col-span-2 text-center">Enrollments</div>
                <div className="col-span-2 text-center">Learning Progress</div>
                <div className="col-span-2 text-right">Last Session</div>
              </div>

              <ScrollArea className="h-[400px] pr-2">
                <div className="space-y-2">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <StudentRow
                        key={student.id}
                        student={student}
                        onSendMessage={handleSendMessage}
                        onViewDetails={handleViewDetails}
                      />
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Users className="w-10 h-10 text-muted-foreground/50 mb-2" />
                      <p className="text-sm text-muted-foreground">No students found</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {searchQuery || statusFilter !== 'all' || courseFilter !== 'all'
                          ? 'Try adjusting your filters' 
                          : 'Students will appear once they enroll in your courses'}
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">

          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                Course Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {coursesLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="space-y-2 animate-pulse">
                      <div className="h-4 w-32 bg-muted rounded" />
                      <div className="h-2 w-full bg-muted rounded" />
                    </div>
                  ))}
                </div>
              ) : (courses as Course[]) && (courses as Course[]).length > 0 ? (
                (courses as Course[]).slice(0, 5).map((course: Course) => {
                  const enrolledCount = students?.filter(s => 
                    s.courseEnrollments.some(e => e.courseId === course.id)
                  ).length || 0;
                  const completedCount = students?.filter(s => 
                    s.courseEnrollments.some(e => e.courseId === course.id && e.progress === 100)
                  ).length || 0;
                  const avgProgress = enrolledCount > 0 
                    ? Math.round(
                        (students
                          ?.filter(s => s.courseEnrollments.some(e => e.courseId === course.id))
                          .reduce((acc, s) => acc + (s.courseEnrollments.find(e => e.courseId === course.id)?.progress || 0), 0) || 0)
                        / enrolledCount
                      )
                    : 0;

                  return (
                    <div key={course.id} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground truncate flex-1 mr-2">{course.title}</span>
                        <span className="font-medium">{avgProgress}%</span>
                      </div>
                      <Progress value={avgProgress} className="h-2" indicatorClassName={
                        avgProgress >= 70 ? 'bg-green-500' : 
                        avgProgress >= 40 ? 'bg-blue-500' : 'bg-amber-500'
                      } />
                      <p className="text-xs text-muted-foreground">
                        {enrolledCount} enrolled, {completedCount} completed
                      </p>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No courses yet</p>
                  <p className="text-xs">Create courses to track student progress</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl rounded-[2rem]">
          {selectedStudent && (
            <div className="bg-white">
              <DialogHeader className="sr-only">
                <DialogTitle>Student Profile</DialogTitle>
                <DialogDescription>Details for {selectedStudent.name}</DialogDescription>
              </DialogHeader>
              <div className="bg-slate-900 h-24 relative">
                <div className="absolute -bottom-8 left-8">
                  <Avatar className="h-20 w-20 border-4 border-white shadow-xl">
                    <AvatarFallback className="bg-primary/10 text-primary text-xl font-black">
                      {selectedStudent.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <div className="pt-12 px-8 pb-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">{selectedStudent.name}</h3>
                    <p className="text-sm font-medium text-slate-400">Student ID: {selectedStudent.userId.slice(0, 8)}...</p>
                  </div>
                  <Badge className={`${getStatusConfig(selectedStudent.status).bg} ${getStatusConfig(selectedStudent.status).text} h-8 px-4 rounded-full font-bold border-none`}>
                    {getStatusConfig(selectedStudent.status).label}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</p>
                    <p className="text-sm font-bold text-slate-700 truncate">{selectedStudent.email}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mobile Number</p>
                    <p className="text-sm font-bold text-slate-700">{selectedStudent.mobileNumber || 'Not provided'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <BookOpen className="h-3 w-3" /> Enrolled Courses
                  </h4>
                  <ScrollArea className="h-[200px] pr-4">
                    <div className="space-y-3">
                      {selectedStudent.courseEnrollments.map((course) => (
                        <StudentCourseDetails
                            key={course.courseId}
                            studentId={selectedStudent.userId}
                            courseId={course.courseId}
                            courseName={course.courseTitle}
                            progress={course.progress}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                <div className="pt-2 flex gap-3">
                   <Button variant="outline" className="flex-1 h-12 rounded-xl font-bold border-slate-200" onClick={() => setIsDetailOpen(false)}>Close</Button>
                   <Button className="flex-1 h-12 rounded-xl pro-button-primary font-black gap-2" onClick={() => handleSendMessage(selectedStudent.userId)}>
                     <Mail className="h-4 w-4" /> Message Student
                   </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>

  );
}
