import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BookOpen,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  MoreHorizontal,
  User,
  Calendar,
  TrendingUp,
  Users,
  Award,
  FileText,
  Mail,
  Layers,
} from 'lucide-react';
import { fetchWithAuth } from '@/lib/api';
import type { Profile } from '@/hooks/useAdminData';
import { CourseBuilder } from '@/components/instructor/courses/CourseBuilder';

interface EnrolledStudent extends Profile {
  progress: number;
  enrolled_at: string;
}

interface Course {
  id: string;
  title: string;
  description: string | null;
  instructor_id: string | null;
  instructor_name: string | null;
  instructor_email: string | null;
  instructor_avatar?: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'published' | 'draft' | 'disabled';
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

export default function InstructorCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, approved: 0, rejected: 0, draft: 0 });
  const [showStudentsDialog, setShowStudentsDialog] = useState(false);
  const [showInstructorDialog, setShowInstructorDialog] = useState(false);
  const [enrolledStudents, setEnrolledStudents] = useState<EnrolledStudent[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState<Profile | null>(null);
  const [buildingCourse, setBuildingCourse] = useState<Course | null>(null);

  const fetchEnrolledStudents = async (courseId: string) => {
    setLoadingStudents(true);
    try {
      const data = await fetchWithAuth(`/admin/course-enrollments/${courseId}`);
      setEnrolledStudents(data as EnrolledStudent[]);
    } catch (err) {
      console.error('Failed to fetch students:', err);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleViewStudents = async (course: Course) => {
    setSelectedCourse(course);
    setShowStudentsDialog(true);
    fetchEnrolledStudents(course.id);
    
    // Also fetch the full instructor profile for this course
    if (course.instructor_id) {
      try {
        const data = await fetchWithAuth(`/data/profiles?user_id=eq.${course.instructor_id}`);
        const instructorData = (data as Profile[])[0];
        if (instructorData) {
          setSelectedInstructor(instructorData);
        }
      } catch (err) {
        console.error('Failed to fetch instructor for course dialog:', err);
      }
    } else {
      setSelectedInstructor(null);
    }
  };

  const handleViewInstructor = async (instructorId: string) => {
    try {
      setLoadingStudents(true); // Reuse loading for simplicity or add loadingInstructor
      const data = await fetchWithAuth(`/data/profiles?user_id=eq.${instructorId}`);
      const instructorData = (data as Profile[])[0];
      if (instructorData) {
        setSelectedInstructor(instructorData);
        setShowInstructorDialog(true);
      }
    } catch (err) {
      console.error('Failed to fetch instructor:', err);
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use the dedicated endpoint that returns courses with instructor details
      const data = await fetchWithAuth('/admin/courses-with-instructors');
      
      // Map to match our interface
      const coursesWithInstructors = (data as Course[]).map((c: Course) => ({
        ...c,
        image: c.image || c.thumbnail_url // Support both image and thumbnail_url
      }));

      setCourses(coursesWithInstructors);
      
      const s: Stats = { total: 0, pending: 0, approved: 0, rejected: 0, draft: 0 };
      (data as Course[]).forEach((c: Course) => {
        s.total++;
        const status = c.status?.toLowerCase();
        if (status === 'pending') s.pending++;
        else if (status === 'approved' || status === 'published') s.approved++;
        else if (status === 'rejected') s.rejected++;
        else s.draft++;
      });
      setStats(s);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
      setError('Failed to load courses. Please try refreshing or check if the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleApprove = async (courseId: string) => {
    setProcessing(true);
    try {
      await fetchWithAuth('/admin/approve-course', {
        method: 'PUT',
        body: JSON.stringify({ courseId, status: 'approved' })
      });
      fetchCourses();
    } catch (err) {
      console.error('Failed to approve:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedCourse || !rejectReason) return;
    setProcessing(true);
    try {
      await fetchWithAuth('/admin/approve-course', {
        method: 'PUT',
        body: JSON.stringify({ courseId: selectedCourse.id, status: 'rejected', rejectionReason: rejectReason })
      });
      setShowRejectDialog(false);
      setSelectedCourse(null);
      setRejectReason('');
      fetchCourses();
    } catch (err) {
      console.error('Failed to reject:', err);
    } finally {
      setProcessing(false);
    }
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || course.status?.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status?: string) => {
    const s = status?.toLowerCase();
    if (s === 'approved' || s === 'published') return <Badge className="bg-green-100 text-green-700 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1" />Published</Badge>;
    if (s === 'pending') return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    if (s === 'rejected') return <Badge className="bg-red-100 text-red-700 hover:bg-red-100"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
    return <Badge variant="outline">{status || 'Draft'}</Badge>;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (buildingCourse) {
      // Need to cast to the same structure as InstructorCourses.tsx component expects or Course interface
      return <CourseBuilder course={buildingCourse as any} onBack={() => setBuildingCourse(null)} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Instructor Courses</h1>
          <p className="text-slate-500 mt-1">Manage and review courses submitted by instructors</p>
        </div>
        <Button onClick={fetchCourses} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Courses</p>
                <p className="text-3xl font-bold text-blue-700">{stats.total}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 border-yellow-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Pending</p>
                <p className="text-3xl font-bold text-yellow-700">{stats.pending}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Approved</p>
                <p className="text-3xl font-bold text-green-700">{stats.approved}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100/50 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Rejected</p>
                <p className="text-3xl font-bold text-red-700">{stats.rejected}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-50 to-slate-100/50 border-slate-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Drafts</p>
                <p className="text-3xl font-bold text-slate-700">{stats.draft}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-slate-500/20 flex items-center justify-center">
                <FileText className="h-6 w-6 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search courses or instructors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'pending', 'approved', 'published', 'rejected', 'draft'].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                  className="capitalize"
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Courses ({filteredCourses.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-500 font-medium">{error}</p>
              <Button onClick={fetchCourses} variant="outline" className="mt-4">Try Again</Button>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No courses found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all bg-white"
                >
                  <div className="h-16 w-28 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                    {course.image || course.thumbnail_url ? (
                      <img src={course.image || course.thumbnail_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <BookOpen className="h-6 w-6 text-slate-400" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900 truncate">{course.title}</h3>
                      {getStatusBadge(course.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      {course.instructor_id ? (
                        <div 
                          className="flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors group"
                          onClick={() => handleViewInstructor(course.instructor_id!)}
                        >
                          {course.instructor_avatar ? (
                            <img 
                              src={course.instructor_avatar} 
                              alt="" 
                              className="h-8 w-8 rounded-full object-cover border border-slate-200" 
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center">
                              <User className="h-4 w-4 text-slate-500" />
                            </div>
                          )}
                          <div className="flex flex-col leading-none">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-semibold text-slate-800">{course.instructor_name || 'Unknown'}</span>
                              <Eye className="h-3 w-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            {course.instructor_email && (
                              <span className="text-xs text-slate-500">{course.instructor_email}</span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          No Instructor
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(course.submitted_at || course.created_at)}
                      </span>
                      {course.category && (
                        <Badge variant="outline" className="text-xs">{course.category}</Badge>
                      )}
                    </div>
                    {course.description && (
                      <p className="text-sm text-slate-500 truncate mt-1">{course.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      title="View Syllabus"
                      onClick={() => setBuildingCourse(course)}
                      className="text-primary hover:bg-primary/5"
                    >
                      <Layers className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      title="View Students"
                      onClick={() => handleViewStudents(course)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {(course.status === 'pending' || course.status === 'draft') && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          title="Approve"
                          disabled={processing}
                          onClick={() => handleApprove(course.id)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Reject"
                          disabled={processing}
                          onClick={() => {
                            setSelectedCourse(course);
                            setShowRejectDialog(true);
                          }}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
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
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectReason || processing}>
              Reject Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Student List Dialog */}
      <Dialog open={showStudentsDialog} onOpenChange={setShowStudentsDialog}>
        <DialogContent className="max-w-4xl bg-white/95 backdrop-blur-xl border-slate-200/60 shadow-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-slate-900">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              Course Details: {selectedCourse?.title}
            </DialogTitle>
            <DialogDescription>
              Instructor profile and student enrollment details
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-8 py-6">
            {/* Instructor Quick View Section */}
            {selectedInstructor && (
              <div className="bg-slate-50/50 rounded-2xl border border-slate-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Award className="h-4 w-4" /> Instructor Details
                  </h3>
                  <Badge className="bg-primary/10 text-primary border-primary/20">Course Leader</Badge>
                </div>
                <div className="flex flex-wrap items-center gap-8">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-2 border-white shadow-md">
                      <AvatarImage src={selectedInstructor.avatar_url || ''} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {selectedInstructor.full_name?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-0.5" title="Click to view full profile">
                      <p className="text-lg font-bold text-slate-900">{selectedInstructor.full_name}</p>
                      <p className="text-sm text-slate-500 flex items-center gap-1.5 font-medium">
                        <Mail className="h-3.5 w-3.5" /> {selectedInstructor.email}
                      </p>
                    </div>
                  </div>
                  
                  <div className="h-10 w-px bg-slate-200 hidden md:block" />
                  
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mobile Number</p>
                    <p className="text-sm font-semibold text-slate-700">{selectedInstructor.mobile_number || 'Not provided'}</p>
                  </div>

                  <div className="h-10 w-px bg-slate-200 hidden md:block" />

                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Joined Date</p>
                    <p className="text-sm font-semibold text-slate-700">
                      {selectedInstructor.created_at ? new Date(selectedInstructor.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!selectedInstructor && selectedCourse?.instructor_id && (
               <div className="p-4 rounded-xl border border-dashed border-slate-200 flex items-center justify-center bg-slate-50/30">
                  <p className="text-sm text-slate-500">Loading instructor profile...</p>
               </div>
            )}

            {/* Students List Section */}
            <div>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Users className="h-4 w-4" /> Enrolled Students ({enrolledStudents.length})
              </h3>
              
              {loadingStudents ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 w-full bg-slate-50 animate-pulse rounded-xl" />
                  ))}
                </div>
              ) : enrolledStudents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 bg-slate-50/30 rounded-2xl border border-dashed border-slate-200">
                  <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                    <Users className="h-8 w-8 text-slate-300" />
                  </div>
                  <p className="text-slate-500 font-medium font-outfit">No students enrolled yet</p>
                </div>
              ) : (
                <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2">
                  {enrolledStudents.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-white hover:border-primary/20 hover:shadow-md transition-all group">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 ring-2 ring-white shadow-sm border border-slate-100">
                          <AvatarImage src={student.avatar_url || ''} />
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {student.full_name?.[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="leading-tight">
                          <p className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">{student.full_name}</p>
                          <p className="text-[11px] text-slate-500 font-medium">{student.email}</p>
                          <p className="text-[10px] font-bold text-primary mt-1">Mobile: {student.mobile_number}</p>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1.5">
                        <Badge variant="outline" className="text-[10px] py-0 h-5 border-slate-200 bg-slate-50/50">
                          {(student.role as string)?.toUpperCase()}
                        </Badge>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full" style={{ width: `${student.progress}%` }} />
                          </div>
                          <span className="text-[10px] font-bold text-slate-600">{student.progress}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter className="pt-6 border-t">
            <Button className="rounded-xl w-full" onClick={() => setShowStudentsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Instructor Profile Dialog */}
      <Dialog open={showInstructorDialog} onOpenChange={setShowInstructorDialog}>
        <DialogContent className="max-w-md bg-white/95 backdrop-blur-xl border-slate-200/60 shadow-2xl rounded-2xl">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="flex items-center gap-3 text-xl font-bold text-slate-900">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Award className="h-5 w-5 text-primary" />
              </div>
              Instructor Profile
            </DialogTitle>
          </DialogHeader>
          
          {selectedInstructor && (
            <div className="space-y-6 pt-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                  <AvatarImage src={selectedInstructor.avatar_url || ''} />
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                    {selectedInstructor.full_name?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{selectedInstructor.full_name}</h3>
                  <Badge className="mt-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                    Lead Instructor
                  </Badge>
                </div>
              </div>

              <div className="grid gap-3">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email Address</p>
                  <p className="text-sm font-medium text-slate-900">{selectedInstructor.email}</p>
                </div>
                
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mobile Number</p>
                  <p className="text-sm font-medium text-slate-900">{selectedInstructor.mobile_number || 'Not provided'}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Platform Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={selectedInstructor.approval_status === 'approved' ? 'secondary' : 'outline'} className={selectedInstructor.approval_status === 'approved' ? 'bg-green-100 text-green-700 border-green-200' : ''}>
                      {selectedInstructor.approval_status?.toUpperCase() || 'PENDING'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="pt-6 border-t mt-4">
            <Button className="w-full rounded-xl" onClick={() => setShowInstructorDialog(false)}>
              Close Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
