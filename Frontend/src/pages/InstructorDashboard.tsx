import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { InstructorSidebar } from "@/components/instructor/InstructorSidebar";
import { InstructorHeader } from "@/components/instructor/InstructorHeader";
import { useAuth } from "@/hooks/useAuth";
import {
  useInstructorCourses,
  useInstructorStats,
} from "@/hooks/useInstructorData";
import { useSocket } from "@/hooks/useSocket";
import { useToast } from "@/hooks/use-toast";
import { InstructorStats } from "@/components/instructor/dashboard/InstructorStats";
import { PerformanceCharts } from "@/components/instructor/dashboard/PerformanceCharts";
import { SmartAlerts } from "@/components/instructor/dashboard/SmartAlerts";
import { InstructorCourses } from "@/components/instructor/courses/InstructorCourses";
import { InstructorStudentDashboard } from "@/components/instructor/dashboard/InstructorStudentDashboard";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { ResourcesDashboard } from "@/components/instructor/dashboard/ResourcesDashboard";
import PerformanceDashboard from "@/components/instructor/dashboard/PerformanceDashboard";
import { QuestionBankManager } from "@/components/manager/QuestionBankManager";
import { InstructorVideoLibrary } from "@/components/instructor/dashboard/InstructorVideoLibrary";
import { LiveClassManager } from "@/components/instructor/dashboard/LiveClassManager";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react";

interface DashboardStats {
  totalStudents: number;
  upcomingClasses?: number;
  pendingAssignments?: number;
  totalEarnings?: number;
  avgCompletion?: number;
}

// ─── Welcome Component ────────────────────────────────────────────────────────
function WelcomeBanner({ name, stats }: { name: string, stats?: DashboardStats }) {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // Dynamic stats
  const studentCount = stats?.totalStudents || 0;
  const upcomingCount = stats?.upcomingClasses || 0;
  const pendingAssignments = stats?.pendingAssignments || 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="pro-card p-5 sm:p-8 md:p-10 bg-slate-900 text-white relative overflow-hidden group border-none shadow-lg"
    >
      <div className="absolute top-0 right-0 p-8 md:p-12 opacity-10 group-hover:scale-110 transition-transform duration-1000">
        <BrainCircuit className="h-32 w-32 md:h-48 md:w-48" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-10">
        <div className="space-y-4">
          <Badge className="bg-primary/20 text-blue-400 border-primary/20 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-widest shadow-sm">
            Instructor Hub
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            {greeting},{" "}
            <span className="text-primary font-black italic">
              {name.split(" ")[0]}
            </span>
            .
          </h1>
          <p className="text-slate-400 max-w-xl font-medium text-base md:text-lg leading-relaxed">
            Welcome back to your teaching portal. You have{" "}
            <span className="text-white font-bold">{studentCount} students</span> enrolled in your courses.
            {pendingAssignments > 0 && (
              <> There are <span className="text-white font-bold">{pendingAssignments} assignments</span> waiting to be graded.</>
            )}
            {upcomingCount > 0 && (
              <> You have <span className="text-white font-bold">{upcomingCount} classes</span> scheduled for this week.</>
            )}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
          <Button className="pro-button-primary h-12 md:h-14 px-6 md:px-8 w-full sm:w-auto rounded-xl shadow-lg shadow-primary/20 group text-sm md:text-base">
            <Plus className="mr-2 h-4 w-4 md:h-5 md:w-5" />
            Create New Course
          </Button>
          <Button
            variant="outline"
            className="h-12 md:h-14 px-6 md:px-8 w-full sm:w-auto rounded-xl bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white font-semibold text-sm md:text-base"
          >
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
    data: courses = [],
    isLoading: coursesLoading,
    refetch,
  } = useInstructorCourses();
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useInstructorStats();
  const { socket } = useSocket();
  const { toast } = useToast();

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
  const isResources = path === "/instructor/resources";
  const isPerformance = path === "/instructor/performance";
  const isVideos = path === "/instructor/videos";
  const isLiveClasses = path === "/instructor/live-classes";
  const isChat = path === "/instructor/chat";
  const isQuestionBank = path === "/instructor/question-bank";

  return (
    <SidebarProvider className="h-screen w-full overflow-hidden mesh-bg font-sans">
      <InstructorSidebar />
      <SidebarInset className="flex flex-col h-screen w-full overflow-hidden bg-transparent">
        <InstructorHeader />

        <main className="flex-1 w-full overflow-y-auto overflow-x-hidden p-4 md:p-8 lg:p-10 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-10">
            <AnimatePresence mode="wait">
              {/* ── Dashboard Stats Overlay ────────────────────────────────── */}
              {isRoot && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-10"
                >
                  <WelcomeBanner
                    name={user?.user_metadata?.full_name || "Instructor"}
                    stats={stats}
                  />

                  <InstructorStats
                    coursesCount={courses.length}
                    stats={stats}
                    loading={statsLoading || coursesLoading}
                  />

                  <div className="grid gap-6 lg:gap-10 xl:grid-cols-3">
                    <div className="xl:col-span-2 space-y-6 lg:space-y-10 min-w-0">
                      <div className="pro-card p-4 sm:p-6 md:p-8 bg-white min-w-0 overflow-hidden">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                          <div>
                            <h3 className="text-lg md:text-xl font-bold text-slate-900">
                              Engagement Overview
                            </h3>
                            <p className="text-sm text-slate-500 font-medium">
                              Trends in student participation and progress.
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            className="text-primary font-bold text-sm gap-2 w-full sm:w-auto mt-2 sm:mt-0"
                          >
                            Details <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="h-[250px] sm:h-[300px] md:h-[350px] w-full mt-2">
                          <PerformanceCharts loading={statsLoading} />
                        </div>
                      </div>

                      <div className="pro-card p-1 bg-white min-w-0 overflow-hidden mt-6 lg:mt-10">
                        <div className="p-4 sm:p-6 md:p-8 border-b border-slate-100">
                          <h3 className="text-lg md:text-xl font-bold text-slate-900">
                            Recent Courses
                          </h3>
                        </div>
                        <InstructorCourses limit={3} hideHeader />
                      </div>
                    </div>

                    <div className="space-y-6 lg:space-y-8 min-w-0">
                      <SmartAlerts />

                      <div className="pro-card p-4 sm:p-6 md:p-8 bg-gradient-to-br from-slate-50 to-white hover:bg-white cursor-pointer transition-all border-slate-200 min-w-0">
                        <h4 className="text-xs md:text-sm font-bold text-primary uppercase tracking-widest mb-4 md:mb-6">
                          Active Sessions
                        </h4>
                        <div className="space-y-6">
                          {[1, 2].map((i) => (
                            <div
                              key={i}
                              className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
                            >
                              <div className="h-10 w-10 shrink-0 bg-blue-50 rounded-lg flex items-center justify-center">
                                <Video className="h-5 w-5 text-primary" />
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm font-bold text-slate-800">
                                  Advanced React Patterns
                                </p>
                                <div className="flex items-center gap-3 text-xs text-slate-500 font-bold">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" /> 2:30 PM
                                  </span>
                                  <span className="flex items-center gap-1 text-emerald-600">
                                    <Users className="h-3 w-3" /> 42 Online
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
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
              {isResources && (
                <motion.div
                  key="resources"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <ResourcesDashboard />
                </motion.div>
              )}
              {isPerformance && (
                <motion.div
                  key="performance"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <PerformanceDashboard />
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
            </AnimatePresence>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
