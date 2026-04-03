import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { ManagerSidebar } from "@/components/manager/ManagerSidebar";
import { ManagerHeader } from "@/components/manager/ManagerHeader";
import { ExamScheduler } from "@/components/manager/ExamScheduler";
import { QuestionBankManager } from "@/components/manager/QuestionBankManager";
import { LeaderboardManager } from "@/components/manager/LeaderboardManager";
import { LiveMonitoring } from "@/components/admin/LiveMonitoring";
import { ExamRulesManager } from "@/components/manager/ExamRulesManager";
import { ManagerCourses } from "@/components/manager/ManagerCourses";
import { EnrollmentsList } from "@/components/admin/EnrollmentsList";
import { CourseAssignment } from "@/components/admin/CourseAssignment";
import { InstructorManagement } from "@/components/manager/InstructorManagement";
import { ManagerVideoLibrary } from "@/components/manager/ManagerVideoLibrary";
import { useAdminData } from "@/hooks/useAdminData";
import { useCourses, CourseEnrollment } from "@/hooks/useCourses";
import { useSocket } from "@/hooks/useSocket";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CalendarCheck,
  BookOpen,
  FileText,
  Trophy,
  UserPlus,
  Shield,
  MonitorPlay,
  Video,
  Gavel,
  Server,
  Settings,
  ChevronRight,
  Activity,
  Plus,
  KeyRound,
  CheckCircle,
  ArrowRight
} from "lucide-react";
import {
  useExams,
  useQuestions,
  useLeaderboard,
  useExamRules,
  useExamResults,
  type ExamRule,
} from "@/hooks/useManagerData";
import { cn } from "@/lib/utils";

export default function ManagerDashboard() {
  const { user, userRole, loading } = useAuth();
  const [activeSection, setActiveSection] = useState("overview");
  const [qbFlowStep, setQbFlowStep] = useState<'rules' | 'container' | 'manager'>('rules');
  const [lastCreatedRule, setLastCreatedRule] = useState<ExamRule | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Reset flow when changing sections
  useEffect(() => {
    if (activeSection !== "questions") {
        setQbFlowStep('rules');
        setLastCreatedRule(null);
    }
  }, [activeSection]);

  // Data hooks for overview
  const { data: exams = [] } = useExams();
  const { data: questions = [] } = useQuestions();
  const { data: leaderboard = [] } = useLeaderboard();

  const { data: examRules = [] } = useExamRules();
  const { data: examResults = [] } = useExamResults();

  const { updateEnrollmentStatus, deleteEnrollment } = useAdminData(userRole);
  const { fetchEnrollments } = useCourses();
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(false);

  const loadEnrollments = useCallback(async () => {
    setEnrollmentsLoading(true);
    try {
      const data = await fetchEnrollments();
      setEnrollments(data);
    } catch (err) {
      console.error('Failed to load enrollments:', err);
    } finally {
      setEnrollmentsLoading(false);
    }
  }, [fetchEnrollments]);

  useEffect(() => {
    if (user && activeSection === 'enrollments') {
      loadEnrollments();
    }
  }, [user, activeSection, loadEnrollments]);

  // Socket support for real-time enrollment updates
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleEnrollmentChange = () => {
      console.log('[Socket-Manager] Enrollments changed, refreshing...');
      loadEnrollments();
    };

    socket.on('course_enrollments_changed', handleEnrollmentChange);
    
    return () => {
      socket.off('course_enrollments_changed', handleEnrollmentChange);
    };
  }, [socket, loadEnrollments]);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/20 border-t-primary"></div>
        <p className="text-xs font-medium text-muted-foreground animate-pulse tracking-tight">
          Loading console...
        </p>
      </div>
    );
  }

  if (userRole !== "manager" && userRole !== "admin") {
    return <Navigate to="/student-dashboard" replace />;
  }

  const activeExamsCount = exams.filter((e) => e.status === "active").length;

  const renderOverview = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Search and Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Manager Dashboard
          </h2>
          <p className="text-sm text-muted-foreground">
            Welcome back, {user?.user_metadata?.full_name || "Manager"}. Here is
            what's happening today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setActiveSection("exams")}
            className="rounded-lg"
          >
            <Plus className="h-4 w-4 mr-1" /> New Exam
          </Button>
        </div>
      </div>

      {/* Standard Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            label: "Exams Scheduled",
            value: exams.length,
            color: "text-blue-600",
            icon: CalendarCheck,
            bg: "bg-blue-50",
          },
          {
            label: "Question Bank",
            value: questions.length,
            color: "text-purple-600",
            icon: BookOpen,
            bg: "bg-purple-50",
          },
          {
            label: "Leaderboard",
            value: leaderboard.length,
            color: "text-amber-600",
            icon: Trophy,
            bg: "bg-amber-50",
          },
        ].map((stat, i) => (
          <Card
            key={i}
            className="rounded-xl border shadow-sm hover:shadow-md transition-shadow"
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "h-10 w-10 rounded-lg flex items-center justify-center",
                    stat.bg,
                  )}
                >
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-tight">
                    {stat.label}
                  </p>
                  <h3 className="text-2xl font-bold">{stat.value}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Quick Actions Section */}
        <Card className="md:col-span-2 rounded-xl border-none shadow-sm bg-muted/30">
          <CardHeader>
            <CardTitle className="text-lg">Quick Tasks</CardTitle>
            <CardDescription>Commonly used management tools</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                {
                  id: "exams",
                  label: "Exam Scheduler",
                  icon: CalendarCheck,
                  desc: "Manage exam timelines",
                  color: "text-blue-500",
                },
                {
                  id: "questions",
                  label: "Question Bank",
                  icon: BookOpen,
                  desc: "Update question pools",
                  color: "text-purple-500",
                },
                {
                  id: "monitoring",
                  label: "Live Monitoring",
                  icon: MonitorPlay,
                  desc: "Watch active assessments",
                  color: "text-rose-500",
                },
                {
                  id: "video-library",
                  label: "Video Library",
                  icon: Video,
                  desc: "Cloud media manager",
                  color: "text-indigo-500",
                },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className="group flex flex-col p-4 rounded-xl border bg-card hover:border-primary/50 hover:bg-muted/50 transition-all text-left"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-9 w-9 rounded-lg flex items-center justify-center bg-muted transition-colors group-hover:bg-primary/10">
                      <item.icon className={cn("h-4 w-4", item.color)} />
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/0 group-hover:text-muted-foreground transition-all" />
                  </div>
                  <p className="font-semibold text-sm">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Status/Health Section */}
        <div className="space-y-4">
          <Card className="rounded-xl shadow-sm border">
            <CardHeader className="p-5 pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-500" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Active Sessions</span>
                  <span className="font-bold underline">Online</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Database Sync</span>
                  <span className="text-emerald-600 font-bold uppercase tracking-tighter">
                    Verified
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Live Exams</span>
                  <span className="font-bold">{activeExamsCount}</span>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full text-xs h-9 rounded-lg"
                onClick={() => setActiveSection("monitoring")}
              >
                Full Monitoring Dashboard
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm border bg-primary text-primary-foreground overflow-hidden relative">
            <CardHeader className="p-5 pb-0 relative z-10">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Integrity Shield
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 relative z-10 space-y-3">
              <p className="text-xs opacity-80 leading-relaxed">
                Proctoring systems are currently monitoring {activeExamsCount}{" "}
                active exams.
              </p>
              <Button
                variant="secondary"
                size="sm"
                className="w-full text-xs h-9 rounded-lg font-bold"
                onClick={() => setActiveSection("overview")}
              >
                System Verified
              </Button>
            </CardContent>
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Server className="h-16 w-16" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return renderOverview();
      case "exams":
        return <ExamScheduler />;
      case "questions":
        return <QuestionBankManager onSectionChange={setActiveSection} initialTab="bank" />;
      case "approvals":
        return <QuestionBankManager onSectionChange={setActiveSection} initialTab="approvals" />;
      case "leaderboard":
        return <LeaderboardManager />;
      case "monitoring":
        return <LiveMonitoring />;
      case "enrollments":
        return (
          <div className="space-y-6">
            <div className="flex flex-col gap-1">
              <h2 className="text-3xl font-bold tracking-tight">Enrollment Management</h2>
              <p className="text-sm text-muted-foreground font-medium">Review and approve student course access requests</p>
            </div>
            <EnrollmentsList 
              enrollments={enrollments} 
              loading={enrollmentsLoading} 
              onUpdateStatus={async (id, status) => {
                if (userRole !== 'admin' && status === 'active') {
                  toast({
                    title: "Access Restricted",
                    description: "Only admin can approve enrollments",
                    variant: "destructive"
                  });
                  return;
                }
                const success = await updateEnrollmentStatus(id, status);
                if (success) {
                  loadEnrollments();
                }
              }}
              onDelete={async (id) => {
                if (confirm("Are you sure you want to permanently delete this enrollment? This action cannot be undone.")) {
                  const success = await deleteEnrollment(id);
                  if (success) {
                    loadEnrollments();
                  }
                }
              }}
            />
          </div>
        );
      case "courses":
        return <ManagerCourses />;
      case "course-assignment":
        return <CourseAssignment />;
      case "instructors":
        return <InstructorManagement />;
      case "video-library":
        return <ManagerVideoLibrary />;
      default:
        return renderOverview();
    }
  };

  return (
    <SidebarProvider className="h-[100dvh] w-full overflow-hidden mesh-bg font-sans">
      <ManagerSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      <SidebarInset className="flex flex-col h-[100dvh] w-full overflow-hidden bg-transparent">
        <ManagerHeader />
        <main className="flex-1 w-full overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-10 custom-scrollbar">
          <div className="max-w-6xl mx-auto h-full space-y-6">{renderContent()}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
