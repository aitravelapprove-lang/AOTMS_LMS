import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, 
  BookOpen, 
  Search, 
  RefreshCw,
  UserPlus,
  CheckCircle,
  AlertCircle,
  Loader2,
  Fingerprint,
  User,
  Mail
} from "lucide-react";
import { fetchWithAuth } from "@/lib/api";
import { toast } from "sonner";

interface Course {
  id: string;
  title: string;
  category: string;
  status: string;
  instructor_id: string | null;
  instructor_name: string;
  instructor_email: string;
}

interface Instructor {
  user_id: string;
  full_name: string;
  email: string;
}

interface LookupResult {
  user_id: string;
  full_name: string;
  email: string;
  role: string;
}

export function CourseAssignment() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  
  // UUID lookup state
  const [uuidInput, setUuidInput] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState<LookupResult | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [coursesRes, instructorsRes] = await Promise.all([
        fetchWithAuth('/admin/courses-with-instructors'),
        fetchWithAuth('/admin/instructors')
      ]);
      setCourses((coursesRes as Course[]) || []);
      setInstructors((instructorsRes as Instructor[]) || []);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLookup = async () => {
    if (!uuidInput.trim()) {
      toast.error('Please enter a UUID');
      return;
    }
    
    setLookupLoading(true);
    try {
      const result = await fetchWithAuth(`/admin/lookup-user/${uuidInput.trim()}`);
      if (result) {
        // Allow any user to be assigned as instructor - admin decision
        const lookupData = result as LookupResult;
        setLookupResult(lookupData);
        toast.success(`User found: ${lookupData.full_name || lookupData.email}`);
      } else {
        setLookupResult(null);
        toast.error('No user found with this UUID');
      }
    } catch (err) {
      setLookupResult(null);
      toast.error('Failed to lookup user');
    } finally {
      setLookupLoading(false);
    }
  };

  const handleAssignWithLookup = async () => {
    if (!selectedCourseId || !lookupResult) return;
    
    setAssigning(String(selectedCourseId));
    try {
      console.log('[AssignCourse] Sending request:', { courseId: selectedCourseId, instructorId: lookupResult.user_id });
      const result = await fetchWithAuth('/admin/assign-course', {
        method: 'POST',
        body: JSON.stringify({ courseId: selectedCourseId, instructorId: lookupResult.user_id })
      });
      console.log('[AssignCourse] Result:', result);
      toast.success(`Course assigned to ${lookupResult.full_name || lookupResult.email}!`);
      setLookupResult(null);
      setUuidInput("");
      setSelectedCourseId(null);
      loadData();
    } catch (err) {
      console.error('[AssignCourse] Error:', err);
      toast.error('Failed to assign course');
    } finally {
      setAssigning(null);
    }
  };

  const handleAssign = async (courseId: string, instructorId: string) => {
    console.log('[AssignCourse] Direct assign:', { courseId, instructorId });
    setAssigning(courseId);
    try {
      await fetchWithAuth('/admin/assign-course', {
        method: 'POST',
        body: JSON.stringify({ courseId, instructorId })
      });
      toast.success('Course assigned successfully!');
      loadData();
    } catch (err) {
      toast.error('Failed to assign course');
    } finally {
      setAssigning(null);
    }
  };

  const filteredCourses = courses.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         c.instructor_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "assigned" && c.instructor_id) ||
                         (filterStatus === "unassigned" && !c.instructor_id);
    return matchesSearch && matchesStatus;
  });

  const assignedCount = courses.filter(c => c.instructor_id).length;
  const unassignedCount = courses.filter(c => !c.instructor_id).length;

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* UUID Lookup Section */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Fingerprint className="h-5 w-5 text-primary" />
            Assign by UUID
          </CardTitle>
          <CardDescription>
            Enter instructor UUID to find and assign course
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Input
                placeholder="Enter instructor UUID..."
                value={uuidInput}
                onChange={(e) => setUuidInput(e.target.value)}
                className="h-11 font-mono text-xs sm:text-sm rounded-xl bg-white/50 border-primary/20 focus:ring-primary/20"
              />
            </div>
            <Button 
              onClick={handleLookup} 
              disabled={lookupLoading}
              className="h-11 rounded-xl px-8 shadow-lg shadow-primary/10"
            >
              {lookupLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Lookup User
            </Button>
          </div>

          {/* Lookup Result */}
          {lookupResult && (
            <div className="mt-4 p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center border border-emerald-200 shadow-sm shrink-0">
                    <User className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-black text-emerald-900 truncate">
                      {lookupResult.full_name || 'Unknown'}
                    </p>
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-tighter truncate">
                      <Mail className="h-3.5 w-3.5" />
                      {lookupResult.email}
                    </div>
                  </div>
                </div>
                <div className="w-full sm:w-auto flex items-center gap-2">
                  {selectedCourseId ? (
                    <Button 
                      onClick={handleAssignWithLookup}
                      disabled={assigning !== null}
                      className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11 px-6 shadow-lg shadow-emerald-600/20"
                    >
                      {assigning ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Confirm & Assign
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2 bg-amber-100/50 p-2 px-3 rounded-lg border border-amber-200">
                       <AlertCircle className="h-4 w-4 text-amber-600" />
                       <p className="text-[10px] font-black uppercase text-amber-700 tracking-tighter leading-none">
                         Select a course below to assign
                       </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{courses.length}</p>
                <p className="text-xs text-muted-foreground">Total Courses</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{assignedCount}</p>
                <p className="text-xs text-muted-foreground">Assigned</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">{unassignedCount}</p>
                <p className="text-xs text-muted-foreground">Unassigned</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses or instructors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 rounded-xl border-slate-200"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="flex-1 sm:w-[180px] h-11 rounded-xl bg-white border-slate-200">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200">
              <SelectItem value="all">All Courses</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={loadData} className="h-11 w-11 shrink-0 rounded-xl bg-white border-slate-200">
            <RefreshCw className="h-4 w-4 text-slate-500" />
          </Button>
        </div>
      </div>

      {/* Course List */}
      <div className="grid gap-4">
        {filteredCourses.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No courses found</p>
            </CardContent>
          </Card>
        ) : (
          filteredCourses.map((course) => (
            <Card 
              key={course.id} 
              className={`hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer rounded-2xl overflow-hidden group ${
                selectedCourseId === course.id ? 'ring-2 ring-primary border-transparent translate-x-1' : 'border-slate-200/60'
              }`}
              onClick={() => setSelectedCourseId(course.id)}
            >
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row items-stretch">
                  {/* Category Side Strip */}
                  <div className={`w-1 sm:w-2 shrink-0 ${
                    course.status === 'published' ? 'bg-emerald-500' :
                    course.status === 'draft' ? 'bg-slate-300' :
                    'bg-amber-500'
                  }`} />

                  <div className="flex-1 p-5 lg:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-primary transition-colors truncate">
                          {course.title}
                        </h3>
                        <Badge variant="outline" className="text-[10px] uppercase font-black tracking-tight border-slate-200 text-slate-500 rounded-md h-5">
                          {course.category}
                        </Badge>
                        <Badge className={`text-[10px] uppercase font-black tracking-tighter rounded-md h-5 shadow-sm ${
                          course.status === 'published' ? 'bg-emerald-500' :
                          course.status === 'draft' ? 'bg-slate-500' :
                          'bg-amber-500'
                        }`}>
                          {course.status}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        {course.instructor_id ? (
                          <div className="flex items-center gap-2.5 bg-slate-50 p-1.5 pr-3 rounded-full border border-slate-100 max-w-full overflow-hidden">
                            <div className="h-7 w-7 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-100 shrink-0">
                               <Users className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <div className="overflow-hidden">
                               <p className="text-xs font-bold text-slate-700 truncate leading-none mb-0.5">
                                 {course.instructor_name}
                               </p>
                               <p className="text-[10px] font-medium text-slate-400 truncate leading-none">
                                 {course.instructor_email}
                               </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-2 px-3 rounded-xl border border-amber-100 w-fit">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <span className="text-xs font-black uppercase tracking-tighter">Needs Assignment</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="w-full lg:w-[240px] flex items-center gap-2 group/select bg-white p-1 rounded-xl border border-slate-200 focus-within:border-primary transition-colors shadow-sm">
                        <Select
                          value={course.instructor_id || "unassigned"}
                          onValueChange={(value) => {
                            handleAssign(course.id, value === "unassigned" ? "" : value);
                          }}
                          disabled={assigning === String(course.id)}
                        >
                          <SelectTrigger className="h-10 border-none shadow-none focus:ring-0 focus:ring-offset-0 bg-transparent text-xs font-bold" onClick={(e) => e.stopPropagation()}>
                            {assigning === String(course.id) ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <SelectValue placeholder="Assign Instructor" />
                            )}
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-slate-200">
                            <SelectItem value="unassigned" className="text-slate-400">Not Assigned</SelectItem>
                            {instructors.map((inst) => (
                              <SelectItem key={inst.user_id} value={inst.user_id} className="text-xs">
                                <div className="flex flex-col">
                                   <span className="font-bold">{inst.full_name || 'Unknown'}</span>
                                   <span className="text-[10px] opacity-70 italic">{inst.email || 'No email'}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
