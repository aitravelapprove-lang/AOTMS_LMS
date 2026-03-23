import { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { useAuth } from "@/hooks/useAuth";
import { useAdminData } from "@/hooks/useAdminData";
import { useCourses, CourseEnrollment } from "@/hooks/useCourses";
import { UserManagement } from "@/components/admin/UserManagement";
import { CourseApproval } from "@/components/admin/CourseApproval";
import { SecurityMonitor } from "@/components/admin/SecurityMonitor";
import { QuestionBankApproval } from "@/components/admin/QuestionBankApproval";
import { ExamApproval } from "@/components/admin/ExamApproval";
import { EnrollmentsList } from "@/components/admin/EnrollmentsList";
import { GrantStudentAccess } from "@/components/admin/GrantStudentAccess";
import InstructorCoursesAdmin from "@/pages/InstructorCourses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { ChatMonitor } from "@/components/admin/ChatMonitor";
import {
  Users,
  Shield,
  BookOpen,
  BarChart3,
  Settings,
  ShieldAlert,
  RefreshCw,
  FileQuestion,
  ArrowUpRight,
  UserCheck,
  LayoutGrid,
  Activity,
  ChevronRight,
  GraduationCap,
  Trash2,
  ShieldCheck,
  ClipboardList,
  Eye,
  User,
  Mail,
  Calendar,
  Clock,
  Archive,
  MessageSquare,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Course as InstructorCourse } from "@/hooks/useInstructorData";
import { Course as CatalogCourse } from "@/hooks/useCourses";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

type CombinedCourse = CatalogCourse & Partial<InstructorCourse>;

function AllCoursesList({ onDelete, onView, refreshTrigger }: { onDelete?: (id: string) => void, onView?: (course: CatalogCourse) => void, refreshTrigger?: number }) {
  const { courses: allCourses, fetchCourses, loading } = useCourses();

  useEffect(() => {
    fetchCourses(1, 'all', true, 1000); // Fetch up to 1000 courses to show all
  }, [fetchCourses, refreshTrigger]);

  if (loading && allCourses.length === 0) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="rounded-3xl overflow-hidden bg-white shadow-sm border border-slate-100 h-[320px]">
            <Skeleton className="h-48 w-full" />
            <div className="p-5 space-y-3">
              <Skeleton className="h-6 w-3/4 rounded-lg" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">All Courses</h2>
          <p className="text-slate-500">Manage your entire course catalog</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
          <Badge variant="secondary" className="px-3 py-1.5 h-8 text-sm font-medium bg-slate-100 text-slate-700">
            {allCourses.length} Total
          </Badge>
          <div className="h-4 w-px bg-slate-200" />
          <span className="text-xs font-medium text-slate-400 px-2">
            {allCourses.filter(c => c.is_active).length} Active
          </span>
        </div>
      </div>

      {allCourses.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200"
        >
          <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
            <LayoutGrid className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-medium text-slate-900">No courses found</h3>
          <p className="text-slate-500 max-w-sm text-center mt-2">
            Get started by creating a new course in the Instructor portal.
          </p>
        </motion.div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {allCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group relative bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 overflow-hidden flex flex-col"
            >
              {/* Image Container */}
              <div className="aspect-[4/3] relative overflow-hidden bg-slate-100">
                {course.image ? (
                  <img 
                    src={course.image.startsWith('http') ? course.image : `/s3/public/${course.image}`}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-300">
                    <BookOpen className="h-10 w-10 mb-2" />
                    <span className="text-xs font-medium uppercase tracking-wider">No Preview</span>
                  </div>
                )}
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Status Badge */}
                <div className="absolute top-3 right-3 z-10">
                  <span className={`
                    inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm backdrop-blur-md
                    ${course.is_active 
                      ? 'bg-emerald-500/90 text-white' 
                      : 'bg-slate-500/90 text-white'}
                  `}>
                    {course.is_active ? 'Active' : 'Draft'}
                  </span>
                </div>

                {/* Quick Actions (Hover) */}
                <div className="absolute bottom-3 right-3 flex gap-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10">
                  {onView && (
                    <Button
                      size="icon"
                      className="h-9 w-9 rounded-full bg-white/90 text-slate-700 hover:bg-white hover:text-primary shadow-lg backdrop-blur-sm border-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onView(course);
                      }}
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      size="icon"
                      className="h-9 w-9 rounded-full bg-white/90 text-slate-700 hover:bg-red-50 hover:text-red-600 shadow-lg backdrop-blur-sm border-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(course.id);
                      }}
                      title="Delete Course"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 rounded-md bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-wider">
                      {course.category || 'General'}
                    </span>
                    <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                      {course.level || 'All Levels'}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>
                </div>

                <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-50">
                  <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{course.duration || 'Flexible'}</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900">
                    {course.price === '0' || course.price === 'Free' ? (
                      <span className="text-emerald-600">Free</span>
                    ) : (
                      <span>{course.price}</span>
                    )}
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

export default function AdminDashboard() {
  const { user, loading: authLoading, userRole } = useAuth();
  const navigate = useNavigate();

  const adminData = useAdminData(userRole);
  const [selectedCourseDetail, setSelectedCourseDetail] = useState<CombinedCourse | null>(null);
  const [showCourseDetail, setShowCourseDetail] = useState(false);
  const {
    loading: dataLoading,
    profiles,
    courses,
    securityEvents,
    systemLogs,
    stats,
    refresh,
    updateUserStatus,
    updateUserRole,
    resolveSecurityEvent,
    sendApprovalEmail,
    approveCourse,
    rejectCourse,
    updateCourseStatus,
    updateEnrollmentStatus: _updateEnrollmentStatus,
    deleteEnrollment: _deleteEnrollment,
    deleteCourse: _deleteCourse,
  } = adminData;

  const updateEnrollmentStatus = async (id: string, status: "rejected" | "active") => {
    const success = await _updateEnrollmentStatus(id, status);
    if (success) {
      setEnrollments((prev) => prev.map((e) => e.id === id ? { ...e, status } : e));
    }
  };

  const deleteEnrollment = async (id: string) => {
    if (confirm("Are you sure you want to delete this enrollment? This action cannot be undone.")) {
      const success = await _deleteEnrollment(id);
      if (success) {
        setEnrollments((prev) => prev.filter((e) => e.id !== id));
      }
    }
  };

  const deleteCourse = async (id: string) => {
    if (confirm("Are you sure you want to permanently delete this course? This action cannot be undone.")) {
      const success = await _deleteCourse(id);
      if (success) {
        setCoursesRefreshKey(prev => prev + 1);
      }
    }
  };

  const { fetchEnrollments } = useCourses();
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(false);
  const [coursesRefreshKey, setCoursesRefreshKey] = useState(0);
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("users");

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
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadEnrollments();
    }
  }, [user, loadEnrollments]);

  useEffect(() => {
    const tabUrlMap: Record<string, string> = {
      "/admin": "users",
      "/admin/users": "users",
      "/admin/enrollments": "enrollments",
      "/admin/all-courses": "all-courses",
      "/admin/instructor-courses": "instructor-courses",
      "/admin/questions": "questions",
      "/admin/courses": "courses",
      "/admin/exams": "exams",
      "/admin/security": "security",
      "/admin/chat": "chat",
    };
    const path = location.pathname;
    const tab = tabUrlMap[path];
    if (tab) {
      setActiveTab(tab);
    }
  }, [location.pathname]); // Removed tabUrlMap from dependencies as it's now internal

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 text-primary animate-spin" />
          <p className="text-sm font-medium text-slate-500 animate-pulse">
            Initializing Dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider className="h-[100dvh] w-full overflow-hidden mesh-bg font-sans">
      <AdminSidebar />
      <SidebarInset className="flex flex-col h-[100dvh] w-full overflow-hidden bg-transparent">
        <AdminHeader />
        <main className="flex-1 w-full overflow-y-auto overflow-x-hidden p-4 sm:p-6 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-6 lg:space-y-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                  Platform Administration
                </h1>
                <p className="text-slate-500 font-medium">
                  Overview of system performance, user activities, and security
                  protocols.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={refresh}
                  disabled={dataLoading}
                  className="h-10 px-4 gap-2 rounded-lg border-slate-200 text-slate-600 font-semibold"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${dataLoading ? "animate-spin" : ""}`}
                  />
                  Sync Data
                </Button>
                <Button className="pro-button-primary h-10 px-6 gap-2 rounded-lg shadow-md">
                  <Shield className="h-4 w-4" />
                  Security Protocol
                </Button>
              </div>
            </div>

            {/* Metrics Dashboard */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
              {[
                {
                  label: "Total Users",
                  value: stats.totalUsers,
                  icon: Users,
                  color: "blue",
                  trend: "+12.5%",
                  description: "Registered accounts",
                },
                {
                  label: "Active Courses",
                  value: stats.activeCourses,
                  icon: BookOpen,
                  color: "orange",
                  trend: "Steady",
                  description: "Verified curriculum",
                },
                {
                  label: "Pending Enrollments",
                  value: stats.pendingEnrollments,
                  icon: GraduationCap,
                  color: "red",
                  trend: stats.pendingEnrollments > 0 ? "Action needed" : "Clear",
                  description: "Approval queue",
                },
                {
                  label: "Security Events",
                  value: stats.securityEvents,
                  icon: ShieldAlert,
                  color: "blue",
                  trend: "-5%",
                  description: "Requiring attention",
                },
                {
                  label: "System Health",
                  value: "99.9%",
                  icon: Activity,
                  color: "blue",
                  trend: "Optimal",
                  description: "Across all nodes",
                },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: { delay: i * 0.05 },
                  }}
                  className="pro-card p-6 bg-white relative overflow-hidden group hover:border-primary/20 cursor-default shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div
                      className={`p-2.5 rounded-lg ${stat.color === "red" ? "bg-red-50" : stat.color === "blue" ? "bg-primary/10" : "bg-accent/10"}`}
                    >
                      <stat.icon
                        className={`h-5 w-5 ${stat.color === "red" ? "text-red-500" : stat.color === "blue" ? "text-primary" : "text-accent"}`}
                      />
                    </div>
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded-full ${stat.trend === "Action needed" ? "bg-red-50 text-red-600" : stat.trend.startsWith("+") ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-600"}`}
                    >
                      {stat.trend}
                    </span>
                  </div>
                  <div className="mt-4 space-y-1">
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                      {stat.label}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                        {dataLoading ? "..." : stat.value}
                      </h2>
                    </div>
                    <p className="text-xs text-slate-400 font-medium">
                      {stat.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Management Portal */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <div className="flex flex-col gap-4 border-b border-slate-200">
                <div className="w-full overflow-x-auto custom-scrollbar pb-2">
                  <TabsList className="bg-transparent h-auto p-0 gap-6 sm:gap-8 flex min-w-max">
                    {[
                      { id: "users", label: "User Management", icon: Users, key: "tab-users" },
                      { id: "enrollments", label: "Student Enrollments", icon: GraduationCap, key: "tab-enrollments" },
                      { id: "grant-access", label: "Grant Access", icon: UserCheck, key: "tab-grant-access" },
                      { id: "instructor-courses", label: "Instructor Courses", icon: BookOpen, key: "tab-instructor-courses" },
                      { id: "all-courses", label: "All Courses", icon: LayoutGrid, key: "tab-all-courses" },
                      {
                        id: "questions",
                        label: "Question Bank",
                        icon: FileQuestion,
                        key: "tab-questions",
                      },
                      { id: "exams", label: "Assessments", icon: ShieldCheck, key: "tab-exams" },
                      { id: "security", label: "Security Center", icon: Shield, key: "tab-security" },
                      { id: "chat", label: "Chat Monitor", icon: MessageSquare, key: "tab-chat" },
                    ].map((tab) => (
                      <TabsTrigger
                        key={tab.key}
                        value={tab.id}
                        className="px-0 py-4 h-auto border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none text-slate-500 font-semibold text-sm data-[state=active]:text-primary transition-all flex items-center gap-2"
                      >
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
                <div className="hidden lg:flex items-center gap-2 text-slate-400 absolute right-0 top-4">
                  <LayoutGrid className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-widest">
                    Administrative Grid
                  </span>
                </div>
              </div>

              <div className="min-h-[600px]">
                <AnimatePresence>
                  <TabsContent key="tab-users" value="users" className="mt-0 outline-none">
                    <motion.div
                      key="motion-users"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <UserManagement
                        users={profiles}
                        loading={dataLoading}
                        roleCounts={stats.roleCounts}
                        onUpdateStatus={updateUserStatus}
                        onUpdateRole={updateUserRole}
                        onSendEmail={sendApprovalEmail}
                      />
                    </motion.div>
                  </TabsContent>

                  <TabsContent key="tab-enrollments" value="enrollments" className="mt-0 outline-none">
                    <motion.div
                      key="motion-enrollments"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <EnrollmentsList
                        enrollments={enrollments}
                        loading={enrollmentsLoading}
                        onUpdateStatus={updateEnrollmentStatus}
                        onDelete={deleteEnrollment}
                      />
                    </motion.div>
                  </TabsContent>

                  <TabsContent key="tab-grant-access" value="grant-access" className="mt-0 outline-none">
                    <motion.div
                      key="motion-grant-access"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <GrantStudentAccess profiles={profiles} />
                    </motion.div>
                  </TabsContent>

                  <TabsContent key="tab-instructor-courses" value="instructor-courses" className="mt-0 outline-none">
                    <motion.div
                      key="motion-instructor-courses"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <InstructorCoursesAdmin />
                    </motion.div>
                  </TabsContent>

                  <TabsContent key="tab-all-courses" value="all-courses" className="mt-0 outline-none">
                    <motion.div
                      key="motion-all-courses"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <AllCoursesList 
                        onDelete={deleteCourse} 
                        onView={(course) => {
                          setSelectedCourseDetail(course);
                          setShowCourseDetail(true);
                        }}
                        refreshTrigger={coursesRefreshKey} 
                      />
                    </motion.div>
                  </TabsContent>

                  <TabsContent key="tab-questions" value="questions" className="mt-0 outline-none">
                    <motion.div
                      key="motion-questions"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <QuestionBankApproval />
                    </motion.div>
                  </TabsContent>

                    <TabsContent key="tab-courses" value="courses" className="mt-0 outline-none">
                    <motion.div
                      key="motion-courses"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <CourseApproval
                        courses={courses}
                        loading={dataLoading}
                        onApprove={approveCourse}
                        onReject={rejectCourse}
                        onUpdateStatus={updateCourseStatus}
                      />
                    </motion.div>
                  </TabsContent>

                  <TabsContent key="tab-exams" value="exams" className="mt-0 outline-none">
                    <motion.div
                      key="motion-exams"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <ExamApproval />
                    </motion.div>
                  </TabsContent>

                  <TabsContent key="tab-security" value="security" className="mt-0 outline-none">
                    <motion.div
                      key="motion-security"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <SecurityMonitor
                        securityEvents={securityEvents}
                        systemLogs={systemLogs}
                        loading={dataLoading}
                        highPriorityCount={stats.highPriorityEvents}
                        onResolveEvent={resolveSecurityEvent}
                      />
                    </motion.div>
                  </TabsContent>

                  <TabsContent key="tab-chat" value="chat" className="mt-0 outline-none">
                    <motion.div
                      key="motion-chat"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <ChatMonitor />
                    </motion.div>
                  </TabsContent>
                </AnimatePresence>
              </div>
            </Tabs>
          </div>
        </main>
      </SidebarInset>

      {/* Course Detail View Modal */}
      <Dialog open={showCourseDetail} onOpenChange={setShowCourseDetail}>
        <DialogContent className="max-w-xl pro-modal">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <BookOpen className="h-5 w-5 text-primary" />
              Course Profile
            </DialogTitle>
            <DialogDescription>
              Detailed information about the selected curriculum
            </DialogDescription>
          </DialogHeader>
          
          {selectedCourseDetail && (
            <div className="space-y-6 py-4">
              <div className="aspect-video relative rounded-xl overflow-hidden bg-slate-100 border shadow-inner">
                {selectedCourseDetail.thumbnail_url || selectedCourseDetail.image ? (
                  <img 
                    src={selectedCourseDetail.thumbnail_url?.startsWith('http') ? selectedCourseDetail.thumbnail_url : 
                        (selectedCourseDetail.image?.startsWith('http') ? selectedCourseDetail.image : 
                        `/s3/public/${selectedCourseDetail.thumbnail_url || selectedCourseDetail.image}`)}
                    alt={selectedCourseDetail.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="h-12 w-12 text-slate-300" />
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <Badge className="bg-white/90 text-primary hover:bg-white shadow-sm backdrop-blur-sm border-none px-3 py-1">
                    {selectedCourseDetail.category || 'Curriculum'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold tracking-tight text-slate-900">{selectedCourseDetail.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {selectedCourseDetail.description || 'Comprehensive training program for aviation professionals.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Course Metadata</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <span>{selectedCourseDetail.duration || 'Flexible'} duration</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <LayoutGrid className="h-4 w-4 text-slate-400" />
                      <span>Level: {selectedCourseDetail.level || 'Beginner'}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-primary/60">Assignment Details</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <User className="h-4 w-4 text-primary/40" />
                      <span className="font-medium truncate">{selectedCourseDetail.instructor_id ? 'Assigned' : 'Open Catalog'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <Calendar className="h-4 w-4 text-primary/40" />
                      <span>Added {selectedCourseDetail.created_at ? new Date(selectedCourseDetail.created_at).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-orange-50 border border-orange-100">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-orange-200 flex items-center justify-center">
                    <ShieldAlert className="h-4 w-4 text-orange-700" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-orange-800 uppercase tracking-tighter">Current Status</p>
                    <p className="text-sm font-medium text-orange-900">{selectedCourseDetail.status || 'Active in Library'}</p>
                  </div>
                </div>
                <Badge className="bg-orange-200 text-orange-800 hover:bg-orange-300 border-none">
                  {selectedCourseDetail.is_active !== false ? 'Active' : 'Archived'}
                </Badge>
              </div>
            </div>
          )}

          <DialogFooter className="border-t pt-4">
            <Button variant="outline" className="rounded-lg h-10 px-6 font-semibold" onClick={() => setShowCourseDetail(false)}>
              Close Profile
            </Button>
            <Button className="pro-button-primary h-10 px-8 rounded-lg shadow-md" onClick={() => setShowCourseDetail(false)}>
              Manage Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
