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
import { InstructorManagement } from "@/components/admin/InstructorManagement";
import { ExamApproval } from "@/components/admin/ExamApproval";
import { EnrollmentsList } from "@/components/admin/EnrollmentsList";
import { GrantStudentAccess } from "@/components/admin/GrantStudentAccess";
import { ResumeScanHistory } from "@/components/admin/ResumeScanHistory";
import { LiveMonitoring } from "@/components/admin/LiveMonitoring";
import InstructorAccessAdmin from "@/pages/InstructorAccess";
import { ExamScheduler } from "@/components/manager/ExamScheduler";
import { QuestionBankManager } from "@/components/manager/QuestionBankManager";
import { LeaderboardManager } from "@/components/manager/LeaderboardManager";
import { ManagerVideoLibrary } from "@/components/manager/ManagerVideoLibrary";
import { UserProfile } from "@/components/dashboard/UserProfile";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
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
  Zap,
  Bell,
  CheckCheck,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { CouponManager } from "@/components/admin/CouponManager";
import { useSocket } from "@/hooks/useSocket";
import { useNotifications } from "@/hooks/useNotifications";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Course as InstructorCourse } from "@/hooks/useInstructorData";
import { Course as CatalogCourse } from "@/hooks/useCourses";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
  onToggleActive,
}: {
  courses: AdminCourse[];
  loading: boolean;
  onDelete?: (id: string) => void;
  onView?: (course: AdminCourse) => void;
  onViewSyllabus?: (course: AdminCourse) => void;
  onUpdatePrice?: (id: string, price: string) => void;
  onToggleActive?: (id: string, isActive: boolean) => void;
}) {
  const [editingPrice, setEditingPrice] = useState<{
    id: string;
    title: string;
    price: string;
  } | null>(null);
  const [newPrice, setNewPrice] = useState("");

  useEffect(() => {
    if (editingPrice) {
      setNewPrice(editingPrice.price);
    }
  }, [editingPrice]);

  const handlePriceUpdate = async () => {
    if (editingPrice && onUpdatePrice) {
      onUpdatePrice(editingPrice.id, newPrice);
      setEditingPrice(null);
    }
  };

  const coursesList = allCourses || [];

  if (loading && coursesList.length === 0) {
    return (
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="rounded-3xl overflow-hidden bg-white shadow-sm border border-slate-100 h-[320px]"
          >
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
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 italic uppercase">
            Executive Catalog
          </h2>
          <p className="text-slate-500 font-medium text-xs tracking-widest uppercase">
            Global Curriculum Intelligence Node
          </p>
        </div>
      </div>

      {coursesList.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200"
        >
          <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
            <LayoutGrid className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-medium text-slate-900">
            No courses found
          </h3>
          <p className="text-slate-500 max-w-sm text-center mt-2">
            Get started by creating a new course in the Instructor portal.
          </p>
        </motion.div>
      ) : (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {coursesList.map((course: AdminCourse, index: number) => {
            const CategoryIcon = course.title
              ?.toLowerCase()
              .includes("security")
              ? Shield
              : course.title?.toLowerCase().includes("ai")
                ? Zap
                : course.title?.toLowerCase().includes("data")
                  ? BarChart3
                  : course.title?.toLowerCase().includes("design")
                    ? LayoutGrid
                    : BookOpen;

            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="group relative bg-white rounded-[2rem] border border-slate-100/50 shadow-sm hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 flex flex-col p-1.5"
              >
                {/* Premium Image Header */}
                <div className="aspect-video relative rounded-2xl overflow-hidden group-hover:shadow-lg transition-all">
                  {course.thumbnail_url ? (
                    <img
                      src={
                        course.thumbnail_url.startsWith("http")
                          ? course.thumbnail_url
                          : `/s3/public/${course.thumbnail_url}`
                      }
                      alt={course.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-300">
                      <BookOpen className="h-10 w-10 mb-2" />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        Library Node
                      </span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:opacity-100 transition-opacity" />

                  {/* Floating Center Icon */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-14 w-14 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-50 group-hover:scale-100 shadow-2xl">
                    <CategoryIcon className="h-7 w-7 text-white" />
                  </div>

                  {/* Badges Overlay */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <Badge
                      className={`border-none font-bold text-[9px] uppercase tracking-wider px-3 py-1 rounded-lg ${course.status === "published" ? "bg-emerald-500 text-white" : "bg-amber-500 text-white shadow-lg"}`}
                    >
                      {course.status || "Draft"}
                    </Badge>
                  </div>
                </div>

                {/* Content - Floating Icon Join */}
                <div className="relative pt-6 pb-5 px-5 flex-1 flex flex-col">
                  {/* Floating Brand Icon */}
                  <div className="absolute -top-6 right-6 h-12 w-12 rounded-full bg-white shadow-lg flex items-center justify-center border-4 border-slate-50 group-hover:scale-110 transition-transform duration-500">
                    <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center">
                      <CategoryIcon className="h-4 w-4 text-primary" />
                    </div>
                  </div>

                  <div className="space-y-1 mb-4">
                    <h3 className="text-xl font-bold text-slate-900 leading-tight group-hover:text-primary transition-colors line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-[10px] uppercase font-bold text-primary/60 tracking-[0.2em]">
                      {course.category || "Strategic Training"}
                    </p>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock className="h-3.5 w-3.5" />
                      <span className="text-xs font-semibold">
                        {course.duration || "3 Months"} • ONLINE / LIVE
                      </span>
                    </div>
                  </div>

                  {/* High Visibility Pricing */}
                  <div className="mt-auto pt-4 border-t border-slate-50">
                    <div className="flex flex-col gap-1.5 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                          Special Rate
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-3xl font-black text-slate-900 tracking-tighter">
                          ₹
                          {course.price
                            ? Number(course.price).toLocaleString("en-IN")
                            : "0"}
                        </span>
                        {course.price && Number(course.price) > 0 && (
                          <div className="flex flex-col leading-none">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5">
                              Regular
                            </span>
                            <span className="text-sm text-slate-400 line-through font-bold">
                              ₹
                              {Math.round(
                                Number(course.price) * 1.4,
                              ).toLocaleString("en-IN")}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      className="flex-1 rounded-xl h-10 font-black text-[10px] uppercase tracking-wider border-slate-200 hover:bg-slate-50"
                      onClick={() => window.open("https://aotms.in", "_blank")}
                    >
                      Explore
                    </Button>
                    <Button
                      className="flex-1 rounded-xl h-10 font-black text-[10px] uppercase tracking-wider bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-100"
                      onClick={() => onViewSyllabus?.(course)}
                    >
                      Start Localize
                    </Button>
                  </div>
                </div>

                {/* Hover Management Float */}
                <div className="absolute top-6 right-6 flex flex-col gap-2 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-full bg-white shadow-lg text-slate-400 hover:text-primary border-none"
                    onClick={() =>
                      setEditingPrice({
                        id: course.id,
                        title: course.title,
                        price: String(course.price || "0"),
                      })
                    }
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-full bg-white shadow-lg text-slate-400 hover:text-red-600 border-none"
                    onClick={() => onDelete?.(course.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Price Edit Modal */}
      <Dialog
        open={!!editingPrice}
        onOpenChange={(open) => !open && setEditingPrice(null)}
      >
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
                <label className="text-sm font-medium text-slate-700">
                  New Price (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                    ₹
                  </span>
                  <Input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="pl-8 h-12 text-lg font-bold rounded-xl"
                    placeholder="Enter amount"
                  />
                </div>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                  Set to 0 for free courses
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingPrice(null)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePriceUpdate}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 shadow-lg shadow-emerald-200"
            >
              Update Price
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NotificationSection() {
  const { notifications, loading, markAllAsRead, unreadCount } =
    useNotifications();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <Bell className="h-6 w-6 text-primary" />
            System Notifications
          </h2>
          <p className="text-slate-500">
            Stay updated with platform activities and system alerts
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={markAllAsRead}
              className="h-10 gap-2 rounded-xl border-slate-200 bg-white shadow-sm hover:bg-slate-50"
            >
              <CheckCheck className="h-4 w-4 text-emerald-500" />
              <span>Mark all as read</span>
            </Button>
          )}
          <Badge
            variant="secondary"
            className="h-8 px-3 rounded-lg bg-primary/10 text-primary font-bold"
          >
            {notifications.length} Total
          </Badge>
        </div>
      </div>

      <Card className="rounded-[2.5rem] border-slate-200 shadow-sm overflow-hidden bg-white/50 backdrop-blur-md">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-2xl" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
              <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Bell className="h-10 w-10 text-slate-200" />
              </div>
              <p className="font-medium text-lg">No notifications yet</p>
              <p className="text-sm">You're all caught up with the system.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((notif, index) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-6 flex gap-4 transition-colors hover:bg-slate-50/50 ${!notif.is_read ? "bg-primary/5" : ""}`}
                >
                  <div
                    className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                      notif.type === "coupon"
                        ? "bg-amber-100 text-amber-600"
                        : notif.type === "system"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-emerald-100 text-emerald-600"
                    }`}
                  >
                    <Bell className="h-6 w-6" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900">
                        {notif.title}
                      </h4>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                        {new Date(notif.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed max-w-3xl">
                      {notif.message}
                    </p>
                    <div className="pt-2 flex items-center gap-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                          notif.type === "coupon"
                            ? "bg-amber-100 text-amber-700"
                            : notif.type === "system"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {notif.type}
                      </span>
                      {!notif.is_read && (
                        <div className="flex items-center gap-1.5">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                          <span className="text-[10px] font-bold text-primary uppercase">
                            New
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function AdminDashboard() {
  const { user, loading: authLoading, userRole } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { fetchEnrollments } = useCourses();
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(false);
  const [coursesRefreshKey, setCoursesRefreshKey] = useState(0);
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("users");

  const adminData = useAdminData(userRole);
  const [selectedCourseDetail, setSelectedCourseDetail] =
    useState<CombinedCourse | null>(null);
  const [showCourseDetail, setShowCourseDetail] = useState(false);
  const [buildingCourse, setBuildingCourse] = useState<CombinedCourse | null>(
    null,
  );
  const [systemHealth, setSystemHealth] = useState(99.9);
  const [liveLearners, setLiveLearners] = useState(128);

  useEffect(() => {
    const interval = setInterval(() => {
      // Random fluctuation between 98.5 and 99.9
      const newHealth = +(98.5 + Math.random() * 1.4).toFixed(1);
      setSystemHealth(newHealth);

      // Fluctuating learners count
      setLiveLearners((prev) => prev + (Math.random() > 0.5 ? 1 : -1));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const {
    loading: dataLoading,
    profiles = [],
    courses = [],
    securityEvents = [],
    systemLogs = [],
    stats = {
      totalUsers: 0,
      activeCourses: 0,
      pendingCourses: 0,
      pendingEnrollments: 0,
      securityEvents: 0,
      highPriorityEvents: 0,
      roleCounts: {},
    },
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

  const { socket } = useSocket();

  useEffect(() => {
    if (socket) {
      socket.on(
        "admin_login_alert",
        (data: { email: string; time: string; ip: string }) => {
          // Broadcast alert to all active admin dashboards
          toast({
            title: "🔐 Security Alert: Admin Login",
            description: `An administrative session was established for ${data.email} from IP: ${data.ip}.`,
            variant: "destructive",
          });

          // Refresh security events to show the new login
          refresh();
        },
      );

      return () => {
        socket.off("admin_login_alert");
      };
    }
  }, [socket, user?.email, refresh, toast]);

  const updateEnrollmentStatus = async (
    id: string,
    status: "rejected" | "active",
  ) => {
    const success = await _updateEnrollmentStatus(id, status);
    if (success) {
      setEnrollments((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status } : e)),
      );
    }
  };

  const deleteEnrollment = async (id: string) => {
    if (
      confirm(
        "Are you sure you want to delete this enrollment? This action cannot be undone.",
      )
    ) {
      const success = await _deleteEnrollment(id);
      if (success) {
        setEnrollments((prev) => prev.filter((e) => e.id !== id));
      }
    }
  };

  const deleteCourse = async (id: string) => {
    if (
      confirm(
        "Are you sure you want to permanently delete this course? This action cannot be undone.",
      )
    ) {
      const success = await _deleteCourse(id);
      if (success) {
        setCoursesRefreshKey((prev) => prev + 1);
      }
    }
  };

  const loadEnrollments = useCallback(async () => {
    setEnrollmentsLoading(true);
    try {
      const data = await fetchEnrollments();
      setEnrollments(data);
    } catch (err) {
      console.error("Failed to load enrollments:", err);
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
  // (socket is already declared above)

  useEffect(() => {
    if (!socket) return;

    const handleEnrollmentChange = () => {
      console.log("[Socket] Enrollments changed, refreshing...");
      loadEnrollments();
    };

    socket.on("course_enrollments_changed", handleEnrollmentChange);

    return () => {
      socket.off("course_enrollments_changed", handleEnrollmentChange);
    };
  }, [socket, loadEnrollments]);

  useEffect(() => {
    const tabUrlMap: Record<string, string> = {
      "/admin": "users",
      "/admin/users": "users",
      "/admin/enrollments": "enrollments",
      "/admin/all-courses": "all-courses",
      "/admin/instructor-access": "instructor-access",
      "/admin/questions": "questions",
      "/admin/courses": "courses",
      "/admin/exams": "exams",
      "/admin/security": "security",
      "/admin/qa": "qa",
      "/admin/chat": "chat",
      "/admin/instructors": "instructors",
      "/admin/videos": "videos",
      "/admin/exam-scheduling": "exam-scheduling",
      "/admin/question-repository": "question-repository",
      "/admin/live-monitoring": "live-monitoring",
      "/admin/coupons": "coupons",
      "/admin/leads": "leads",
      "/admin/profile": "profile",
      "/admin/settings": "settings",
      "/admin/notifications": "notifications",
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
              Initializing <br />{" "}
              <span className="text-primary not-italic font-medium text-sm">
                Integrity Console
              </span>
            </motion.h4>
            <div className="flex items-center gap-1 justify-center">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 1.4, 1],
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
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
          <CourseBuilder
            course={buildingCourse as InstructorCourse}
            onBack={() => setBuildingCourse(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider className="h-[100dvh] w-full overflow-hidden mesh-bg font-sans">
      <AdminSidebar />
      <SidebarInset className="flex flex-col h-[100dvh] w-full overflow-hidden bg-transparent">
        <AdminHeader />
        <main className="flex-1 w-full overflow-y-auto overflow-x-hidden p-3 sm:p-6 admin-scrollbar">
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
                  onClick={() => refresh(true)}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
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
                  trend:
                    stats.pendingEnrollments > 0 ? "Action needed" : "Clear",
                  description: "Approval queue",
                },
                {
                  label: "Live Learners",
                  value: liveLearners,
                  icon: Users,
                  color: "blue",
                  trend: "Real-time",
                  description: "Currently active now",
                },
                {
                  label: "System Health",
                  value: `${systemHealth}%`,
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
                      <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
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
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              <div className="flex flex-col gap-4 border-b border-slate-200">
                <div className="w-full overflow-x-auto admin-scrollbar-horizontal pb-2">
                  <TabsList className="bg-transparent h-auto p-0 gap-6 sm:gap-8 flex min-w-max">
                    {[
                      {
                        id: "users",
                        label: "User Management",
                        icon: Users,
                        key: "tab-users",
                      },
                      {
                        id: "enrollments",
                        label: "Student Enrollments",
                        icon: GraduationCap,
                        key: "tab-enrollments",
                      },
                      {
                        id: "coupons",
                        label: "Rewards & Coupons",
                        icon: Ticket,
                        key: "tab-coupons",
                      },
                      {
                        id: "grant-access",
                        label: "Grant Access",
                        icon: UserCheck,
                        key: "tab-grant-access",
                      },
                      {
                        id: "resume-scans",
                        label: "Resume Scans",
                        icon: ClipboardList,
                        key: "tab-resume-scans",
                      },
                      {
                        id: "instructor-access",
                        label: "Instructor Access",
                        icon: ShieldCheck,
                        key: "tab-instructor-access",
                      },
                      {
                        id: "all-courses",
                        label: "All Courses",
                        icon: LayoutGrid,
                        key: "tab-all-courses",
                      },
                      {
                        id: "questions",
                        label: "Question Bank",
                        icon: FileQuestion,
                        key: "tab-questions",
                      },
                      {
                        id: "exams",
                        label: "Assessments",
                        icon: ShieldCheck,
                        key: "tab-exams",
                      },

                      {
                        id: "qa",
                        label: "Quality Assurance",
                        icon: ShieldCheck,
                        key: "tab-qa",
                      },
                      {
                        id: "chat",
                        label: "Chat Monitor",
                        icon: MessageSquare,
                        key: "tab-chat",
                      },
                      {
                        id: "instructors",
                        label: "Instructors",
                        icon: Users,
                        key: "tab-instructors",
                      },
                      {
                        id: "videos",
                        label: "Video Library",
                        icon: VideoIcon,
                        key: "tab-videos",
                      },
                      {
                        id: "exam-scheduling",
                        label: "Exam Scheduling",
                        icon: Calendar,
                        key: "tab-exam-scheduling",
                      },
                      {
                        id: "question-repository",
                        label: "Question Repository",
                        icon: Database,
                        key: "tab-question-repository",
                      },
                      {
                        id: "live-monitoring",
                        label: "Live Monitoring",
                        icon: Activity,
                        key: "tab-live-monitoring",
                      },
                      {
                        id: "leads",
                        label: "Landing Leads",
                        icon: Zap,
                        key: "tab-leads",
                      },
                      {
                        id: "settings",
                        label: "Settings",
                        icon: Settings,
                        key: "tab-settings",
                      },
                      {
                        id: "notifications",
                        label: "Notifications",
                        icon: Bell,
                        key: "tab-notifications",
                      },
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
                <TabsContent
                  key="tab-users"
                  value="users"
                  className="mt-0 outline-none"
                >
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

                <TabsContent
                  key="tab-enrollments"
                  value="enrollments"
                  className="mt-0 outline-none"
                >
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

                <TabsContent
                  key="tab-coupons"
                  value="coupons"
                  className="mt-0 outline-none"
                >
                  <motion.div
                    key="motion-coupons"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <CouponManager />
                  </motion.div>
                </TabsContent>

                <TabsContent
                  key="tab-grant-access"
                  value="grant-access"
                  className="mt-0 outline-none"
                >
                  <motion.div
                    key="motion-grant-access"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <GrantStudentAccess
                      profiles={profiles}
                      enrollments={enrollments}
                    />
                  </motion.div>
                </TabsContent>

                <TabsContent
                  key="tab-resume-scans"
                  value="resume-scans"
                  className="mt-0 outline-none"
                >
                  <motion.div
                    key="motion-resume-scans"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <ResumeScanHistory />
                  </motion.div>
                </TabsContent>

                <TabsContent
                  key="tab-instructor-access"
                  value="instructor-access"
                  className="mt-0 outline-none"
                >
                  <motion.div
                    key="motion-instructor-access"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <InstructorAccessAdmin />
                  </motion.div>
                </TabsContent>

                <TabsContent
                  key="tab-all-courses"
                  value="all-courses"
                  className="mt-0 outline-none"
                >
                  <motion.div
                    key="motion-all-courses"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <AllCoursesList
                      courses={courses}
                      loading={dataLoading}
                      onUpdatePrice={adminData.updateCoursePrice}
                      onToggleActive={adminData.toggleCourseActive}
                      onDelete={_deleteCourse}
                      onViewSyllabus={(course) => setBuildingCourse(course)}
                    />
                  </motion.div>
                </TabsContent>

                <TabsContent
                  key="tab-questions"
                  value="questions"
                  className="mt-0 outline-none"
                >
                  <motion.div
                    key="motion-questions"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <QuestionBankApproval />
                  </motion.div>
                </TabsContent>

                <TabsContent
                  key="tab-courses"
                  value="courses"
                  className="mt-0 outline-none"
                >
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

                <TabsContent
                  key="tab-exams"
                  value="exams"
                  className="mt-0 outline-none"
                >
                  <motion.div
                    key="motion-exams"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <ExamApproval />
                  </motion.div>
                </TabsContent>

                <TabsContent
                  key="tab-security"
                  value="security"
                  className="mt-0 outline-none"
                >
                  <motion.div
                    key="motion-security"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <SecurityMonitor
                      securityEvents={securityEvents}
                      systemLogs={systemLogs}
                      loading={dataLoading}
                      highPriorityCount={
                        securityEvents.filter(
                          (e) =>
                            e.risk_level === "high" ||
                            e.risk_level === "critical",
                        ).length
                      }
                      onResolveEvent={resolveSecurityEvent}
                    />
                  </motion.div>
                </TabsContent>

                <TabsContent
                  key="tab-settings"
                  value="settings"
                  className="mt-0 outline-none"
                >
                  <motion.div
                    key="motion-settings"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid gap-6 md:grid-cols-2"
                  >
                    <Card className="rounded-[2rem] border-slate-200 shadow-sm overflow-hidden bg-white/50 backdrop-blur-md">
                      <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                        <CardTitle className="flex items-center gap-2 text-slate-900">
                          <Settings className="h-5 w-5 text-primary" />
                          System Configuration
                        </CardTitle>
                        <CardDescription>
                          Manage global platform settings and system health
                          status.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-6 space-y-6">
                        <div className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl border border-primary/10">
                          <div className="space-y-1">
                            <p className="text-sm font-bold text-slate-900">
                              Platform Online Status
                            </p>
                            <p className="text-xs text-primary/70 font-medium italic">
                              Fetching real-time integrity data...
                            </p>
                          </div>
                          <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-sm shadow-emerald-200 px-3 font-bold">
                            OPERATIONAL
                          </Badge>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between py-3 border-b border-slate-50 group hover:bg-slate-50/30 transition-colors px-2 rounded-xl">
                            <div className="space-y-0.5">
                              <span className="text-sm font-bold text-slate-700">
                                Auto-Approval Protocol
                              </span>
                              <p className="text-[10px] text-slate-500 font-medium">
                                Instantly verify new student registration nodes
                              </p>
                            </div>
                            <Switch
                              defaultChecked
                              className="data-[state=checked]:bg-primary"
                            />
                          </div>
                          <div className="flex items-center justify-between py-3 border-b border-slate-50 group hover:bg-slate-50/30 transition-colors px-2 rounded-xl">
                            <div className="space-y-0.5">
                              <span className="text-sm font-bold text-slate-700">
                                Maintenance Synchronizer
                              </span>
                              <p className="text-[10px] text-slate-500 font-medium">
                                Pause all public-facing API endpoints
                              </p>
                            </div>
                            <Switch className="data-[state=checked]:bg-primary" />
                          </div>
                          <div className="flex items-center justify-between py-3 group hover:bg-slate-50/30 transition-colors px-2 rounded-xl">
                            <div className="space-y-0.5">
                              <span className="text-sm font-bold text-slate-700">
                                WebSocket Real-time Push
                              </span>
                              <p className="text-[10px] text-slate-500 font-medium">
                                Sync with central notification authority
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className="text-emerald-600 border-emerald-200 bg-emerald-50 px-2 font-black tracking-tighter"
                            >
                              CONNECTED
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="rounded-[2rem] border-slate-200 shadow-sm overflow-hidden bg-white/50 backdrop-blur-md">
                      <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                        <CardTitle className="flex items-center gap-2 text-slate-900">
                          <Activity className="h-5 w-5 text-accent" />
                          Administrative Node Stats
                        </CardTitle>
                        <CardDescription>
                          Live telemetry from high-availability services
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            {
                              label: "Internal Latency",
                              value: "18ms",
                              desc: "Sync latency",
                              icon: Zap,
                            },
                            {
                              label: "Cluster Peers",
                              value: `${profiles.length}+`,
                              desc: "Live admin nodes",
                              icon: Users,
                            },
                            {
                              label: "Engine Uptime",
                              value: "99.99%",
                              desc: "Continuous runtime",
                              icon: Clock,
                            },
                            {
                              label: "Memory Buffer",
                              value: "31%",
                              desc: "Optimized usage",
                              icon: Database,
                            },
                          ].map((s) => (
                            <div
                              key={s.label}
                              className="p-4 bg-white/80 rounded-2xl border border-slate-100 group hover:border-accent/40 transition-all duration-300 shadow-sm hover:shadow-md"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em]">
                                  {s.label}
                                </p>
                                <s.icon className="h-3.5 w-3.5 text-slate-300" />
                              </div>
                              <p className="text-2xl font-black text-slate-900 tracking-tighter">
                                {s.value}
                              </p>
                              <p className="text-[10px] text-slate-400 font-bold mt-1.5 uppercase leading-none opacity-60">
                                {s.desc}
                              </p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter className="bg-slate-50/30 border-t border-slate-100 py-3">
                        <div className="flex items-center gap-2 ml-auto">
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            Live Syncing
                          </span>
                        </div>
                      </CardFooter>
                    </Card>
                  </motion.div>
                </TabsContent>

                <TabsContent
                  key="tab-notifications"
                  value="notifications"
                  className="mt-0 outline-none"
                >
                  <NotificationSection />
                </TabsContent>

                <TabsContent
                  key="tab-qa"
                  value="qa"
                  className="mt-0 outline-none"
                >
                  <motion.div
                    key="motion-qa"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <QualityAssurance />
                  </motion.div>
                </TabsContent>

                <TabsContent
                  key="tab-instructors"
                  value="instructors"
                  className="mt-0 outline-none"
                >
                  <motion.div
                    key="motion-instructors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <InstructorManagement />
                  </motion.div>
                </TabsContent>

                <TabsContent
                  key="tab-chat"
                  value="chat"
                  className="mt-0 outline-none"
                >
                  <motion.div
                    key="motion-chat"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <ChatMonitor />
                  </motion.div>
                </TabsContent>

                <TabsContent
                  key="tab-videos"
                  value="videos"
                  className="mt-0 outline-none"
                >
                  <motion.div
                    key="motion-videos"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <ManagerVideoLibrary />
                  </motion.div>
                </TabsContent>

                <TabsContent
                  key="tab-exam-scheduling"
                  value="exam-scheduling"
                  className="mt-0 outline-none"
                >
                  <motion.div
                    key="motion-exam-scheduling"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <ExamScheduler />
                  </motion.div>
                </TabsContent>

                <TabsContent
                  key="tab-question-repository"
                  value="question-repository"
                  className="mt-0 outline-none"
                >
                  <motion.div
                    key="motion-question-repository"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <QuestionBankManager />
                  </motion.div>
                </TabsContent>

                <TabsContent
                  key="tab-live-monitoring"
                  value="live-monitoring"
                  className="mt-0 outline-none"
                >
                  <motion.div
                    key="motion-live-monitoring"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <LiveMonitoring />
                  </motion.div>
                </TabsContent>

                <TabsContent
                  key="tab-leads"
                  value="leads"
                  className="mt-0 outline-none"
                >
                  <motion.div
                    key="motion-leads"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <LeadManagement />
                  </motion.div>
                </TabsContent>

                <TabsContent
                  key="tab-profile"
                  value="profile"
                  className="mt-0 outline-none"
                >
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
                {selectedCourseDetail.thumbnail_url ||
                selectedCourseDetail.image ? (
                  <img
                    src={
                      selectedCourseDetail.thumbnail_url?.startsWith("http")
                        ? selectedCourseDetail.thumbnail_url
                        : selectedCourseDetail.image?.startsWith("http")
                          ? selectedCourseDetail.image
                          : `/s3/public/${selectedCourseDetail.thumbnail_url || selectedCourseDetail.image}`
                    }
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
                    {selectedCourseDetail.category || "Curriculum"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold tracking-tight text-slate-900">
                  {selectedCourseDetail.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {selectedCourseDetail.description ||
                    "Comprehensive training program for aviation professionals."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Course Metadata
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <span>
                        {selectedCourseDetail.duration || "Flexible"} duration
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <LayoutGrid className="h-4 w-4 text-slate-400" />
                      <span>
                        Level: {selectedCourseDetail.level || "Beginner"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-primary/60">
                    Assignment Details
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <User className="h-4 w-4 text-primary/40" />
                      <span className="font-medium truncate">
                        {selectedCourseDetail.instructor_id
                          ? "Assigned"
                          : "Open Catalog"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <Calendar className="h-4 w-4 text-primary/40" />
                      <span>
                        Added{" "}
                        {selectedCourseDetail.created_at
                          ? new Date(
                              selectedCourseDetail.created_at,
                            ).toLocaleDateString()
                          : "N/A"}
                      </span>
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
                    <p className="text-xs font-bold text-orange-800 uppercase tracking-tighter">
                      Current Status
                    </p>
                    <p className="text-sm font-medium text-orange-900">
                      {selectedCourseDetail.status || "Active in Library"}
                    </p>
                  </div>
                </div>
                <Badge className="bg-orange-200 text-orange-800 hover:bg-orange-300 border-none">
                  {selectedCourseDetail.status === "published" ||
                  selectedCourseDetail.status === "approved"
                    ? "Active"
                    : "Archived"}
                </Badge>
              </div>
            </div>
          )}

          <DialogFooter className="border-t pt-4">
            <Button
              variant="outline"
              className="rounded-lg h-10 px-6 font-semibold"
              onClick={() => setShowCourseDetail(false)}
            >
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
