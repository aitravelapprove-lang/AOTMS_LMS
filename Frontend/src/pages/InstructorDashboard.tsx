import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { InstructorSidebar } from "@/components/instructor/InstructorSidebar";
import { InstructorHeader } from "@/components/instructor/InstructorHeader";
import { useAuth } from "@/hooks/useAuth";
import {
  useInstructorCourses,
  useInstructorStats,
  useInstructorRatings,
  Course,
  CourseRating,
} from "@/hooks/useInstructorData";
import { useSocket } from "@/hooks/useSocket";
import { useToast } from "@/hooks/use-toast";
import { InstructorStats } from "@/components/instructor/dashboard/InstructorStats";
import { InstructorCourses } from "@/components/instructor/courses/InstructorCourses";
import { InstructorStudentDashboard } from "@/components/instructor/dashboard/InstructorStudentDashboard";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { QuestionBankManager } from "@/components/manager/QuestionBankManager";
import { ExamScheduler } from "@/components/manager/ExamScheduler";
import { InstructorVideoLibrary } from "@/components/instructor/dashboard/InstructorVideoLibrary";
import { LiveClassManager } from "@/components/instructor/dashboard/LiveClassManager";
import { UserProfile } from "@/components/dashboard/UserProfile";
import { ResumeScanHistory } from "@/components/admin/ResumeScanHistory";
import { StudentResumeScan } from "@/components/dashboard/StudentResumeScan";
import { InstructorNotifications } from "@/components/instructor/dashboard/InstructorNotifications";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { fetchWithAuth } from "@/lib/api";
import {
  Bell,
  Sparkles,
  RefreshCw,
  Plus,
  LayoutDashboard,
  BarChart3,
  Clock,
  BookOpen,
  Users,
  Calendar,
  ChevronRight,
  TrendingUp,
  BrainCircuit,
  Activity,
  User,
  Video,
  Star,
  Eye,
  MessageSquare,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DashboardStats {
  totalStudents: number;
  contentItems: number;
  avgCompletion: number;
  activeStudents?: number;
  pendingAssignments?: number;
  upcomingClasses?: number;
  avgRating?: number;
  totalEarnings?: number;
}

// ─── Feedback Modal Component ──────────────────────────────────────────────
function FeedbackModal({ 
  ratings, 
  isOpen, 
  onOpenChange 
}: { 
  ratings: CourseRating[], 
  isOpen: boolean, 
  onOpenChange: (open: boolean) => void 
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-4xl p-0 overflow-hidden bg-white border-none shadow-2xl rounded-2xl sm:rounded-3xl">
        <DialogHeader className="p-6 sm:p-10 border-b border-slate-50 bg-slate-50/50">
           <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-yellow-400 flex items-center justify-center text-white shadow-lg shadow-yellow-400/20">
                 <Star className="h-7 w-7 fill-white" />
              </div>
              <div>
                  <DialogTitle className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight italic uppercase">Student Pulse Detail</DialogTitle>
                 <DialogDescription className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Full analytical breakdown of scholar testimonials</DialogDescription>
              </div>
           </div>
        </DialogHeader>
        <div className="p-6 sm:p-10 max-h-[60vh] overflow-y-auto custom-scrollbar bg-white">
          {ratings.length === 0 ? (
            <div className="py-20 text-center opacity-40">
               <MessageSquare className="h-16 w-16 mx-auto mb-6 text-slate-300" />
               <p className="text-xl font-bold uppercase tracking-widest text-slate-500">Zero Pulse Detected</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 text-left">
              {ratings.map((r: CourseRating) => (
                <div key={r.id} className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 group hover:bg-white hover:shadow-2xl hover:border-transparent transition-all duration-500">
                  <div className="flex items-center gap-5 mb-6">
                    <Avatar className="h-14 w-14 border-4 border-white shadow-xl">
                        <AvatarImage src={r.user_avatar} />
                        <AvatarFallback className="bg-primary/10 text-primary font-black uppercase text-xs">{r.user_name?.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                       <h5 className="font-black text-xl text-slate-900 truncate">{r.user_name}</h5>
                       <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] truncate">{r.course_title}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 mb-5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={`h-4 w-4 ${star <= r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`} />
                    ))}
                  </div>
                  <p className="text-base text-slate-600 font-medium italic leading-relaxed text-left">"{r.review || 'Excellent module architecture. Highly intuitive teaching methodology.'}"</p>
                  <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200/50">
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(r.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                     <Badge className="bg-emerald-500 text-white border-none text-[8px] font-black uppercase px-3 h-5 flex items-center gap-1 rounded-full">
                        Pulsar Verified
                     </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface LiveClass {
  id: string;
  topic: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  [key: string]: unknown;
}

// ─── Active Sessions Component ───────────────────────────────────────────────
function ActiveSessions() {
  const [sessions, setSessions] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    try {
      const data = await fetchWithAuth('/data/live_classes?status=eq.live') as LiveClass[];
      setSessions(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  if (loading) return (
    <>
      {[1, 2, 3].map(i => (
        <div key={i} className="h-40 bg-slate-100 animate-pulse rounded-2xl" />
      ))}
    </>
  );
  
  if (sessions.length === 0) return null;

  return (
    <>
      {sessions.map((s: LiveClass) => (
        <div key={s.id} className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                <Video className="h-7 w-7" />
            </div>
            <div className="min-w-0">
              <h5 className="font-black text-slate-900 group-hover:text-primary transition-colors truncate">{s.topic}</h5>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Broadcast</p>
            </div>
          </div>
          <Button 
            className="w-full bg-slate-900 hover:bg-black text-white rounded-xl h-12 text-xs font-bold shadow-lg" 
            onClick={() => window.location.href='/instructor/live-classes'}
          >
            Enter Session Room
          </Button>
        </div>
      ))}
    </>
  );
}

// ─── Welcome Component ────────────────────────────────────────────────────────
function WelcomeBanner({ 
  name, 
  stats, 
  navigate 
}: { 
  name: string, 
  stats?: DashboardStats, 
  navigate: (path: string) => void 
}) {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // Dynamic stats
  const studentCount = stats?.totalStudents || 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] group"
    >
      {/* Premium Gradient Background Layers */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-1000" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors duration-1000" />

      <div className="relative z-10 p-6 sm:p-8 md:p-12 flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-10">
        <div className="space-y-4">
          <Badge className="bg-primary/10 text-primary border-primary/20 font-black px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.2em] shadow-sm backdrop-blur-md inline-flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" />
            Instructor Hub
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900">
            {greeting},{" "}
            <span className="text-primary italic inline-block hover:-translate-y-1 transition-transform cursor-default">
              {name.split(" ")[0]}
            </span>
            .
          </h1>
          <p className="text-slate-600 max-w-xl font-medium text-base md:text-lg leading-relaxed">
            Welcome back to your teaching portal. You have{" "}
            <span className="text-slate-900 font-bold bg-slate-100 px-2 py-0.5 rounded-md">{studentCount} students</span> enrolled in your courses. 
            All systems are ready for your next teaching session.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
          <Button 
            className="h-12 md:h-14 px-6 md:px-8 w-full sm:w-auto rounded-2xl bg-primary hover:bg-primary/95 text-white font-bold text-sm md:text-base shadow-[0_8px_20px_rgba(20,100,250,0.2)] hover:shadow-[0_10px_25px_rgba(20,100,250,0.3)] hover:-translate-y-0.5 transition-all duration-300 border border-transparent"
            onClick={() => navigate('/instructor/courses')}
          >
            <Plus className="mr-2 h-4 w-4 md:h-5 md:w-5" />
            Create New Course
          </Button>
          <Button
            variant="outline"
            className="h-12 md:h-14 px-6 md:px-8 w-full sm:w-auto rounded-2xl bg-white/50 backdrop-blur-md border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-semibold text-sm md:text-base shadow-sm hover:shadow hover:-translate-y-0.5 transition-all duration-300"
            onClick={() => navigate('/instructor/live-classes')}
          >
            <Calendar className="mr-2 h-4 w-4 md:h-5 md:w-5 text-slate-500" />
            View Schedule
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Dashboard Component ─────────────────────────────────────────────────
export default function InstructorDashboard() {
  const { user, loading: authLoading, userRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    data: courses = [] as Course[],
    isLoading: coursesLoading,
    refetch,
  } = useInstructorCourses() as { data: Course[]; isLoading: boolean; refetch: () => void };
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useInstructorStats() as { 
    data: DashboardStats; 
    isLoading: boolean; 
    refetch: () => void 
  };
  const { socket } = useSocket();
  const { toast } = useToast();
  const { data: ratings = [] } = useInstructorRatings();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const avgRating = ratings.length > 0 
    ? (ratings.reduce((acc, r) => acc + (r.rating || 0), 0) / ratings.length).toFixed(1)
    : "5.0";

  useEffect(() => {
    if (socket) {
      const handleNotification = (notif: { title?: string; message: string }) => {
        toast({
          title: notif.title || "New Notification",
          description: notif.message,
          className: "bg-slate-900 text-white border-primary/50 shadow-2xl",
        });
        // Refetch data when notifications arrive to keep dashboard fresh
        refetch();
        refetchStats();
      };

      socket.on("notification", handleNotification);
      return () => {
        socket.off("notification", handleNotification);
      };
    }
  }, [socket, refetch, refetchStats, toast]);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate("/auth");
      } else if (userRole !== "instructor" && userRole !== "admin") {
        navigate("/student-dashboard");
      }
    }
  }, [user, authLoading, userRole, navigate]);

  useEffect(() => {
    if (user?.id && authLoading === false) {
      refetch();
    }
  }, [user?.id, authLoading, refetch]);

  if (authLoading || coursesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <RefreshCw className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  const path = location.pathname;
  const isRoot = path === "/instructor" || path === "/instructor/";
  const isMyCourses = path === "/instructor/my-courses";
  const isCourses = path.startsWith("/instructor/courses");
  const isStudents = path === "/instructor/students";
  const isVideos = path === "/instructor/videos";
  const isLiveClasses = path === "/instructor/live-classes";
  const isChat = path === "/instructor/chat";
  const isQuestionBank = path === "/instructor/question-bank";
  const isExams = path === "/instructor/exams";
  const isProfile = path === "/instructor/profile";
  const isResumeScans = path === "/instructor/resume-scans";
  const isNotifications = path === "/instructor/notifications";

  return (
    <SidebarProvider className="h-screen w-full overflow-hidden mesh-bg font-sans">
      <InstructorSidebar />
      <SidebarInset className="flex flex-col h-screen w-full overflow-hidden bg-transparent">
        <InstructorHeader />

        <main className="flex-1 w-full overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-8 lg:p-10 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-10">
            <AnimatePresence mode="wait">
              {/* ── Dashboard Root ─────────────────────────────────────────── */}
              {isRoot && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-10"
                >
                  <WelcomeBanner
                    name={user?.full_name || user?.user_metadata?.full_name || "Instructor"}
                    stats={stats}
                    navigate={navigate}
                  />

                  <InstructorStats
                    coursesCount={courses.length}
                    stats={stats}
                    loading={statsLoading || coursesLoading}
                  />

                  <div className="space-y-10">
                    <div className="pro-card p-1 bg-white min-w-0 overflow-hidden mt-6 lg:mt-10 border-slate-200 shadow-md">
                      <div className="p-4 sm:p-6 md:p-10 lg:p-12 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 bg-slate-50/30">
                        <div className="space-y-2">
                           <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                              Featured & Recent Curricula
                           </h3>
                           <p className="text-sm font-bold text-slate-400 mt-1">Manage and oversee your latest course developments</p>
                           
                           <div className="group relative flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-100 shadow-sm w-fit mt-3 animate-in fade-in slide-in-from-left-2 duration-700">
                             <div className="flex gap-0.5">
                               {[1, 2, 3, 4, 5].map((star) => (
                                 <Star key={star} className={`h-3 w-3 ${star <= Math.round(Number(avgRating)) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                               ))}
                             </div>
                             <span className="text-[10px] font-black text-amber-700 uppercase tracking-tighter">
                               {avgRating} Average Peer Rating
                             </span>
                             <button
                               onClick={() => setIsFeedbackOpen(true)}
                               className="ml-2 h-6 w-6 rounded-full bg-amber-400 flex items-center justify-center text-white hover:bg-amber-500 transition-colors shadow-sm"
                               title="View Detailed Student Pulse"
                             >
                               <Eye className="h-3 w-3" />
                             </button>
                           </div>
                           
                           <FeedbackModal 
                             ratings={ratings} 
                             isOpen={isFeedbackOpen} 
                             onOpenChange={setIsFeedbackOpen} 
                           />
                        </div>
                        <Badge variant="secondary" className="w-fit bg-primary/10 text-primary border-none text-[12px] uppercase font-black tracking-widest px-4 py-2 rounded-lg">
                          {courses.length} Total Curricula
                        </Badge>
                      </div>
                      <div className="overflow-x-auto w-full custom-scrollbar pb-6">
                         <div className="min-w-0 lg:min-w-0 p-4 sm:p-6 md:p-10 lg:p-14">
                           <InstructorCourses limit={6} hideHeader />
                         </div>
                      </div>
                    </div>



                    {/* Active Sessions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
                       <ActiveSessions />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── Routing Content ────────────────────────────────────────── */}
              {isMyCourses && (
                <motion.div
                  key="my-courses"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <InstructorCourses showAll={false} title="My Courses" />
                </motion.div>
              )}
              {isCourses && (
                <motion.div
                  key="courses"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <InstructorCourses showAll={true} title="AOTMS Courses" />
                </motion.div>
              )}
              {isStudents && (
                <motion.div
                  key="students"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <InstructorStudentDashboard />
                </motion.div>
              )}
              {isVideos && (
                <motion.div
                  key="videos"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <InstructorVideoLibrary />
                </motion.div>
              )}
              {isLiveClasses && (
                <motion.div
                  key="live"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <LiveClassManager />
                </motion.div>
              )}
              {isChat && (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <ChatInterface />
                </motion.div>
              )}
              {isQuestionBank && (
                <motion.div
                  key="question-bank"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <QuestionBankManager mode="instructor" />
                </motion.div>
              )}
              {isExams && (
                <motion.div
                  key="exams"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <ExamScheduler />
                </motion.div>
              )}
              {isProfile && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <UserProfile />
                </motion.div>
              )}
              {isResumeScans && (
                <motion.div
                  key="resume-scans"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <ResumeScanHistory />
                </motion.div>
              )}
              {isNotifications && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <InstructorNotifications />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
