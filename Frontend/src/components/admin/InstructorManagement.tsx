import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, 
  Search, 
  RefreshCw,
  Mail,
  User,
  BookOpen,
  MoreVertical,
  Plus,
  Trash2,
  Loader2,
  Award,
  Shield,
  Eye,
  ArrowRight,
  Phone,
  Lock as LockIcon,
  Unlock as UnlockIcon,
} from "lucide-react";
import { fetchWithAuth } from "@/lib/api";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface Instructor {
  user_id: string;
  full_name: string;
  email: string;
  mobile_number?: string;
  phone?: string;
  avatar_url?: string;
  status: 'active' | 'suspended';
  role: string;
  created_at?: string;
}

interface Course {
  id: string;
  title: string;
  instructor_ids?: string[];
  instructors?: { id: string; full_name: string; avatar_url: string }[];
}

interface MockPaper {
  id: string;
  title: string;
}

interface Batch {
  id: string;
  batch_name: string;
  batch_type: string;
  course_id: string;
  instructor_id?: string;
  studentCount?: number;
  start_time?: string;
  end_time?: string;
}

interface StudentBatch {
  id: string;
  student_id: string;
  batch_id: string;
  course_id: string;
}

interface Profile {
  user_id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  role?: string;
}

export function InstructorManagement() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  // Assignment Modal State
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [manageAssignmentsOpen, setManageAssignmentsOpen] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [assigning, setAssigning] = useState(false);
  const [showAllCourses, setShowAllCourses] = useState(false);
  const [batchTypeFilter, setBatchTypeFilter] = useState("all");

  const [instructorBatches, setInstructorBatches] = useState<Batch[]>([]);
  const [batchStudents, setBatchStudents] = useState<Record<string, Profile[]>>({});
  const [loadingMockData, setLoadingMockData] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [instructorsData, coursesData] = (await Promise.all([
        fetchWithAuth('/admin/instructors'),
        fetchWithAuth('/admin/courses-with-instructors')
      ])) as [Instructor[], Course[]];
      setInstructors(instructorsData || []);
      setCourses(coursesData || []);
    } catch (err) {
      console.error('Failed to load data:', err);
      toast.error('Failed to load instructors or courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAssignModal = (instructor: Instructor) => {
    setSelectedInstructor(instructor);
    setSelectedCourseId("");
    setShowAllCourses(false);
    setAssignModalOpen(true);
  };

  const handleOpenProfileModal = async (instructor: Instructor) => {
    setSelectedInstructor(instructor);
    setProfileModalOpen(true);
    setLoadingMockData(true);
    setInstructorBatches([]);
    setBatchStudents({});
    
    try {
      const assignedCourseIds = courses
        .filter(c => c.instructor_ids?.includes(instructor.user_id))
        .map(c => c.id);
      
      if (assignedCourseIds.length > 0) {
        const batches = (await fetchWithAuth(`/data/batches?course_id=in.(${assignedCourseIds.join(',')})`)) as Batch[];
        
        if (batches && batches.length > 0) {
            const batchIds = batches.map(b => b.id);
            const studentBatches = (await fetchWithAuth(`/data/student_batches?batch_id=in.(${batchIds.join(',')})`)) as StudentBatch[];
            
            // Fetch real student profiles
            const studentIds = [...new Set(studentBatches.map(sb => sb.student_id))];
            if (studentIds.length > 0) {
              const profiles = (await fetchWithAuth(`/data/profiles?user_id=in.(${studentIds.join(',')})`)) as Profile[];
              const studentsByBatch: Record<string, Profile[]> = {};
              
              batches.forEach(b => {
                const bStudentIds = studentBatches.filter(sb => sb.batch_id === b.id).map(sb => sb.student_id);
                studentsByBatch[b.id] = profiles.filter(p => bStudentIds.includes(p.user_id));
              });
              setBatchStudents(studentsByBatch);
            }

            const batchesWithCounts = batches.map(b => ({
                ...b,
                studentCount: studentBatches.filter(sb => sb.batch_id === b.id).length
            }));
            
            setInstructorBatches(batchesWithCounts);
        }
      }
    } catch (err) {
      console.error('Failed to load profile batch data:', err);
    } finally {
      setLoadingMockData(false);
    }
  };

  const handleOpenManageAssignments = (instructor: Instructor) => {
    setSelectedInstructor(instructor);
    setManageAssignmentsOpen(true);
  };

  const handleAssignCourse = async () => {
    if (!selectedInstructor || !selectedCourseId) return;

    setAssigning(true);
    try {
      await fetchWithAuth(`/admin/assign-course`, {
        method: 'POST', // Use our new dedicated endpoint
        body: JSON.stringify({
          courseId: selectedCourseId,
          instructorId: selectedInstructor.user_id
        })
      });

      toast.success(`Course assigned to ${selectedInstructor.full_name}`);
      setAssignModalOpen(false);
      loadData();
    } catch (err) {
      console.error('Failed to assign course:', err);
      toast.error('Failed to assign course');
    } finally {
      setAssigning(false);
    }
  };

  const handleUnassignCourse = async (courseId: string, courseTitle: string) => {
    if (!confirm(`Are you sure you want to unassign "${courseTitle}" from this instructor?`)) return;

    setAssigning(true);
    try {
      await fetchWithAuth(`/data/courses/${courseId}`, {
        method: 'PUT',
        body: JSON.stringify({
          instructor_id: null
        })
      });

      toast.success(`Course "${courseTitle}" unassigned`);
      loadData();
    } catch (err) {
      console.error('Failed to unassign course:', err);
      toast.error('Failed to unassign course');
    } finally {
      setAssigning(false);
    }
  };

  const handleDeleteInstructor = async (userId: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete instructor "${name}"? This will remove their access and unassign their courses.`)) {
        return;
    }

    setProcessingId(userId);
    try {
        await fetchWithAuth(`/admin/delete-user/${userId}`, {
            method: 'DELETE'
        });
        toast.success(`Instructor ${name} deleted successfully`);
        
        // Update list locally
        setInstructors(prev => prev.filter(i => i.user_id !== userId));
        
        // Also refresh to sync any course changes
        loadData();
    } catch (err) {
        console.error('Failed to delete instructor:', err);
        toast.error('Failed to delete instructor');
    } finally {
        setProcessingId(null);
    }
  };

  const filteredInstructors = instructors.filter(i => 
    i.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter courses for the dropdown
  const filteredCoursesDropdown = courses.filter(course => {
    if (showAllCourses) return true;
    // By default, only show courses where this instructor is NOT already assigned
    return !course.instructor_ids?.includes(selectedInstructor?.user_id || "");
  });

  const availableCourses = filteredCoursesDropdown.sort((a, b) => {
    const aCount = a.instructor_ids?.length || 0;
    const bCount = b.instructor_ids?.length || 0;
    return aCount - bCount || a.title.localeCompare(b.title);
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{instructors.length}</p>
                <p className="text-xs text-muted-foreground">Total Instructors</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {instructors.filter(i => i.user_id).length}
                </p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {instructors.filter(i => i.email)?.length}
                </p>
                <p className="text-xs text-muted-foreground">With Email</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search instructors by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10"
          />
        </div>
        <Button variant="outline" onClick={loadData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Instructor List */}
      {filteredInstructors.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No instructors found</p>
            {searchQuery && (
              <p className="text-sm mt-1">Try adjusting your search</p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredInstructors.map((instructor) => {
            const assignedCourses = courses.filter(c => 
              c.instructor_ids?.includes(instructor.user_id)
            );
            const isSuspended = instructor.status === 'suspended';
            return (
              <div
                key={instructor.user_id}
                className={`group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-3xl border border-slate-200 bg-white hover:border-primary/30 hover:shadow-md transition-all relative overflow-hidden gap-4 ${
                  isSuspended ? 'opacity-80 grayscale-[0.3]' : ''
                }`}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="relative shrink-0">
                    <Avatar className={`h-12 w-12 sm:h-14 sm:w-14 border-2 border-slate-50 shadow-sm rounded-2xl overflow-hidden`}>
                      <AvatarImage src={instructor.avatar_url} className="object-cover" />
                      <AvatarFallback className="bg-primary/5 text-primary font-bold text-lg">
                        {instructor.full_name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white shadow-sm ${
                      isSuspended ? 'bg-rose-500' : 'bg-emerald-500'
                    }`} />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="text-sm sm:text-base font-black text-slate-900 leading-tight truncate">{instructor.full_name}</p>
                      <Badge 
                          variant="outline" 
                          className={`text-[9px] h-4 px-1.5 rounded-md uppercase font-black tracking-tighter border-none shadow-none bg-blue-50 text-blue-600 shrink-0`}
                      >
                          INSTRUCTOR
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate leading-none mb-1.5">{instructor.email}</p>
                    
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                       <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-primary/5 border border-primary/10 shadow-sm shadow-primary/5">
                          <BookOpen className="h-3 w-3 text-primary" />
                          <span className="text-[10px] font-black text-primary uppercase tracking-tight">Teaching {assignedCourses.length}</span>
                       </div>
                       <div className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-slate-300" />
                          <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">
                             {instructor.created_at ? new Date(instructor.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'Joined ---'}
                          </span>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 sm:ml-2 justify-end pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-50">
                  <Button 
                    variant="secondary" 
                    size="sm"
                    className="h-9 truncate px-3 rounded-xl bg-slate-50 hover:bg-primary hover:text-white text-primary transition-all group/btn font-bold text-xs flex-1 sm:flex-none"
                    onClick={() => handleOpenProfileModal(instructor)}
                  >
                    Management
                    <ArrowRight className="h-3 w-3 ml-2 transition-transform group-hover/btn:translate-x-1 shrink-0" />
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-slate-100 text-slate-400 border border-slate-100/50">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 p-1 rounded-xl shadow-xl border-slate-200/60">
                       <DropdownMenuLabel className="px-2 py-1.5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Instructor Node</DropdownMenuLabel>
                       <DropdownMenuSeparator className="bg-slate-100" />
                       
                       <DropdownMenuItem onClick={() => handleOpenAssignModal(instructor)} className="rounded-lg">
                         <Plus className="h-4 w-4 mr-2" /> Assign New Course
                       </DropdownMenuItem>

                       <DropdownMenuItem onClick={() => handleOpenManageAssignments(instructor)} className="rounded-lg">
                         <Award className="h-4 w-4 mr-2" /> Global Assignments
                       </DropdownMenuItem>
                       
                       <DropdownMenuSeparator className="bg-slate-100" />
                       
                       {isSuspended ? (
                         <DropdownMenuItem 
                           className="text-emerald-600 focus:text-emerald-600 font-bold rounded-lg"
                           onClick={async () => {
                             try {
                               await fetchWithAuth('/admin/update-user-status', {
                                 method: 'PUT',
                                 body: JSON.stringify({ userId: instructor.user_id, status: 'approved' })
                               });
                               toast.success('Instructor node active');
                               loadData();
                             } catch (err) {
                               toast.error('Failed to sync state');
                             }
                           }}
                         >
                           <UnlockIcon className="h-4 w-4 mr-2" /> Unsuspend Node
                         </DropdownMenuItem>
                       ) : (
                         <DropdownMenuItem 
                           className="text-amber-600 focus:text-amber-600 font-bold rounded-lg"
                           onClick={async () => {
                             if (!confirm(`Suspend ${instructor.full_name}?`)) return;
                             try {
                               await fetchWithAuth('/admin/update-user-status', {
                                 method: 'PUT',
                                 body: JSON.stringify({ userId: instructor.user_id, status: 'suspended', suspensionDays: '30' })
                               });
                               toast.success('Instructor suspended');
                               loadData();
                             } catch (err) {
                               toast.error('Sync failed');
                             }
                           }}
                         >
                           <LockIcon className="h-4 w-4 mr-2" /> Suspend Access
                         </DropdownMenuItem>
                       )}
                       
                       <DropdownMenuItem 
                          className="text-rose-600 focus:text-rose-600 font-bold rounded-lg" 
                          onClick={() => handleDeleteInstructor(instructor.user_id, instructor.full_name)}
                       >
                          <Trash2 className="h-4 w-4 mr-2" /> Purge Entity
                       </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Profile Modal */}
      <Dialog open={profileModalOpen} onOpenChange={setProfileModalOpen}>
        <DialogContent className="max-w-md bg-white/95 backdrop-blur-xl border-slate-200/60 shadow-2xl rounded-2xl">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="flex items-center gap-3 text-xl font-bold text-slate-900">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Award className="h-5 w-5 text-primary" />
              </div>
              Instructor Profile
            </DialogTitle>
            <DialogDescription className="sr-only">Detailed profile information for the selected instructor.</DialogDescription>
          </DialogHeader>
          
          {selectedInstructor && (
            <>
            <div className="space-y-6 pt-6">
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                <Avatar className="h-20 w-20 rounded-2xl border-4 border-white shadow-lg shrink-0">
                    <AvatarImage src={selectedInstructor.avatar_url} className="object-cover" />
                    <AvatarFallback className="text-3xl font-bold text-primary bg-primary/10">
                        {selectedInstructor.full_name?.[0]?.toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div className="text-center sm:text-left">
                  <h3 className="text-xl font-bold text-slate-900">{selectedInstructor.full_name}</h3>
                  <div className="flex items-center gap-2 mt-1 justify-center sm:justify-start">
                    <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                      Primary Instructor
                    </Badge>
                    <Badge variant={selectedInstructor.status === 'suspended' ? 'destructive' : 'secondary'} className="capitalize">
                      {selectedInstructor.status || 'Active'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid gap-3">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email Address</p>
                  <p className="text-sm font-medium text-slate-900">{selectedInstructor.email}</p>
                </div>
                
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mobile Number</p>
                  <p className="text-sm font-medium text-slate-900">{selectedInstructor.mobile_number || selectedInstructor.phone || 'N/A'}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Account Type</p>
                  <p className="text-sm font-medium text-slate-900 capitalize">{selectedInstructor.role}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</p>
                  <Badge 
                    variant={selectedInstructor.status === 'suspended' ? 'destructive' : 'default'}
                    className="capitalize"
                  >
                    {selectedInstructor.status || 'active'}
                  </Badge>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Member Since</p>
                  <p className="text-sm font-medium text-slate-900">
                    {selectedInstructor.created_at ? new Date(selectedInstructor.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>

              </div>
            </div>

            <DialogFooter className="pt-6 border-t flex gap-2">
              <Button variant="outline" className="rounded-xl flex-1" onClick={() => setProfileModalOpen(false)}>
                Close
              </Button>
              {selectedInstructor.status === 'suspended' ? (
                <Button 
                  className="rounded-xl flex-1 bg-emerald-600 hover:bg-emerald-700" 
                  onClick={async () => {
                    try {
                      await fetchWithAuth('/admin/update-user-status', {
                        method: 'PUT',
                        body: JSON.stringify({ userId: selectedInstructor.user_id, status: 'approved' })
                      });
                      toast.success('Access restored');
                      setProfileModalOpen(false);
                      loadData();
                    } catch (err) {
                      toast.error('Failed to restore');
                    }
                  }}
                >
                  Restore Access
                </Button>
              ) : (
                <Button 
                  variant="destructive"
                  className="rounded-xl flex-1" 
                  onClick={async () => {
                    if (!confirm(`Suspend ${selectedInstructor.full_name}?`)) return;
                    try {
                      await fetchWithAuth('/admin/update-user-status', {
                        method: 'PUT',
                        body: JSON.stringify({ userId: selectedInstructor.user_id, status: 'suspended', suspensionDays: '30' })
                      });
                      toast.success('Instructor suspended');
                      setProfileModalOpen(false);
                      loadData();
                    } catch (err) {
                      toast.error('Failed to suspend');
                    }
                  }}
                >
                  Suspend Access
                </Button>
              )}
            </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Manage Assignments Modal */}
      <Dialog open={manageAssignmentsOpen} onOpenChange={setManageAssignmentsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Managed Assigned Courses</DialogTitle>
            <DialogDescription>
                Courses currently assigned to <b>{selectedInstructor?.full_name}</b>. You can unassign them from here.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-3 max-h-[400px] overflow-y-auto">
             {courses.filter(c => c.instructor_ids?.includes(selectedInstructor?.user_id || "")).length === 0 ? (
                 <p className="text-center text-muted-foreground py-8">No courses assigned.</p>
             ) : (
                courses.filter(c => c.instructor_ids?.includes(selectedInstructor?.user_id || "")).map(course => (
                    <div key={course.id} className="flex items-center justify-between p-3 rounded-lg border bg-slate-50/50">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
                                <BookOpen className="h-4 w-4 text-primary" />
                            </div>
                            <span className="font-medium text-sm">{course.title}</span>
                        </div>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => handleUnassignCourse(course.id, course.title)}
                        >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Unassign
                        </Button>
                    </div>
                ))
             )}
          </div>

          <DialogFooter>
            <Button variant="outline" className="w-full" onClick={() => setManageAssignmentsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Course Modal */}
      <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Course to Instructor</DialogTitle>
            <DialogDescription>
              Select a course to assign to <b>{selectedInstructor?.full_name}</b>.
              Existing instructor for the course will be replaced.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="show-all" 
                checked={showAllCourses} 
                onCheckedChange={(checked) => setShowAllCourses(checked as boolean)} 
              />
              <Label htmlFor="show-all" className="text-sm cursor-pointer">
                Include already assigned courses (Re-assign)
              </Label>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Select Course</label>
              <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a course..." />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {availableCourses.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      No courses available.
                    </div>
                  ) : (
                        availableCourses.map((course) => {
                          const isAssignedToThis = course.instructor_ids?.includes(selectedInstructor?.user_id || "");
                          const count = course.instructor_ids?.length || 0;
                      
                      // Find current instructor name if assigned
                      let assignedToName = "";
                      if (count > 0 && !isAssignedToThis) {
                        const firstInstructorId = course.instructor_ids?.[0];
                        const currentInstructor = instructors.find(i => i.user_id === firstInstructorId);
                        assignedToName = currentInstructor?.full_name || "Assigned";
                      }

                          return (
                            <SelectItem 
                              key={course.id} 
                              value={String(course.id)}
                              disabled={isAssignedToThis}
                            >
                              <div className="flex items-center justify-between w-full gap-2 min-w-0">
                                <span className="truncate max-w-[200px] font-medium">{course.title}</span>
                                <div className="shrink-0 flex items-center gap-1">
                                  {isAssignedToThis && <Badge variant="secondary" className="text-[10px]">Current</Badge>}
                                  {count > 0 && !isAssignedToThis && (
                                    <Badge variant="outline" className="text-[10px] text-muted-foreground">
                                      {count} Instructor{count > 1 ? 's' : ''}
                                    </Badge>
                                  )}
                                  {count === 0 && <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 text-[10px]">Unassigned</Badge>}
                                </div>
                              </div>
                            </SelectItem>
                          );
                    })
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAssignCourse} disabled={!selectedCourseId || assigning}>
              {assigning ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Assigning...
                </>
              ) : (
                'Assign Course'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

