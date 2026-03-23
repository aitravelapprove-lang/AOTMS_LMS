import { useLocation, useNavigate } from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sparkles, 
  Users, 
  ArrowUpRight,
  BookOpen,
  Trophy,
  Clock,
  TrendingUp,
  Play,
  Calendar,
  FileText,
  Award,
  User,
  Video,
  ClipboardCheck,
  History,
  Bell,
  Settings,
  Target,
  Medal,
  ChevronRight,
  Copy,
  MessageSquare,
  Folder,
  MonitorPlay
} from "lucide-react";
import { UserProfile } from "./UserProfile";
import { CourseList } from "./CourseList";
import { StudentCourseViewer } from "./StudentCourseViewer";
import { StudentHistory } from "./StudentHistory";
import StudentResources from "./StudentResources";
import StudentVideoLibrary from "./StudentVideoLibrary";
import { ExamModule } from "./ExamModule";
import { Notifications } from "./Notifications";
import { StudentSettings } from "./StudentSettings";
import { ChatInterface } from "../chat/ChatInterface";
import {
  StudentCourse,
  useStudentAnnouncements,
  useLeaderboard,
  useLiveClasses,
  useStudentStats,
  useEnrolledCourses,
  useEnrollCourse,
  Announcement,
  LeaderboardEntry,
  LiveClass,
} from "@/hooks/useStudentData";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";

import { useToast } from "@/components/ui/use-toast";

// ─── Shared Components ────────────────────────────────────────────────────────

function CoursesTab() {
  const [viewingCourse, setViewingCourse] = useState<StudentCourse | null>(null);
  const [courseTab, setCourseTab] = useState<'enrolled' | 'available'>('enrolled');
  const { toast } = useToast();
  const enrollMutation = useEnrollCourse();

  if (viewingCourse) {
    return (
      <StudentCourseViewer
        course={viewingCourse}
        isEnrolled={viewingCourse.enrollmentStatus === 'active'}
        onBack={() => setViewingCourse(null)}
      />
    );
  }

  const handleEnroll = async (course: StudentCourse) => {
    try {
      await enrollMutation.mutateAsync(course.id);
      toast({
        title: "Enrollment Requested",
        description: `Enrollment for ${course.title} submitted! Waiting for admin approval.`,
        className: "bg-amber-50 border-amber-200"
      });
      setCourseTab('enrolled'); // Switch back to 'My Courses'
    } catch (err) {
      const error = err as Error;
      toast({
        title: "Enrollment Failed",
        description: error.message || "An error occurred during enrollment.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="w-full space-y-8 h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Tabs value={courseTab} onValueChange={(v) => setCourseTab(v as 'enrolled' | 'available')} className="w-full sm:w-auto">
          <TabsList className="bg-slate-100/50 p-1 rounded-xl">
            <TabsTrigger value="enrolled" className="rounded-lg px-6 py-2">My Courses</TabsTrigger>
            <TabsTrigger value="available" className="rounded-lg px-6 py-2">Course Catalog</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="h-full">
        {courseTab === 'enrolled' ? (
          <CourseList
            type="enrolled"
            onSelectCourse={(c) => {
              if (c.enrollmentStatus === 'pending') {
                toast({
                  title: "Enrollment Pending",
                  description: "Admin approval required for full access.",
                  variant: "default"
                });
                return;
              }
              if (c.enrollmentStatus === 'rejected') {
                toast({
                  title: "Enrollment Rejected",
                  description: "Your enrollment for this course was rejected.",
                  variant: "destructive"
                });
                return;
              }
              setViewingCourse(c);
            }}
          />
        ) : (
          <CourseList
            type="available"
            onSelectCourse={handleEnroll}
          />
        )}
      </div>
    </div>
  );
}

function AnnouncementsSection() {
  const { data: announcements, isLoading } = useStudentAnnouncements();

  return (
    <Card className="pro-card border-none shadow-md overflow-hidden bg-white">
      <CardHeader className="pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800">
          <Bell className="h-5 w-5 text-accent animate-pulse" />
          Campus Announcements
        </CardTitle>
        {announcements && announcements.length > 0 && (
          <Badge className="bg-accent/10 text-accent hover:bg-accent/20 border-none font-bold px-2 py-0.5 shadow-none">
            {announcements.length} New
          </Badge>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[320px]">
          {isLoading ? (
            <div className="p-5 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-4 w-2/3 rounded-full" />
                  <Skeleton className="h-3 w-full rounded-full" />
                </div>
              ))}
            </div>
          ) : !announcements || announcements.length === 0 ? (
            <div className="p-10 text-center flex flex-col items-center justify-center h-full">
              <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                 <Bell className="h-5 w-5 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-600">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {announcements.map((item: Announcement) => (
                <div
                  key={item.id}
                  className="p-5 hover:bg-slate-50 transition-colors cursor-default border-l-2 border-transparent hover:border-accent"
                >
                  <div className="flex justify-between items-start mb-2 gap-4">
                    <h4 className="font-bold text-sm text-slate-900 leading-tight">
                      {item.title}
                    </h4>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md shrink-0">
                      {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium">
                    {item.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function LeaderboardTab() {
  const { data: board, isLoading } = useLeaderboard();

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2 mb-8">
         <Badge className="bg-accent/10 text-accent hover:bg-accent/20 border-none mb-4 tracking-widest uppercase font-bold text-[10px] px-3 py-1">Global Rankings</Badge>
         <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Top Scholars</h2>
         <p className="text-slate-600 font-medium">Inspiring excellence across the academy network.</p>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-4 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 space-y-4">
          {isLoading ? (
            [1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-2xl" />
            ))
          ) : !board || board.length === 0 ? (
            <div className="text-center py-16">
              <Trophy className="h-12 w-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-600 font-medium text-lg">Rankings are hidden until exams begin.</p>
            </div>
          ) : (
            board.map((user: LeaderboardEntry, idx: number) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                key={user.id}
                className={`flex items-center gap-4 md:gap-6 p-4 md:p-6 rounded-2xl transition-all duration-300 hover:shadow-md border ${
                  idx === 0 
                    ? "bg-gradient-to-r from-accent/10 to-transparent border-accent/20 shadow-sm" 
                    : idx === 1 
                      ? "bg-gradient-to-r from-slate-100 to-transparent border-slate-200"
                      : idx === 2
                        ? "bg-gradient-to-r from-orange-50 to-transparent border-orange-100"
                        : "bg-white border-slate-100 hover:border-primary/20"
                }`}
              >
                <div className="flex shrink-0 w-8 justify-center">
                  {idx === 0 ? <Trophy className="h-6 w-6 text-accent" /> : 
                   idx < 3 ? <Medal className={`h-6 w-6 ${idx === 1 ? 'text-slate-500' : 'text-orange-400'}`} /> :
                   <span className="font-bold text-slate-500 text-lg">#{idx + 1}</span>}
                </div>
                
                <Avatar className={`h-12 w-12 md:h-14 md:w-14 border-[3px] shadow-sm ${idx === 0 ? 'border-accent' : 'border-white'}`}>
                  <AvatarImage src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${user.user_id}`} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {user.user_id.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 text-base md:text-lg truncate">
                    Scholar {user.user_id.slice(0, 6)}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                     <Badge variant="secondary" className="bg-slate-100 hover:bg-slate-200 text-slate-600 border-none font-semibold text-[10px]">
                        {user.exams_completed} Exams
                     </Badge>
                  </div>
                </div>
                
                <div className="text-right shrink-0">
                  <p className={`font-black tracking-tight text-xl md:text-3xl ${idx === 0 ? 'text-accent' : 'text-primary'}`}>
                    {user.total_score}
                  </p>
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mt-0.5">
                    Credits
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function LiveClassesTab() {
  const { data: classes, isLoading } = useLiveClasses();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCopyPassword = (e: React.MouseEvent, password?: string) => {
    e.stopPropagation();
    if (!password) return;
    navigator.clipboard.writeText(password);
    toast({
      title: "Password Copied",
      description: "Meeting passcode copied to clipboard.",
      className: "bg-blue-50 border-blue-200"
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Virtual Classrooms</h2>
            <p className="text-slate-600 font-medium">Join scheduled interactive sessions with your instructors.</p>
          </div>
       </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          [1, 2, 3].map((i) => <Skeleton key={i} className="h-[280px] rounded-2xl" />)
        ) : !classes || classes.length === 0 ? (
          <div className="col-span-full py-24 text-center bg-white rounded-3xl border border-dashed border-slate-200 flex flex-col items-center">
            <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
               <Video className="h-8 w-8 text-primary/40" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">No Upcoming Sessions</h3>
            <p className="text-base font-medium text-slate-600 mt-2 max-w-sm">
              Your instructors haven't scheduled any new live broadcasts yet.
            </p>
          </div>
        ) : (
          classes.map((session: LiveClass) => (
            <Card
              key={session.id}
              className="pro-card group cursor-default hover:-translate-y-1 transition-all duration-300"
            >
              <div className="h-32 bg-primary p-6 flex flex-col justify-end text-white relative overflow-hidden rounded-t-xl">
                {/* Decorative Mesh */}
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white border border-white/30">
                  {session.status}
                </div>
                <h3 className="font-bold text-xl line-clamp-1 relative z-10 drop-shadow-sm">
                  {session.title}
                </h3>
              </div>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-sm font-medium text-slate-600">
                    <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                      <Calendar className="h-4.5 w-4.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Date</p>
                      <p className="text-slate-900 font-semibold text-sm">
                        {new Date(session.scheduled_at).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm font-medium text-slate-600">
                    <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-accent/5 transition-colors">
                      <Clock className="h-4.5 w-4.5 text-accent" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Time & Duration</p>
                      <p className="text-slate-900 font-semibold text-sm">
                        {new Date(session.scheduled_at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                        <span className="text-slate-500"> • {session.duration_minutes || 60} min</span>
                      </p>
                    </div>
                  </div>
                  
                  {session.meeting_password && (
                    <div className="flex items-center gap-4 text-sm font-medium text-slate-600">
                      <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                        <Users className="h-4.5 w-4.5 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Meeting Passcode</p>
                        <div className="flex items-center gap-2">
                          <code className="bg-slate-100 px-2 py-0.5 rounded text-slate-900 font-mono font-bold text-sm tracking-widest border border-slate-200">
                            {session.meeting_password}
                          </code>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 hover:bg-slate-200" 
                            onClick={(e) => handleCopyPassword(e, session.meeting_password)}
                            title="Copy Passcode"
                          >
                            <Copy className="h-3.5 w-3.5 text-slate-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => session.meeting_id && navigate(`/live/${session.meeting_id}?role=0&pwd=${session.meeting_password || ''}`)}
                  className="w-full pro-button-primary"
                  disabled={!session.meeting_id}
                >
                  Join Broadcast
                  <Video className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Main Dashboard Home ──────────────────────────────────────────────────────

function DashboardHome() {
  const { data: stats } = useStudentStats();
  const { data: enrolledCourses } = useEnrolledCourses();
  const { user } = useAuth();
  const latestCourse = enrolledCourses?.[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-4">
        <div>
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none mb-3 tracking-widest uppercase font-bold text-[10px] px-3 py-1">Student Portal</Badge>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
            Welcome back, <span className="text-primary italic">{user?.user_metadata?.full_name?.split(" ")[0] || "Student"}</span>.
          </h1>
          <p className="text-slate-600 font-medium mt-2 text-base md:text-lg">
            Let's continue building your tech career today.
          </p>
        </div>
        <div className="hidden md:flex gap-3">
           <Button variant="outline" className="h-12 px-6 rounded-xl border-slate-200 text-slate-600 font-semibold" onClick={() => window.location.href='/student-dashboard/courses'}>
              View All Courses
           </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Active Courses", value: stats?.enrolled_courses || enrolledCourses?.length || 0, icon: BookOpen, color: "blue", desc: "Currently enrolled" },
          { title: "Completed Modules", value: stats?.completed_courses || 0, icon: Target, color: "orange", desc: "Milestones reached" },
          { title: "Hours Learned", value: `${stats?.total_watch_minutes ? Math.floor(stats.total_watch_minutes / 60) : 0}h`, icon: Clock, color: "blue", desc: "Total screen time" },
          { title: "Certificates", value: stats?.certificates_earned || 0, icon: Award, color: "orange", desc: "Verified credentials" },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="pro-card group cursor-default"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-slate-600 uppercase tracking-wider">
                {kpi.title}
              </CardTitle>
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-colors ${kpi.color === 'blue' ? 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white' : 'bg-accent/10 text-accent group-hover:bg-accent group-hover:text-white'}`}>
                <kpi.icon className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-slate-900 tracking-tight">
                {kpi.value}
              </div>
              <p className="text-xs font-medium text-slate-500 mt-1">
                {kpi.desc}
              </p>
            </CardContent>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Continue Learning - Spans 2 cols */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="pro-card overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-900">
                    <Play className="h-5 w-5 fill-accent text-accent" />
                    Continue Learning
                  </CardTitle>
                  <CardDescription className="text-slate-600 font-medium mt-1">
                    Resume your most recent training module
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {!latestCourse ? (
                <div className="py-12 flex flex-col items-center justify-center text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <BookOpen className="h-12 w-12 text-primary/20 mb-4" />
                  <p className="font-bold text-slate-800 text-lg">Your learning path is clear.</p>
                  <p className="text-sm font-medium text-slate-600 max-w-sm mt-1 mb-6">
                    Enroll in a new course to start upgrading your tech skills.
                  </p>
                  <Button className="pro-button-primary" asChild>
                    <a href="/student-dashboard/courses">Browse Catalog</a>
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row gap-6 md:items-center">
                  <div className="aspect-video md:w-64 shrink-0 rounded-xl overflow-hidden bg-slate-100 relative group cursor-pointer shadow-sm border border-slate-200">
                    <img
                      src={latestCourse.thumbnail_url?.startsWith("http") ? latestCourse.thumbnail_url : `${API_URL}/s3/public/${latestCourse.thumbnail_url}`}
                      alt={latestCourse.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop"; }}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/50">
                          <Play className="h-5 w-5 text-white fill-white ml-1" />
                       </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0 space-y-4">
                    <div>
                      <Badge className="bg-primary/10 hover:bg-primary/20 text-primary border-none text-[10px] font-bold uppercase tracking-widest mb-2">Priority Module</Badge>
                      <h4 className="font-bold text-slate-900 text-xl md:text-2xl line-clamp-2 leading-tight">
                        {latestCourse.title}
                      </h4>
                    </div>
                    
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Course Progress</span>
                        <span className="text-lg font-black text-primary">{latestCourse.progress}%</span>
                      </div>
                      <Progress value={latestCourse.progress} className="h-2 bg-slate-200 [&>div]:bg-primary" />
                    </div>

                    {latestCourse.enrollmentStatus === 'pending' ? (
                      <Button className="w-full sm:w-auto bg-amber-100 text-amber-700 hover:bg-amber-100 cursor-not-allowed">
                        Pending Admin Approval
                      </Button>
                    ) : (
                      <Button className="pro-button-primary w-full sm:w-auto" asChild>
                        <a href={`/student-dashboard/courses?courseId=${latestCourse.id}`}>
                          Resume Training <ChevronRight className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Announcements - Spans 1 col */}
        <div className="lg:col-span-1 border-none shadow-none">
          <AnnouncementsSection />
        </div>
      </div>
    </div>
  );
}

// ─── Routing Map ──────────────────────────────────────────────────────────────

const routeConfig: Record<string, { title: string; description: string; icon: React.ElementType; component?: React.ReactNode; }> = {
  "/student-dashboard/profile": {
    title: "Student Profile",
    description: "Manage your credentials and portfolio",
    icon: User,
    component: <UserProfile />,
  },
  "/student-dashboard/courses": {
    title: "Learning Library",
    description: "Access your enrolled courses and training materials",
    icon: BookOpen,
    component: <CoursesTab />,
  },
  "/student-dashboard/live-classes": {
    title: "Virtual Campus",
    description: "Join scheduled interactive sessions with instructors",
    icon: Video,
    component: <LiveClassesTab />,
  },
  "/student-dashboard/videos": {
    title: "Video Library",
    description: "Browse and watch video lessons from your enrolled courses",
    icon: MonitorPlay,
    component: <StudentVideoLibrary />,
  },
  "/student-dashboard/resources": {
    title: "Course Resources",
    description: "Download study materials and reference documents",
    icon: Folder,
    component: <StudentResources />,
  },
  "/student-dashboard/mock-papers": {
    title: "Simulation Lab",
    description: "Practice with timed mock examinations",
    icon: FileText,
    component: <ExamModule type="mock" />,
  },
  "/student-dashboard/history": {
    title: "Academic Record",
    description: "Review your past performance and transcripts",
    icon: History,
    component: <StudentHistory />,
  },
  "/student-dashboard/leaderboard": {
    title: "Global Rankings",
    description: "See how you rank among top tech scholars",
    icon: Trophy,
    component: <LeaderboardTab />,
  },
  "/student-dashboard/notifications": {
    title: "Communications",
    description: "Important updates from the academy",
    icon: Bell,
    component: <Notifications />,
  },
  "/student-dashboard/chat": {
    title: "Messages",
    description: "Chat with your instructors and peers",
    icon: MessageSquare,
    component: <ChatInterface />,
  },
  "/student-dashboard/settings": {
    title: "Preferences",
    description: "Configure your digital learning environment",
    icon: Settings,
    component: <StudentSettings />,
  },
};

export function DashboardContent() {
  const location = useLocation();
  const currentPath = location.pathname;

  if (currentPath === "/student-dashboard" || currentPath === "/student-dashboard/") {
    return <DashboardHome />;
  }

  const config = routeConfig[currentPath];

  if (config) {
    if (config.component) {
      return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 border-b border-slate-200 pb-6">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/10">
              <config.icon className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                {config.title}
              </h1>
              <p className="text-base font-medium text-slate-600 mt-1">{config.description}</p>
            </div>
          </div>
          <div className="w-full">
            {config.component}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 border-b border-slate-200 pb-6">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/10">
            <config.icon className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              {config.title}
            </h1>
            <p className="text-base font-medium text-slate-600 mt-1">{config.description}</p>
          </div>
        </div>
        
        <Card className="pro-card border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-24 text-center">
            <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <config.icon className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">
              Feature in Development
            </h3>
            <p className="text-base font-medium text-slate-600 max-w-md">
              The engineering team is currently upgrading this section. It will be available shortly.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <DashboardHome />;
}
