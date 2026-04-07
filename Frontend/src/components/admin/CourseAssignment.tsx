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
      setCourses(coursesRes || []);
      setInstructors(instructorsRes || []);
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
        setLookupResult(result);
        toast.success(`User found: ${result.full_name || result.email}`);
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
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Input
                placeholder="Enter instructor UUID..."
                value={uuidInput}
                onChange={(e) => setUuidInput(e.target.value)}
                className="h-10 font-mono text-sm"
              />
            </div>
            <Button 
              onClick={handleLookup} 
              disabled={lookupLoading}
              className="h-10"
            >
              {lookupLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Lookup
            </Button>
          </div>

          {/* Lookup Result */}
          {lookupResult && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-800">
                      {lookupResult.full_name || 'Unknown'}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <Mail className="h-3.5 w-3.5" />
                      {lookupResult.email}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedCourseId ? (
                    <Button 
                      onClick={handleAssignWithLookup}
                      disabled={assigning !== null}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {assigning ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Confirm & Assign
                    </Button>
                  ) : (
                    <p className="text-sm text-amber-600">
                      Select a course below to assign
                    </p>
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
            className="pl-10 h-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px] h-10">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="unassigned">Unassigned</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={loadData}>
          <RefreshCw className="h-4 w-4" />
        </Button>
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
              className={`hover:shadow-md transition-shadow cursor-pointer ${
                selectedCourseId === course.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedCourseId(course.id)}
            >
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{course.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        {course.category}
                      </Badge>
                      <Badge className={`text-xs ${
                        course.status === 'published' ? 'bg-green-100 text-green-700' :
                        course.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {course.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {course.instructor_id ? (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {course.instructor_name} ({course.instructor_email})
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-amber-600">
                          <AlertCircle className="h-3 w-3" />
                          Not assigned to any instructor
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Select
                      value={course.instructor_id || "unassigned"}
                      onValueChange={(value) => {
                        handleAssign(course.id, value === "unassigned" ? "" : value);
                      }}
                      disabled={assigning === String(course.id)}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <SelectTrigger className="w-[200px]">
                        {assigning === String(course.id) ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <SelectValue placeholder="Assign to instructor" />
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">-- Unassigned --</SelectItem>
                        {instructors.map((inst) => (
                          <SelectItem key={inst.user_id} value={inst.user_id}>
                            {inst.full_name || 'Unknown'} - {inst.email || 'No email'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
