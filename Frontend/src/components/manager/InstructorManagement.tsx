import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Eye,
} from "lucide-react";
import { fetchWithAuth } from "@/lib/api";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
  role: string;
  created_at?: string;
}

interface Course {
  id: string;
  title: string;
  instructor_id: string | null;
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

  const loadData = async () => {
    setLoading(true);
    try {
      const [instructorsData, coursesData] = (await Promise.all([
        fetchWithAuth('/admin/instructors'),
        fetchWithAuth('/data/courses?select=id,title,instructor_id')
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

  const handleOpenProfileModal = (instructor: Instructor) => {
    setSelectedInstructor(instructor);
    setProfileModalOpen(true);
  };

  const handleOpenManageAssignments = (instructor: Instructor) => {
    setSelectedInstructor(instructor);
    setManageAssignmentsOpen(true);
  };

  const handleAssignCourse = async () => {
    if (!selectedInstructor || !selectedCourseId) return;

    setAssigning(true);
    try {
      await fetchWithAuth(`/data/courses/${selectedCourseId}`, {
        method: 'PUT',
        body: JSON.stringify({
          instructor_id: selectedInstructor.user_id
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
    // By default, only show courses that are NOT assigned
    return !course.instructor_id;
  });

  const availableCourses = filteredCoursesDropdown.sort((a, b) => {
    // Sort unassigned first
    if (!a.instructor_id && b.instructor_id) return -1;
    if (a.instructor_id && !b.instructor_id) return 1;
    return a.title.localeCompare(b.title);
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        <div className="grid gap-4">
          {filteredInstructors.map((instructor) => {
            // Find courses assigned to this instructor
            const assignedCourses = courses.filter(c => c.instructor_id === instructor.user_id);

            return (
              <Card key={instructor.user_id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        {instructor.full_name ? (
                          <span className="text-lg font-bold text-primary">
                            {instructor.full_name.charAt(0).toUpperCase()}
                          </span>
                        ) : (
                          <User className="h-6 w-6 text-primary" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-foreground">
                          {instructor.full_name || 'Unknown'}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-3.5 w-3.5" />
                          <span>{instructor.email || 'No email'}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            <User className="h-3 w-3 mr-1" />
                            Instructor
                          </Badge>
                          {assignedCourses.length > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              <BookOpen className="h-3 w-3 mr-1" />
                              {assignedCourses.length} Courses Assigned
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 self-end md:self-auto">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                           <DropdownMenuItem onClick={() => handleOpenProfileModal(instructor)}>
                              <Eye className="h-4 w-4 mr-2" /> View Profile
                           </DropdownMenuItem>
                           <DropdownMenuItem onClick={() => handleOpenAssignModal(instructor)}>
                              <Plus className="h-4 w-4 mr-2" /> Assign New Course
                           </DropdownMenuItem>
                           {assignedCourses.length > 0 && (
                             <DropdownMenuItem onClick={() => handleOpenManageAssignments(instructor)}>
                                <BookOpen className="h-4 w-4 mr-2" /> Manage Assignments
                             </DropdownMenuItem>
                           )}
                           <DropdownMenuItem 
                              className="text-destructive focus:text-destructive" 
                              onClick={() => handleDeleteInstructor(instructor.user_id, instructor.full_name)}
                              disabled={processingId === instructor.user_id}
                           >
                              {processingId === instructor.user_id ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4 mr-2" />
                              )}
                              Delete Permanently
                           </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
            <div className="space-y-6 pt-6">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-full border-4 border-white shadow-lg bg-primary/10 flex items-center justify-center overflow-hidden">
                    <span className="text-3xl font-bold text-primary">
                        {selectedInstructor.full_name?.[0]?.toUpperCase()}
                    </span>
                </div>
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
                  <p className="text-sm font-medium text-slate-900">{selectedInstructor.mobile_number || selectedInstructor.phone || 'N/A'}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Account Type</p>
                  <p className="text-sm font-medium text-slate-900 capitalize">{selectedInstructor.role}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Member Since</p>
                  <p className="text-sm font-medium text-slate-900">
                    {selectedInstructor.created_at ? new Date(selectedInstructor.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="pt-6 border-t">
            <Button className="rounded-xl w-full" onClick={() => setProfileModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
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
             {courses.filter(c => c.instructor_id === selectedInstructor?.user_id).length === 0 ? (
                 <p className="text-center text-muted-foreground py-8">No courses assigned.</p>
             ) : (
                courses.filter(c => c.instructor_id === selectedInstructor?.user_id).map(course => (
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
                      const isAssignedToThis = course.instructor_id === selectedInstructor?.user_id;
                      const isUnassigned = !course.instructor_id;
                      
                      // Find current instructor name if assigned
                      let assignedToName = "";
                      if (!isUnassigned && !isAssignedToThis) {
                        const currentInstructor = instructors.find(i => i.user_id === course.instructor_id);
                        assignedToName = currentInstructor?.full_name || "Unknown";
                      }

                      return (
                        <SelectItem 
                          key={course.id} 
                          value={String(course.id)}
                          disabled={isAssignedToThis}
                        >
                          <div className="flex items-center justify-between w-full gap-2 min-w-0">
                            <span className="truncate max-w-[200px] font-medium">{course.title}</span>
                            <div className="shrink-0 flex items-center">
                              {isAssignedToThis && <Badge variant="secondary" className="text-[10px]">Current</Badge>}
                              {!isUnassigned && !isAssignedToThis && (
                                <Badge variant="outline" className="text-[10px] text-muted-foreground">
                                  {assignedToName}
                                </Badge>
                              )}
                              {isUnassigned && <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 text-[10px]">Unassigned</Badge>}
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
