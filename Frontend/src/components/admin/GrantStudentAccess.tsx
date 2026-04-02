import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Users, 
  Search, 
  BookOpen, 
  UserPlus, 
  UserCheck, 
  CheckCircle, 
  XCircle, 
  Loader2,
  GraduationCap,
  Mail,
  Plus
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithAuth } from '@/lib/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Profile, CourseEnrollment } from '@/hooks/useAdminData';

interface Course {
  id: string;
  title: string;
  status: string;
}

interface GrantStudentAccessProps {
    profiles?: Profile[];
    enrollments?: CourseEnrollment[];
}

export function GrantStudentAccess({ profiles = [], enrollments = [] }: GrantStudentAccessProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [studentUuid, setStudentUuid] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Profile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch approved courses
  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ['approved-courses'],
    queryFn: async () => {
      // Fetch published, approved, or active courses for enrollment
      const data = await fetchWithAuth('/data/courses?status=in.(published,approved,active)&select=id,title,status');
      return data as Course[];
    }
  });

  // Filter profiles to show only students who haven't selected any course yet
  const filteredStudents = profiles.filter(profile => {
      const role = profile.role?.toLowerCase();
      const isAllowedRole = role === 'student'; // Strictly students only
      
      // Rule: Only show students who have NO enrollments at all
      const hasNoEnrollments = !enrollments.some(e => e.user_id === profile.id);
      
      const matchesSearch = (profile.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             profile.email?.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return isAllowedRole && hasNoEnrollments && matchesSearch;
  });

  // Get available courses for selected student (exclude those already enrolled)
  const availableCourses = courses.filter(course => {
      if (!selectedStudent) return true;
      return !enrollments.some(e => 
          e.user_id === selectedStudent.id && 
          e.course_id === course.id && 
          e.status === 'active'
      );
  });

  // Grant access mutation
  const grantAccess = useMutation({
    mutationFn: async () => {
      if (!selectedCourse || !selectedStudent) return;
      
      return fetchWithAuth('/data/course_enrollments', {
        method: 'POST',
        body: JSON.stringify({
          user_id: selectedStudent.id,
          course_id: selectedCourse.id,
          status: 'active',
          progress_percentage: 0
        })
      });
    },
    onSuccess: () => {
      toast({ title: 'Access Granted', description: `Student has been enrolled in ${selectedCourse?.title}` });
      setStudentUuid('');
      setSelectedStudent(null);
      setSelectedCourse(null);
      setIsOpen(false);
    },
    onError: (err: Error) => {
      toast({ title: 'Error', description: err.message || 'Failed to grant access', variant: 'destructive' });
    }
  });

  const handleCourseSelect = (courseId: string) => {
    const course = availableCourses.find(c => c.id === courseId);
    setSelectedCourse(course || null);
  };

  const handleStudentSelect = (student: Profile) => {
      setSelectedStudent(student);
      setStudentUuid(student.id);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Grant Student Access
            </CardTitle>
            <CardDescription>
              Select a student from the list and manually enroll them in a course.
            </CardDescription>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Enroll Student
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Enroll Student in Course
                </DialogTitle>
                <DialogDescription>
                  Search for a student and select a course to grant access.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                {/* Course Selection */}
                <div className="space-y-2">
                  <Label>Select Course</Label>
                  {coursesLoading ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" /> Loading courses...
                    </div>
                  ) : (
                    <select
                      className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-primary/20"
                      value={selectedCourse?.id || ''}
                      onChange={(e) => handleCourseSelect(e.target.value)}
                    >
                      <option value="">Select a course...</option>
                      {availableCourses.map(course => (
                        <option key={course.id} value={course.id}>
                          {course.title}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Student Search & Selection */}
                <div className="space-y-2">
                  <Label>Select Student</Label>
                  {!selectedStudent ? (
                      <div className="space-y-2">
                          <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                  placeholder="Search students by name or email..."
                                  value={searchQuery}
                                  onChange={(e) => setSearchQuery(e.target.value)}
                                  className="pl-9"
                              />
                          </div>
                          <div className="border rounded-md max-h-48 overflow-y-auto bg-slate-50">
                              {filteredStudents.length === 0 ? (
                                  <div className="p-4 text-center text-sm text-muted-foreground">
                                      {searchQuery ? "No students found" : "Type to search students"}
                                  </div>
                              ) : (
                                  filteredStudents.map(student => (
                                      <div 
                                          key={student.id} 
                                          className="flex items-center gap-3 p-3 hover:bg-slate-100 cursor-pointer transition-colors border-b last:border-0"
                                          onClick={() => handleStudentSelect(student)}
                                      >
                                          <Avatar className="h-8 w-8">
                                              <AvatarImage src={student.avatar_url || ''} />
                                              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                                  {student.full_name?.[0]?.toUpperCase() || 'S'}
                                              </AvatarFallback>
                                          </Avatar>
                                           <div className="overflow-hidden">
                                               <div className="flex items-center gap-2">
                                                   <p className="text-sm font-medium truncate">{student.full_name}</p>
                                                    <Badge 
                                                        variant="outline" 
                                                        className={`text-[8px] h-3 px-1 rounded-sm uppercase tracking-tighter ${
                                                            student.role === 'instructor' 
                                                            ? "border-amber-200 bg-amber-50 text-amber-700" 
                                                            : "border-blue-200 bg-blue-50 text-blue-700"
                                                        }`}
                                                    >
                                                        {student.role || 'student'}
                                                    </Badge>
                                               </div>
                                               <p className="text-xs text-muted-foreground truncate">{student.email}</p>
                                           </div>
                                      </div>
                                  ))
                              )}
                          </div>
                      </div>
                  ) : (
                      <div className="rounded-xl border bg-card p-4 relative group">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="absolute top-2 right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => setSelectedStudent(null)}
                        >
                            <XCircle className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={selectedStudent.avatar_url || ''} />
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {selectedStudent.full_name?.[0]?.toUpperCase() || 'S'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium">{selectedStudent.full_name}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {selectedStudent.email}
                            </p>
                            <Badge variant="outline" className="mt-1 text-[10px] h-5 px-1.5">{selectedStudent.role}</Badge>
                          </div>
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                      </div>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button
                  onClick={() => grantAccess.mutate()}
                  disabled={!selectedCourse || !selectedStudent || grantAccess.isPending}
                >
                  {grantAccess.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enrolling...</>
                  ) : (
                    <>Grant Access</>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      {/* List of Recently Granted Access or a general placeholder list can go here if needed, 
          but for now, the modal handles the action. We can show a simple instruction list. */}
      <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                 {filteredStudents.map(student => (
                     <div key={student.id} className="flex items-center justify-between p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                         <div className="flex items-center gap-3 overflow-hidden">
                             <Avatar className="h-9 w-9 border">
                                  <AvatarImage src={student.avatar_url} />
                                  <AvatarFallback>{student.full_name?.[0]}</AvatarFallback>
                             </Avatar>
                             <div className="grid gap-0.5 overflow-hidden">
                                 <div className="flex items-center gap-2">
                                     <p className="text-sm font-medium leading-none truncate">{student.full_name}</p>
                                     <Badge 
                                        variant="outline" 
                                        className={`text-[9px] h-4 px-1 rounded-sm uppercase tracking-tighter ${
                                            student.role === 'instructor' 
                                            ? "border-amber-200 bg-amber-50 text-amber-700" 
                                            : "border-blue-200 bg-blue-50 text-blue-700"
                                        }`}
                                    >
                                        {student.role || 'student'}
                                     </Badge>
                                 </div>
                                 <p className="text-xs text-muted-foreground truncate">{student.email}</p>
                             </div>
                         </div>
                         <Button 
                            variant="secondary" 
                            size="sm" 
                            className="ml-auto h-8 shadow-none"
                            onClick={() => {
                                setSelectedStudent(student);
                                setIsOpen(true);
                            }}
                         >
                            Enroll
                         </Button>
                     </div>
                 ))}
            </div>
            {filteredStudents.length === 0 && searchQuery && (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-xl">
                    <Search className="h-10 w-10 mx-auto mb-2 opacity-20" />
                    <p>No students match "{searchQuery}"</p>
                </div>
            )}
            {filteredStudents.length === 0 && (
                <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-3xl bg-slate-50/50">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <h3 className="font-bold text-slate-800 text-lg">No Students Awaiting Access</h3>
                    <p className="text-sm max-w-xs mx-auto mt-2">
                        Currently, all registered students have already selected a course or were manually enrolled. 
                        They will appear here once new students register.
                    </p>
                </div>
            )}
          </div>
      </CardContent>
    </Card>
  );
}
