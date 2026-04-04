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
import { QualityAssurance } from "@/components/admin/QualityAssurance";
import { CourseAssignment } from "@/components/admin/CourseAssignment";
import { InstructorManagement } from "@/components/admin/InstructorManagement";
import { ExamApproval } from "@/components/admin/ExamApproval";
import { EnrollmentsList } from "@/components/admin/EnrollmentsList";
import { GrantStudentAccess } from "@/components/admin/GrantStudentAccess";
import { ResumeScanHistory } from "@/components/admin/ResumeScanHistory";
import { LiveMonitoring } from "@/components/admin/LiveMonitoring";
import InstructorCoursesAdmin from "@/pages/InstructorCourses";
import { ExamScheduler } from "@/components/manager/ExamScheduler";
import { QuestionBankManager } from "@/components/manager/QuestionBankManager";
import { LeaderboardManager } from "@/components/manager/LeaderboardManager";
import { ManagerVideoLibrary } from "@/components/manager/ManagerVideoLibrary";
import { UserProfile } from "@/components/dashboard/UserProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { ChatMonitor } from "@/components/admin/ChatMonitor";
import { LeadManagement } from "@/components/admin/LeadManagement";
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
  DollarSign,
  Pencil,
  Video as VideoIcon,
  Database,
  Ticket,
  Gift,
  Power,
  Layers,
  Zap
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { CouponManager } from "@/components/admin/CouponManager";
import { useSocket } from "@/hooks/useSocket";
import { Skeleton } from "@/components/ui/skeleton";
import { Course as InstructorCourse } from "@/hooks/useInstructorData";
import { Course as CatalogCourse } from "@/hooks/useCourses";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { CourseBuilder } from "@/components/instructor/courses/CourseBuilder";

import { Course as AdminCourse } from "@/hooks/useAdminData";

type CombinedCourse = AdminCourse;

function AllCoursesList({ 
  courses: allCourses, 
  loading, 
  onDelete, 
  onView, 
  onViewSyllabus,
  onUpdatePrice,
  onToggleActive
}: { 
  courses: AdminCourse[], 
  loading: boolean,
  onDelete?: (id: string) => void, 
  onView?: (course: AdminCourse) => void,
  onViewSyllabus?: (course: AdminCourse) => void,
  onUpdatePrice?: (id: string, price: string) => void,
  onToggleActive?: (id: string, isActive: boolean) => void
}) {
  const [editingPrice, setEditingPrice] = useState<{ id: string, title: string, price: string } | null>(null);
  const [newPrice, setNewPrice] = useState("");

  const handlePriceUpdate = async () => {
    if (editingPrice && onUpdatePrice) {
      onUpdatePrice(editingPrice.id, newPrice);
      setEditingPrice(null);
    }
  };

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
            {allCourses.filter(c => c.status === 'published' || c.status === 'approved').length} Active
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
                {course.thumbnail_url ? (
                  <img 
                    src={course.thumbnail_url.startsWith('http') ? course.thumbnail_url : `/s3/public/${course.thumbnail_url}`}
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
                    ${(course.status === 'published' || course.status === 'approved') 
                      ? 'bg-emerald-500/90 text-white' 
                      : 'bg-slate-500/90 text-white'}
                  `}>
                    {course.status || 'Draft'}
                  </span>
                </div>

                {/* Active Toggle */}
                <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-white/90 backdrop-blur-md px-2 py-1 rounded-full shadow-sm border border-slate-200/50 transition-opacity whitespace-nowrap">
                  <Switch 
                    checked={course.is_active !== false} 
                    onCheckedChange={(checked) => onToggleActive?.(course.id, checked)}
                    className="scale-75 data-[state=checked]:bg-emerald-500"
                  />
                  <span className={`text-[9px] font-black uppercase tracking-tighter ${course.is_active !== false ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {course.is_active !== false ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Quick Actions (Hover) */}
                <div className="absolute bottom-3 right-3 flex gap-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10">
                  {onView && (
                    <Button
                      size="icon"
                      variant="ghost"
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
                  {onUpdatePrice && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-9 w-9 rounded-full bg-white/90 text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 shadow-lg backdrop-blur-sm border-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingPrice({ id: course.id, title: course.title, price: String(course.price || "0") });
                        setNewPrice(String(course.price || "0"));
                      }}
                      title="Edit Price"
                    >
                      <DollarSign className="h-4 w-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      size="icon"
                      variant="ghost"
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
                      Status: {course.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>
                </div>

                <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-50">
                  <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Manage Pricing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-bold text-slate-900">
                      {course.price === '0' || course.price === 0 || course.price === 'Free' ? (
                        <span className="text-emerald-600">Free</span>
                      ) : (
                        <span>₹{course.price}</span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-primary hover:bg-primary/5 rounded-full"
                      onClick={() => onViewSyllabus?.(course)}
                      title="Manage Syllabus"
                    >
                      <Layers className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-slate-400 hover:text-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingPrice({ id: course.id, title: course.title, price: String(course.price || "0") });
                        setNewPrice(String(course.price || "0"));
                      }}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Price Edit Modal */}
      <Dialog open={!!editingPrice} onOpenChange={(open) => !open && setEditingPrice(null)}>
        <DialogContent className="sm:max-w-md pro-modal">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-500" />
              Edit Course Price
            </DialogTitle>
            <DialogDescription>
              Update the pricing for "{editingPrice?.title}"
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">New Price (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <Input 
                    type="number" 
                    value={newPrice} 
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="pl-8 h-12 text-lg font-bold rounded-xl"
                    placeholder="Enter amount"
                  />
                </div>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Set to 0 for free courses</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPrice(null)} className="rounded-xl">Cancel</Button>
            <Button onClick={handlePriceUpdate} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 shadow-lg shadow-emerald-200">
              Update Price
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminDashboard() {
  const { user, loading: authLoading, userRole } = useAuth();
  const navigate = useNavigate();

  const adminData = useAdminData(userRole);
  const [selectedCourseDetail, setSelectedCourseDetail] = useState<CombinedCourse | null>(null);
  const [showCourseDetail, setShowCourseDetail] = useState(false);
  const [buildingCourse, setBuildingCourse] = useState<CombinedCourse | null>(null);
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

  // Socket support for real-time enrollment updates
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleEnrollmentChange = () => {
      console.log('[Socket] Enrollments changed, refreshing...');
      loadEnrollments();
    };

    socket.on('course_enrollments_changed', handleEnrollmentChange);
    
    return () => {
      socket.off('course_enrollments_changed', handleEnrollmentChange);
    };
  }, [socket, loadEnrollments]);

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
        "/admin/qa": "qa",
        "/admin/chat": "chat",
        "/admin/assign-courses": "assign-courses",
        "/admin/instructors": "instructors",
        "/admin/videos": "videos",
        "/admin/exam-scheduling": "exam-scheduling",
        "/admin/question-repository": "question-repository",
        "/admin/live-monitoring": "live-monitoring",
        "/admin/coupons": "coupons",
        "/admin/leads": "leads",
        "/admin/profile": "profile",
      };
    const path = location.pathname;
    const tab = tabUrlMap[path];
    if (tab) {
      setActiveTab(tab);
    }
  }, [location.pathname]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50/50 backdrop-blur-xl transition-all duration-700">
        <div className="relative flex flex-col items-center">
          {/* Main loader rings */}
          <div className="relative flex items-center justify-center">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="h-28 w-28 rounded-full border-[3px] border-primary/10 border-t-primary shadow-[0_0_20px_rgba(var(--primary),0.1)]"
            />
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="absolute h-20 w-20 rounded-full border-[3px] border-slate-200 border-b-slate-400 opacity-50"
            />
            <div className="absolute flex flex-col items-center gap-1">
              <Shield className="h-6 w-6 text-primary animate-pulse" />
            </div>
          </div>
          
          {/* Text indicators */}
          <div className="mt-12 text-center space-y-4">
            <motion.h4 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-lg font-black text-slate-900 uppercase tracking-[0.4em] italic leading-none pl-1"
            >
              Initializing <br/> <span className="text-primary not-italic font-medium text-sm">Integrity Console</span>
            </motion.h4>
            <div className="flex items-center gap-1 justify-center">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    scale: [1, 1.4, 1],
                    opacity: [0.3, 1, 0.3]
                  }}
                  transition={{ 
                    duration: 1, 
                    repeat: Infinity, 
                    delay: i * 0.2 
                  }}
                  className="h-1.5 w-1.5 rounded-full bg-primary"
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* Footnote */}
        <div className="absolute bottom-12 text-[10px] font-bold text-slate-300 uppercase tracking-[0.5em] animate-pulse">
          Quantum Authentication Protocol V.4
        </div>
      </div>
    );
  }

  if (buildingCourse) {
      return (
        <div className="min-h-screen bg-slate-50 relative">
          <div className="p-8 max-w-7xl mx-auto">
             <CourseBuilder course={buildingCourse as InstructorCourse} onBack={() => setBuildingCourse(null)} />
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
                  className="h-10 px-5 gap-3 rounded-xl border-slate-200 bg-white/70 backdrop-blur-md text-slate-700 font-bold hover:bg-white hover:border-primary/30 hover:text-primary transition-all shadow-sm hover:shadow-md active:scale-95 group"
                >
                  <RefreshCw
                    className={`h-4 w-4 transition-transform duration-500 ${dataLoading ? "animate-spin text-primary" : "group-hover:rotate-180 text-primary/60"}`}
                  />
                  <span>System Sync</span>
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
                      { id: "coupons", label: "Rewards & Coupons", icon: Ticket, key: "tab-coupons" },
                      { id: "grant-access", label: "Grant Access", icon: UserCheck, key: "tab-grant-access" },
                      { id: "resume-scans", label: "Resume Scans", icon: ClipboardList, key: "tab-resume-scans" },
                      { id: "instructor-courses", label: "Instructor Courses", icon: BookOpen, key: "tab-instructor-courses" },
                      { id: "all-courses", label: "All Courses", icon: LayoutGrid, key: "tab-all-courses" },
                      {
                        id: "questions",
                        label: "Question Bank",
                        icon: FileQuestion,
                        key: "tab-questions",
                      },
                      { id: "exams", label: "Assessments", icon: ShieldCheck, key: "tab-exams" },

                      { id: "qa", label: "Quality Assurance", icon: ShieldCheck, key: "tab-qa" },
                      { id: "chat", label: "Chat Monitor", icon: MessageSquare, key: "tab-chat" },
                      { id: "assign-courses", label: "Assign Courses", icon: ClipboardList, key: "tab-assign-courses" },
                      { id: "instructors", label: "Instructors", icon: Users, key: "tab-instructors" },
                      { id: "videos", label: "Video Library", icon: VideoIcon, key: "tab-videos" },
                      { id: "exam-scheduling", label: "Exam Scheduling", icon: Calendar, key: "tab-exam-scheduling" },
                      { id: "question-repository", label: "Question Repository", icon: Database, key: "tab-question-repository" },
                      { id: "live-monitoring", label: "Live Monitoring", icon: Activity, key: "tab-live-monitoring" },
                      { id: "leads", label: "Landing Leads", icon: Zap, key: "tab-leads" },
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

                <TabsContent key="tab-coupons" value="coupons" className="mt-0 outline-none">
                  <motion.div
                    key="motion-coupons"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <CouponManager />
                  </motion.div>
                </TabsContent>

                <TabsContent key="tab-grant-access" value="grant-access" className="mt-0 outline-none">
                  <motion.div
                    key="motion-grant-access"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <GrantStudentAccess profiles={profiles} enrollments={enrollments} />
                  </motion.div>
                </TabsContent>

                <TabsContent key="tab-resume-scans" value="resume-scans" className="mt-0 outline-none">
                  <motion.div
                    key="motion-resume-scans"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <ResumeScanHistory />
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
                      courses={courses}
                      loading={dataLoading}
                      onDelete={deleteCourse} 
                      onViewSyllabus={setBuildingCourse}
                      onView={(course) => {
                        setSelectedCourseDetail(course);
                        setShowCourseDetail(true);
                      }}
                      onUpdatePrice={adminData.updateCoursePrice}
                      onToggleActive={adminData.toggleCourseActive}
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
                      onToggleActive={adminData.toggleCourseActive}
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



                <TabsContent key="tab-qa" value="qa" className="mt-0 outline-none">
                  <motion.div
                    key="motion-qa"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <QualityAssurance />
                  </motion.div>
                </TabsContent>

                <TabsContent key="tab-assign-courses" value="assign-courses" className="mt-0 outline-none">
                  <motion.div
                    key="motion-assign-courses"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <CourseAssignment />
                  </motion.div>
                </TabsContent>

                <TabsContent key="tab-instructors" value="instructors" className="mt-0 outline-none">
                  <motion.div
                    key="motion-instructors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <InstructorManagement />
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

                <TabsContent key="tab-videos" value="videos" className="mt-0 outline-none">
                  <motion.div
                    key="motion-videos"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <ManagerVideoLibrary />
                  </motion.div>
                </TabsContent>

                <TabsContent key="tab-exam-scheduling" value="exam-scheduling" className="mt-0 outline-none">
                  <motion.div
                    key="motion-exam-scheduling"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <ExamScheduler />
                  </motion.div>
                </TabsContent>

                <TabsContent key="tab-question-repository" value="question-repository" className="mt-0 outline-none">
                  <motion.div
                    key="motion-question-repository"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <QuestionBankManager />
                  </motion.div>
                </TabsContent>

                <TabsContent key="tab-live-monitoring" value="live-monitoring" className="mt-0 outline-none">
                  <motion.div
                    key="motion-live-monitoring"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <LiveMonitoring />
                  </motion.div>
                </TabsContent>

                <TabsContent key="tab-leads" value="leads" className="mt-0 outline-none">
                  <motion.div
                    key="motion-leads"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <LeadManagement />
                  </motion.div>
                </TabsContent>

                <TabsContent key="tab-profile" value="profile" className="mt-0 outline-none">
                  <motion.div
                    key="motion-profile"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <UserProfile />
                  </motion.div>
                </TabsContent>
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
                  {selectedCourseDetail.status === 'published' || selectedCourseDetail.status === 'approved' ? 'Active' : 'Archived'}
                </Badge>
              </div>
            </div>
          )}

          <DialogFooter className="border-t pt-4">
            <Button variant="outline" className="rounded-lg h-10 px-6 font-semibold" onClick={() => setShowCourseDetail(false)}>
              Close Profile
            </Button>
            <Button 
                className="pro-button-primary h-10 px-8 rounded-lg shadow-md" 
                onClick={() => {
                    setBuildingCourse(selectedCourseDetail);
                    setShowCourseDetail(false);
                }}
            >
              Manage Syllabus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
