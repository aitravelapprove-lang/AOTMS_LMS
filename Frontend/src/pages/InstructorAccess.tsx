import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  BookOpen,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Layers,
  ShieldCheck,
  Plus,
  ArrowRight,
  Check,
  MoreVertical,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { fetchWithAuth } from "@/lib/api";
import { CourseBuilder } from "@/components/instructor/courses/CourseBuilder";
import { Course as InstructorCourse } from "@/hooks/useInstructorData";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface AdminCourse {
  id: string;
  title: string;
  description: string | null;
  instructor_id: string | null;
  instructor_name: string | null;
  instructor_email: string | null;
  instructor_avatar?: string | null;
  status:
    | "pending"
    | "approved"
    | "rejected"
    | "published"
    | "draft"
    | "disabled";
  category: string | null;
  thumbnail_url: string | null;
  image?: string | null;
  submitted_at?: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  draft: number;
}

export default function InstructorAccess() {
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedCourse, setSelectedCourse] = useState<AdminCourse | null>(
    null,
  );
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState(false);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    draft: 0,
  });
  const [buildingCourse, setBuildingCourse] = useState<AdminCourse | null>(
    null,
  );

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchWithAuth("/admin/courses-with-instructors");
      const coursesData = (data as AdminCourse[]).map((c: AdminCourse) => ({
        ...c,
        image: c.image || c.thumbnail_url,
      }));

      setCourses(coursesData);

      const s: Stats = {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        draft: 0,
      };
      coursesData.forEach((c: AdminCourse) => {
        s.total++;
        const status = c.status?.toLowerCase();
        if (status === "pending") s.pending++;
        else if (status === "approved" || status === "published") s.approved++;
        else if (status === "rejected") s.rejected++;
        else s.draft++;
      });
      setStats(s);
    } catch (err) {
      console.error("Failed to fetch courses:", err);
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleApprove = async (courseId: string, title: string) => {
    setProcessing(true);
    try {
      await fetchWithAuth("/admin/approve-course", {
        method: "PUT",
        body: JSON.stringify({ courseId, status: "approved" }),
      });
      toast.success(`Access granted for: ${title}`);
      fetchCourses();
    } catch (err) {
      console.error("Failed to approve:", err);
      toast.error("Failed to grant access");
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteCourse = async (courseId: string, title: string) => {
    if (
      !confirm(
        `Are you sure you want to remove all instructor assignments from "${title}"? This will return the course to draft status but will NOT delete the course content.`,
      )
    )
      return;

    setProcessing(true);
    try {
      await fetchWithAuth(`/admin/clear-course-instructors/${courseId}`, {
        method: "DELETE",
      });
      toast.success(`Access removed: ${title}`);
      fetchCourses();
    } catch (err) {
      console.error("Failed to unassign:", err);
      toast.error("Failed to remove instructors");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedCourse || !rejectReason) return;
    setProcessing(true);
    try {
      await fetchWithAuth("/admin/approve-course", {
        method: "PUT",
        body: JSON.stringify({
          courseId: selectedCourse.id,
          status: "rejected",
          rejectionReason: rejectReason,
        }),
      });
      toast.info(`Request rejected for: ${selectedCourse.title}`);
      setShowRejectDialog(false);
      setSelectedCourse(null);
      setRejectReason("");
      fetchCourses();
    } catch (err) {
      console.error("Failed to reject:", err);
      toast.error("Failed to process rejection");
    } finally {
      setProcessing(false);
    }
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      course.instructor_email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || course.status?.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (buildingCourse) {
    return (
      <CourseBuilder
        course={buildingCourse as unknown as InstructorCourse}
        onBack={() => setBuildingCourse(null)}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Primary Header - Grant Access Style */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center shadow-sm shrink-0">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Staff Permissions
            </h2>
          </div>
          <p className="text-[11px] sm:text-[13px] font-medium text-slate-500 sm:ml-13 uppercase tracking-[0.2em]">
            Manage curriculum publishing permissions
          </p>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm w-full sm:w-auto">
          <div className="flex -space-x-2 sm:-space-x-3 px-2">
            {courses.slice(0, 4).map((c, i) => (
              <Avatar
                key={i}
                className="h-8 w-8 border-2 border-white ring-1 ring-slate-100 italic"
              >
                <AvatarImage src={c.instructor_avatar || ""} />
                <AvatarFallback className="bg-slate-100 text-[10px] font-bold">
                  {c.instructor_name?.[0]}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          <div className="h-4 w-px bg-slate-200 mx-1" />
          <Badge
            variant="secondary"
            className="px-3 py-1 bg-primary/5 text-primary border-none font-bold"
          >
            {stats.pending} Pending Request{stats.pending !== 1 && "s"}
          </Badge>
        </div>
      </div>

      {/* Grid Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Course Submissions",
            count: stats.total,
            color: "bg-slate-900",
            icon: Layers,
            desc: "Total courses submitted by faculty",
          },
          {
            label: "Pending Review",
            count: stats.pending,
            color: "bg-amber-500",
            icon: Clock,
            desc: "Needs administrative approval",
            active: stats.pending > 0,
          },
          {
            label: "Verified Courses",
            count: stats.approved,
            color: "bg-emerald-600",
            icon: CheckCircle,
            desc: "Ready for platform students",
          },
          {
            label: "Admin Overview",
            count: stats.total,
            color: "bg-rose-500",
            icon: ShieldCheck,
            desc: "Combined course inventory",
            isHigh: true,
          },
        ].map((role) => (
          <Card
            key={role.label}
            className={`border-none shadow-xl shadow-slate-200/50 rounded-[2rem] overflow-hidden group transition-all duration-500 hover:-translate-y-2 ${role.isHigh ? "bg-primary shadow-primary/30" : "bg-white"}`}
          >
            <CardContent className="p-6 sm:p-8">
              <div className="flex justify-between items-start mb-8">
                <div
                  className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-500 group-hover:rotate-12 ${role.isHigh ? "bg-white/20" : "bg-slate-50"}`}
                >
                  <role.icon
                    className={`h-6 w-6 ${role.isHigh ? "text-white" : "text-slate-600"}`}
                  />
                </div>
                {role.active && (
                  <div
                    className={`h-2 w-2 rounded-full animate-ping bg-amber-500/60`}
                  />
                )}
              </div>

              <div className="space-y-1">
                <h5
                  className={`text-[10px] font-black uppercase tracking-[0.2em] ${role.isHigh ? "text-white/60" : "text-slate-400"}`}
                >
                  {role.label}
                </h5>
                <div className="flex items-baseline gap-2">
                  <span
                    className={`text-3xl font-black tracking-tighter ${role.isHigh ? "text-white" : "text-slate-900"}`}
                  >
                    {role.count}
                  </span>
                    <span
                    className={`text-[11px] font-bold ${role.isHigh ? "text-white/40" : "text-slate-300"}`}
                  >
                    Courses
                  </span>
                </div>
                <p
                  className={`text-[11px] font-medium pt-3 border-t mt-4 border-white/10 ${role.isHigh ? "text-white/60" : "text-slate-400 border-slate-50"}`}
                >
                  {role.desc}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Filter & Horizontal Grid Section */}
      <Card className="border-none shadow-2xl shadow-slate-200/40 rounded-[2.5rem] overflow-hidden bg-white/80 backdrop-blur-md">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-5 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center shadow-sm shrink-0 border border-slate-100">
                <Layers className="h-6 w-6 text-primary/60" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-800 tracking-tight">
                  Instructor Proposals
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                  Submission Register
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative w-full sm:w-[350px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search proposals or instructors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-11 h-12 rounded-2xl bg-white border-slate-200/60 focus:ring-2 focus:ring-primary/20 transition-all font-bold placeholder:font-medium placeholder:text-slate-400 shadow-sm"
                />
              </div>
              <div className="flex items-center gap-2 bg-white/50 p-1 rounded-2xl border border-slate-200/60 shadow-sm overflow-x-auto scrollbar-none">
                {["all", "pending", "approved", "rejected"].map((s) => (
                  <Button
                    key={s}
                    variant="ghost"
                    size="sm"
                    onClick={() => setStatusFilter(s)}
                    className={`capitalize rounded-xl px-5 h-9 text-[10px] font-black tracking-widest transition-all ${
                      statusFilter === s
                        ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-24 rounded-2xl bg-slate-50 animate-pulse border border-slate-100"
                />
              ))}
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="h-20 w-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6 border border-slate-100 shadow-inner">
                <BookOpen className="h-10 w-10 text-slate-200" />
              </div>
              <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">
                No Requests Logged
              </h3>
              <p className="text-sm text-slate-300 font-medium max-w-xs mt-3 uppercase tracking-tight">
                The platform registry is currently clear of pending proposals.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredCourses.map((course) => (
                  <motion.div
                    key={course.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group flex flex-col md:flex-row md:items-center justify-between p-5 rounded-3xl border border-slate-200 bg-white hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 relative overflow-hidden gap-6"
                  >
                    <div className="flex items-start sm:items-center gap-5 min-w-0 flex-1">
                      <div className="relative shrink-0">
                        <Avatar className="h-14 w-14 border-2 border-slate-50 shadow-md rounded-2xl overflow-hidden transition-transform duration-500 group-hover:scale-105">
                          <AvatarImage src={course.instructor_avatar || ""} />
                          <AvatarFallback className={`${course.instructor_name === 'No Instructor Assigned' ? 'bg-slate-50 text-slate-300' : 'bg-primary/5 text-primary'} text-base font-black`}>
                            {course.instructor_name === 'No Instructor Assigned' ? '?' : (course.instructor_name?.[0] || 'I')}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-4 border-white flex items-center justify-center shadow-sm ${
                            course.status === "pending"
                              ? "bg-amber-500"
                              : course.status === "approved"
                                ? "bg-emerald-500"
                                : "bg-rose-500"
                          }`}
                        >
                          <div className="h-1.5 w-1.5 bg-white rounded-full animate-pulse" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className={`text-[16px] font-black group-hover:text-primary transition-colors line-clamp-1 tracking-tight ${course.instructor_name === 'No Instructor Assigned' ? 'text-slate-400 italic' : 'text-slate-900'}`}>
                            {course.instructor_name}
                          </h4>
                          <Badge
                            className={`text-[9px] h-5 px-2 rounded-lg uppercase font-black tracking-wider border-none shadow-none ${
                              course.status === "approved"
                                ? "bg-emerald-500 text-white"
                                : course.status === "pending"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-rose-50 text-rose-600"
                            }`}
                          >
                            {course.status === "pending"
                              ? "PENDING"
                              : "INSTRUCTOR"}
                          </Badge>
                        </div>
                        <p className="text-[12px] font-semibold text-slate-500 line-clamp-1 opacity-70">
                          {course.instructor_email}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <div className="px-3 py-1 bg-slate-50 rounded-lg border border-slate-100 flex items-center gap-2 max-w-full">
                            <BookOpen className="h-3 w-3 text-primary/40 shrink-0" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight line-clamp-1">
                              {course.title}
                            </span>
                          </div>
                          {course.created_at && (
                            <div className="px-3 py-1 bg-slate-50/50 rounded-lg border border-slate-100/50 flex items-center gap-2">
                              <Clock className="h-3 w-3 text-slate-300 shrink-0" />
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                {new Date(course.created_at).toLocaleDateString(
                                  "en-GB",
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-3 md:ml-6 shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-slate-50">
                      {course.status === "pending" ? (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApprove(course.id, course.title);
                            }}
                            disabled={processing}
                            className="h-10 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-100 transition-all font-black text-[11px] uppercase tracking-wider"
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Grant Access
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCourse(course);
                              setShowRejectDialog(true);
                            }}
                            disabled={processing}
                            className="h-10 px-4 bg-rose-50 hover:bg-rose-100 text-rose-500 border border-rose-100 rounded-xl transition-all font-black text-[11px] uppercase"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div
                          className={`flex items-center gap-2 px-4 py-2 border rounded-xl font-black text-[11px] tracking-wider ${
                            course.status === "rejected"
                              ? "bg-rose-50 text-rose-500 border-rose-100"
                              : "bg-emerald-50 text-emerald-600 border-emerald-100"
                          }`}
                        >
                          {course.status === "rejected" ? (
                            <XCircle className="h-4 w-4" />
                          ) : (
                            <ShieldCheck className="h-4 w-4" />
                          )}
                          <span className="uppercase">
                            {course.status === "approved"
                              ? "Verified Access"
                              : course.status}
                          </span>
                        </div>
                      )}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 rounded-xl text-slate-400 hover:text-slate-900 border-slate-100 transition-all"
                          >
                            <MoreVertical className="h-4.5 w-4.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-56 p-2 rounded-2xl shadow-2xl border-slate-100"
                        >
                          <DropdownMenuItem
                            className="text-rose-600 focus:text-rose-600 focus:bg-rose-50 font-bold gap-3 p-3 rounded-xl cursor-pointer"
                            onClick={() =>
                              handleDeleteCourse(course.id, course.title)
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                            Revoke/Delete Status
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="max-w-md bg-white border border-slate-200 shadow-2xl rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-rose-50 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-rose-600" />
              </div>
              Reject Proposal
            </DialogTitle>
            <DialogDescription>
              Please provide formal justification for rejecting "
              {selectedCourse?.title}"
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <Textarea
              placeholder="Detailed reason for rejection..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              className="rounded-2xl border-slate-200 focus:ring-rose-500/20"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectReason || processing}
              className="rounded-xl bg-rose-600 hover:bg-rose-700 font-bold px-8 shadow-lg shadow-rose-200"
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
