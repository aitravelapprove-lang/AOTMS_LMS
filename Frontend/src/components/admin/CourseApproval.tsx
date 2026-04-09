import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  BookOpen,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  MoreHorizontal,
  FileEdit,
  Send,
  Archive,
  User,
  Mail,
  Calendar,
  Building,
  GraduationCap
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Course } from '@/hooks/useAdminData';

interface CourseApprovalProps {
  courses: Course[];
  loading: boolean;
  onApprove: (courseId: string) => Promise<boolean>;
  onReject: (courseId: string, reason: string) => Promise<boolean>;
  onUpdateStatus?: (courseId: string, status: string) => Promise<boolean>;
  onToggleActive?: (courseId: string, isActive: boolean) => Promise<boolean>;
}

export function CourseApproval({
  courses,
  loading,
  onApprove,
  onReject,
  onUpdateStatus,
  onToggleActive
}: CourseApprovalProps) {
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'draft' | 'all'>('pending');

  const pendingCourses = courses.filter((c) => c.status?.toLowerCase() === 'pending');
  const approvedCourses = courses.filter((c) => c.status?.toLowerCase() === 'approved' || c.status?.toLowerCase() === 'published');
  const rejectedCourses = courses.filter((c) => c.status?.toLowerCase() === 'rejected');
  const draftCourses = courses.filter((c) => !c.status || c.status?.toLowerCase() === 'draft');
  const disabledCourses = courses.filter((c) => c.status?.toLowerCase() === 'disabled');

  const filteredCourses = filter === 'all' ? courses :
    filter === 'pending' ? pendingCourses :
      filter === 'approved' ? approvedCourses :
        filter === 'rejected' ? rejectedCourses : draftCourses;

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleViewCourse = (course: Course) => {
    setSelectedCourse(course);
    setShowViewDialog(true);
  };

  const handleApprove = async (course: Course) => {
    setProcessing(true);
    await onApprove(course.id);
    setProcessing(false);
  };

  const handleReject = async () => {
    if (selectedCourse && rejectReason) {
      setProcessing(true);
      await onReject(selectedCourse.id, rejectReason);
      setProcessing(false);
      setShowRejectDialog(false);
      setSelectedCourse(null);
      setRejectReason('');
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Unknown date';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Invalid date';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="text-xl flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Executive Catalog
                </CardTitle>
                <CardDescription>Global Curriculum Intelligence Node</CardDescription>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1">
              {[
                { id: 'pending', label: 'Pending', count: pendingCourses.length },
                { id: 'approved', label: 'Approved', count: approvedCourses.length },
                { id: 'draft', label: 'Drafts', count: draftCourses.length },
                { id: 'rejected', label: 'Rejected', count: rejectedCourses.length },
                { id: 'all', label: 'All', count: courses.length }
              ].map((f) => (
                <Button
                  key={f.id}
                  variant={filter === f.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(f.id as 'pending' | 'approved' | 'rejected' | 'draft' | 'all')}
                  className={`h-9 px-4 rounded-full text-[10px] uppercase font-black tracking-widest whitespace-nowrap transition-all ${
                    filter === f.id ? 'shadow-lg shadow-primary/20' : 'bg-white border-slate-200'
                  }`}
                >
                  {f.label} <span className="ml-1.5 opacity-50">({f.count})</span>
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredCourses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-center">
              <CheckCircle className="h-12 w-12 mb-4 opacity-20" />
              <p>No courses found in the "{filter}" category</p>
              {filter === 'pending' && courses.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilter('all')}
                  className="mt-4"
                >
                  View All Platform Courses ({courses.length})
                </Button>
              )}
            </div>
          ) : (
            filteredCourses.map((course) => (
              <div
                key={course.id}
                className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-white border border-slate-200 hover:border-primary/50 hover:shadow-md transition-all group overflow-hidden relative"
              >
                <div className="h-32 sm:h-20 w-full sm:w-32 rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-100 shrink-0">
                  {course.thumbnail_url ? (
                    <img
                      src={course.thumbnail_url.startsWith('http') ? course.thumbnail_url : (course.thumbnail_url.includes('s3') ? course.thumbnail_url : `/s3/public/${course.thumbnail_url}`)}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      alt=""
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1 opacity-20">
                      <BookOpen className="h-7 w-7 text-primary" />
                      <span className="text-[10px] font-black uppercase">No Image</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <h4 className="font-black text-slate-900 group-hover:text-primary transition-colors truncate text-sm sm:text-base">{course.title}</h4>
                    <Badge variant={
                      (course.status?.toLowerCase() === 'approved' || course.status?.toLowerCase() === 'published') ? 'default' :
                        course.status?.toLowerCase() === 'pending' ? 'secondary' :
                          course.status?.toLowerCase() === 'rejected' ? 'destructive' : 'outline'
                    } className="text-[8px] h-4 px-1.5 uppercase font-black tracking-tighter">
                      {course.status || 'draft'}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 truncate">
                      <div className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                         <User className="h-3 w-3 text-slate-400" />
                      </div>
                      <span>by {course.instructor_name || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest border-t sm:border-t-0 sm:border-l pt-2 sm:pt-0 sm:pl-4">
                       <Clock className="h-3 w-3" />
                       {formatDate(course.submitted_at || course.created_at)}
                    </div>
                  </div>

                  {onToggleActive && (
                    <div className="flex items-center gap-2 mt-3 bg-slate-50 w-fit p-1.5 pr-3 rounded-full border border-slate-100">
                      <Switch 
                        id={`active-toggle-${course.id}`}
                        checked={course.is_active !== false}
                        onCheckedChange={(checked) => onToggleActive(course.id, checked)}
                        className="h-4 w-7 data-[state=checked]:bg-emerald-500"
                      />
                      <Label 
                        htmlFor={`active-toggle-${course.id}`}
                        className={`text-[9px] font-black uppercase tracking-widest ${course.is_active !== false ? 'text-emerald-600' : 'text-slate-400'}`}
                      >
                        {course.is_active !== false ? 'Live' : 'Hidden'}
                      </Label>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 justify-end">
                  <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary hover:text-white transition-colors" onClick={() => handleViewCourse(course)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  {onUpdateStatus && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl hover:bg-slate-100">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl border-slate-200">
                        <DropdownMenuItem
                          onClick={() => onUpdateStatus(course.id, 'approved')}
                          disabled={processing || course.status?.toLowerCase() === 'approved'}
                          className="text-xs font-bold"
                        >
                          <CheckCircle className="h-4 w-4 mr-2 text-emerald-600" />
                          Approve Course
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onUpdateStatus(course.id, 'published')}
                          disabled={processing || course.status?.toLowerCase() === 'published'}
                          className="text-xs font-bold"
                        >
                          <Send className="h-4 w-4 mr-2 text-blue-600" />
                          Publish to Platform
                        </DropdownMenuItem>
                        {/* ... other items can remain ... */}
                        <DropdownMenuItem
                          onClick={() => onUpdateStatus(course.id, 'rejected')}
                          disabled={processing || course.status?.toLowerCase() === 'rejected'}
                          className="text-xs font-bold text-destructive"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject Submision
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}

                  <div className="flex gap-1 border-l pl-1.5 ml-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-emerald-600 hover:bg-emerald-50 rounded-xl"
                      disabled={processing || course.status?.toLowerCase() === 'approved' || course.status?.toLowerCase() === 'published'}
                      onClick={() => handleApprove(course)}
                    >
                      <CheckCircle className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-rose-500 hover:bg-rose-50 rounded-xl"
                      disabled={processing || course.status === 'rejected'}
                      onClick={() => {
                        setSelectedCourse(course);
                        setShowRejectDialog(true);
                      }}
                    >
                      <XCircle className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Course Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Course Statistics</CardTitle>
          <CardDescription>Platform-wide course data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm">Total Courses</span>
              <span className="font-bold">{courses.length}</span>
            </div>
            <Progress value={100} className="h-2" />
          </div>
          <div className="p-4 rounded-lg bg-green-500/10">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-green-600">Published</span>
              <span className="font-bold">{approvedCourses.length}</span>
            </div>
            <Progress
              value={courses.length > 0 ? (approvedCourses.length / courses.length) * 100 : 0}
              className="h-2"
            />
          </div>
          <div className="p-4 rounded-lg bg-accent/10">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-accent">Pending</span>
              <span className="font-bold">{pendingCourses.length}</span>
            </div>
            <Progress
              value={courses.length > 0 ? (pendingCourses.length / courses.length) * 100 : 0}
              className="h-2"
            />
          </div>
          <div className="p-4 rounded-lg bg-destructive/10">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-destructive">Rejected</span>
              <span className="font-bold">{rejectedCourses.length}</span>
            </div>
            <Progress
              value={courses.length > 0 ? (rejectedCourses.length / courses.length) * 100 : 0}
              className="h-2"
            />
          </div>
          <div className="p-4 rounded-lg bg-muted">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Disabled</span>
              <span className="font-bold">{disabledCourses.length}</span>
            </div>
            <Progress
              value={courses.length > 0 ? (disabledCourses.length / courses.length) * 100 : 0}
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Course</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting "{selectedCourse?.title}"
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectReason || processing}
            >
              Reject Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Course Details Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Course Details
            </DialogTitle>
            <DialogDescription>
              View course information and instructor details
            </DialogDescription>
          </DialogHeader>
          {selectedCourse && (
            <div className="space-y-6">
              {/* Course Info */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">{selectedCourse.title}</h3>
                <p className="text-sm text-muted-foreground">{selectedCourse.description || 'No description'}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={
                    (selectedCourse.status?.toLowerCase() === 'approved' || selectedCourse.status?.toLowerCase() === 'published') ? 'default' :
                      selectedCourse.status?.toLowerCase() === 'pending' ? 'secondary' :
                        selectedCourse.status?.toLowerCase() === 'rejected' ? 'destructive' : 'outline'
                  }>
                    {selectedCourse.status || 'draft'}
                  </Badge>
                  {selectedCourse.category && (
                    <Badge variant="outline">{selectedCourse.category}</Badge>
                  )}
                </div>
              </div>

              {/* Instructor Info */}
              <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Instructor Details
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{selectedCourse.instructor_name || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{selectedCourse.instructor_email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Created: {selectedCourse.created_at ? new Date(selectedCourse.created_at).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  {selectedCourse.submitted_at && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Submitted: {new Date(selectedCourse.submitted_at).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                {selectedCourse.status?.toLowerCase() !== 'approved' && selectedCourse.status?.toLowerCase() !== 'published' && (
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      onApprove(selectedCourse.id);
                      setShowViewDialog(false);
                    }}
                    disabled={processing}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                )}
                {selectedCourse.status?.toLowerCase() !== 'rejected' && (
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => {
                      setShowViewDialog(false);
                      setSelectedCourse(selectedCourse);
                      setShowRejectDialog(true);
                    }}
                    disabled={processing}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setShowViewDialog(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
