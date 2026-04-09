import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
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
import { ManagerVideoLibrary } from "@/components/manager/ManagerVideoLibrary";
import { AllCoursesList } from "@/components/admin/AllCoursesList";
import { QuestionBankApproval } from "@/components/admin/QuestionBankApproval";
import { CourseBuilder } from "@/components/instructor/courses/CourseBuilder";
import { Course as CatalogCourse, CourseEnrollment } from "@/hooks/useCourses";
import { Course as InstructorCourse } from "@/hooks/useInstructorData";
import { EnrollmentsList } from "@/components/admin/EnrollmentsList";
import { CourseAssignment } from "@/components/admin/CourseAssignment";
import { CourseApproval } from "@/components/admin/CourseApproval";
import { CouponManager } from "@/components/admin/CouponManager";
import { GrantStudentAccess } from "@/components/admin/GrantStudentAccess";
import { ResumeScanHistory } from "@/components/admin/ResumeScanHistory";
import { QualityAssurance } from "@/components/admin/QualityAssurance";
import { ChatMonitor } from "@/components/admin/ChatMonitor";
import { InstructorManagement } from "@/components/admin/InstructorManagement";
import { LeadManagement } from "@/components/admin/LeadManagement";
import InstructorAccessAdmin from "@/pages/InstructorAccess";
import { useNotifications } from "@/hooks/useNotifications";
import { useCourses } from "@/hooks/useCourses";
import { useAdminData } from "@/hooks/useAdminData";
import { useSocket } from "@/hooks/useSocket";
import { UserProfile } from "@/components/dashboard/UserProfile";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Calendar,
  FileQuestion,
  Trophy,
  Users,
  Video,
  MonitorPlay,
  Shield,
  Plus,
  RefreshCw,
  Clock,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import {
  useExams,
  useQuestions,
  useLeaderboard,
  type ExamRule,
} from "@/hooks/useManagerData";
import { cn } from "@/lib/utils";

export default function ManagerDashboard() {
  const { user, userRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState("overview");
  const [buildingCourse, setBuildingCourse] = useState<InstructorCourse | null>(null);

  useEffect(() => {
    const path = location.pathname.split("/").pop();
    if (path && path !== "manager") {
      setActiveSection(path);
    } else {
      setActiveSection("overview");
    }
  }, [location.pathname]);

  const { data: exams = [] } = useExams();
  const { data: questions = [] } = useQuestions();
  const { data: leaderboard = [] } = useLeaderboard();

  const {
    courses,
    loading: dataLoading,
    approveCourse,
    rejectCourse,
    updateCourseStatus,
    toggleCourseActive,
    updateCoursePrice,
    updateEnrollmentStatus,
    deleteEnrollment,
    enrollments,
    deleteCourse: _deleteCourse,
  } = useAdminData(userRole);

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/20 border-t-primary"></div>
        <p className="text-xs font-medium text-muted-foreground animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  if (userRole !== "manager" && userRole !== "admin") {
    return <Navigate to="/student-dashboard" replace />;
  }

  const renderOverview = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Manager Dashboard</h1>
          <p className="text-slate-500 font-medium">Welcome back, Manager. Here's what's happening today.</p>
        </div>
        <Button className="rounded-xl h-11 px-6 gap-2 shadow-lg shadow-primary/20" onClick={() => navigate('/manager/exams')}>
          <Plus className="h-4 w-4" />
          <span>New Exam</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "EXAMS SCHEDULED", value: exams.length, icon: Calendar, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "QUESTION BANK", value: questions.length, icon: FileQuestion, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "LEADERBOARD", value: 9, icon: Trophy, color: "text-amber-600", bg: "bg-amber-50" },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
            <CardContent className="p-6 flex items-center gap-6">
              <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center shadow-inner", stat.bg)}>
                <stat.icon className={cn("h-6 w-6", stat.color)} />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900">Quick Tasks</h2>
              <p className="text-sm text-slate-500">Commonly used management tools</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { 
                  title: "Exam Scheduler", 
                  desc: "Manage exam timelines", 
                  icon: Calendar, 
                  color: "text-blue-500", 
                  bg: "bg-blue-50", 
                  url: "/manager/exams" 
                },
                { 
                  title: "Question Bank", 
                  desc: "Update question pools", 
                  icon: FileQuestion, 
                  color: "text-purple-500", 
                  bg: "bg-purple-50", 
                  url: "/manager/questions" 
                },
                { 
                  title: "Live Monitoring", 
                  desc: "Watch active assessments", 
                  icon: MonitorPlay, 
                  color: "text-rose-500", 
                  bg: "bg-rose-50", 
                  url: "/manager/monitoring" 
                },
                { 
                  title: "Video Library", 
                  desc: "Cloud media manager", 
                  icon: Video, 
                  color: "text-indigo-500", 
                  bg: "bg-indigo-50", 
                  url: "/manager/video-library" 
                },
              ].map((task, i) => (
                <Card key={i} className="group cursor-pointer hover:border-primary/20 transition-all shadow-sm border-slate-100" onClick={() => navigate(task.url)}>
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center shrink-0", task.bg)}>
                      <task.icon className={cn("h-6 w-6", task.color)} />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors">{task.title}</h4>
                      <p className="text-xs text-slate-500">{task.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="pb-4 border-b border-slate-50">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-900">System Status</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
               <div className="divide-y divide-slate-50">
                  <div className="flex items-center justify-between p-4">
                    <span className="text-[12px] font-medium text-slate-500">Active Sessions</span>
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest underline decoration-dotted">Online</span>
                  </div>
                  <div className="flex items-center justify-between p-4">
                    <span className="text-[12px] font-medium text-slate-500">Database Sync</span>
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest underline decoration-dotted">Verified</span>
                  </div>
                  <div className="flex items-center justify-between p-4">
                    <span className="text-[12px] font-medium text-slate-500">Live Exams</span>
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">0</span>
                  </div>
               </div>
               <div className="p-4 bg-slate-50/50">
                 <Button variant="outline" className="w-full h-10 rounded-lg text-xs font-bold border-slate-200" onClick={() => navigate('/manager/monitoring')}>
                    Full Monitoring Dashboard
                 </Button>
               </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-primary text-white overflow-hidden">
             <CardContent className="p-6 relative">
                <div className="relative z-10 space-y-4">
                   <div className="flex items-center gap-2">
                     <Shield className="h-5 w-5 text-primary-foreground/80" />
                     <h4 className="font-black text-sm uppercase tracking-[0.2em]">Integrity Shield</h4>
                   </div>
                   <p className="text-[12px] font-bold text-primary-foreground/70 leading-relaxed">
                     Proctoring systems are currently monitoring 0 active exams.
                   </p>
                   <Button className="w-full h-10 rounded-lg bg-white text-primary hover:bg-white/90 font-black text-[10px] uppercase tracking-widest">
                     System Verified
                   </Button>
                </div>
                <div className="absolute top-0 right-0 p-4 opacity-5 translate-x-4 -translate-y-4">
                   <Shield className="h-24 w-24" />
                </div>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
      case "overview":
        return renderOverview();
      case "profile":
        return <UserProfile />;
      case "exams":
        return <ExamScheduler />;
      case "questions":
        return <QuestionBankManager />;
      case "leaderboard":
        return <LeaderboardManager />;
      case "monitoring":
        return <LiveMonitoring />;
      case "video-library":
        return <ManagerVideoLibrary />;
      case "all-courses":
        return (
          <AllCoursesList 
            courses={courses} 
            loading={dataLoading} 
            onUpdatePrice={updateCoursePrice}
            onToggleActive={toggleCourseActive}
            onDelete={_deleteCourse}
            onViewSyllabus={(course) => {
              // Normalize the course object to match InstructorCourse interface
              const normalizedCourse = {
                ...course,
                price: typeof course.price === 'string' ? parseFloat(course.price) || 0 : course.price
              } as unknown as InstructorCourse;
              setBuildingCourse(normalizedCourse);
            }}
          />
        );
      case "question-access":
        return <QuestionBankApproval />;
      case "instructors":
        return <InstructorManagement />;
      case "coupons":
        return <CouponManager />;
      case "grant-access":
        return <GrantStudentAccess />;
      case "resume-scans":
        return <ResumeScanHistory />;
      case "instructor-access":
        return <InstructorAccessAdmin />;
      case "leads":
        return <LeadManagement />;
      case "enrollments":
        return (
          <EnrollmentsList 
            enrollments={enrollments as unknown as CourseEnrollment[]} 
            loading={dataLoading} 
            onUpdateStatus={async (id, status) => { 
                await updateEnrollmentStatus(id, status); 
            }}
            onDelete={async (id) => { 
                await deleteEnrollment(id); 
            }}
          />
        );
      case "settings":
        return <div className="p-8"><h2 className="text-2xl font-bold">Settings Under Development</h2></div>;
      case "notifications":
        return <div className="p-8"><h2 className="text-2xl font-bold">Notifications Under Development</h2></div>;
      default:
        return renderOverview();
    }
  };

  if (buildingCourse) {
    return (
      <div className="min-h-screen bg-slate-50 relative">
        <div className="p-8 max-w-7xl mx-auto">
          <CourseBuilder
            course={buildingCourse as InstructorCourse}
            onBack={() => setBuildingCourse(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider className="mesh-bg font-sans">
      <ManagerSidebar />
      <SidebarInset className="bg-transparent flex flex-col h-screen overflow-hidden">
        <ManagerHeader />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 lg:p-10 admin-scrollbar">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
